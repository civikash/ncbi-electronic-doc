from django.contrib import admin
from django.urls import path
from .views.core_lk import lk_overview

app_name = 'core'

urlpatterns = [
    path('', lk_overview, name='core-lk'),
]