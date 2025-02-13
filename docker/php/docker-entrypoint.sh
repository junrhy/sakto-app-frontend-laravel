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

# Install npm dependencies and start Vite in the background
npm install
npm run dev -- --host &

# Start PHP-FPM
php-fpm 