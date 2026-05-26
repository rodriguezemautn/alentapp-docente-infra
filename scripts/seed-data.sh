#!/usr/bin/env bash
# ============================================================
# Seed Data — Alentapp Docente
# Carga datos de ejemplo para TODAS las entidades vía API
# ============================================================

API="http://localhost:3000/api/v1"
PASS=0
FAIL=0

log() { echo -e "\n\033[1;34m$1\033[0m"; }
ok() { echo -e "  \033[0;32m✅ $1\033[0m"; ((++PASS)); }
fail() { echo -e "  \033[0;31m❌ $1\033[0m"; ((++FAIL)); }

get_id() {
    python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null
}

get_error() {
    python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null
}

echo "╔══════════════════════════════════════════════╗"
echo "║    🌱 Seed Data — Alentapp Docente          ║"
echo "╚══════════════════════════════════════════════╝"

# ============================================
# Miembros
# ============================================
log "👥 Cargando Miembros..."

R=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"10123456","name":"Martín Rodríguez","email":"martin@email.com","birthdate":"1990-03-15","category":"Pleno"}')
M1_ID=$(echo "$R" | get_id)
if [ -n "$M1_ID" ]; then ok "Martín Rodríguez (Pleno)"; else fail "Martín: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"20234567","name":"Lucía Fernández","email":"lucia@email.com","birthdate":"2005-07-22","category":"Cadete"}')
M2_ID=$(echo "$R" | get_id)
if [ -n "$M2_ID" ]; then ok "Lucía Fernández (Cadete)"; else fail "Lucía: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"30345678","name":"Carlos Gómez","email":"carlos@email.com","birthdate":"1985-11-08","category":"Honorario"}')
M3_ID=$(echo "$R" | get_id)
if [ -n "$M3_ID" ]; then ok "Carlos Gómez (Honorario)"; else fail "Carlos: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"40456789","name":"Ana Martínez","email":"ana@email.com","birthdate":"1995-12-01","category":"Pleno"}')
M4_ID=$(echo "$R" | get_id)
if [ -n "$M4_ID" ]; then ok "Ana Martínez (Pleno)"; else fail "Ana: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"50567890","name":"Pedro López","email":"pedro@email.com","birthdate":"2008-04-18","category":"Cadete"}')
M5_ID=$(echo "$R" | get_id)
if [ -n "$M5_ID" ]; then ok "Pedro López (Cadete)"; else fail "Pedro: $(echo "$R" | get_error)"; fi

# ============================================
# Asignar categoría deportiva a algunos miembros
# Solo Senior/Lifetime pueden pedir préstamos, Cadet NO
# ============================================
log "🏷️ Asignando categorías deportivas..."

R=$(curl -s -X PUT "$API/socios/$M1_ID" -H 'Content-Type: application/json' \
  -d '{"sportCategory":"Senior"}')
if echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null | grep -q .; then
  ok "Martín Rodríguez → Senior"
else
  fail "SportCategory M1: $(echo "$R" | get_error)"
fi

R=$(curl -s -X PUT "$API/socios/$M4_ID" -H 'Content-Type: application/json' \
  -d '{"sportCategory":"Lifetime"}')
if echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null | grep -q .; then
  ok "Ana Martínez → Lifetime"
else
  fail "SportCategory M4: $(echo "$R" | get_error)"
fi

# ============================================
# Deportes
# ============================================
log "⚽ Cargando Deportes..."

R=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Fútbol","description":"Deporte de equipo con 11 jugadores","maxCapacity":22}')
S1_ID=$(echo "$R" | get_id)
if [ -n "$S1_ID" ]; then ok "Fútbol (cap. 22)"; else fail "Fútbol: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Básquet","description":"Deporte de equipo con 5 jugadores","maxCapacity":10}')
S2_ID=$(echo "$R" | get_id)
if [ -n "$S2_ID" ]; then ok "Básquet (cap. 10)"; else fail "Básquet: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Natación","description":"Deporte acuático individual","maxCapacity":30}')
S3_ID=$(echo "$R" | get_id)
if [ -n "$S3_ID" ]; then ok "Natación (cap. 30)"; else fail "Natación: $(echo "$R" | get_error)"; fi

