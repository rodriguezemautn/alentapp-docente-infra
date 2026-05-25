#!/usr/bin/env bash
# ============================================================
# Pruebas Integrales de API — Alentapp Docente
# Valida todos los endpoints contra las especificaciones
# ============================================================

API="http://localhost:3000/api/v1"
PASS=0
FAIL=0
RESULTS=()

log() { echo -e "\n\033[1;34m$1\033[0m"; }
ok() { echo -e "  \033[0;32m✅ $1\033[0m"; ((PASS++)); RESULTS+=("✅ $1"); }
fail() { echo -e "  \033[0;31m❌ $1\033[0m"; ((FAIL++)); RESULTS+=("❌ $1"); }
check_status() {
    local expected=$1 actual=$2 label=$3
    if [ "$actual" = "$expected" ]; then
        ok "$label → HTTP $actual"
    else
        fail "$label → esperado HTTP $expected, obtuvo $actual"
    fi
}

echo "╔══════════════════════════════════════════════╗"
echo "║    🧪 Validación Integral de API            ║"
echo "╚══════════════════════════════════════════════╝"

# =============================================
# 1. SPORT
# =============================================
log "1. SPORT — Especificación RF-01 a RF-04"

# 1.1 Crear deporte exitoso (RF-01)
log "  1.1 Creación exitosa (RF-01)"
SPORT_RESP=$(curl -s -X POST "$API/sports" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Natación","maxCapacity":30}')
SPORT_ID=$(echo "$SPORT_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/sports" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Natación","maxCapacity":30}')
[ -n "$SPORT_ID" ] && ok "Sport creado con ID: $SPORT_ID" || fail "No se obtuvo ID de sport"

# 1.2 Crear deporte duplicado (RF-01 → 409)
log "  1.2 Duplicado (RF-01 → 409)"
DUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/sports" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Natación","maxCapacity":30}')
check_status 409 "$DUP_STATUS" "Sport duplicado"

# 1.3 Crear deporte con maxCapacity inválido (RF-01 → 400)
log "  1.3 maxCapacity inválido (RF-01 → 400)"
INV_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/sports" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Vóley","maxCapacity":0}')
check_status 400 "$INV_STATUS" "maxCapacity=0"

# 1.4 Listar deportes con disciplineCount (RF-02)
log "  1.4 Listar con disciplineCount (RF-02)"
LIST_RESP=$(curl -s "$API/sports")
COUNT=$(echo "$LIST_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(len(d))" 2>/dev/null)
HAS_COUNT=$(echo "$LIST_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print('disciplineCount' in d[0] if d else 'empty')" 2>/dev/null)
[ "$COUNT" -ge 2 ] && ok "Lista deportes: $COUNT registros" || fail "Deberían haber ≥2 deportes, hay $COUNT"
[ "$HAS_COUNT" = "True" ] && ok "disciplineCount presente" || fail "Falta disciplineCount"

# 1.5 Actualizar nombre — debe rechazar (RN-02)
log "  1.5 Cambio de nombre rechazado (RN-02 → 400)"
NAME_CHG=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/sports/$SPORT_ID" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Natación Modificado"}')
check_status 400 "$NAME_CHG" "Cambio de nombre rechazado"

# 1.6 Actualizar maxCapacity — exitoso
log "  1.6 Actualizar maxCapacity exitoso"
UPD_RESP=$(curl -s -X PUT "$API/sports/$SPORT_ID" \
  -H 'Content-Type: application/json' \
  -d '{"maxCapacity":25}')
UPD_CAP=$(echo "$UPD_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('maxCapacity',''))" 2>/dev/null)
[ "$UPD_CAP" = "25" ] && ok "maxCapacity actualizado a 25" || fail "maxCapacity debería ser 25, es $UPD_CAP"

# 1.7 Eliminar deporte sin disciplinas
log "  1.7 Eliminar deporte sin disciplinas"
DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/sports/$SPORT_ID")
check_status 204 "$DEL_STATUS" "Eliminación sin disciplinas"

# =============================================
# 2. MEMBER (Socio)
# =============================================
log "\n2. MEMBER — Especificación"

