FROM composer:2 AS vendor

ENV COMPOSER_MEMORY_LIMIT=-1 \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction \
        --ignore-platform-req=ext-mongodb

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
        libssl-dev pkg-config \
        libzip-dev libonig-dev libgmp-dev libicu-dev \
    && docker-php-ext-install zip mbstring bcmath gmp intl \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/lib/apt/lists/*

# php artisan serve usa o memory_limit do CLI. O default de 128M rebenta
# em respostas grandes (rotas com muitos trackpoints) e o crash é silencioso
# — daí termos páginas 500 sem nada nos logs. Subir e mandar erros para stderr.
RUN { \
        echo "memory_limit=512M"; \
        echo "log_errors=On"; \
        echo "error_log=/dev/stderr"; \
        echo "display_errors=Off"; \
        echo "max_execution_time=120"; \
    } > /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /app
COPY --from=vendor /app /app

RUN chmod -R 775 storage bootstrap/cache

ENV PORT=8080
EXPOSE 8080

CMD php artisan package:discover --ansi \
    && php artisan serve --host=0.0.0.0 --port=${PORT}
