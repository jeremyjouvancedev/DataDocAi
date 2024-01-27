from typing import Any, Dict, Optional

from langchain_core.tools import BaseTool
from langchain_core.pydantic_v1 import BaseModel, Extra, Field, root_validator
from langchain.callbacks.manager import AsyncCallbackManagerForToolRun, CallbackManagerForToolRun

from datadocai.database import DatabaseClient
from datadocai.models import CurrentTable


class BaseSQLDatabaseTool(BaseModel):
    """Base tool for interacting with a SQL database."""

    db: DatabaseClient = Field(exclude=True)
    current_table: CurrentTable = Field(exclude=True)

    class Config(BaseTool.Config):
        pass


class TableSchemaTool(BaseSQLDatabaseTool, BaseTool):
    name = "table_schema_tool"
    description = "Fetches the schema of a specified table."  # Be sure that the tables actually exist by calling fetch_table_list FIRST!"

    # args_schema: Type[BaseModel] = TableNameInput

    def _run(
            self, table_name: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        cursor = self.db.conn.cursor()
        cursor.execute(
            f"SHOW CREATE TABLE {self.current_table.trino_catalog}.{self.current_table.trino_schema}.{self.current_table.trino_table}")
        data = cursor.fetchall()
        description = cursor.description
        cursor.close()

        output = "\n\n"
        # Add column name

        for line in data:
            output += ", ".join([str(c) for c in line])
            output += "\n"

        output += "\n\n"
        return output


class TableSampleRowsTool(BaseSQLDatabaseTool, BaseTool):
    name = "table_sample_rows_tool"
    description = "Fetches the N sample rows of a specified table."  # Be sure that the tables actually exist by calling fetch_table_list FIRST!"

    # args_schema: Type[BaseModel] = TableNameInput

    def _run(
            self, table_name: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        output = ""

        cursor = self.db.conn.cursor()
        try:
            cursor.execute(f"select * from {self.current_table.trino_catalog}.{self.current_table.trino_schema}.{self.current_table.trino_table} limit 10")
            data = cursor.fetchall()
            description = cursor.description
        except Exception as e:
            cursor.close()
            return ""
        cursor.close()

        output += "\n\n"

        output += f"\n\n Here is the {len(data)} sample rows from {self.current_table.trino_table} table:\n\n"

        output += ", ".join([str(x[0]) for x in description]) + "\n"

        def crop(value):
            if len(value) > 100:
                return value[:100] + '...'
            return value

        for line in data:
            output += ", ".join([crop(str(c)) for c in line])
            output += "\n"

        output += "\n"
        return output

import json

class TableFillObjectTool(BaseSQLDatabaseTool, BaseTool):
    name = "table_fill_object_tool"
    description = "Transform the json into a model."  # Be sure that the tables actually exist by calling fetch_table_list FIRST!"

    # args_schema: Type[BaseModel] = TableNameInput

    def _run(
            self, json_data: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> dict:
        return json.loads(json_data)
        