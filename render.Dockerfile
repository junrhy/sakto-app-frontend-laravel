# Build stage for PHP dependencies
FROM composer:2.6.5 AS composer

WORKDIR /app

# Copy composer files
COPY composer.* ./

# Install dependencies
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-plugins \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader

# Copy the rest of the application
COPY . .

# Run composer scripts now that we have the full application
RUN composer dump-autoload --optimize

# Build stage for Node.js
FROM node:20-alpine AS node
COPY --from=composer /app /app
WORKDIR /app
RUN npm ci && npm run build

# Production stage
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    dos2unix \
    icu-dev \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    gd \
    zip \
    opcache \
    intl

# Configure PHP for production
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Configure PHP-FPM
RUN { \
    echo '[global]'; \
    echo 'daemonize = no'; \
    echo 'error_log = /proc/self/fd/2'; \
    echo '[www]'; \
    echo 'user = www-data'; \
    echo 'group = www-data'; \
    echo 'listen = 9000'; \
    echo 'pm = dynamic'; \
    echo 'pm.max_children = 10'; \
    echo 'pm.start_servers = 2'; \
    echo 'pm.min_spare_servers = 1'; \
    echo 'pm.max_spare_servers = 3'; \
    echo 'access.log = /proc/self/fd/2'; \
    echo 'catch_workers_output = yes'; \
    echo 'decorate_workers_output = no'; \
    } > /usr/local/etc/php-fpm.d/www.conf

# Add PHP error logging configuration
RUN { \
    echo 'error_reporting = E_ALL'; \
    echo 'display_errors = Off'; \
    echo 'display_startup_errors = Off'; \
    echo 'log_errors = On'; \
    echo 'error_log = /proc/self/fd/2'; \
    echo 'log_errors_max_len = 1024'; \
    echo 'ignore_repeated_errors = On'; \
    echo 'ignore_repeated_source = Off'; \
    } > /usr/local/etc/php/conf.d/error-logging.ini

# Copy application files
COPY --from=node /app /var/www
WORKDIR /var/www

# Copy example config files if they don't exist (apps.php no longer needed)

# Copy Nginx configuration
COPY docker/nginx/app.prod.conf /etc/nginx/http.d/default.conf

# Create supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d/
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create required directories and set permissions
RUN mkdir -p /var/log/supervisor \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/storage/framework/{cache,sessions,views} \
    && mkdir -p /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage \
    && chown -R www-data:www-data /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/config \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/config

# Create startup script
COPY docker/nginx/docker-entrypoint.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh \
    && dos2unix /usr/local/bin/startup.sh 2>/dev/null || true

# Add permission fix script
RUN printf '#!/bin/sh\n' > /usr/local/bin/fix-permissions.sh && \
    printf 'chown -R www-data:www-data /var/www/storage\n' >> /usr/local/bin/fix-permissions.sh && \
    printf 'chmod -R 775 /var/www/storage\n' >> /usr/local/bin/fix-permissions.sh && \
    printf 'chown -R www-data:www-data /var/www/config\n' >> /usr/local/bin/fix-permissions.sh && \
    printf 'chmod -R 775 /var/www/config\n' >> /usr/local/bin/fix-permissions.sh && \
    printf 'exec "$@"\n' >> /usr/local/bin/fix-permissions.sh && \
    chmod +x /usr/local/bin/fix-permissions.sh && \
    dos2unix /usr/local/bin/fix-permissions.sh 2>/dev/null || true

# Expose port 80
EXPOSE 80

# Set environment variables for PHP
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_ENABLE_CLI=1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_REVALIDATE_FREQ=0

# Start the application with permissions fix
ENTRYPOINT ["/usr/local/bin/fix-permissions.sh"]
CMD ["/usr/local/bin/startup.sh"] 