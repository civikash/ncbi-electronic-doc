from django.db import models
from django.db.models import Max
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, Group, Permission
from datetime import datetime, timedelta
from django.contrib.auth.models import PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.utils.text import slugify
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import re
import uuid
import os


CATEGORY_DOCUMENT_CHOICES = [
    ('INCOMING_DOCUMENT', 'Входящий документ'),
    ('OUTGOING_DOCUMENT', 'Исходящий документ'),
    ('ORD', 'ОРД'),
    ('INTERNAL_DOCUMENT', 'Внутренний документ'),
    ('CONTRACTS', 'Договоры'),
    ('DPO_DOCUMENTS', 'Документы ДПО'),
]


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)

        if not email:
            raise ValueError('Учетная запись должна иметь адрес электронной почты')
        
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)

                
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Суперпользователь должен иметь is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_SYSTEM = [
        ('STAFF', 'Сотрудник'),
        ('CHANCELLERY_CLERK', 'Делопроизводитель'),
        ('HEAD_CHANCELLERY', 'Руководитель канцелярии'),
        ('HEAD_DEPARTMENT', 'Руководитель подразделения'),
        ('RECTOR', 'Ректор')
    ]
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    first_name = models.CharField(_("Имя"), max_length=100)
    last_name = models.CharField(_("Фамилия"), max_length=100)
    patronymic = models.CharField(_("Отчество"), max_length=100, blank=True, null=True)
    role = models.CharField(_("Роль в системе"), choices=ROLE_SYSTEM, default='STAFF', max_length=50)
    username = None

    groups = models.ManyToManyField(
        Group,
        verbose_name=_("Группы"),
        blank=True,
        related_name="user_groups",
    )
    
    permissions = models.ManyToManyField(
        Permission, 
        verbose_name=_("Права пользователя"),
        blank=True,
        related_name="user_permissions",
    )


    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'patronymic']

    def get_full_name(self):
        """Возвращает полное имя (ФИО)"""
        parts = [self.last_name, self.first_name, self.patronymic]
        return " ".join(filter(None, parts))

    class Meta:
        verbose_name = _("Пользователь")
        verbose_name_plural = _("Пользователи")

class Organisation(models.Model):
    full_name = models.CharField(_("Полное наименование организации"), max_length=255)
    short_name = models.CharField(_("Сокращенное наименование организации"), max_length=45)
    inn = models.CharField(_("ИНН"), max_length=10)
    ogrn = models.CharField(_("ОГРН"), max_length=13)

    def __str__(self):
        return self.full_name
    
    def save(self, *args, **kwargs):
        if not self.pk and Organisation.objects.exists():
            raise ValueError("Нельзя создать более одной организации")
        super().save(*args, **kwargs)

class Post(models.Model):
    name = models.CharField(_("Должность"), max_length=120)

    def __str__(self):
        return self.name
    
class Department(models.Model):
    name = models.CharField(_("Отдел"), max_length=120)

    class Meta:
        verbose_name = _("Отдел")
        verbose_name_plural = _("Отделение")

    def __str__(self):
        return self.name

class Staff(models.Model):
    user = models.OneToOneField(User, verbose_name=_("Учетная запись"), on_delete=models.CASCADE)
    organisation = models.ForeignKey("Organisation", verbose_name=_("Организация"), on_delete=models.CASCADE, blank=True)
    department = models.ForeignKey("Department", verbose_name=_("Отдел"), on_delete=models.CASCADE, blank=True)
    post = models.ForeignKey("Post", verbose_name=_("Должность"), on_delete=models.CASCADE, blank=True)

    def save(self, *args, **kwargs):
        if not self.organisation_id:
            self.organisation = Organisation.objects.first()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} ({self.department})"

    class Meta:
        verbose_name = _("Сотрудник")
        verbose_name_plural = _("Сотрудники")

class InteractingOrganisations(models.Model):
    full_name = models.CharField(_("Полное наименование организации"), max_length=255)
    short_name = models.CharField(_("Сокращенное наименование организации"), max_length=155)
    inn = models.CharField(_("ИНН"), max_length=10)
    ogrn = models.CharField(_("ОГРН"), max_length=13)
    city = models.CharField(_("Город"), max_length=50, null=True)
    region = models.CharField(_("Регион"), max_length=50, null=True)
    index = models.CharField(_("Индекс"), max_length=50, null=True)
    legal_address = models.CharField(_("Юридический адрес"), max_length=120, null=True)
    
    class Meta:
        verbose_name = _("Взаимодействующая организация")
        verbose_name_plural = _("Взаимодействующие организации")

