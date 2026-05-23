#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# gh-automation.sh — Automatización de PRs y merges con gh CLI
# ──────────────────────────────────────────────────────────
# Uso:
#   bash scripts/gh-automation.sh create-pr <base> <head> <title> <body_file>
#   bash scripts/gh-automation.sh merge-pr  <pr-number> [--squash|--rebase|--merge]
#   bash scripts/gh-automation.sh status   <pr-number>
#   bash scripts/gh-automation.sh verify-pr <pr-number>
# ──────────────────────────────────────────────────────────

COMMAND="${1:-help}"
GH="${GH_BIN:-gh}"

# ─── Validación ───────────────────────────────────────────

check_gh() {
  if ! command -v "$GH" &>/dev/null; then
    echo "ERROR: gh CLI no encontrado. Instalalo desde https://cli.github.com/"
    echo "       o definí GH_BIN=/ruta/a/gh"
    exit 1
  fi

  if ! $GH auth status &>/dev/null; then
    echo "ERROR: gh no está autenticado. Ejecutá 'gh auth login' primero."
    exit 1
  fi
}

# ─── Comandos ─────────────────────────────────────────────

create_pr() {
  # Args: <base> <head> <title> <body_file>
  local base="${1:-main}"
  local head="${2:-}"
  local title="${3:-}"
  local body_file="${4:-}"

  if [[ -z "$head" || -z "$title" ]]; then
    echo "USO: $0 create-pr <base> <head> <title> [body_file]"
    echo "  base      — rama destino (default: main)"
    echo "  head      — rama origen"
    echo "  title     — título del PR"
    echo "  body_file — archivo con el cuerpo del PR (opcional)"
    exit 1
  fi

  # Verificar que la rama head existe y tiene cambios respecto a base
  if ! git rev-parse --verify "$head" &>/dev/null; then
    echo "ERROR: La rama '$head' no existe localmente."
    exit 1
  fi

  # Contar commits entre base y head
  local commit_count
  commit_count=$(git rev-list --count "$base..$head" 2>/dev/null || echo "0")
  if [[ "$commit_count" -eq 0 ]]; then
    echo "ERROR: No hay commits nuevos entre $base y $head. Push primero."
    exit 1
  fi

  # Push de la rama si no está en remote
  if ! git ls-remote --exit-code origin "$head" &>/dev/null; then
    echo "→ Pusheando rama $head a origin..."
    git push origin "$head"
  fi

  # Crear PR
  local pr_args=(
    --base "$base"
    --head "$head"
    --title "$title"
  )

  if [[ -n "$body_file" && -f "$body_file" ]]; then
    $GH pr create "${pr_args[@]}" --body-file "$body_file"
  else
    $GH pr create "${pr_args[@]}"
  fi

  echo ""
  echo "✅ PR creado exitosamente"
}

merge_pr() {
  local pr_number="${1:-}"
  local merge_method="${2:---squash}"

  if [[ -z "$pr_number" ]]; then
    echo "USO: $0 merge-pr <pr-number> [--squash|--rebase|--merge]"
    exit 1
  fi

  check_gh

  # Validar que el PR existe y está abierto
  local pr_state
  pr_state=$($GH pr view "$pr_number" --json state --jq '.state' 2>/dev/null || echo "notfound")
  if [[ "$pr_state" == "notfound" ]]; then
    echo "ERROR: PR #$pr_number no encontrado."
    exit 1
  fi
  if [[ "$pr_state" != "OPEN" ]]; then
    echo "ERROR: PR #$pr_number no está abierto (estado: $pr_state)."
    exit 1
  fi

  # Verificar que las checks pasaron (opcional, no blocker)
  local checks_pass
  checks_pass=$($GH pr view "$pr_number" --json statusCheckRollup --jq '[.statusCheckRollup[] | select(.conclusion == "FAILURE")] | length' 2>/dev/null || echo "0")

  echo "→ Mergeando PR #$pr_number con método: $merge_method"
  echo "  Checks fallidos: $checks_pass"

  # Preguntar antes de mergear
  echo ""
  echo "¿Mergear PR #$pr_number? (s/N): "
  read -r confirm
  if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "✗ Merge cancelado."
    exit 0
  fi

  $GH pr merge "$pr_number" "$merge_method" --delete-branch

  echo ""
  echo "✅ PR #$pr_number mergeado exitosamente."
  echo "   Rama eliminada: sí (--delete-branch)"
}

pr_status() {
  local pr_number="${1:-}"

  if [[ -z "$pr_number" ]]; then
    echo "USO: $0 status <pr-number>"
    exit 1
  fi

  check_gh

  $GH pr view "$pr_number" --json title,state,headRefName,baseRefName,mergeable,reviews,statusCheckRollup,additions,deletions,createdAt,url | \
    python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'├── Título:    {data[\"title\"]}')
