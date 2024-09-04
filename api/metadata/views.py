import os

from django.conf import settings
from django.shortcuts import render
from django.forms.models import model_to_dict

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Catalog, Schema, Table, Column
from .serializers import CatalogSerializer, SchemaSerializer, TableSerializer, ColumnSerializer
from .serializers import SchemaSyncSerializer, TableSyncSerializer, ColumnSyncSerializer
from datadocai.database import DatabaseClient

from datadocai.metadata import TableMetadataManager
from datadocai.database import DatabaseClient
from datadocai.models import CurrentTable

# datadocai package import
import httpx
from langchain_openai import AzureChatOpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler


class CatalogViewSet(viewsets.ModelViewSet):
    queryset = Catalog.objects.all()
    serializer_class = CatalogSerializer


class SchemaViewSet(viewsets.ModelViewSet):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=['post'])
    def generate_documentation(self, request, pk=None):
        if not pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # TODO: send the task to a celery worker

        table = Table.objects.get(pk=pk)

        ct = CurrentTable(trino_catalog=table.schema.catalog.name,
                          trino_schema=table.schema.name,
                          trino_table=table.name)

        trino_config = settings.TRINO

        dc = DatabaseClient(host=trino_config['HOST'],
                            port=trino_config['PORT'],
                            user=trino_config['USER'],
                            password=trino_config['PASSWORD'])

        api_base = "https://studio-azure-proxy-france.intramundi.com:443"
        deployment_name = "gpt-4-turbo"
        temperature = 0

        llm = AzureChatOpenAI(
            azure_endpoint=api_base,
            deployment_name=deployment_name,
            openai_api_key=os.getenv('OPENAI_API_KEY'),
            openai_api_version="2023-12-01-preview",
            streaming=True,  # for receive the response in streaming
            callbacks=[StreamingStdOutCallbackHandler()],  # for display in the output intermediate steps
            verbose=True,
            temperature=temperature,
            http_client=httpx.Client(verify=False)
        )

        tmm = TableMetadataManager(current_table=ct, database_client=dc, llm=llm)

        # launch the process
        json_response = tmm.process()

        # close the trino connection
        dc.close_connection()

        return Response({
            'data': {
                'json': json_response
            }
        })


class ColumnViewSet(viewsets.ModelViewSet):
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer


@api_view(['POST'])
def synchronize_catalogs_with_trino(request):
    th = DatabaseClient()
    catalogs = th.list_catalogs()
    th.close_connection()

    db_catalogs = []
    for catalog_name in catalogs:
        db_catalog, created = Catalog.objects.get_or_create(name=catalog_name)
        db_catalogs.append(db_catalog)

    return Response({'data': {
        'catalogs': [model_to_dict(x) for x in db_catalogs]
    }})


@api_view(['POST'])
def synchronize_schemas_with_trino(request):
    serializer = SchemaSyncSerializer(data=request.data)
    if serializer.is_valid():
        catalog_id = serializer.validated_data['catalog_id']
        # Fetch the catalog instance and perform synchronization logic here
        catalog = Catalog.objects.get(id=catalog_id)

        th = DatabaseClient()
        schemas = th.list_schemas(catalog_name=catalog.name)
        th.close_connection()

        db_schemas = []
        for schema_name in schemas:
            db_schema, created = Schema.objects.get_or_create(name=schema_name, catalog_id=catalog.pk)
            db_schemas.append(db_schema)

        return Response({'data': {
            'catalog': model_to_dict(catalog),
            'schemas': [model_to_dict(x) for x in db_schemas]
        }})
    else:
        return Response(serializer.errors, status=400)


@api_view(['POST'])
def synchronize_tables_with_trino(request):
    serializer = TableSyncSerializer(data=request.data)
    if serializer.is_valid():
        schema_id = serializer.validated_data['schema_id']
        # Fetch the schema instance and perform synchronization logic here
        schema = Schema.objects.get(id=schema_id)

        th = DatabaseClient()
        tables = th.list_tables(catalog_name=schema.catalog.name, schema_name=schema.name)
        th.close_connection()

        db_tables = []
        for table_name in tables:
            db_table, created = Table.objects.get_or_create(name=table_name, schema_id=schema.pk)
            db_tables.append(db_table)

        return Response({'data': {
            'catalog': model_to_dict(schema.catalog),
            'schema': model_to_dict(schema),
            'tables': [model_to_dict(x) for x in db_tables]
        }})
    else:
        return Response(serializer.errors, status=400)


@api_view(['POST'])
def synchronize_columns_with_trino(request):
    serializer = ColumnSyncSerializer(data=request.data)
    if serializer.is_valid():
        table_id = serializer.validated_data['table_id']
        # Fetch the schema instance and perform synchronization logic here
        table = Table.objects.get(id=table_id)

        th = DatabaseClient()
        columns = th.list_columns(catalog_name=table.schema.catalog.name,
                                  schema_name=table.schema.name,
                                  table_name=table.name)
        th.close_connection()

        db_columns = []
        for column_name in columns:
            db_table, created = Column.objects.get_or_create(name=column_name, table_id=table.pk)
            db_columns.append(db_table)

        return Response({'data': {
            'catalog': model_to_dict(table.schema.catalog),
            'schema': model_to_dict(table.schema),
            'table': model_to_dict(table),
            'columns': [model_to_dict(x) for x in db_columns]
        }})
    else:
        return Response(serializer.errors, status=400)
