from pydantic import BaseModel, Field
from typing import Dict


class TableNameInput(BaseModel):
    table_name: str = Field(description="the exact name of the table")


class CurrentTable(BaseModel):
    trino_catalog: str = Field(description="the exact name of the catalog")
    trino_schema: str = Field(description="the exact name of the schema")
    trino_table: str = Field(description="the exact name of the table")


class DocumentationColumn(BaseModel):
    description: str = Field(description="Description of the column")


class DocumentationTable(BaseModel):
    description: str = Field(description="Description of the purpose of the table")
    columns: Dict[str, DocumentationColumn] = Field(description="A dictionary of columns with their descriptions")
