from django.contrib import admin
from .models import Catalog, Schema, Table, Column

# Register your models here.
admin.site.register(Catalog)
admin.site.register(Schema)
admin.site.register(Table)
admin.site.register(Column)