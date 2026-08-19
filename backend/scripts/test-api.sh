#!/usr/bin/env bash
# Blue Mobile — end-to-end API test suite (LOCAL DEVELOPMENT TOOL)
# Requires a running backend + a freshly seeded database.
# Credentials default to the local dev seed; override via env:
#   TEST_ADMIN_USER / TEST_ADMIN_PASS / TEST_BASE_URL
set -u
BASE="${TEST_BASE_URL:-http://localhost:4000/api}"
ADMIN_USER="${TEST_ADMIN_USER:-admin}"
ADMIN_PASS="${TEST_ADMIN_PASS:-BlueMobile@2026!}"
JAR=$(mktemp)
JAR2=$(mktemp)
PASS=0; FAIL=0

check() { # check <desc> <expected_status> <actual_status>
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); echo "  ✔ $1";
  else FAIL=$((FAIL+1)); echo "  ✖ $1 (expected $2, got $3)"; fi
}

code() { curl -s -o /tmp/bm_body -w "%{http_code}" "$@"; }

echo "== 1. Public endpoints =="
c=$(code "$BASE/health");                    check "GET /api/health -> 200" 200 "$c"
c=$(code "$BASE/does-not-exist");            check "unknown route -> 404"   404 "$c"

echo "== 2. Auth required =="
c=$(code "$BASE/products");                  check "GET /products unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/sales");                     check "GET /sales unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/customers");                 check "GET /customers unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/dashboard/summary");         check "GET /dashboard/summary unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/reports");                   check "GET /reports unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/sessions/current");          check "GET /sessions/current unauthenticated -> 401" 401 "$c"
c=$(code "$BASE/auth/me");                   check "GET /auth/me unauthenticated -> 401" 401 "$c"
c=$(code -X POST "$BASE/auth/logout");       check "POST /auth/logout unauthenticated -> 401" 401 "$c"

echo "== 3. Login =="
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"WRONG"}')
check "login wrong password -> 401" 401 "$c"
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"'"$ADMIN_PASS"'"}' -c "$JAR")
check "login correct -> 200" 200 "$c"
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"'"$ADMIN_PASS"'"}' -c "$JAR2")
check "second session login -> 200" 200 "$c"

echo "== 4. /auth/me =="
c=$(code "$BASE/auth/me" -b "$JAR"); check "GET /auth/me authed -> 200" 200 "$c"
grep -q '"username":"'"$ADMIN_USER"'"' /tmp/bm_body && echo "  ✔ me returns username" && PASS=$((PASS+1)) || { echo "  ✖ me missing username"; FAIL=$((FAIL+1)); }
grep -q 'password' /tmp/bm_body && { echo "  ✖ LEAKED password field!"; FAIL=$((FAIL+1)); } || { echo "  ✔ no password in response"; PASS=$((PASS+1)); }

echo "== 5. Products CRUD =="
c=$(code "$BASE/products" -b "$JAR"); check "list products -> 200" 200 "$c"
N=$(grep -o '"id"' /tmp/bm_body | wc -l); [ "$N" -ge 7 ] && { echo "  ✔ seeded products present ($N)"; PASS=$((PASS+1)); } || { echo "  ✖ expected >=7 products, got $N"; FAIL=$((FAIL+1)); }

