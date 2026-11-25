#!/usr/bin/env bash
# Creates the local PostgreSQL role and databases for Istigaba and enables PostGIS.
# Idempotent: safe to run again. Never drops the dev database.
#
#   pnpm db:setup                 create role `istigaba`, databases `istigaba` + `istigaba_test`, PostGIS in both
#   pnpm db:setup --recreate-test also drop and recreate ONLY `istigaba_test`
#
# Superuser: PG_SUPERUSER/PG_HOST/PG_PORT from the root .env (defaults postgres/127.0.0.1/5432).
# Its password comes from PGPASSWORD, your pgpass file, or psql's prompt; it is never stored or echoed.
# App role: DB_USERNAME/DB_PASSWORD/DB_DATABASE/DB_TEST_DATABASE from apps/api/.env.
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"

read_env() { # file key default
  local value
  value=$(grep -E "^$2=" "$1" 2>/dev/null | tail -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' || true)
  printf '%s' "${value:-$3}"
}

root_env="$root/.env"
api_env="$root/apps/api/.env"
if [ ! -f "$api_env" ]; then
  echo "apps/api/.env not found. Copy apps/api/.env.example and set DB_PASSWORD first." >&2
  exit 1
fi

PG_SUPERUSER=$(read_env "$root_env" PG_SUPERUSER postgres)
PG_HOST=$(read_env "$root_env" PG_HOST 127.0.0.1)
PG_PORT=$(read_env "$root_env" PG_PORT 5432)
APP_USER=$(read_env "$api_env" DB_USERNAME istigaba)
APP_PASSWORD=$(read_env "$api_env" DB_PASSWORD "")
DEV_DB=$(read_env "$api_env" DB_DATABASE istigaba)
TEST_DB=$(read_env "$api_env" DB_TEST_DATABASE istigaba_test)

recreate_test=false
[ "${1:-}" = "--recreate-test" ] && recreate_test=true

if [ -z "$APP_PASSWORD" ]; then
  echo "DB_PASSWORD is empty in apps/api/.env. Set it before running this script." >&2
  exit 1
fi
if [[ ! "$TEST_DB" =~ _test$ ]]; then
  echo "DB_TEST_DATABASE must end in _test (got '$TEST_DB')." >&2
  exit 1
fi
for ident in "$APP_USER" "$DEV_DB" "$TEST_DB"; do
  if [[ ! "$ident" =~ ^[a-z_][a-z0-9_]*$ ]]; then
    echo "Refusing unsafe identifier '$ident' (lowercase letters, digits, underscore only)." >&2
    exit 1
  fi
done

psql_super() { # db, then psql args
  local db="$1"; shift
  psql -v ON_ERROR_STOP=1 -X -q -h "$PG_HOST" -p "$PG_PORT" -U "$PG_SUPERUSER" -d "$db" "$@"
}

echo "Role '$APP_USER'"
# The password reaches psql only through the environment (\getenv) and is quoted by %L:
# it never appears on a command line or in the process list.
ISTIGABA_APP_DB_PASSWORD="$APP_PASSWORD" psql_super postgres -v role="$APP_USER" <<'SQL'
\getenv pw ISTIGABA_APP_DB_PASSWORD
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role', :'pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role') \gexec
SELECT format('ALTER ROLE %I WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD %L', :'role', :'pw') \gexec
SQL

if $recreate_test; then
  echo "Dropping '$TEST_DB' (test database only)"
  psql_super postgres -c "DROP DATABASE IF EXISTS \"$TEST_DB\" WITH (FORCE);"
fi

for db in "$DEV_DB" "$TEST_DB"; do
  echo "Database '$db'"
  psql_super postgres -v db="$db" -v owner="$APP_USER" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I ENCODING ''UTF8'' TEMPLATE template0', :'db', :'owner')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db') \gexec
SQL
  # PostGIS is not a trusted extension: it must be created by a superuser.
  psql_super "$db" -c "CREATE EXTENSION IF NOT EXISTS postgis;"
  psql_super "$db" -c "GRANT ALL ON SCHEMA public TO \"$APP_USER\";"
  printf '  PostGIS: '
  psql_super "$db" -t -A -c "SELECT postgis_lib_version();"
done

echo "Done. Next: php apps/api/artisan migrate"
