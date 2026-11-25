#!/usr/bin/env bash
# Verifies the local toolchain against the pins in docs/engineering/VERSIONS.md.
# Read-only: changes nothing. Exit code 1 if any check fails.
set -u

fail=0
ok()   { printf '  ok    %s\n' "$1"; }
bad()  { printf '  FAIL  %s\n' "$1"; fail=1; }

check_version() { # name actual wanted-regex
  if [[ "$2" =~ $3 ]]; then ok "$1 $2"; else bad "$1 $2 (want $3)"; fi
}

echo "Istigaba toolchain check"

php_v=$(php -r 'echo PHP_VERSION;' 2>/dev/null || echo missing)
check_version php "$php_v" '^8\.4\.'
for ext in pdo_pgsql pgsql intl sodium mbstring fileinfo exif gd openssl; do
  if php -m 2>/dev/null | grep -qix "$ext"; then ok "php ext $ext"; else bad "php ext $ext missing"; fi
done
composer_php=$(composer --version --no-ansi 2>&1 | sed -n 's/.*PHP version \([0-9.]*\).*/\1/p' | head -1)
check_version "composer runs on php" "${composer_php:-missing}" '^8\.4\.'

check_version node "$(node -v 2>/dev/null || echo missing)" "^v$(tr -d '[:space:]' < "$(dirname "$0")/../.nvmrc")$"
check_version pnpm "$(pnpm -v 2>/dev/null || echo missing)" '^12\.23\.'

if command -v py >/dev/null 2>&1; then
  check_version python3.13 "$(py -3.13 -c 'import platform;print(platform.python_version())' 2>/dev/null || echo missing)" '^3\.13\.'
else
  check_version python3.13 "$(python3.13 -c 'import platform;print(platform.python_version())' 2>/dev/null || echo missing)" '^3\.13\.'
fi

check_version psql "$(psql --version 2>/dev/null | awk '{print $3}')" '^18\.'
share=$(pg_config --sharedir 2>/dev/null)
if [ -n "$share" ] && grep -q "default_version = '3\.7" "$share/extension/postgis.control" 2>/dev/null; then
  ok "postgis 3.7 available"
else
  bad "postgis 3.7 not found in pg_config sharedir"
fi

exit $fail
