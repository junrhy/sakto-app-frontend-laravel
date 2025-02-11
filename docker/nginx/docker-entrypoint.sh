#!/bin/sh

# Wait for container to fully initialize
sleep 5

# Generate app key if not set
php artisan key:generate --force

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Start supervisor (which manages nginx and php-fpm)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf