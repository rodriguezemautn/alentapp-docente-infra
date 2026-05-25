#!/usr/bin/env bash
# ============================================================
# Test Runner TUI — Alentapp Docente
# Menú interactivo para ejecutar tests del proyecto
# ============================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      🧪 Alentapp Docente — Test Runner      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
}

print_menu() {
    echo -e "${YELLOW}Seleccioná una opción:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC}  Todos los tests (API + Web)"
    echo -e "  ${GREEN}2)${NC}  Tests de API (unitarios + integración)"
    echo -e "  ${GREEN}3)${NC}  Tests de Web (frontend React)"
    echo -e "  ${GREEN}4)${NC}  Tests unitarios (API — verbose)"
    echo -e "  ${GREEN}5)${NC}  Tests de integración (API)"
    echo -e "  ${GREEN}6)${NC}  Coverage — API"
    echo -e "  ${GREEN}7)${NC}  Coverage — Web"
    echo -e "  ${GREEN}8)${NC}  Coverage — Completo"
    echo -e "  ${GREEN}9)${NC}  E2E (Playwright — web)"
    echo -e "  ${GREEN}10)${NC} E2E Fullstack (Docker + Playwright)"
    echo -e "  ${GREEN}11)${NC} Watch mode — API"
    echo -e "  ${GREEN}12)${NC} Watch mode — Web"
    echo -e "  ${RED}0)${NC}  Salir"
    echo ""
}

run_test() {
    local description="$1"
    shift
    echo ""
    echo -e "${BLUE}▶ Ejecutando: ${description}${NC}"
    echo -e "${BLUE}──────────────────────────────────────────────${NC}"
    echo ""

    set +e
    npm run "$@"
    local exit_code=$?
    set -e

    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${description} — PASÓ${NC}"
    else
        echo -e "${RED}❌ ${description} — FALLÓ (código: $exit_code)${NC}"
    fi
    echo ""
}

run_test_custom() {
    local description="$1"
    shift
    echo ""
    echo -e "${BLUE}▶ ${description}${NC}"
    echo -e "${BLUE}──────────────────────────────────────────────${NC}"
    echo ""

    set +e
    "$@"
    local exit_code=$?
    set -e

    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${description} — PASÓ${NC}"
    else
        echo -e "${RED}❌ ${description} — FALLÓ (código: $exit_code)${NC}"
    fi
    echo ""
}

while true; do
    print_header
    print_menu
    echo -n -e "${CYAN}Opción: ${NC}"
    read -r opt

    case "$opt" in
        1)  run_test "Todos los tests" test ;;
        2)  run_test "Tests API" test:api ;;
        3)  run_test "Tests Web" test:web ;;
        4)  run_test "Tests unitarios (API)" test:unit ;;
        5)  run_test "Tests integración (API)" test:integration ;;
        6)  run_test "Coverage API" test:api:coverage ;;
        7)  run_test "Coverage Web" test:web:coverage ;;
        8)  run_test "Coverage completo" test:coverage ;;
        9)  run_test "E2E Web" test:e2e ;;
        10) run_test_custom "E2E Fullstack (Docker)" npm run e2e:fullstack:up bash -c "npm run e2e:fullstack && npm run e2e:fullstack:down" ;;
        11) run_test_custom "Watch mode — API (Ctrl+C para salir)" npm run test:watch ;;
        12) run_test_custom "Watch mode — Web (Ctrl+C para salir)" npm run test:watch:web ;;
        0)  echo -e "${YELLOW}¡Hasta luego!${NC}"; exit 0 ;;
        *)  echo -e "${RED}Opción inválida${NC}"; sleep 1 ;;
    esac

    if [ "$opt" != "0" ]; then
        echo ""
        echo -n -e "${YELLOW}Presioná Enter para volver al menú...${NC}"
        read -r
    fi
done
