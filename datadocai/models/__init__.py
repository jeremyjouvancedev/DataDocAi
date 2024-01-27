from pydantic import BaseModel, Field


class TableNameInput(BaseModel):
    table_name: str = Field(description="the exact name of the table")


class CurrentTable(BaseModel):
    trino_catalog: str = Field(description="the exact name of the catalog")
    trino_schema: str = Field(description="the exact name of the schema")
    trino_table: str = Field(description="the exact name of the table")
