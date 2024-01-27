import json

from datadocai.metadata.exporter.base import MetadataExporterBase
from datadocai.models import CurrentTable
from datadocai.database import DatabaseClient


class MetadataTrinoExporter(MetadataExporterBase):
    def __init__(self, current_table: CurrentTable, database_client: DatabaseClient):
        super().__init__(current_table)
        self.client = database_client

    def prepare(self):
        pass

    def process(self, json_data):
        result = self.extract_json(json_data)[0]
        result_json = json.loads(result)

        data = result_json.get(self.current_table.trino_table)

        description = data.get('description')
        clean_description = description.replace("'", "''")

        query = f"""
        COMMENT ON TABLE {self.current_table.trino_catalog}.{self.current_table.trino_schema}.{self.current_table.trino_table}
        IS '{clean_description}'
        """
        print(query, description)
        result = self.client.execute_query(query)

        for key, value in data.get('columns').items():
            print(f"{self.current_table.trino_catalog}.{self.current_table.trino_schema}.{self.current_table.trino_table} Set Documentation for column {key}")
            clean_value = value.replace("'", "''")
            query = f"""
            COMMENT ON COLUMN {self.current_table.trino_catalog}.{self.current_table.trino_schema}.{self.current_table.trino_table}.{key}
            IS '{clean_value}'
            """
            result = self.client.execute_query(query)

        return result
            




