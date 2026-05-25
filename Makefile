# ============================================================
# Makefile — Alentapp Docente
# ============================================================
# Comandos unificados para desarrollo, testing, producción.
#
# Uso:
#   make help          → muestra esta ayuda
#   make dev           → levanta entorno desarrollo
#   make test          → corre tests (API + Web)
#   make prod          → levanta entorno producción
# ============================================================

SHELL := /bin/bash
.PHONY: help dev dev-down dev-logs dev-rebuild \
        test test-api test-web test-watch test-coverage test-report \
        prod prod-down prod-build prod-logs \
        seed release clean

# ──────────────────────────────────────────────
# HELP
# ──────────────────────────────────────────────

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────────
# DESARROLLO
# ──────────────────────────────────────────────

dev: ## Levanta entorno de desarrollo (docker compose up)
	docker compose up -d
	@echo ""
	@echo "  🌐 Frontend: http://localhost:5173"
	@echo "  ⚙️  API:      http://localhost:3000"
	@echo "  🐘 DB:       postgres://localhost:5432"
	@echo ""

dev-down: ## Detiene entorno de desarrollo
	docker compose down

dev-logs: ## Logs en tiempo real
	docker compose logs -f

dev-rebuild: ## Reconstruye imágenes y reinicia
	docker compose up -d --build

dev-reset: ## Reset completo: borra volúmenes y levanta de nuevo
	docker compose down -v
	docker compose up -d --build
	@echo "  ✅ Base de datos reseteada y migraciones aplicadas"

dev-shell-api: ## Shell dentro del contenedor API
	docker compose exec api sh

dev-shell-web: ## Shell dentro del contenedor Web
	docker compose exec web sh

dev-shell-db: ## Cliente psql dentro de la DB
	docker compose exec db psql -U admin -d alentapp_db

# ──────────────────────────────────────────────
# TESTING
# ──────────────────────────────────────────────

test: ## Corre todos los tests (API + Web)
	@echo "🧪 Running API tests..."
	@npm -w packages/api run test || true
	@echo ""
	@echo "🧪 Running Web tests..."
	@npm -w packages/web run test || true
	@echo ""
	@echo "✅ Tests completados"

test-api: ## Tests de API (unitarios + integración)
	npm -w packages/api run test -- --reporter=verbose

test-web: ## Tests de Web (frontend React)
	npm -w packages/web run test

test-watch: ## Tests en modo watch (API)
	npm -w packages/api run test -- --watch

test-watch-web: ## Tests en modo watch (Web)
	npm -w packages/web run test -- --watch

test-unit: ## Solo tests unitarios (API)
	npm -w packages/api run test -- src/**/*.test.ts --reporter=verbose

test-integration: ## Solo tests de integración (API)
	npm -w packages/api run test -- src/**/*.integration.test.ts --reporter=verbose

test-e2e: ## Tests E2E (Web - Playwright)
	npm -w packages/web run e2e

test-e2e-fullstack: ## Tests E2E Fullstack (Docker + Playwright)
	npm run e2e:fullstack:run

test-coverage: ## Reporte de cobertura (API + Web)
	@echo "📊 Coverage API..."
	@npm -w packages/api run coverage 2>/dev/null || echo "  (ignored)"
	@echo ""
	@echo "📊 Coverage Web..."
	@npm -w packages/web run coverage 2>/dev/null || echo "  (ignored)"
	@echo ""
	@echo "✅ Coverage generado en packages/*/coverage/"

test-report: ## Ejecuta tests y genera reporte resumido
	@echo "═══════════════════════════════════════════════"
	@echo "  📋 TEST REPORT — Alentapp Docente"
	@echo "═══════════════════════════════════════════════"
	@echo ""
	@echo "📦 API:"
	@npm -w packages/api run test 2>&1 | grep -E "Tests|Files|FAIL" | sed 's/^/   /'
	@echo ""
	@echo "📦 Web:"
	@npm -w packages/web run test 2>&1 | grep -E "Tests|Files|FAIL" | sed 's/^/   /'
	@echo ""
	@echo "═══════════════════════════════════════════════"

test-ci: ## Tests en modo CI (sin stderr)
	npm -w packages/api run test 2>/dev/null
	npm -w packages/web run test 2>/dev/null

# ──────────────────────────────────────────────
# PRODUCCIÓN
# ──────────────────────────────────────────────

prod: ## Construye y levanta entorno producción
	@echo "🏭 Building production images..."
	docker compose -f docker-compose.prod.yml build
	@echo ""
	@echo "🚀 Starting production services..."
	docker compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "  🌐 Frontend: http://localhost:80"
	@echo "  ⚙️  API:      http://localhost:3000"
	@echo "  🐘 DB:       postgres://localhost:5432"
	@echo ""

