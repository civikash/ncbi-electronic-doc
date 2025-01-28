#!/bin/sh

if [ "$PG_DATABASE" = "$PG_DATABASE" ]
then
    echo "Ожидание PostgreSQL на $POSTGRES_HOST:$POSTGRES_PORT..."
    echo "База данных: $PG_DATABASE"

    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
        sleep 0.1
    done

    echo "PostgreSQL запущен и доступен"
fi

exec "$@"