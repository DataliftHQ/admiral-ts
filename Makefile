.PHONY: build test lint clean

build: ## Build the package
	npm run build

test: ## Run tests
	npm test

lint: ## Run linter
	npx tsc --noEmit

clean: ## Clean build artifacts
	npm run clean
