from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Учетная запись должна иметь адрес электронной почты')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

                
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Суперпользователь должен иметь is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Суперпользователь должен иметь is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class AppModules(models.Model):
    name = models.CharField(_("Наименование модуля"), max_length=30)
    description = models.CharField(_("Описание"), max_length=110)
    active = models.BooleanField(_("Активный"), default=False)


    def __str__(self):
        return self.name


class User(AbstractBaseUser):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    first_name = models.CharField(_("Имя"), max_length=100)
    last_name = models.CharField(_("Фамилия"), max_length=100)
    patronymic = models.CharField(_("Отчество"), max_length=100, blank=True, null=True)
    username = None

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['password']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


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
    user = models.OneToOneField("User", verbose_name=_("Учетная запись"), on_delete=models.CASCADE)
    organisation = models.OneToOneField("Organisation", verbose_name=_("Организация"), on_delete=models.CASCADE)
    department = models.ForeignKey("Department", verbose_name=_("Отдел"), on_delete=models.CASCADE)
    post = models.ForeignKey("Post", verbose_name=_("Должность"), on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.organisation_id:
            self.organisation = Organisation.objects.first()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} ({self.department})"

    class Meta:
        verbose_name = _("Сотрудник")
        verbose_name_plural = _("Сотрудники")


class DocumentClassifier(models.Model):
    name = models.CharField(_("Наименование"), unique=True, max_length=80)

    class Meta:
        abstract = True
        ordering = ['name']
        verbose_name = "Классификатор"
        verbose_name_plural = "Классификаторы"  

    def __str__(self):
        return self.name


class TypePartition(DocumentClassifier):
    description = models.CharField(_("Описание раздела"), max_length=75)

    def __str__(self):
        return self.name

class TypeDocument(DocumentClassifier):
    partition = models.ForeignKey("TypePartition", verbose_name=_("Раздел"), on_delete=models.CASCADE)


class Document(models.Model):
    type = models.ForeignKey("TypeDocument", verbose_name=_("Тип документа"), on_delete=models.CASCADE)
    brief = models.CharField(_("Краткое описание"), max_length=250)
    signatory = models.ForeignKey("Staff", verbose_name=_("Подписант"), on_delete=models.CASCADE, related_name='document_signatory')
    addressee = models.ForeignKey("Staff", verbose_name=_("Адресат"), on_delete=models.CASCADE, related_name='document_addressee')
    author_work_card = models.ForeignKey("Staff", verbose_name=_("Автор РК"), on_delete=models.CASCADE)
    note = models.TextField(_("Примечание"))
    readers = models.ManyToManyField("Staff", verbose_name=_("Читатели"), related_name='document_readers')

    class Meta:
        verbose_name = "Документ"
        verbose_name_plural = "Документы"  