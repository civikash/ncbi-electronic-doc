#!/bin/bash

docker network create ncbi-sed-network
docker-compose up -d --build

docker-compose run web python manage.py collectstatic --noinput