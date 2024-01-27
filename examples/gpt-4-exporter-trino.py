# python import
import os
import httpx
from dotenv import load_dotenv

# langchain import
from langchain_openai import ChatOpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# local import
from datadocai.metadata import TableMetadataManager
from datadocai.database import DatabaseClient
from datadocai.models import CurrentTable
from datadocai.metadata.exporter.trino import MetadataTrinoExporter

# Load the environment variables
env_loaded = load_dotenv('.env-local')
print(f"Env Loaded: {env_loaded}")

TRINO_CATALOG = 'postgres'
TRINO_SCHEMA = 'public'
TRINO_TABLE = 'house_pricing'

# construct the table you want to analyse
ct = CurrentTable(trino_catalog=TRINO_CATALOG,
                  trino_schema=TRINO_SCHEMA,
                  trino_table=TRINO_TABLE)

# connect to trino
dc = DatabaseClient(host=os.getenv('TRINO_HOST'),
                    port=os.getenv('TRINO_PORT'),
                    user=os.getenv('TRINO_USER'),
                    password=os.getenv('TRINO_PASSWORD'))

llm = ChatOpenAI(model='gpt-4')

metadata_exporter = MetadataTrinoExporter(current_table=ct, database_client=dc)

tmm = TableMetadataManager(current_table=ct, database_client=dc, llm=llm, metadata_exporter=metadata_exporter)

# launch the process
tmm.process()


