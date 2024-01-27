from rest_framework import serializers
from .models import Catalog, Schema, Table, Column


class CatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalog
        fields = ['id', 'name', 'documentation']


class SchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schema
        fields = ['id', 'name', 'documentation', 'catalog']


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'documentation', 'schema']


class ColumnSerializer(serializers.ModelSerializer):
    related_column = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Column
        fields = ['id', 'name', 'documentation', 'table', 'related_column']


class SchemaSyncSerializer(serializers.Serializer):
    catalog_id = serializers.IntegerField()

    def validate_catalog_id(self, value):
        if not Catalog.objects.filter(id=value).exists():
            raise serializers.ValidationError("Catalog with ID {} does not exist.".format(value))
        return value


class TableSyncSerializer(serializers.Serializer):
    schema_id = serializers.IntegerField()

    def validate_schema_id(self, value):
        if not Schema.objects.filter(id=value).exists():
            raise serializers.ValidationError("Schema with ID {} does not exist.".format(value))
        return value


class ColumnSyncSerializer(serializers.Serializer):
    table_id = serializers.IntegerField()

    def validate_table_id(self, value):
        if not Table.objects.filter(id=value).exists():
            raise serializers.ValidationError("Table with ID {} does not exist.".format(value))
        return value
