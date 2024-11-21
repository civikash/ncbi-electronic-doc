from django.contrib import admin
from django.urls import path
from .views.appcontrol_manage import appcontrol_overview

app_name = 'appcontrol'

urlpatterns = [
    path('', appcontrol_overview, name='appcontrol-main'),
]