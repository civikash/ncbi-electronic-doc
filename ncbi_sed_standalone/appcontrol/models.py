from django.db import models
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class AppModules(models.Model):
    name = models.CharField(_("Наименование модуля"), max_length=30)
    description = models.CharField(_("Описание"), max_length=110)
    active = models.BooleanField(_("Активный"), default=False)


    def __str__(self):
        return self.name