print(f'├── Estado:    {data[\"state\"]}')
print(f'├── Rama:      {data[\"headRefName\"]} → {data[\"baseRefName\"]}')
print(f'├── Mergeable: {data[\"mergeable\"]}')
print(f'├── +/-:       +{data[\"additions\"]} / -{data[\"deletions\"]}')
print(f'├── Creado:    {data[\"createdAt\"]}')
print(f'├── URL:       {data[\"url\"]}')
print(f'├── Reviews:   {len(data.get(\"reviews\", []))}')
print(f'└── Checks:')
for check in data.get('statusCheckRollup', []):
    icon = '✅' if check.get('conclusion') == 'SUCCESS' else '❌' if check.get('conclusion') == 'FAILURE' else '⏳'
    print(f'    {icon} {check.get(\"name\", \"?\")}: {check.get(\"conclusion\", \"PENDING\")}')
"
}

verify_pr() {
  local pr_number="${1:-}"

  if [[ -z "$pr_number" ]]; then
    echo "USO: $0 verify-pr <pr-number>"
    exit 1
  fi

  check_gh

  # Extraer datos del PR
  local data
  data=$($GH pr view "$pr_number" --json title,additions,deletions,state,mergeable,reviews,statusCheckRollup,headRefName 2>/dev/null) || {
    echo "ERROR: No se pudo obtener datos del PR #$pr_number"
    exit 1
  }

  local additions deletions state mergeable
  additions=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['additions'])")
  deletions=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['deletions'])")
  state=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['state'])")
  mergeable=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['mergeable'])")

  local budget="${BUDGET_LINES:-400}"
  local issues=0

  echo "═══ Verificación de PR #$pr_number ═══"
  echo ""

  # 1. Budget check
  local total=$((additions + deletions))
  if [[ "$total" -gt "$budget" ]]; then
    echo "❌ BUDGET: $total líneas (excede el límite de $budget)"
    issues=$((issues + 1))
  else
    echo "✅ BUDGET: $total líneas (dentro del límite de $budget)"
  fi

  # 2. State check
  if [[ "$state" != "OPEN" ]]; then
    echo "❌ ESTADO: $state (debe ser OPEN)"
    issues=$((issues + 1))
  else
    echo "✅ ESTADO: $state"
  fi

  # 3. Mergeable check
  if [[ "$mergeable" == "CONFLICTING" ]]; then
    echo "❌ CONFLICTOS: El PR tiene conflictos de merge"
    issues=$((issues + 1))
  else
    echo "✅ CONFLICTOS: $mergeable"
  fi

  # 4. Checks
  local failures
  failures=$(echo "$data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
checks = data.get('statusCheckRollup', [])
fails = [c for c in checks if c.get('conclusion') == 'FAILURE']
print(len(fails))
" 2>/dev/null || echo "0")

  if [[ "$failures" -gt 0 ]]; then
    echo "❌ CHECKS: $failures checks fallidos"
    issues=$((issues + 1))
  else
    echo "✅ CHECKS: sin fallos"
  fi

  # 5. Branch naming
  local branch
  branch=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['headRefName'])")
  if echo "$branch" | grep -qE '^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/'; then
    echo "✅ BRANCH: nombre válido ($branch)"
  else
    echo "⚠️  BRANCH: nombre no convencional ($branch)"
  fi

  echo ""
  if [[ "$issues" -eq 0 ]]; then
    echo "✅ VEREDICTO: PR listo para merge"
    return 0
  else
    echo "❌ VEREDICTO: $issues problema(s) detectado(s). Revisar antes de mergear."
    return 1
  fi
}

# ─── Help ─────────────────────────────────────────────────

show_help() {
  echo "gh-automation.sh — Automatización de PRs y merges"
  echo ""
  echo "Comandos:"
  echo "  create-pr <base> <head> <title> [body_file]"
  echo "    Crea un PR y pushea la rama si es necesario."
  echo ""
  echo "  merge-pr <pr-number> [--squash|--rebase|--merge]"
  echo "    Mergea un PR abierto después de confirmación."
  echo "    Default: --squash (conventional commits)."
  echo ""
  echo "  status <pr-number>"
  echo "    Muestra estado detallado del PR."
  echo ""
  "verify-pr <pr-number>"
  echo "    Verifica budget, estado, conflictos y checks."
  echo "    Usa BUDGET_LINES=800 para proyectos grandes."
  echo ""
  echo "Variables de entorno:"
  echo "  GH_BIN       — ruta a gh CLI (default: gh)"
  echo "  BUDGET_LINES — límite de líneas (default: 400)"
  echo ""
  echo "Ejemplos:"
  echo "  $0 create-pr main feat/sport 'feat(api): implementa entidad Sport' body.md"
  echo "  $0 merge-pr 42 --squash"
  echo "  BUDGET_LINES=800 $0 verify-pr 42"
}

# ─── Dispatch ─────────────────────────────────────────────

case "$COMMAND" in
  create-pr)   shift; create_pr "$@" ;;
  merge-pr)    shift; merge_pr "$@" ;;
  status)      shift; pr_status "$@" ;;
  verify-pr)   shift; verify_pr "$@" ;;
  help|--help|-h) show_help ;;
  *)
    echo "Comando desconocido: $COMMAND"
    echo ""
    show_help
    exit 1
    ;;
esac
