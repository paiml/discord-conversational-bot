.PHONY: help install dev test test-coverage lint format quality clean compile cache check validate tdg-score

# Variables
DENO := deno
COVERAGE_THRESHOLD := 80
TDG_THRESHOLD := 85

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "Discord Bot Conversational Course - Deno Make Targets"
	@echo "====================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

install: cache ## Cache dependencies
	@echo "$(GREEN)✓ Dependencies cached$(NC)"

cache: ## Cache all dependencies
	@echo "$(YELLOW)Caching dependencies...$(NC)"
	$(DENO) cache src/deps.ts
	$(DENO) cache src/**/*.ts
	@echo "$(GREEN)✓ Dependencies cached$(NC)"

dev: ## Start development server with watch mode
	@echo "$(YELLOW)Starting development server...$(NC)"
	$(DENO) task dev

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	$(DENO) task test
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-coverage: ## Run tests with coverage
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	$(DENO) task test:coverage
	$(DENO) task coverage
	@echo "$(GREEN)✓ Coverage complete$(NC)"

lint: ## Run linter
	@echo "$(YELLOW)Running linter...$(NC)"
	$(DENO) task lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	$(DENO) task fmt
	@echo "$(GREEN)✓ Formatting complete$(NC)"

check: ## Type check all TypeScript files
	@echo "$(YELLOW)Running type check...$(NC)"
	$(DENO) task check
	@echo "$(GREEN)✓ Type check complete$(NC)"

quality: check test ## Run all quality checks
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

validate: quality tdg-score ## Validate project (quality + TDG score)
	@echo "$(GREEN)✓ Project validation complete$(NC)"

tdg-score: ## Calculate PMAT TDG score
	@echo "$(YELLOW)Calculating PMAT TDG score...$(NC)"
	$(DENO) task tdg
	@echo "$(GREEN)✓ TDG score calculated$(NC)"

clean: ## Clean build artifacts and cache
	@echo "$(YELLOW)Cleaning artifacts...$(NC)"
	rm -rf coverage/ discord-bot *.log
	@echo "$(GREEN)✓ Clean complete$(NC)"

compile: ## Compile to standalone executable
	@echo "$(YELLOW)Compiling executable...$(NC)"
	$(DENO) task compile
	@echo "$(GREEN)✓ Compilation complete$(NC)"

week1: ## Run Week 1 example (Basic Bot)
	@echo "$(YELLOW)Running Week 1 Basic Bot...$(NC)"
	$(DENO) task week1

week3: ## Run Week 3 example (Conversational Bot)
	@echo "$(YELLOW)Running Week 3 Conversational Bot...$(NC)"
	$(DENO) task week3

week5: ## Run Week 5 example (MCP Bot)
	@echo "$(YELLOW)Running Week 5 MCP Bot...$(NC)"
	$(DENO) task week5

ci: ## Run CI pipeline
	@echo "$(YELLOW)Running CI pipeline...$(NC)"
	$(MAKE) quality
	$(MAKE) compile
	@echo "$(GREEN)✓ CI pipeline complete$(NC)"

docs: ## Generate documentation
	@echo "$(YELLOW)Generating documentation...$(NC)"
	$(DENO) doc --html src/ --output=docs/api
	@echo "$(GREEN)✓ Documentation generated$(NC)"

deploy: compile ## Deploy to Deno Deploy
	@echo "$(YELLOW)Deploying to Deno Deploy...$(NC)"
	deployctl deploy --project=discord-bot-course src/main.ts
	@echo "$(GREEN)✓ Deployment complete$(NC)"

# Default target
.DEFAULT_GOAL := help