from django.db import models


class Catalog(models.Model):
    name = models.CharField(max_length=255, unique=True)
    documentation = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Schema(models.Model):
    name = models.CharField(max_length=255)
    documentation = models.TextField(blank=True, null=True)

    catalog = models.ForeignKey(Catalog, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'catalog')

    def __str__(self):
        return self.name


class Table(models.Model):
    name = models.CharField(max_length=255)
    documentation = models.TextField(blank=True, null=True)

    schema = models.ForeignKey(Schema, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'schema')

    def __str__(self):
        return self.name


class Column(models.Model):
    name = models.CharField(max_length=255)
    documentation = models.TextField(blank=True, null=True)

    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    related_column = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('name', 'table')

    def __str__(self):
        return self.name
