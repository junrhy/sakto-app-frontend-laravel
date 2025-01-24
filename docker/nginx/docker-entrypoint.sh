#!/bin/sh

# Select the appropriate configuration based on DOCKER_ENV
if [ "$DOCKER_ENV" = "local" ]; then
    echo "Using local development configuration..."
    cp /etc/nginx/conf.d/app.local.conf /etc/nginx/conf.d/default.conf
else
    echo "Using production configuration..."
    cp /etc/nginx/conf.d/app.prod.conf /etc/nginx/conf.d/default.conf
fi

# Execute the original docker-entrypoint.sh
exec /docker-entrypoint.sh "$@" 