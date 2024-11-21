#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Поиск базы данных..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL запущен"
fi

exec "$@"