from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CatalogViewSet, SchemaViewSet, TableViewSet, ColumnViewSet
from .views import synchronize_catalogs_with_trino, synchronize_schemas_with_trino, synchronize_tables_with_trino, \
    synchronize_columns_with_trino

router = DefaultRouter()
router.register(r'catalogs', CatalogViewSet)
router.register(r'schemas', SchemaViewSet)
router.register(r'tables', TableViewSet)
router.register(r'columns', ColumnViewSet)

urlpatterns = [
    path('synchronize/catalogs/', synchronize_catalogs_with_trino, name='synchronize-catalogs-with-trino'),
    path('synchronize/schemas/', synchronize_schemas_with_trino, name='synchronize-schemas-with-trino'),
    path('synchronize/tables/', synchronize_tables_with_trino, name='synchronize-tables-with-trino'),
    path('synchronize/columns/', synchronize_columns_with_trino, name='synchronize-columns-with-trino'),
    path('', include(router.urls)),
]
