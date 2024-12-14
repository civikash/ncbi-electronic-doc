#!/bin/sh

if [ "$PG_DATABASE" = "$PG_DATABASE" ]
then
    echo "Ожидание..."
    echo $PG_DATABASE
    echo $POSTGRES_HOST
    echo $POSTGRES_PORT

    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL запущен"
fi

exec "$@"