# ============================================
# Disciplinas
# ============================================
log "🏋️ Cargando Disciplinas..."

R=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S1_ID\",\"name\":\"Fútbol Infantil\",\"description\":\"Categoría de 6 a 12 años\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Lunes y Miércoles 17:00\",\"professor\":\"Prof. Pérez\"}")
D1_ID=$(echo "$R" | get_id)
if [ -n "$D1_ID" ]; then ok "Fútbol Infantil"; else fail "Disciplina 1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S1_ID\",\"name\":\"Fútbol Femenino\",\"description\":\"Categoría femenina todas las edades\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Martes y Jueves 18:00\",\"professor\":\"Prof. García\"}")
D2_ID=$(echo "$R" | get_id)
if [ -n "$D2_ID" ]; then ok "Fútbol Femenino"; else fail "Disciplina 2: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S2_ID\",\"name\":\"Básquet Infantil\",\"description\":\"Categoría de 8 a 14 años\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Lunes y Miércoles 16:00\",\"professor\":\"Prof. Martínez\"}")
D3_ID=$(echo "$R" | get_id)
if [ -n "$D3_ID" ]; then ok "Básquet Infantil"; else fail "Disciplina 3: $(echo "$R" | get_error)"; fi

# ============================================
# Pagos
# ============================================
log "💰 Cargando Pagos..."

R=$(curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}")
if echo "$R" | get_id | grep -q .; then ok "Pago Martín Rodríguez (Cuota)"; else fail "Pago M1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}")
if echo "$R" | get_id | grep -q .; then ok "Pago Lucía Fernández (Cuota)"; else fail "Pago M2: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M4_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}")
if echo "$R" | get_id | grep -q .; then ok "Pago Ana Martínez (Cuota)"; else fail "Pago M4: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"amount\":80000,\"description\":\"Inscripción anual\",\"paymentType\":\"Inscripcion\"}")
if echo "$R" | get_id | grep -q .; then ok "Inscripción Martín Rodríguez"; else fail "Inscripción M1: $(echo "$R" | get_error)"; fi

# ============================================
# Certificados Médicos
# ============================================
log "🩺 Cargando Certificados Médicos..."

R=$(curl -s -X POST "$API/certificados-medicos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"expirationDate\":\"2027-03-15\",\"description\":\"Aptitud para deportes de contacto\",\"doctorName\":\"Dr. Ruiz\"}")
if echo "$R" | get_id | grep -q .; then ok "Certificado Martín Rodríguez"; else fail "Cert M1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/certificados-medicos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"expirationDate\":\"2027-07-22\",\"description\":\"Aptitud general\",\"doctorName\":\"Dra. López\"}")
if echo "$R" | get_id | grep -q .; then ok "Certificado Lucía Fernández"; else fail "Cert M2: $(echo "$R" | get_error)"; fi

# ============================================
# Lockers
# ============================================
log "🔐 Cargando Casilleros..."

R=$(curl -s -X POST "$API/casilleros" -H 'Content-Type: application/json' \
  -d '{"number":1,"location":"Pasillo principal - Planta baja"}')
L1_ID=$(echo "$R" | get_id)
if [ -n "$L1_ID" ]; then ok "Casillero #1 - Pasillo principal"; else fail "Locker 1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/casilleros" -H 'Content-Type: application/json' \
  -d '{"number":2,"location":"Pasillo principal - Planta baja"}')
L2_ID=$(echo "$R" | get_id)
if [ -n "$L2_ID" ]; then ok "Casillero #2 - Pasillo principal"; else fail "Locker 2: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/casilleros" -H 'Content-Type: application/json' \
  -d '{"number":3,"location":"Vestuarios - Planta alta"}')