# 2.1 Crear socio exitoso
log "  2.1 Creación exitosa"
M1=$(curl -s -X POST "$API/socios" \
  -H 'Content-Type: application/json' \
  -d '{"dni":"11111111","name":"Ana García","email":"ana@test.com","birthdate":"1995-05-15","category":"Pleno"}')
M1_ID=$(echo "$M1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M1_ID" ] && ok "Socio creado: $M1_ID" || fail "No se obtuvo ID"
M1_STATUS=$(echo "$M1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('status',''))" 2>/dev/null)
[ "$M1_STATUS" = "Activo" ] && ok "Status inicial: Activo" || fail "Status debería ser Activo, es $M1_STATUS"

# 2.2 Crear socio con DNI duplicado → 409
log "  2.2 DNI duplicado → 409"
DUP_MEMBER=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/socios" \
  -H 'Content-Type: application/json' \
  -d '{"dni":"11111111","name":"Otro","email":"otro@test.com","birthdate":"1990-01-01","category":"Pleno"}')
check_status 409 "$DUP_MEMBER" "DNI duplicado"

# 2.3 Listar socios
log "  2.3 Listar socios"
M_LIST=$(curl -s "$API/socios")
M_COUNT=$(echo "$M_LIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
[ "$M_COUNT" -ge 1 ] && ok "Lista socios: $M_COUNT registros" || fail "Debería haber ≥1 socio"

# 2.4 Actualizar socio
log "  2.4 Actualizar socio"
M_UPD=$(curl -s -X PUT "$API/socios/$M1_ID" \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana.garcia@test.com"}')
M_EMAIL=$(echo "$M_UPD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('email',''))" 2>/dev/null)
[ "$M_EMAIL" = "ana.garcia@test.com" ] && ok "Email actualizado" || fail "Email no se actualizó"

# 2.5 Eliminar socio
log "  2.5 Eliminar socio"
M_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/socios/$M1_ID")
check_status 204 "$M_DEL" "Eliminar socio"

# Re-crear socio para pruebas de otras entidades
log "  2.6 Re-crear socio para entidades dependientes"
M2=$(curl -s -X POST "$API/socios" \
  -H 'Content-Type: application/json' \
  -d '{"dni":"22222222","name":"Carlos Pérez","email":"carlos@test.com","birthdate":"1988-03-20","category":"Pleno"}')
M2_ID=$(echo "$M2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M2_ID" ] && ok "Socio re-creado: $M2_ID" || fail "No se pudo recrear socio"

# =============================================
# 3. PAYMENT (Pago)
# =============================================
log "\n3. PAYMENT — Especificación"

# 3.1 Crear pago exitoso
log "  3.1 Crear pago exitoso"
PAY_RESP=$(curl -s -X POST "$API/pagos" \
  -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"amount\":15000,\"description\":\"Cuota mensual\",\"paymentType\":\"Cuota\"}")
PAY_ID=$(echo "$PAY_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$PAY_ID" ] && ok "Pago creado: $PAY_ID" || fail "No se obtuvo ID de pago"

# 3.2 Listar pagos con paginación
log "  3.2 Listar pagos"
PAY_LIST=$(curl -s "$API/pagos")
PAY_TOTAL=$(echo "$PAY_LIST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total',0))" 2>/dev/null)
PAY_PAGE=$(echo "$PAY_LIST" | python3 -c "import sys,json; print(json.load(sys.stdin).get('page',0))" 2>/dev/null)
[ "$PAY_TOTAL" -ge 1 ] && ok "Pagos total: $PAY_TOTAL, página: $PAY_PAGE" || fail "Debería haber ≥1 pago"

# 3.3 Get pago by ID
log "  3.3 Obtener pago por ID"
PAY_GET=$(curl -s "$API/pagos/$PAY_ID")
PAY_AMOUNT=$(echo "$PAY_GET" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('amount',0))" 2>/dev/null)
[ "$PAY_AMOUNT" = "15000" ] && ok "Pago obtenido: amount=$PAY_AMOUNT" || fail "Amount incorrecto"

# 3.4 Cancelar pago
log "  3.4 Cancelar pago"
PAY_CANCEL=$(curl -s -X PUT "$API/pagos/$PAY_ID/cancel" \
  -H 'Content-Type: application/json' \
  -d '{}')
PAY_CANCEL_STATUS=$(echo "$PAY_CANCEL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('status',''))" 2>/dev/null)
[ "$PAY_CANCEL_STATUS" = "Cancelado" ] && ok "Pago cancelado: status=$PAY_CANCEL_STATUS" || fail "Status debería ser Cancelado, es $PAY_CANCEL_STATUS"

# 3.5 Cancelar pago ya cancelado → debe fallar (validación)
log "  3.5 Cancelar pago ya cancelado"
PAY_RE_CANCEL=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/pagos/$PAY_ID/cancel" \
  -H 'Content-Type: application/json' \
  -d '{}')
check_status 409 "$PAY_RE_CANCEL" "Re-cancelar pago rechazado"

# =============================================
# 4. MEDICAL CERTIFICATE
# =============================================
log "\n4. MEDICAL CERTIFICATE — Especificación"

# 4.1 Crear certificado médico
log "  4.1 Crear certificado"
MC_RESP=$(curl -s -X POST "$API/certificados-medicos" \
  -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"startDate\":\"2026-06-01\",\"endDate\":\"2026-12-31\",\"diagnosis\":\"Control general\",\"doctorName\":\"Dr. López\"}")
MC_ID=$(echo "$MC_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
MC_ACTIVE=$(echo "$MC_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('isActive',''))" 2>/dev/null)
[ -n "$MC_ID" ] && ok "Certificado creado: $MC_ID" || fail "No se obtuvo ID"
[ "$MC_ACTIVE" = "True" ] && ok "isActive: true" || fail "isActive debería ser true, es $MC_ACTIVE"

# 4.2 Crear segundo certificado — debe desactivar el primero
log "  4.2 Segundo certificado — desactiva el anterior"
MC2_RESP=$(curl -s -X POST "$API/certificados-medicos" \
  -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"startDate\":\"2027-01-01\",\"endDate\":\"2027-06-30\",\"diagnosis\":\"Renovación\",\"doctorName\":\"Dr. García\"}")
MC2_ID=$(echo "$MC2_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$MC2_ID" ] && ok "Segundo certificado creado: $MC2_ID" || fail "No se obtuvo ID"

# 4.3 Obtener certificado activo — debe ser el segundo
log "  4.3 Obtener activo — debe ser el último"
MC_ACTIVE=$(curl -s "$API/certificados-medicos/activo/$M2_ID")
MC_ACTIVE_ID=$(echo "$MC_ACTIVE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
MC_ACTIVE_ISACTIVE=$(echo "$MC_ACTIVE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('isActive',''))" 2>/dev/null)
[ "$MC_ACTIVE_ID" = "$MC2_ID" ] && ok "Activo es el último certificado" || fail "Debería ser el último certificado"
[ "$MC_ACTIVE_ISACTIVE" = "True" ] && ok "isActive: true" || fail "isActive debería ser true"

# =============================================
# 5. DISCIPLINE
# =============================================
log "\n5. DISCIPLINE — Especificación RF-01 a RF-05"

# Necesito un sport para las disciplinas
SPORT_FOR_DISC=$(curl -s -X POST "$API/sports" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Básquet","maxCapacity":20}')
SD_ID=$(echo "$SPORT_FOR_DISC" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)

# 5.1 Crear disciplina exitosa (RF-01)
log "  5.1 Crear disciplina exitosa (RF-01)"
DISC_RESP=$(curl -s -X POST "$API/disciplinas" \
  -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$SD_ID\",\"name\":\"Básquet Infantil\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Martes y Jueves 17:00\",\"professor\":\"Prof. Martínez\"}")
DISC_ID=$(echo "$DISC_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
DISC_SPORTNAME=$(echo "$DISC_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('sportName',''))" 2>/dev/null)
[ -n "$DISC_ID" ] && ok "Disciplina creada: $DISC_ID" || fail "No se obtuvo ID"
[ "$DISC_SPORTNAME" = "Básquet" ] && ok "sportName incluido: $DISC_SPORTNAME" || fail "Falta sportName"

# 5.2 Crear disciplina con endDate <= startDate (RN-01 → 400)
log "  5.2 Fecha inválida (RN-01 → 400)"
DISC_INV=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/disciplinas" \
  -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$SD_ID\",\"name\":\"Básquet Senior\",\"startDate\":\"2026-06-01\",\"endDate\":\"2025-01-01\"}")
check_status 400 "$DISC_INV" "endDate anterior a startDate"

# 5.3 Crear disciplina con sportId inexistente (RN-02 → 404)
log "  5.3 Sport inexistente (RN-02 → 404)"
DISC_NOSPORT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/disciplinas" \
  -H 'Content-Type: application/json' \
  -d '{"sportId":"00000000-0000-0000-0000-000000000000","name":"Test","startDate":"2026-01-01","endDate":"2026-12-31"}')
check_status 404 "$DISC_NOSPORT" "SportId inexistente"

# 5.4 Listar disciplinas (RF-02)
log "  5.4 Listar disciplinas (RF-02)"
DISC_LIST=$(curl -s "$API/disciplinas")
DISC_COUNT=$(echo "$DISC_LIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
[ "$DISC_COUNT" -ge 1 ] && ok "Lista disciplinas: $DISC_COUNT registros" || fail "Debería haber ≥1 disciplina"

# 5.5 Listar por sportId (RF-02 filter)
log "  5.5 Filtrar por sportId (RF-02)"
DISC_FILTER=$(curl -s "$API/disciplinas?sportId=$SD_ID")
FILTER_COUNT=$(echo "$DISC_FILTER" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
[ "$FILTER_COUNT" -ge 1 ] && ok "Filtro sportId: $FILTER_COUNT resultados" || fail "Debería encontrar disciplinas"

# 5.6 Obtener disciplina por ID (RF-03)
log "  5.6 Obtener por ID (RF-03)"
DISC_GET=$(curl -s "$API/disciplinas/$DISC_ID")
DISC_GET_NAME=$(echo "$DISC_GET" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('name',''))" 2>/dev/null)
[ "$DISC_GET_NAME" = "Básquet Infantil" ] && ok "Disciplina obtenida: $DISC_GET_NAME" || fail "Nombre incorrecto"

# 5.7 Actualizar disciplina (RF-04)
log "  5.7 Actualizar disciplina (RF-04)"
DISC_UPD=$(curl -s -X PUT "$API/disciplinas/$DISC_ID" \
  -H 'Content-Type: application/json' \
  -d '{"schedule":"Martes y Jueves 18:00","professor":"Prof. Rodríguez"}')
DISC_UPD_PROF=$(echo "$DISC_UPD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('professor',''))" 2>/dev/null)
[ "$DISC_UPD_PROF" = "Prof. Rodríguez" ] && ok "Disciplina actualizada: profesor=$DISC_UPD_PROF" || fail "Profesor no actualizado"

# 5.8 Eliminar disciplina (RF-05 — hard delete)
log "  5.8 Eliminar disciplina (RF-05)"
DISC_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/disciplinas/$DISC_ID")
check_status 204 "$DISC_DEL" "Eliminar disciplina (hard delete)"

# 5.9 Verificar eliminación (RF-05 → 404)
log "  5.9 Verificar eliminación (RF-05 → 404)"
DISC_GONE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API/disciplinas/$DISC_ID")
check_status 404 "$DISC_GONE" "Disciplina eliminada no encontrada"

# =============================================
# RESUMEN
# =============================================
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           📊 RESUMEN DE PRUEBAS             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Total: $((PASS + FAIL)) pruebas"
echo -e "  \033[0;32m  ✅ Pasaron: $PASS\033[0m"
echo -e "  \033[0;31m  ❌ Fallaron: $FAIL\033[0m"
echo ""

if [ $FAIL -gt 0 ]; then
    echo "  Fallos:"
    for r in "${RESULTS[@]}"; do
        [[ "$r" == ❌* ]] && echo "    $r"
    done
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           ESPECIFICACIONES vs API           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Miembros:      RF-01 a RF-□  → Create/List/Update/Delete"
echo "  Sport:         RF-01 a RF-04  → CRUD + name immutable"
echo "  Payment:       RF-01 a RF-04  → Create/List/Get/Cancel"
echo "  MedicalCert:   RF-01 a RF-02  → Create + GetActive (transacción)"
echo "  Discipline:    RF-01 a RF-05  → CRUD + fechas + sport FK"
echo ""

# Salida
exit $FAIL
