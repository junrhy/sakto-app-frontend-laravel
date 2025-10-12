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
    icu-dev \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    pcntl \
    gd \
    zip \
    opcache \
    intl

# Set timezone to Asia/Manila (Philippines)
ENV TZ=Asia/Manila
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files
COPY composer.* ./

# Install dependencies (ignoring platform requirements for extensions that will be installed in this stage)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-plugins \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-req=ext-pcntl \
    --ignore-platform-req=ext-bcmath \
    --ignore-platform-req=ext-intl

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

# Create startup script for cron (before switching user)
RUN printf '#!/bin/sh\n\
export TZ=Asia/Manila\n\
php artisan config:cache && \\\n\
php artisan route:cache && \\\n\
php artisan view:cache && \\\n\
php artisan schedule:run\n' > /var/www/cron-startup.sh \
&& chmod +x /var/www/cron-startup.sh \
&& chown www-data:www-data /var/www/cron-startup.sh

# Switch to www-data user
USER www-data

# Run the Laravel scheduler
CMD ["/var/www/cron-startup.sh"]
