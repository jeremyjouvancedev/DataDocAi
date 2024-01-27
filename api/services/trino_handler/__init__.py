from django.conf import settings
from trino import dbapi
from trino.auth import BasicAuthentication
from trino.constants import HTTPS
import logging


class TrinoHandler:
    def __init__(self):
        trino_config = settings.TRINO

        if trino_config['HOST'] in ['localhost', '127.0.0.1', 'trino-coordinator']:
            print("NO connection")
            self.connection = dbapi.connect(
                host=trino_config['HOST'],
                port=trino_config['PORT'],
                user=trino_config['USER'],
                auth=BasicAuthentication(trino_config['USER'], trino_config['PASSWORD']),
                http_scheme=HTTPS,
                verify='/home/app/datadocai/api/certificate.pem'
            )
        else:
            self.connection = dbapi.connect(
                host=trino_config['HOST'],
                port=trino_config['PORT'],
                user=trino_config['USER'],
                auth=BasicAuthentication(trino_config['USER'], trino_config['PASSWORD']),
                http_scheme=HTTPS,
            )

    def execute_query(self, query):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
                return rows
        except Exception as e:
            logging.error(f"Error executing query on Trino: {e}")
            return None

    def list_catalogs(self):
        query = """
        SHOW CATALOGS
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        return [row[0] for row in rows]

    def list_schemas(self, catalog_name: str):
        query = f"""
        SHOW SCHEMAS FROM {catalog_name}
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        return [row[0] for row in rows]

    def list_tables(self, catalog_name: str, schema_name: str = None):
        query = f"""
        SHOW TABLES FROM {catalog_name}.{schema_name}
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        return [row[0] for row in rows]

    def list_columns(self, catalog_name: str, schema_name: str, table_name: str):
        query = f"""
        SHOW COLUMNS FROM {catalog_name}.{schema_name}.{table_name}
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        return [row[0] for row in rows]

    def close_connection(self):
        self.connection.close()
