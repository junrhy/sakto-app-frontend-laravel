# Cron-specific Dockerfile for Laravel scheduled tasks
FROM php:8.2-cli-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    bcmath \
    gd \
    zip

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

# Run the Laravel scheduler
CMD ["php", "artisan", "schedule:run"]
