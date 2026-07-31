#!/bin/sh
set -e

echo "Starting FridgeToFork app container..."

# PostgreSQL is the deployment target. Managed providers (Railway, Neon,
# Supabase) hand over a single DATABASE_URL, which Laravel's pgsql connection
# reads directly — DB_HOST and friends are only needed for docker compose.
DB_CONNECTION="${DB_CONNECTION:-pgsql}"
export DB_CONNECTION

if [ ! -f vendor/autoload.php ]; then
  echo "Missing vendor/autoload.php."
  echo "Install Composer dependencies on the host first so the vendor directory is available to Docker."
  exit 1
fi

echo "Preparing Laravel..."
mkdir -p \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  storage/app/public \
  bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

if [ -z "${APP_KEY}" ]; then
  echo "Generating application key..."
  GENERATED_APP_KEY=$(php artisan key:generate --show --no-interaction)
  export APP_KEY="${GENERATED_APP_KEY}"
  echo "WARNING: APP_KEY was not supplied. A throwaway key was generated for this"
  echo "         container; set APP_KEY in the environment so sessions and"
  echo "         encrypted values survive a restart."
else
  export APP_KEY
fi

php artisan config:clear || true
php artisan cache:clear || true

# SQL Server needs the database created before Laravel can connect to it;
# Postgres providers create it as part of provisioning.
if [ "${DB_CONNECTION}" = "sqlsrv" ]; then
  echo "Ensuring SQL Server database ${DB_DATABASE} exists..."
  SQLSRV_DSN="sqlsrv:Server=${DB_HOST},${DB_PORT};Database=master;Encrypt=${DB_ENCRYPT:-no};TrustServerCertificate=${DB_TRUST_SERVER_CERTIFICATE:-true}"
  export SQLSRV_DSN
  until php -r 'try { new PDO(getenv("SQLSRV_DSN"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); exit(0); } catch (Throwable $e) { fwrite(STDERR, $e->getMessage() . PHP_EOL); exit(1); }'; do
    sleep 5
  done
  php -r '
    $pdo = new PDO(getenv("SQLSRV_DSN"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));
    $database = str_replace("]", "]]", getenv("DB_DATABASE"));
    $pdo->exec("IF DB_ID(N\"" . $database . "\") IS NULL CREATE DATABASE [" . $database . "]");
  ' || true
fi

php docker/app/wait-for-db.php 30 2

echo "Running migrations..."
php artisan migrate --force

# Off by default: seeding on every boot would resurrect demo rows a real user
# had deleted. Set RUN_SEED=true for the first deploy, then unset it.
if [ "${RUN_SEED}" = "true" ] || [ "${RUN_SEED}" = "1" ]; then
  echo "Seeding database..."
  php artisan db:seed --force
else
  echo "Skipping seed (set RUN_SEED=true to seed on boot)."
fi

echo "Caching configuration..."
php artisan config:cache || true
php artisan route:cache || true

# Railway and most PaaS hosts inject the port to bind. Apache is configured
# for 80 in the image, so rewrite it when the platform asks for something else.
APP_LISTEN_PORT="${PORT:-80}"
if [ "${APP_LISTEN_PORT}" != "80" ]; then
  echo "Binding Apache to port ${APP_LISTEN_PORT}..."
  sed -ri "s/^Listen 80$/Listen ${APP_LISTEN_PORT}/" /etc/apache2/ports.conf
  sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${APP_LISTEN_PORT}>/" /etc/apache2/sites-available/*.conf
fi

echo "Starting Apache on port ${APP_LISTEN_PORT}..."
apache2-foreground
