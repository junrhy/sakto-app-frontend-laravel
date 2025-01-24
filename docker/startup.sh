#!/bin/sh

# Wait for database to be ready
echo "Waiting for database connection..."
if [ "$DB_CONNECTION" = "pgsql" ]; then
    # Wait for PostgreSQL
    while ! nc -z ${DB_HOST:-db} ${DB_PORT:-5432}; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 1
    done
    
    # Create UUID extension if PostgreSQL
    echo "Creating UUID extension for PostgreSQL..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
else
    # Wait for MySQL
    while ! nc -z ${DB_HOST:-db} ${DB_PORT:-3306}; do
        echo "MySQL is unavailable - sleeping"
        sleep 1
    done
fi

echo "Database is up and running!"

# Run Laravel commands
echo "Running migrations..."
php artisan migrate --force

echo "Running seeders..."
php artisan db:seed --force

echo "Optimizing Laravel for production..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache
php artisan optimize

# Start supervisord
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf 