# Cron-specific Dockerfile for Laravel scheduled tasks
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
    tzdata \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    gd \
    zip \
    opcache

# Set timezone to Asia/Manila (Philippines)
ENV TZ=Asia/Manila
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

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

# Create required directories and set permissions
RUN mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/storage/framework/{cache,sessions,views} \
    && mkdir -p /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Set proper ownership
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Switch to www-data user
USER www-data

# Create startup script for cron in a location accessible to www-data
RUN echo '#!/bin/sh\n\
export TZ=Asia/Manila\n\
php artisan config:cache && \
php artisan route:cache && \
php artisan view:cache && \
php artisan schedule:run\n' > /var/www/cron-startup.sh \
&& chmod +x /var/www/cron-startup.sh

# Run the Laravel scheduler
CMD ["/var/www/cron-startup.sh"]