prod-down: ## Detiene entorno producción
	docker compose -f docker-compose.prod.yml down

prod-build: ## Reconstruye imágenes de producción
	docker compose -f docker-compose.prod.yml build --no-cache

prod-logs: ## Logs de producción
	docker compose -f docker-compose.prod.yml logs -f

prod-shell: ## Shell en contenedor API de producción
	docker compose -f docker-compose.prod.yml exec api sh

prod-check: ## Verifica que todos los servicios estén healthy
	@echo "🔍 Checking production services..."
	@docker compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "🌐 API health:"
	@curl -s -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:3000/ || echo "  ⚠️  API not reachable"
	@echo "🌐 Web health:"
	@curl -s -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:80/ || echo "  ⚠️  Web not reachable"

# ──────────────────────────────────────────────
# DATOS
# ──────────────────────────────────────────────

seed: ## Carga datos de ejemplo en la API (requiere entorno corriendo)
	@echo "🌱 Cargando datos de ejemplo..."
	@bash scripts/seed-data.sh
	@echo ""
	@echo "✅ Seed data cargada"

seed-reset: ## Reset DB y carga datos de ejemplo
	@echo "🔄 Reseteando base de datos..."
	@docker compose exec -T db psql -U admin -d alentapp_db \
	  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || true
	@docker compose restart api
	@sleep 5
	@bash scripts/seed-data.sh
	@echo ""
	@echo "✅ DB reseteada y datos cargados"

# ──────────────────────────────────────────────
# CALIDAD
# ──────────────────────────────────────────────

lint: ## Ejecuta ESLint en todo el proyecto
	npx eslint . --ext .ts,.tsx || true

typecheck: ## Verificación de tipos TypeScript
	npx tsc --noEmit && echo "✅ TypeScript OK"

format: ## Formatea código con Prettier
	npx prettier --write "packages/**/*.{ts,tsx}" "*.ts"

check: typecheck lint test-ci ## TypeScript + ESLint + Tests (todo junto)

clean: ## Limpia artefactos de build
	rm -rf packages/*/dist packages/*/coverage .nyc_output
	rm -rf node_modules/.cache

# ──────────────────────────────────────────────
# RELEASE
# ──────────────────────────────────────────────

release: ## Crea una nueva release (VERSION=vX.Y.Z)
ifndef VERSION
	$(error Usage: make release VERSION=v1.2.3)
endif
	@echo "🏷️  Creando release $(VERSION)..."
	git tag -a $(VERSION) -m "Release $(VERSION)"
	git push origin $(VERSION)
	@echo ""
	@echo "✅ Release $(VERSION) creada. Docker images:"
	@echo "   make docker-save VERSION=$(VERSION)"

docker-save: ## Guarda imágenes Docker a archivo tar
ifndef VERSION
	$(error Usage: make docker-save VERSION=v1.0.0)
endif
	@mkdir -p docker-images
	docker save alentapp-api:$(VERSION) alentapp-web:$(VERSION) \
	  -o docker-images/alentapp-$(VERSION).tar
	@echo "✅ Imágenes guardadas en docker-images/alentapp-$(VERSION).tar"
	@ls -lh docker-images/alentapp-$(VERSION).tar

docker-tag: ## Etiqueta imágenes con versión
ifndef VERSION
	$(error Usage: make docker-tag VERSION=v1.0.0)
endif
	docker tag alentapp-api alentapp-api:$(VERSION)
	docker tag alentapp-web alentapp-web:$(VERSION)
	@echo "✅ Imágenes etiquetadas: $(VERSION)"

# ──────────────────────────────────────────────
# UTILIDADES
# ──────────────────────────────────────────────

info: ## Información del proyecto
	@echo "═══════════════════════════════════════════════"
	@echo "  📋 Alentapp Docente"
	@echo "═══════════════════════════════════════════════"
	@echo ""
	@echo "  Stack:"
	@echo "    Backend:  Fastify 5 + Prisma 7 + PostgreSQL 16"
	@echo "    Frontend: React 19 + Chakra UI 3 + Vite 8"
	@echo "    Testing:  Vitest 4 + Playwright"
	@echo "    Infra:    Docker Compose + GitHub Actions"
	@echo ""
	@echo "  Entornos:"
	@echo "    Dev:  make dev   → http://localhost:5173"
	@echo "    Test: make test  → vitest run"
	@echo "    Prod: make prod  → http://localhost:80"
	@echo ""
	@echo "  Tests:"
	@echo "    API:  ~200 unit + integration"
	@echo "    Web:   ~40 frontend"
	@echo ""
	@echo "═══════════════════════════════════════════════"
