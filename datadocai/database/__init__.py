import os

from trino.dbapi import connect
from trino.auth import BasicAuthentication
from trino.constants import HTTPS


class DatabaseClient:
    def __init__(self, host=os.getenv('TRINO_HOST'),
                 port=os.getenv('TRINO_PORT'),
                 user=os.getenv('TRINO_USER'),
                 password=os.getenv('TRINO_PASSWORD')):

        if host in ['localhost', '127.0.0.1', 'postgres', 'trino-coordinator']:
            print("LOCAL connection")
            self.conn = connect(
                host=host,
                port=port,
                user=user,
                auth=BasicAuthentication(user, password),
                http_scheme=HTTPS,
                verify=os.getenv('TRINO_CERTIFICATE_PATH', False)
            )
        else:
            self.conn = connect(
                host=host,
                port=port,
                user=user,
                auth=BasicAuthentication(user, password),
                http_scheme=HTTPS,
                verify=False
            )

    def execute_query(self, query, data=None):
        cursor = self.conn.cursor()
        if data:
            cursor.execute(query, data)
        else:
            cursor.execute(query)
        data = cursor.fetchall()
        description = cursor.description
        cursor.close()
        return data, description

    def list_catalogs(self):
        """
        List all available catalogs
        :return:
        """
        cursor = self.conn.cursor()
        cursor.execute(f"SHOW CATALOGS")
        data = cursor.fetchall()
        cursor.close()
        catalogs = [x[0] for x in data]
        return catalogs

    def list_schemas(self, catalog):
        """
        List all schemas for a catalog
        :param catalog:
        :return:
        """
        cursor = self.conn.cursor()
        cursor.execute(f"SHOW SCHEMAS from {catalog}")
        data = cursor.fetchall()
        cursor.close()
        schemas = [x[0] for x in data]
        return schemas

    def list_tables(self, catalog, schema):
        """
        List all tables in a catalog and schema
        :param catalog:
        :param schema:
        :return:
        """
        cursor = self.conn.cursor()
        cursor.execute(f"SHOW TABLES from {catalog}.{schema}")
        current_schema_data = cursor.fetchall()
        cursor.close()
        all_tables = [x[0] for x in current_schema_data]
        return all_tables

    def list_columns(self, catalog: str, schema: str, table: str):
        query = f"""
        SHOW COLUMNS FROM {catalog}.{schema}.{table}
        """
        cursor = self.conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        return [row[0] for row in rows]

    def close_connection(self):
        self.conn.close()