class DirectorsOrganisations(models.Model):
    first_name = models.CharField(_("Имя"), max_length=100)
    last_name = models.CharField(_("Фамилия"), max_length=100)
    patronymic = models.CharField(_("Отчество"), max_length=100, blank=True, null=True)
    post = models.CharField(_("Должность"), max_length=120, blank=True, null=False)
    organisation = models.OneToOneField(InteractingOrganisations, verbose_name=_("Организация"), on_delete=models.CASCADE)

    def get_full_name(self):
        """Возвращает полное имя (ФИО)"""
        parts = [self.last_name, self.first_name, self.patronymic]
        return " ".join(filter(None, parts))

    class Meta:
        verbose_name = _("Руководитель организации")
        verbose_name_plural = _("Руководители организаций")

class DocumentType(models.Model):
    category = models.CharField(max_length=55, choices=CATEGORY_DOCUMENT_CHOICES)
    name = models.CharField(_("Наименование"), unique=True, max_length=80)
    short_name = models.CharField(_("Сокращенное наименование"), max_length=20)
    description = models.CharField(_("Описание типа документа"), max_length=195)

    def __str__(self):
        return self.name

class Cases(models.Model):
    code = models.IntegerField(_("Код"))
    nomenclature = models.CharField(_("Номенклатура"), max_length=220)

    class Meta:
        verbose_name = _("Дело")
        verbose_name_plural = _("Дела")

"""
Модели относящийся к Документам
"""


class Document(models.Model):
    STATUS_DOCUMENT_CHOICES = [
        ('IN_WORKING', 'В работе'),
        ('SIGNED', 'Подписан'),
        ('SIGNING', 'Подписание'),
        ('WRITTEN_OFF', 'Списано'),
        ('NOT_ASSIGNED', 'Не назначен'),
    ]
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=55, choices=CATEGORY_DOCUMENT_CHOICES)
    brief = models.CharField(_("Краткое описание"), max_length=250, null=True)
    draft = models.BooleanField(_("Черновик"), default=True)
    case = models.ForeignKey(Cases, verbose_name=_("Дело"), on_delete=models.CASCADE, null=True)
    document_sheets = models.IntegerField(_("Листов документа"), null=True)
    application_sheets = models.IntegerField(_("Листов приложения"), null=True)
    author_work_card = models.ForeignKey("Staff", verbose_name=_("Автор рабочей карточки"), on_delete=models.CASCADE)
    note = models.CharField(_("Примечание"), max_length=250, null=True)
    status = models.CharField(_("Статус"), max_length=55, choices=STATUS_DOCUMENT_CHOICES, default='NOT_ASSIGNED')
    registration_number = models.CharField(_("Регистрационный номер"), max_length=110)
    created_at = models.DateTimeField(_("Дата создания в системе"), auto_now_add=True)

    class Meta:
        abstract = True


class IncomingDocuments(Document):
    type = models.ForeignKey(DocumentType, verbose_name=_("Тип документа"), on_delete=models.CASCADE)
    shared_access = models.BooleanField(_("Общий доступ"), default=True)
    signatory = models.ForeignKey(DirectorsOrganisations, verbose_name=_("Подписант"), on_delete=models.CASCADE, related_name='incoming_document_signatory', null=True)
    outgoing_number = models.CharField(_("Исходящий номер"), max_length=50, null=True)
    addressee = models.ForeignKey("Staff", verbose_name=_("Адресат"), on_delete=models.CASCADE, related_name='incoming_addressee', null=True)
    date = models.DateField(_("Дата регистрации"), auto_now_add=False, null=True)

    def save(self, *args, **kwargs):
        if not self.category:
            self.category = 'INCOMING_DOCUMENT'
        if not self.registration_number:
            all_numbers = IncomingDocuments.objects.filter(type=self.type).values_list('registration_number', flat=True)
            
            max_number = 0
            for reg_number in all_numbers:
                match = re.search(r'(\d+)$', reg_number)
                if match:
                    number = int(match.group(1))
                    max_number = max(max_number, number)

            new_number = max_number + 1

            self.registration_number = f"{self.type.short_name}-{new_number:03d}"

        super().save(*args, **kwargs)


class OutgoingDocuments(Document):
    type = models.ForeignKey(DocumentType, verbose_name=_("Тип документа"), on_delete=models.CASCADE)
    shared_access = models.BooleanField(_("Общий доступ"), default=False)
    signatory = models.ForeignKey(Staff, verbose_name=_("Подписант"), on_delete=models.CASCADE, related_name='outgoing_document_signatory', null=True)
    addressee = models.ForeignKey(DirectorsOrganisations, verbose_name=_("Адресат"), on_delete=models.CASCADE, related_name='outgoing_document_addressee', null=True)
    outgoing_number = models.CharField(_("Исходящий номер"), max_length=50)
    date = models.DateField(_("Дата регистрации"), auto_now_add=False, null=True)

    def save(self, *args, **kwargs):
        if not self.category:
            self.category = 'OUTGOING_DOCUMENT'
        if not self.registration_number:
            all_numbers = OutgoingDocuments.objects.filter(type=self.type).values_list('registration_number', flat=True)
            
            max_number = 0
            for reg_number in all_numbers:
                match = re.search(r'(\d+)$', reg_number)
                if match:
                    number = int(match.group(1))
                    max_number = max(max_number, number)

            new_number = max_number + 1

            self.registration_number = f"{self.type.short_name}-{new_number:03d}"

        super().save(*args, **kwargs)

