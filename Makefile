.PHONY: help lint lint-fix type-check qa start stop build prisma-generate prisma-migrate-generate prisma-migrate-deploy prisma-migrate-diff cli

COMPOSE := docker compose
NPM := $(COMPOSE) exec frontend npm

##———————————— Commands

help: ## Show this help page
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' Makefile | awk 'BEGIN {FS = ":.*?##"}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##———————————— Environment Management

start: ## Start the development environment
	$(COMPOSE) up --renew-anon-volumes

stop: ## Stop the development environment
	$(COMPOSE) down

build: ## Build the project
	$(COMPOSE) build

##———————————— Code Quality

lint: ## Launch ESLint
	$(NPM) lint

lint-fix: ## Launch ESLint with autofix
	$(NPM) lint --fix

type-check: ## Launch TypeScript type checking
	$(NPM) type-check

qa: lint-fix type-check ## Launch quality automation (lint, type checking...)

##———————————— Prisma Database

prisma-g: ## Generate Prisma Client files
	cd backend && npx prisma generate
	$(COMPOSE) exec backend npx prisma generate
	$(COMPOSE) restart backend

prisma-m-g: ## Automatically generate new Prisma migration
	$(COMPOSE) exec backend npx prisma migrate dev --create-only

prisma-m-deploy: ## Apply the latest Prisma migrations
	$(COMPOSE) exec backend npx prisma migrate deploy
	cd backend && npx prisma generate
	$(COMPOSE) exec backend npx prisma generate
	$(COMPOSE) restart backend

prisma-m-diff: ## Check if database is up to date with schema file
	$(COMPOSE) exec backend npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script

##———————————— CLI Commands

cli: ## Run CLI commands in the backend container (use: make cli ARGS="command arguments")
	$(COMPOSE) exec backend npm run cli -- $(ARGS)
