# Generated by Django 5.0.1 on 2024-01-21 20:57

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Catalog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('documentation', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Schema',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('documentation', models.TextField(blank=True, null=True)),
                ('catalog', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='metadata.catalog')),
            ],
            options={
                'unique_together': {('name', 'catalog')},
            },
        ),
        migrations.CreateModel(
            name='Table',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('documentation', models.TextField(blank=True, null=True)),
                ('schema', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='metadata.schema')),
            ],
            options={
                'unique_together': {('name', 'schema')},
            },
        ),
        migrations.CreateModel(
            name='Column',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('documentation', models.TextField(blank=True, null=True)),
                ('related_column', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='metadata.column')),
                ('table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='metadata.table')),
            ],
            options={
                'unique_together': {('name', 'table')},
            },
        ),
    ]
