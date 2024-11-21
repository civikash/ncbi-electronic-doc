from django.contrib import admin
from django.urls import path
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('lk/', include('core.urls')),
    path('controll/', include('appcontrol.urls')),
]
