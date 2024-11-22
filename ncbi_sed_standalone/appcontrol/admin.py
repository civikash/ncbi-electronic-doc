from django.contrib import admin
from core.models import User, Staff

@admin.register(User)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('last_name','first_name', 'patronymic')


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('user__last_name','user__first_name', 'user__patronymic')

