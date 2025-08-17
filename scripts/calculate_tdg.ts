#!/usr/bin/env -S deno run --allow-read --allow-write

import { exists, walk } from 'std/fs/mod.ts';

interface TDGScores {
  documentation: number;
  testing: number;
  complexity: number;
  dependencies: number;
  security: number;
  maintainability: number;
}

interface TDGWeights {
  documentation: number;
  testing: number;
  complexity: number;
  dependencies: number;
  security: number;
  maintainability: number;
}

class TDGCalculator {
  private scores: TDGScores = {
    documentation: 0,
    testing: 0,
    complexity: 0,
    dependencies: 0,
    security: 0,
    maintainability: 0,
  };

  private readonly weights: TDGWeights = {
    documentation: 0.20,
    testing: 0.25,
    complexity: 0.20,
    dependencies: 0.10,
    security: 0.15,
    maintainability: 0.10,
  };

  async calculateDocumentationScore(): Promise<number> {
    let score = 100;

    if (!await exists('README.md')) score -= 20;
    if (!await exists('docs')) score -= 10;

    const srcFiles = await this.getFiles('src', '.ts');
    const documented = await Promise.all(
      srcFiles.map(async (file) => {
        const content = await Deno.readTextFile(file);
        return content.includes('/**') && content.includes('*/');
      }),
    );

    const docCount = documented.filter(Boolean).length;
    const docRatio = docCount / Math.max(srcFiles.length, 1);
    score = Math.min(score, Math.round(docRatio * 100));

    this.scores.documentation = score;
    return score;
  }

  async calculateTestingScore(): Promise<number> {
    let score = 100;

    const testFiles = [
      ...(await this.getFiles('src', '_test.ts')),
      ...(await this.getFiles('src', '.test.ts')),
    ];

    if (testFiles.length === 0) {
      score = 0;
    } else {
      if (await exists('coverage/lcov.info')) {
        try {
          const coverage = await Deno.readTextFile('coverage/lcov.info');
          const lines = coverage.split('\n');
          let totalLines = 0;
          let coveredLines = 0;

          for (const line of lines) {
            if (line.startsWith('LF:')) {
              totalLines += parseInt(line.slice(3));
            } else if (line.startsWith('LH:')) {
              coveredLines += parseInt(line.slice(3));
            }
          }

          if (totalLines > 0) {
            score = Math.round((coveredLines / totalLines) * 100);
          }
        } catch {
          score = 75;
        }
      } else {
        const srcFiles = (await this.getFiles('src', '.ts')).filter(
          (f) => !f.includes('_test.') && !f.includes('.test.'),
        );
        const testRatio = testFiles.length / Math.max(srcFiles.length, 1);
        score = Math.min(100, Math.round(testRatio * 100));
      }
    }

    this.scores.testing = score;
    return score;
  }

  async calculateComplexityScore(): Promise<number> {
    let score = 100;
    const srcFiles = await this.getFiles('src', '.ts');
    let totalComplexity = 0;
    let fileCount = 0;

    for (const file of srcFiles) {
      const content = await Deno.readTextFile(file);

      const complexityIndicators = [
        /if\s*\(/g,
        /else\s+if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /case\s+/g,
        /catch\s*\(/g,
      ];

      let fileComplexity = 1;
      for (const pattern of complexityIndicators) {
        const matches = content.match(pattern);
        if (matches) fileComplexity += matches.length;
      }

      if (fileComplexity > 10) score -= 5;
      if (fileComplexity > 20) score -= 10;

      totalComplexity += fileComplexity;
      fileCount++;
    }

    const avgComplexity = totalComplexity / Math.max(fileCount, 1);
    if (avgComplexity > 10) score = Math.max(0, score - 20);

    this.scores.complexity = Math.max(0, score);
    return this.scores.complexity;
  }

  async calculateDependenciesScore(): Promise<number> {
    let score = 100;

    if (await exists('deno.json')) {
      const config = JSON.parse(await Deno.readTextFile('deno.json'));
      const imports = Object.keys(config.imports || {}).length;

      if (imports > 20) score -= 10;
      if (imports > 50) score -= 20;

      if (!config.lock === false) score += 5;
    } else {
      score = 0;
    }

    this.scores.dependencies = score;
    return score;
  }

  async calculateSecurityScore(): Promise<number> {
    let score = 100;
    const srcFiles = await this.getFiles('src', '.ts');

    for (const file of srcFiles) {
      const content = await Deno.readTextFile(file);

      if (content.includes('eval(')) score -= 20;
      if (content.includes('innerHTML')) score -= 10;
      if (content.match(/password.*=.*["'].*["']/i)) score -= 15;
      if (!content.includes('sanitize') && content.includes('user')) score -= 5;
    }

    if (!await exists('.env.example')) score -= 10;

    this.scores.security = Math.max(0, score);
    return this.scores.security;
  }

  async calculateMaintainabilityScore(): Promise<number> {
    let score = 100;

    if (!await exists('deno.json')) score -= 20;
    if (!await exists('.github/workflows')) score -= 15;
    if (!await exists('Makefile')) score -= 10;

    this.scores.maintainability = Math.max(0, score);
    return this.scores.maintainability;
  }

  private async getFiles(dir: string, ext: string): Promise<string[]> {
    const files: string[] = [];

    if (!await exists(dir)) return files;

    for await (
      const entry of walk(dir, {
        includeDirs: false,
        includeFiles: true,
        exts: [ext.replace('.', '')],
      })
    ) {
      files.push(entry.path);
    }

    return files;
  }

  async calculateOverallScore(): Promise<number> {
    await this.calculateDocumentationScore();
    await this.calculateTestingScore();
    await this.calculateComplexityScore();
    await this.calculateDependenciesScore();
    await this.calculateSecurityScore();
    await this.calculateMaintainabilityScore();

    let weightedScore = 0;
    for (const [category, score] of Object.entries(this.scores)) {
      const weight = this.weights[category as keyof TDGWeights];
      weightedScore += score * weight;
    }

    return Math.round(weightedScore);
  }

  getGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  async generateReport(): Promise<number> {
    const overallScore = await this.calculateOverallScore();
    const grade = this.getGrade(overallScore);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║       PMAT TDG Score Report            ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('Category Scores:');
    console.log('────────────────────────────────────────');

    for (const [category, score] of Object.entries(this.scores)) {
      const weight = this.weights[category as keyof TDGWeights];
      const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
      console.log(
        `${category.padEnd(15)} ${bar} ${String(score).padStart(3)}% (weight: ${
          (weight * 100).toFixed(0)
        }%)`,
      );
    }

    console.log('────────────────────────────────────────');
    console.log(`\nOverall TDG Score: ${overallScore}/100 (${grade})`);

    if (overallScore >= 85) {
      console.log('✅ Excellent! Code meets PMAT quality standards.');
    } else if (overallScore >= 75) {
      console.log("⚠️  Good, but there's room for improvement.");
    } else {
      console.log('❌ Needs improvement to meet PMAT standards.');
    }

    const badgeData = {
      schemaVersion: 1,
      label: 'PMAT TDG',
      message: `${overallScore}%`,
      color: overallScore >= 85 ? 'brightgreen' : overallScore >= 75 ? 'yellow' : 'red',
    };

    await Deno.writeTextFile('tdg-score.json', JSON.stringify(badgeData, null, 2));

    return overallScore;
  }
}

// Main execution
if (import.meta.main) {
  const calculator = new TDGCalculator();
  const score = await calculator.generateReport();
  Deno.exit(score >= 75 ? 0 : 1);
}
