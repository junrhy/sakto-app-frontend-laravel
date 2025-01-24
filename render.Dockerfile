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
FROM node:20-alpine as node
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
    netcat-openbsd \
    postgresql-dev \
    postgresql-client

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    pgsql \
    bcmath \
    gd \
    zip \
    opcache

# Configure PHP opcache for production
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Copy application files
COPY --from=node /app /var/www
WORKDIR /var/www

# Copy Nginx configurations
COPY docker/nginx/app.prod.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Create required directories
RUN mkdir -p /var/log/supervisor

# Set proper permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port 80
EXPOSE 80

# Set environment variable for production
ENV DOCKER_ENV=production

# Start services using the startup script
CMD ["/usr/local/bin/startup.sh"] 