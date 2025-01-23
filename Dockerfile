FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory
COPY . .

# Install dependencies
RUN composer install

# Create startup script
RUN echo '#!/bin/sh\n\
APP_ENV=$(grep "^APP_ENV=" .env | cut -d "=" -f2)\n\
\n\
npm install\n\
\n\
if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "development" ]; then\n\
    echo "Starting application in hot-reload mode (APP_ENV=$APP_ENV)..."\n\
    npm run dev -- --host & \n\
elif [ "$APP_ENV" = "staging" ] || [ "$APP_ENV" = "production" ]; then\n\
    echo "Building optimized assets (APP_ENV=$APP_ENV)..."\n\
    npm run build\n\
fi\n\
\n\
php-fpm\n\
' > /usr/local/bin/startup.sh \
&& chmod +x /usr/local/bin/startup.sh

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose ports
EXPOSE 9000 5173

CMD ["/usr/local/bin/startup.sh"] 