class CoverLetters(models.Model):
    document = models.ForeignKey(IncomingDocuments, verbose_name=_("Входящий документ"), to_field='uuid', on_delete=models.CASCADE)
    correspondent = models.ForeignKey(InteractingOrganisations, verbose_name=_("Корреспондент"), on_delete=models.CASCADE)
    outgoing_number = models.IntegerField(_("Исходящий номер"))
    date = models.DateField(_("Дата"), auto_now_add=False)


class InternalDocuments(Document):
    type = models.ForeignKey(DocumentType, verbose_name=_("Тип документа"), on_delete=models.CASCADE)
    signatory = models.ForeignKey(Staff, verbose_name=_("Подписант"), on_delete=models.CASCADE, related_name='internal_document_signatory', null=True)
    direction = models.ForeignKey("Staff", verbose_name=_("Направление"), on_delete=models.CASCADE, related_name='+', null=True)
    addressee = models.ForeignKey("Staff", verbose_name=_("Адресат"), on_delete=models.CASCADE, related_name='internal_addressee', null=True)
    readers = models.ManyToManyField("Staff", verbose_name=_("Читатели"), related_name='internal_document_readers')
    executor = models.ForeignKey(Staff, verbose_name=_("Исполнитель"), on_delete=models.CASCADE, related_name='internal_document_executor')

    def save(self, *args, **kwargs):
        if not self.category:
            self.category = 'INTERNAL_DOCUMENT'
        if not self.registration_number:
            all_numbers = InternalDocuments.objects.filter(type=self.type).values_list('registration_number', flat=True)
            
            max_number = 0
            for reg_number in all_numbers:
                match = re.search(r'(\d+)$', reg_number)
                if match:
                    number = int(match.group(1))
                    max_number = max(max_number, number)

            new_number = max_number + 1

            self.registration_number = f"{self.type.short_name}-{new_number:03d}"

        super().save(*args, **kwargs)

"""
Визирование документов
"""

class DocumentVisas(models.Model):
    content_type = models.ForeignKey(ContentType, verbose_name=_("Документ"), on_delete=models.CASCADE)
    document = models.UUIDField(editable=False, null=True)
    content_object = GenericForeignKey('content_type', 'document')
    staff = models.ForeignKey("Staff", verbose_name=_("Сотрудник"), on_delete=models.CASCADE, related_name='document_visas_staff', null=True)
    visa = models.BooleanField(_("Статус визирования"), default=False)
    note = models.CharField(_("Примечание"), max_length=120)

"""
Файлы прикрепленные к объектам Документы
"""

class DocumentFile(models.Model):
    def custom_upload_path(self, filename):
        name, extension = os.path.splitext(filename)
        safe_filename = name if any("\u0400" <= char <= "\u04FF" for char in name) else slugify(name)
        extension = os.path.splitext(filename)[1]
        return f'documents/{self.document}/{safe_filename}{extension}'
    
    file_name = models.CharField(_("Имя файла"), max_length=190, null=True)
    file = models.FileField(upload_to=custom_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, verbose_name=_("Документ"), on_delete=models.CASCADE)
    owner = models.ForeignKey(Staff, verbose_name=_("Пользователь"), on_delete=models.CASCADE)
    document = models.UUIDField(editable=False, null=True)
    content_object = GenericForeignKey('content_type', 'document')

"""
Папки и элементы папок
"""

class Folder(models.Model):
    name = models.CharField(_("Наименование папки"), max_length=75)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    def __str__(self):
        return self.name
    
    @staticmethod
    def get_or_create_drafts_folder(owner):
        drafts_folder, created = Folder.objects.get_or_create(
            name="Черновики",
            defaults={
                "name": "Черновики"
            }
        )
        return drafts_folder
    
        
    class Meta:
        verbose_name = "Папка"
        verbose_name_plural = "Папки"


class FolderObject(models.Model):
    folder = models.ForeignKey(Folder, verbose_name=_("Папка"), on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, verbose_name=_("Документ"), on_delete=models.CASCADE)
    owner = models.ForeignKey(Staff, verbose_name=_("Владелец папки"), on_delete=models.CASCADE)
    document = models.UUIDField(editable=False, null=True)
    content_object = GenericForeignKey('content_type', 'document')

    def __str__(self):
        return f"{self.document} из папки {self.folder}"

    class Meta:
        verbose_name = "Элемент папки"
        verbose_name_plural = "Элементы папки"