#!/usr/bin/env bash
# ============================================================
# Seed Data — Alentapp Docente
# Carga datos de ejemplo para todas las entidades vía API
# ============================================================

API="http://localhost:3000/api/v1"
PASS=0
FAIL=0

log() { echo -e "\n\033[1;34m$1\033[0m"; }
ok() { echo -e "  \033[0;32m✅ $1\033[0m"; ((PASS++)); }
fail() { echo -e "  \033[0;31m❌ $1\033[0m"; ((FAIL++)); }

echo "╔══════════════════════════════════════════════╗"
echo "║    🌱 Seed Data — Alentapp Docente          ║"
echo "╚══════════════════════════════════════════════╝"

# ============================================
# Miembros
# ============================================
log "👥 Cargando Miembros..."

M1=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"10123456","name":"Martín Rodríguez","email":"martin@email.com","birthdate":"1990-03-15","category":"Pleno"}')
M1_ID=$(echo "$M1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M1_ID" ] && ok "Martín Rodríguez (Pleno)" || fail "Miembro 1 falló"

M2=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"20234567","name":"Lucía Fernández","email":"lucia@email.com","birthdate":"2005-07-22","category":"Cadete"}')
M2_ID=$(echo "$M2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M2_ID" ] && ok "Lucía Fernández (Cadete)" || fail "Miembro 2 falló"

M3=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"30345678","name":"Carlos Gómez","email":"carlos@email.com","birthdate":"1985-11-08","category":"Honorario"}')
M3_ID=$(echo "$M3" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M3_ID" ] && ok "Carlos Gómez (Honorario)" || fail "Miembro 3 falló"

M4=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"40456789","name":"Ana Martínez","email":"ana@email.com","birthdate":"1995-12-01","category":"Pleno"}')
M4_ID=$(echo "$M4" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M4_ID" ] && ok "Ana Martínez (Pleno)" || fail "Miembro 4 falló"

M5=$(curl -s -X POST "$API/socios" -H 'Content-Type: application/json' \
  -d '{"dni":"50567890","name":"Pedro López","email":"pedro@email.com","birthdate":"2008-04-18","category":"Cadete"}')
M5_ID=$(echo "$M5" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$M5_ID" ] && ok "Pedro López (Cadete)" || fail "Miembro 5 falló"

# ============================================
# Deportes
# ============================================
log "⚽ Cargando Deportes..."

S1=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Fútbol","description":"Deporte de equipo con 11 jugadores","maxCapacity":22}')
S1_ID=$(echo "$S1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$S1_ID" ] && ok "Fútbol (cap. 22)" || fail "Sport 1 falló"

S2=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Básquet","description":"Deporte de equipo con 5 jugadores","maxCapacity":10}')
S2_ID=$(echo "$S2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$S2_ID" ] && ok "Básquet (cap. 10)" || fail "Sport 2 falló"

S3=$(curl -s -X POST "$API/sports" -H 'Content-Type: application/json' \
  -d '{"name":"Natación","description":"Deporte acuático individual","maxCapacity":30}')
S3_ID=$(echo "$S3" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)
[ -n "$S3_ID" ] && ok "Natación (cap. 30)" || fail "Sport 3 falló"

# ============================================
# Disciplinas
# ============================================
log "🏋️ Cargando Disciplinas..."

D1=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S1_ID\",\"name\":\"Fútbol Infantil\",\"description\":\"Categoría de 6 a 12 años\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Lunes y Miércoles 17:00\",\"professor\":\"Prof. Pérez\"}")
[ -n "$(echo $D1 | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)" ] && ok "Fútbol Infantil" || fail "Disciplina 1 falló"

D2=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S1_ID\",\"name\":\"Fútbol Femenino\",\"description\":\"Categoría femenina todas las edades\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Martes y Jueves 18:00\",\"professor\":\"Prof. García\"}")
[ -n "$(echo $D2 | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)" ] && ok "Fútbol Femenino" || fail "Disciplina 2 falló"

D3=$(curl -s -X POST "$API/disciplinas" -H 'Content-Type: application/json' \
  -d "{\"sportId\":\"$S2_ID\",\"name\":\"Básquet Infantil\",\"description\":\"Categoría de 8 a 14 años\",\"startDate\":\"2026-03-01\",\"endDate\":\"2026-12-15\",\"schedule\":\"Lunes y Miércoles 16:00\",\"professor\":\"Prof. Martínez\"}")
[ -n "$(echo $D3 | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null)" ] && ok "Básquet Infantil" || fail "Disciplina 3 falló"

# ============================================
# Pagos
# ============================================
log "💰 Cargando Pagos..."

curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}" > /dev/null && ok "Pago Martín Rodríguez (Cuota)"
curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}" > /dev/null && ok "Pago Lucía Fernández (Cuota)"
curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M4_ID\",\"amount\":15000,\"description\":\"Cuota marzo 2026\",\"paymentType\":\"Cuota\"}" > /dev/null && ok "Pago Ana Martínez (Cuota)"
curl -s -X POST "$API/pagos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"amount\":80000,\"description\":\"Inscripción anual\",\"paymentType\":\"Inscripcion\"}" > /dev/null && ok "Inscripción Martín Rodríguez"

# ============================================
# Certificados Médicos
# ============================================
log "🩺 Cargando Certificados Médicos..."

curl -s -X POST "$API/certificados-medicos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M1_ID\",\"expirationDate\":\"2027-03-15\",\"description\":\"Aptitud para deportes de contacto\",\"doctorName\":\"Dr. Ruiz\"}" > /dev/null && ok "Certificado Martín Rodríguez"
curl -s -X POST "$API/certificados-medicos" -H 'Content-Type: application/json' \
  -d "{\"memberId\":\"$M2_ID\",\"expirationDate\":\"2027-07-22\",\"description\":\"Aptitud general\",\"doctorName\":\"Dra. López\"}" > /dev/null && ok "Certificado Lucía Fernández"

# ============================================
# Resumen
# ============================================
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           📊 SEED DATA COMPLETE              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Miembros:        5"
echo "  Deportes:        3"
echo "  Disciplinas:     3"
echo "  Pagos:           4"
echo "  Certificados:    2"
echo "  Total:           17 registros"
echo ""