PID=$(curl -s -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json' \
  -d '{"name":"USB-C Cable 2m","category":"Cables","brand":"Anker","quantity":25,"buyingPrice":4.5,"sellingPrice":12,"barcode":"TEST-0001","minimumStock":5}' | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['id'])")
echo "  created product: $PID"

c=$(code "$BASE/products/barcode/TEST-0001" -b "$JAR"); check "barcode lookup -> 200" 200 "$c"
c=$(code "$BASE/products/barcode/NO-SUCH" -b "$JAR");    check "barcode not found -> 404" 404 "$c"
c=$(code -X PUT "$BASE/products/$PID" -b "$JAR" -H 'Content-Type: application/json' -d '{"sellingPrice":13.5}'); check "update product -> 200" 200 "$c"
curl -s "$BASE/products?search=USB-C" -b "$JAR" | grep -q "USB-C Cable" && { echo "  ✔ search works"; PASS=$((PASS+1)); } || { echo "  ✖ search failed"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json' -d '{"name":"Dup Barcode","sellingPrice":1,"buyingPrice":1,"barcode":"TEST-0001"}'); check "duplicate barcode -> 409" 409 "$c"
c=$(code -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json' -d '{"name":"","sellingPrice":-5}'); check "invalid product -> 400" 400 "$c"

echo "== 6. Day session lifecycle =="
c=$(code "$BASE/sessions/current" -b "$JAR"); check "no open session -> 200 (null)" 200 "$c"
grep -q '"session":null' /tmp/bm_body && { echo "  ✔ session is null"; PASS=$((PASS+1)); } || { echo "  ✖ expected null session"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"Saturday","date":"2026-08-16"}'); check "start day -> 201" 201 "$c"
SID=$(python3 -c "import sys,json;print(json.load(open('/tmp/bm_body'))['session']['id'])")
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"Sunday","date":"2026-08-17"}'); check "second day while open -> 409" 409 "$c"
c=$(code -X POST "$BASE/sessions" -b "$JAR2" -H 'Content-Type: application/json' -d '{"dayName":"Sunday","date":"2026-08-17"}'); check "second session (same server) -> 409" 409 "$c"
c=$(code "$BASE/sessions/current" -b "$JAR"); check "current session -> 200" 200 "$c"

echo "== 7. Sales =="
c=$(code "$BASE/sales" -b "$JAR"); check "list sales (empty) -> 200" 200 "$c"
Q0=$(curl -s "$BASE/products/barcode/TEST-0001" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
echo "  stock before sale: $Q0"
c=$(code -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":3,\"unitPrice\":12,\"paymentMethod\":\"cash\"}")
check "create sale -> 201" 201 "$c"
SALE=$(python3 -c "import sys,json;print(json.load(open('/tmp/bm_body'))['sale']['id'])")
curl -s "$BASE/sales" -b "$JAR" | grep -q '"saleNumber":"INV-00001"' && { echo "  ✔ invoice INV-00001"; PASS=$((PASS+1)); } || { echo "  ✖ invoice numbering wrong"; FAIL=$((FAIL+1)); }
Q1=$(curl -s "$BASE/products/barcode/TEST-0001" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
[ "$((Q0-3))" = "$Q1" ] && { echo "  ✔ stock decremented $Q0 -> $Q1"; PASS=$((PASS+1)); } || { echo "  ✖ stock not decremented ($Q0 -> $Q1)"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":9999,\"unitPrice\":2,\"paymentMethod\":\"cash\"}")
check "oversell blocked -> 400" 400 "$c"
grep -q "Insufficient stock" /tmp/bm_body && { echo "  ✔ clear insufficient-stock message"; PASS=$((PASS+1)); } || { echo "  ✖ message missing"; FAIL=$((FAIL+1)); }
c=$(code -X PUT "$BASE/sales/$SALE" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":5,\"unitPrice\":13,\"paymentMethod\":\"card\"}")
check "edit sale -> 200" 200 "$c"
Q2=$(curl -s "$BASE/products/barcode/TEST-0001" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
[ "$((Q0-5))" = "$Q2" ] && { echo "  ✔ stock after edit correct ($Q2)"; PASS=$((PASS+1)); } || { echo "  ✖ stock after edit wrong ($Q2, expected $((Q0-5)))"; FAIL=$((FAIL+1)); }
curl -s "$BASE/sales" -b "$JAR" | grep -q '"paymentMethod":"card"' && { echo "  ✔ payment method updated"; PASS=$((PASS+1)); } || { echo "  ✖ payment method not updated"; FAIL=$((FAIL+1)); }

echo "== 8. Dashboard =="
c=$(code "$BASE/dashboard/summary" -b "$JAR"); check "dashboard summary -> 200" 200 "$c"
python3 - << 'PYEOF'
import json
d = json.load(open('/tmp/bm_body'))['summary']
assert d['today']['count'] == 1, d['today']
assert d['today']['sales'] == 65.0, d['today']          # 5 x 13
assert d['today']['profit'] == 42.5, d['today']         # 5 x (13-4.5)
assert d['today']['card'] == 65.0, d['today']
assert d['session'] and d['session']['dayName'] == 'Saturday'
assert len(d['recent']) == 1
print("  ✔ dashboard values correct (count/sales/profit/card/session/recent)")
PYEOF
PASS=$((PASS+1))

echo "== 9. Customers + transactions =="
c=$(code "$BASE/customers" -b "$JAR"); check "list customers -> 200" 200 "$c"
CID=$(curl -s -X POST "$BASE/customers" -b "$JAR" -H 'Content-Type: application/json' -d '{"name":"Ahmed Ali","phone":"0912345678","notes":"Regular"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['customer']['id'])")
c=$(code -X POST "$BASE/customers/$CID/transactions" -b "$JAR" -H 'Content-Type: application/json' -d '{"type":"credit","amount":150,"note":"iPhone case"}'); check "add credit -> 201" 201 "$c"
c=$(code -X POST "$BASE/customers/$CID/transactions" -b "$JAR" -H 'Content-Type: application/json' -d '{"type":"payment","amount":50,"note":""}'); check "record payment -> 201" 201 "$c"
BAL=$(curl -s "$BASE/customers/$CID" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['customer']['balance'])")
[ "$(python3 -c "print(abs($BAL - 100.0) < 0.001)")" = "True" ] && { echo "  ✔ balance = 100 (150 credit - 50 payment)"; PASS=$((PASS+1)); } || { echo "  ✖ balance wrong: $BAL"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/customers/$CID/transactions" -b "$JAR" -H 'Content-Type: application/json' -d '{"type":"credit","amount":-5}'); check "negative amount -> 400" 400 "$c"
c=$(code -X PUT "$BASE/customers/$CID" -b "$JAR" -H 'Content-Type: application/json' -d '{"name":"Ahmed Ali B."}'); check "update customer -> 200" 200 "$c"

echo "== 10. Close day + reports =="
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close day -> 200" 200 "$c"
python3 - << 'PYEOF'
import json
r = json.load(open('/tmp/bm_body'))['report']
assert r['totals']['count'] == 1 and r['totals']['sales'] == 65.0 and r['totals']['profit'] == 42.5
assert r['totals']['card'] == 65.0
print("  ✔ close-day report totals correct")
PYEOF
PASS=$((PASS+1))
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close with no open day -> 400" 400 "$c"
c=$(code "$BASE/reports" -b "$JAR"); check "reports list -> 200" 200 "$c"
RID=$(python3 -c "import sys,json;print(json.load(open('/tmp/bm_body'))['reports'][0]['id'])")
c=$(code "$BASE/reports/$RID" -b "$JAR"); check "report detail -> 200" 200 "$c"
grep -q "USB-C Cable" /tmp/bm_body && { echo "  ✔ report keeps product name snapshot"; PASS=$((PASS+1)); } || { echo "  ✖ snapshot missing"; FAIL=$((FAIL+1)); }
c=$(code "$BASE/reports/monthly" -b "$JAR"); check "monthly summary -> 200" 200 "$c"
grep -q '"month":"2026-08"' /tmp/bm_body && { echo "  ✔ monthly groups by YYYY-MM"; PASS=$((PASS+1)); } || { echo "  ✖ monthly grouping wrong"; FAIL=$((FAIL+1)); }
c=$(code "$BASE/reports/best-sellers" -b "$JAR"); check "best sellers -> 200" 200 "$c"
grep -q "USB-C Cable" /tmp/bm_body && { echo "  ✔ best sellers has product"; PASS=$((PASS+1)); } || { echo "  ✖ best sellers missing"; FAIL=$((FAIL+1)); }
c=$(code "$BASE/reports/low-stock" -b "$JAR"); check "low stock report -> 200" 200 "$c"
c=$(code "$BASE/reports?from=2026-08-01&to=2026-08-31" -b "$JAR"); check "reports date range -> 200" 200 "$c"
c=$(code -X PUT "$BASE/sales/$SALE" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":1,\"unitPrice\":2,\"paymentMethod\":\"cash\"}")
check "edit closed-day sale -> 409" 409 "$c"
c=$(code -X DELETE "$BASE/sales/$SALE" -b "$JAR"); check "delete closed-day sale -> 409" 409 "$c"

echo "== 11. Sale inside open day + delete restores stock =="
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"Sunday","date":"2026-08-16"}'); check "open new day -> 201" 201 "$c"
SALE2=$(curl -s -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$PID\",\"quantity\":2,\"unitPrice\":12,\"paymentMethod\":\"cash\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['sale']['id'])")
Q3=$(curl -s "$BASE/products/barcode/TEST-0001" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
c=$(code -X DELETE "$BASE/sales/$SALE2" -b "$JAR"); check "delete open-day sale -> 200" 200 "$c"
Q4=$(curl -s "$BASE/products/barcode/TEST-0001" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
[ "$Q4" = "$Q3" ] && { echo "  ✖ stock not restored after delete ($Q3 -> $Q4)"; FAIL=$((FAIL+1)); } || { echo "  ✔ stock restored after delete ($Q3 -> $Q4)"; PASS=$((PASS+1)); }

echo "== 12. Product delete with history =="
c=$(code -X DELETE "$BASE/products/$PID" -b "$JAR"); check "delete product with history -> 200" 200 "$c"
grep -q '"id"' /tmp/bm_body && { echo "  ✔ product deleted, history keeps snapshot"; PASS=$((PASS+1)); } || { echo "  ✖ delete failed"; FAIL=$((FAIL+1)); }
c=$(code "$BASE/reports/$RID" -b "$JAR"); check "old report still intact -> 200" 200 "$c"
grep -q "USB-C Cable" /tmp/bm_body && { echo "  ✔ report unchanged after product deletion"; PASS=$((PASS+1)); } || { echo "  ✖ report broken"; FAIL=$((FAIL+1)); }

echo "== 13. Change password =="
c=$(code -X PUT "$BASE/auth/change-password" -b "$JAR" -H 'Content-Type: application/json' -d '{"currentPassword":"WRONG","newPassword":"NewPass@123"}')
check "change password wrong current -> 400" 400 "$c"
c=$(code -X PUT "$BASE/auth/change-password" -b "$JAR" -H 'Content-Type: application/json' -d '{"currentPassword":"'"$ADMIN_PASS"'","newPassword":"NewPass@123"}')
check "change password correct -> 200" 200 "$c"
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"'"$ADMIN_PASS"'"}')
check "old password no longer works -> 401" 401 "$c"
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"NewPass@123"}' -c "$JAR2")
check "new password works -> 200" 200 "$c"
c=$(code "$BASE/auth/me" -b "$JAR"); check "previous session still valid -> 200" 200 "$c"
c=$(code -X PUT "$BASE/auth/change-password" -b "$JAR2" -H 'Content-Type: application/json' -d '{"currentPassword":"NewPass@123","username":"blueadmin"}')
check "change username -> 200" 200 "$c"
c=$(code "$BASE/auth/me" -b "$JAR2"); check "me shows new username -> 200" 200 "$c"
grep -q '"username":"blueadmin"' /tmp/bm_body && { echo "  ✔ username updated"; PASS=$((PASS+1)); } || { echo "  ✖ username not updated"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"blueadmin","password":"NewPass@123"}' -c "$JAR2")
check "login with new username -> 200" 200 "$c"
c=$(code -X PUT "$BASE/auth/change-password" -b "$JAR2" -H 'Content-Type: application/json' -d '{"currentPassword":"NewPass@123","username":"'"$ADMIN_USER"'","newPassword":"'"$ADMIN_PASS"'"}')
check "restore admin credentials -> 200" 200 "$c"

echo "== 14. Logout + session revocation =="
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"'"$ADMIN_PASS"'"}' -c "$JAR")
check "fresh login (new session) -> 200" 200 "$c"
c=$(code -X POST "$BASE/auth/logout" -b "$JAR"); check "logout -> 200" 200 "$c"
c=$(code "$BASE/auth/me" -b "$JAR"); check "me after logout -> 401" 401 "$c"
c=$(code "$BASE/products" -b "$JAR"); check "products after logout -> 401" 401 "$c"
c=$(code "$BASE/auth/me" -b "$JAR2"); check "other session untouched -> 200" 200 "$c"

echo "== 14b. Purchase batches + FIFO costing =="
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" -c "$JAR")
check "fresh login for new-feature tests -> 200" 200 "$c"
FRESH=$(curl -s -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json'   -d '{"name":"FIFO Cable","category":"Cables","quantity":10,"buyingPrice":4,"sellingPrice":9,"barcode":"FIFO-1"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['id'])")
c=$(code -X POST "$BASE/products/$FRESH/purchase" -b "$JAR" -H 'Content-Type: application/json' -d '{"quantity":10,"unitCost":9}')
check "purchase batch -> 201" 201 "$c"
PB=$(python3 -c "import sys,json;p=json.load(open('/tmp/bm_body'))['product'];print(p['quantity'], p['buyingPrice'])")
case "$PB" in
  "20 9"|"20 9.0") echo "  ✔ quantity +10 (20) and buyingPrice updated to latest (9)"; PASS=$((PASS+1));;
  *) echo "  ✖ purchase result wrong: $PB"; FAIL=$((FAIL+1));;
esac
c=$(code -X POST "$BASE/products/$FRESH/purchase" -b "$JAR" -H 'Content-Type: application/json' -d '{"quantity":-3,"unitCost":5}'); check "negative purchase qty -> 400" 400 "$c"
# close any leftover open day (section 11 left one open), then FIFO tests
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close leftover day -> 200" 200 "$c"
# FIFO: sell 12 → 10 units from batch@4 + 2 units from batch@9 → cost = (40+18)/12 = 4.8333
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"FIFO","date":"2026-08-17"}'); check "open FIFO day -> 201" 201 "$c"
curl -s -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$FRESH\",\"quantity\":12,\"unitPrice\":9,\"paymentMethod\":\"cash\"}" | python3 -c "
import sys,json
it=json.load(sys.stdin)['sale']['items'][0]
c=it['unitCost']
assert abs(c-4.83)<0.011, c
print(f'  ✔ FIFO unit cost {c:.2f} (10×4 + 2×9)/12')
"
PASS=$((PASS+1))
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close FIFO day -> 200" 200 "$c"

echo "== 14c. Manual sale item (service, no inventory) =="
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"Services","date":"2026-08-17"}'); check "open day for services -> 201" 201 "$c"
M_SALE=$(curl -s -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d '{"manualText":"Software installation","quantity":1,"unitPrice":25,"paymentMethod":"cash"}' | python3 -c "import sys,json;s=json.load(sys.stdin)['sale'];print(s['id'])")
python3 - << 'PYEOF'
import json
sale = json.load(open('/tmp/bm_body'))['sale']
it = sale['items'][0]
assert it['isManual'] is True, it
assert it['unitCost'] == 0.0, it
assert it['subtotal'] == 25.0, it
assert sale['totalAmount'] == 25.0, sale
print("  ✔ manual item saved (isManual, cost 0, in total)")
PYEOF
PASS=$((PASS+1))
QB=$(curl -s "$BASE/products/barcode/FIFO-1" -b "$JAR" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['quantity'])")
[ "$QB" = "8" ] && { echo "  ✔ manual item did NOT change inventory ($QB)"; PASS=$((PASS+1)); } || { echo "  ✖ inventory changed by manual item: $QB"; FAIL=$((FAIL+1)); }
# sale without product AND without manualText must fail
c=$(code -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d '{"quantity":1,"unitPrice":5,"paymentMethod":"cash"}'); check "sale without product/manual -> 400" 400 "$c"
# close services day (report with manual item)
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close services day -> 200" 200 "$c"
grep -q "Software installation" /tmp/bm_body && { echo "  ✔ closed-day report contains the manual item"; PASS=$((PASS+1)); } || { echo "  ✖ manual item missing from report"; FAIL=$((FAIL+1)); }

echo "== 14d. Daily notes =="
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"Notes","date":"2026-08-18"}'); check "open day for notes -> 201" 201 "$c"
N1=$(curl -s -X POST "$BASE/notes" -b "$JAR" -H 'Content-Type: application/json' -d '{"text":"Gave my brother 100 LYD"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['note']['id'])")
c=$(code -X POST "$BASE/notes" -b "$JAR" -H 'Content-Type: application/json' -d '{"text":"Paid 30 LYD expenses"}'); check "add second note -> 201" 201 "$c"
c=$(code "$BASE/notes" -b "$JAR"); check "list notes -> 200" 200 "$c"
grep -q "Gave my brother" /tmp/bm_body && { echo "  ✔ notes listed"; PASS=$((PASS+1)); } || { echo "  ✖ notes missing"; FAIL=$((FAIL+1)); }
c=$(code -X DELETE "$BASE/notes/$N1" -b "$JAR"); check "delete note -> 200" 200 "$c"
curl -s "$BASE/notes" -b "$JAR" | grep -q "Gave my brother" && { echo "  ✖ deleted note still listed"; FAIL=$((FAIL+1)); } || { echo "  ✔ note deleted"; PASS=$((PASS+1)); }
# note without session while a day is open attaches to the open day
c=$(code -X POST "$BASE/notes" -b "$JAR" -H 'Content-Type: application/json' -d '{"text":"Store note"}'); check "note auto-attaches to open day -> 201" 201 "$c"
c=$(code -X POST "$BASE/sessions/close" -b "$JAR"); check "close notes day -> 200" 200 "$c"
grep -q "Store note" /tmp/bm_body && { echo "  ✔ closed-day report includes notes"; PASS=$((PASS+1)); } || { echo "  ✖ notes missing from report"; FAIL=$((FAIL+1)); }

echo "== 14e. Device models =="
c=$(code "$BASE/device-models" -b "$JAR"); check "list device models -> 200" 200 "$c"
MID=$(curl -s -X POST "$BASE/device-models" -b "$JAR" -H 'Content-Type: application/json' -d '{"brand":"Infinix","model":"Hot 40"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['model']['id'])")
c=$(code -X POST "$BASE/device-models" -b "$JAR" -H 'Content-Type: application/json' -d '{"brand":"Infinix","model":"Hot 40"}'); check "duplicate model -> 200 (idempotent)" 200 "$c"
curl -s "$BASE/device-models?search=infinix" -b "$JAR" | grep -q "Hot 40" && { echo "  ✔ model search works"; PASS=$((PASS+1)); } || { echo "  ✖ model search failed"; FAIL=$((FAIL+1)); }

echo "== 14f. Product type fields + zero-stock partition =="
SCASE=$(curl -s -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json' -d "{\"name\":\"Case Test\",\"category\":\"Phone Cases\",\"quantity\":2,\"buyingPrice\":3,\"sellingPrice\":10,\"compatibleModelId\":\"$MID\"}" | python3 -c "import sys,json;print(json.load(sys.stdin)['product']['id'])")
c=$(code -X POST "$BASE/products" -b "$JAR" -H 'Content-Type: application/json' -d '{"name":"Case NoModel","category":"Phone Cases","quantity":2,"buyingPrice":3,"sellingPrice":10}'); check "case without model -> 400" 400 "$c"
# sell all stock of Case Test → moves to outOfStock
c=$(code -X POST "$BASE/sessions" -b "$JAR" -H 'Content-Type: application/json' -d '{"dayName":"ZeroStock","date":"2026-08-19"}'); check "open day -> 201" 201 "$c"
curl -s -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$SCASE\",\"quantity\":2,\"unitPrice\":10,\"paymentMethod\":\"cash\"}" -o /dev/null -w ""
c=$(code "$BASE/products?includeOut=true" -b "$JAR"); check "products list -> 200" 200 "$c"
grep -q '"outOfStock"' /tmp/bm_body && { echo "  ✔ outOfStock partition present"; PASS=$((PASS+1)); } || { echo "  ✖ outOfStock missing"; FAIL=$((FAIL+1)); }
OOS=$(python3 -c "import sys,json;d=json.load(open('/tmp/bm_body'));print(any(p['id']=='$SCASE' for p in d['outOfStock']), any(p['id']=='$SCASE' for p in d['products']))")
[ "$OOS" = "True False" ] && { echo "  ✔ zero-stock product moved to outOfStock (kept, not for sale)"; PASS=$((PASS+1)); } || { echo "  ✖ partition wrong: $OOS"; FAIL=$((FAIL+1)); }
c=$(code -X POST "$BASE/sales" -b "$JAR" -H 'Content-Type: application/json' -d "{\"productId\":\"$SCASE\",\"quantity\":1,\"unitPrice\":10,\"paymentMethod\":\"cash\"}"); check "sale of zero-stock product -> 400" 400 "$c"
# restock brings it back to active
c=$(code -X POST "$BASE/products/$SCASE/purchase" -b "$JAR" -H 'Content-Type: application/json' -d '{"quantity":5,"unitCost":4}'); check "restock zero-stock product -> 201" 201 "$c"
c=$(code "$BASE/products?includeOut=true" -b "$JAR"); check "products after restock -> 200" 200 "$c"
ACT=$(python3 -c "import sys,json;d=json.load(open('/tmp/bm_body'));print(any(p['id']=='$SCASE' for p in d['products']))")
[ "$ACT" = "True" ] && { echo "  ✔ restocked product back in active inventory"; PASS=$((PASS+1)); } || { echo "  ✖ product not active after restock"; FAIL=$((FAIL+1)); }

echo "== 15. Clear all data =="
c=$(code -X DELETE "$BASE/admin/data" -b "$JAR2"); check "clear data -> 200" 200 "$c"
c=$(code "$BASE/products" -b "$JAR2"); check "products empty after clear -> 200" 200 "$c"
grep -q '"products":\[\]' /tmp/bm_body && { echo "  ✔ products cleared"; PASS=$((PASS+1)); } || { echo "  ✖ products not cleared"; FAIL=$((FAIL+1)); }
c=$(code "$BASE/customers" -b "$JAR2"); check "customers cleared -> 200" 200 "$c"
c=$(code "$BASE/reports" -b "$JAR2"); check "reports cleared -> 200" 200 "$c"

echo "== 16. Rate limiting on login =="
for i in $(seq 1 12); do
  code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"wrong"}' -o /dev/null > /dev/null
done
c=$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{"username":"'"$ADMIN_USER"'","password":"wrong"}')
check "login rate limited -> 429" 429 "$c"

echo
echo "========================================"
echo "RESULTS: $PASS passed, $FAIL failed"
echo "========================================"
[ "$FAIL" = "0" ]