L3_ID=$(echo "$R" | get_id)
if [ -n "$L3_ID" ]; then ok "Casillero #3 - Vestuarios"; else fail "Locker 3: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/casilleros" -H 'Content-Type: application/json' \
  -d '{"number":4,"location":"Vestuarios - Planta alta"}')
L4_ID=$(echo "$R" | get_id)
if [ -n "$L4_ID" ]; then ok "Casillero #4 - Vestuarios"; else fail "Locker 4: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/casilleros" -H 'Content-Type: application/json' \
  -d '{"number":5,"location":"Sector pileta"}')
L5_ID=$(echo "$R" | get_id)
if [ -n "$L5_ID" ]; then ok "Casillero #5 - Sector pileta"; else fail "Locker 5: $(echo "$R" | get_error)"; fi

# ============================================
# Asignar casilleros a miembros
# Asignar L1 → Martín, L3 → Ana
# ============================================
log "🔗 Asignando Casilleros a Socios..."

R=$(curl -s -X PUT "$API/casilleros/$L1_ID" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"status\":\"Occupied\"}")
if echo "$R" | get_id | grep -q .; then ok "Casillero #1 → Martín Rodríguez"; else fail "Asignación L1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X PUT "$API/casilleros/$L3_ID" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M4_ID\",\"status\":\"Occupied\"}")
if echo "$R" | get_id | grep -q .; then ok "Casillero #3 → Ana Martínez"; else fail "Asignación L3: $(echo "$R" | get_error)"; fi

# ============================================
# Equipment Loans
# ============================================
log "🎒 Cargando Préstamos de Equipamiento..."

R=$(curl -s -X POST "$API/prestamos-equipamiento" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"equipmentName\":\"Pelota de fútbol N⁰5\",\"notes\":\"Préstamo para entrenamiento semanal\"}")
EL1_ID=$(echo "$R" | get_id)
if [ -n "$EL1_ID" ]; then ok "Pelota de fútbol → Martín Rodríguez"; else fail "Loan 1: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/prestamos-equipamiento" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M4_ID\",\"equipmentName\":\"Conos de entrenamiento (x10)\",\"notes\":\"Para práctica de básquet\"}")
EL2_ID=$(echo "$R" | get_id)
if [ -n "$EL2_ID" ]; then ok "Conos de entrenamiento → Ana Martínez"; else fail "Loan 2: $(echo "$R" | get_error)"; fi

R=$(curl -s -X POST "$API/prestamos-equipamiento" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"equipmentName\":\"Red de vóley (profesional)\",\"notes\":\"Préstamo para torneo del fin de semana\"}")
EL3_ID=$(echo "$R" | get_id)
if [ -n "$EL3_ID" ]; then ok "Red de vóley → Martín Rodríguez"; else fail "Loan 3: $(echo "$R" | get_error)"; fi

# Devolver uno de los préstamos
R=$(curl -s -X PUT "$API/prestamos-equipamiento/$EL1_ID/return" -H 'Content-Type: application/json' \
  -d "{\"notes\":\"Devuelto en buen estado\"}")
if echo "$R" | get_id | grep -q .; then ok "Devolución: Pelota de fútbol"; else fail "Return loan: $(echo "$R" | get_error)"; fi

# ============================================
# Resumen
# ============================================
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           📊 SEED DATA COMPLETE              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Miembros:             5"
echo "  Categorías deportivas: 2 (Senior, Lifetime)"
echo "  Deportes:             3"
echo "  Disciplinas:          3"
echo "  Pagos:                4"
echo "  Certificados:         2"
echo "  Casilleros:           5"
echo "  Asignaciones:         2"
echo "  Préstamos:            3 (1 devuelto, 2 activos)"
echo "  Total:                ~24 registros"
echo "  ✅ ${PASS} pasaron  |  ❌ ${FAIL} fallaron"
echo ""
