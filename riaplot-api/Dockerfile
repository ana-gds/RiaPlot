FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
        git unzip libssl-dev pkg-config libzip-dev libonig-dev \
    && docker-php-ext-install zip mbstring \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && chmod -R 775 storage bootstrap/cache

ENV PORT=8080
EXPOSE 8080

CMD php artisan package:discover --ansi \
    && php artisan serve --host=0.0.0.0 --port=${PORT}
