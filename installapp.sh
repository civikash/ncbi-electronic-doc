#!/bin/bash

docker-compose up -d --build

docker-compose exec ncbi-electronic-doc-web-1 python manage.py collectstatic --noinput