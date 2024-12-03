from django.contrib import admin
from django.urls import path
from .views.appcontrol_manage import appcontrol_overview, appcontrol_app, appcontrol_modules, appcontrol_settings, appcontrol_users_create, appcontrol_users
from .views.appcontrol_appsettings import appcontrol_app_departments, appcontrol_app_documents, appcontrol_app_posts

app_name = 'appcontrol'

urlpatterns = [
    path('', appcontrol_overview, name='appcontrol-main'),
    path('app/', appcontrol_app, name='appcontrol-app'),
    path('app/documents/', appcontrol_app_documents, name='appcontrol-app-documents'),
    path('app/departments/', appcontrol_app_departments, name='appcontrol-app-departments'),
    path('app/posts/', appcontrol_app_posts, name='appcontrol-app-posts'),
    path('users/', appcontrol_users, name='appcontrol-users'),
    path('users/create/', appcontrol_users_create, name='appcontrol-users-create'),
    path('settings/', appcontrol_settings, name='appcontrol-settings'),
    path('modules/', appcontrol_modules, name='appcontrol-modules'),
]