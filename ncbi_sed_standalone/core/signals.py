from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from .models import User, Staff, Organisation, Post, Department

@receiver(post_save, sender=User)
def create_staff_for_user(sender, instance, created, **kwargs):
    if created and not instance.is_superuser:
        Staff.objects.create(user=instance)

@receiver(post_migrate)
def create_initial_data(sender, **kwargs):
    if not Organisation.objects.exists():
        print("[Первоначальная инициализация СЭД] Введите данные своей организации: ")
        full_name = input("Введите полное наименование организации: ")
        short_name = input("Введите сокращенное наименование организации: ")
        inn = input("Введите ИНН: ")
        ogrn = input("Введите ОГРН: ")

        Organisation.objects.create(
            full_name=full_name,
            short_name=short_name,
            inn=inn,
            ogrn=ogrn
        )
        print("Организация успешно создана")

    if not Department.objects.exists():
        print("[Первоначальная инициализация СЭД] Введите данные исполняемого подразделения (Например: канцелярия)")
        department_name = input("Наименование подразделения: ")
        Department.objects.create(name=department_name)
        print("Подразделение успешно создано")

    if not Post.objects.exists():
        print("[Первоначальная инициализация СЭД] Должность руководителя")
        post_name = input("Введите наименование должности: ")
        Post.objects.create(name=post_name)
        print("Должность руководителя организации успешно создана")