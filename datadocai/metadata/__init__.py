import json
import os

from crewai import Agent, Task, Crew, Process

from datadocai.models import CurrentTable
from datadocai.database import DatabaseClient
from datadocai.tools import TableSchemaTool, TableSampleRowsTool, TableFillObjectTool
from .exporter.json import MetadataJsonExporter, MetadataExporterBase


class TableMetadataManager:
    def __init__(self, current_table: CurrentTable, database_client: DatabaseClient, llm,
                 metadata_exporter: MetadataExporterBase = None):
        self.client = database_client
        self.current_table = current_table
        self.llm = llm
        if metadata_exporter is None:
            self.metadata_exporter = MetadataJsonExporter(self.current_table)
        else:
            self.metadata_exporter = metadata_exporter

        self.agents = {}
        self.tasks = {}
        self.tools = {}

        self.metadata_exporter.prepare()

    def generate_agents(self):
        self.agents['researcher'] = Agent(
            role='Database Intelligence Officer',
            goal='Extract critical data from various databases and generate insightful comments on each column of every table, to enhance understanding and decision-making processes.',
            backstory="""With a background in advanced data science and a passion for database architecture, you have risen to become the Database Intelligence Officer at a leading tech company. Your expertise lies in unraveling the complexities of vast databases, transforming raw data into meaningful insights. Your journey began in the world of big data analytics, where you developed a keen eye for patterns and anomalies in data structures. Now, you apply your unique skills to analyze and interpret database information, providing valuable feedback and recommendations to teams across the organization, aiding in strategic planning and operational efficiency.""",
            verbose=True,
            allow_delegation=False,
            tools=self.generate_tools(),
            llm=self.llm
        )

        self.agents['json_validator'] = Agent(
            role='JSON Data Validator and Cleaner',
            goal='Validate and clean JSON files to ensure data integrity and correctness.',
            backstory="""As a JSON Data Validator and Cleaner, your role is critical in maintaining the accuracy and usability of data within the organization. With a keen attention to detail and a methodical approach, you specialize in scrutinizing JSON files, identifying any errors or inconsistencies, and applying corrections to ensure the highest quality of data. Your expertise not only in JSON but also in data structures and cleaning techniques makes you an invaluable asset in the data management process.""",
            verbose=True,
            allow_delegation=False,
            tools=[],  # self.generate_tools(),
            llm=self.llm
        )

    def generate_tasks(self):
        self.tasks['task1'] = Task(
            description=f"""Conduct a comprehensive analysis of the table "{self.current_table.trino_table}".
            If the table don't exist find the closer one. Identify data insight. Get Sample of data to extract informations.
            Your final answer MUST be a full analysis report""",
            agent=self.agents.get('researcher')
        )

        from typing import List
        from langchain.chains import create_extraction_chain_pydantic
        from langchain_core.pydantic_v1 import BaseModel

        class ColumnsDescription(BaseModel):
            name: str
            description: str

        # Pydantic data class
        class TableDescription(BaseModel):
            description: str
            columns: List[ColumnsDescription]

        examples = [
            {
                'description': "this the global description of the table",
                'columns': [
                    {
                        'name': 'the name of the column',
                        'description': 'the description of the specific column'
                    }
                ]
            }
        ]

        #{json.dumps(TableDescription.schema())}
        #{json.dumps(examples[0])}

        self.tasks['task2'] = Task(
            description="""Using the insights provided, develop an descriptive documentation for table itself and
            for each column. Your post should be informative yet accessible, catering to a tech-savvy audience.
            THE OUTPUT MUST BE A VALID JSON FORMAT!. DON'T respond in MARDOWN format ONLY JSON is ALLOWED.  
            
            Here is an example of the schema: 
            {
                "table_name": {        
                    "description": "the description of the table",
                    "columns": {
                        "column1": "description of the column 1",
                        "column2": "description of the column 2"
                    }
                }
            }

            """,
            agent=self.agents.get('researcher')
        )

        self.tasks['task3'] = Task(
            description="""
            Verify that the json is correct and return the json. YOU MUST NOT ADD comments. YOU MUST RETURN ONLY THE JSON. the json will be save in a .json file
            
            The json should be between tags <JSON></JSON>            
            
            """,
            agent=self.agents.get('json_validator')
        )

        self.tasks['task4'] = Task(
            description="""extract the json""",
            agent=self.agents.get('json_validator')
        )

    def generate_tools(self):
        self.tools['schema'] = TableSchemaTool(current_table=self.current_table, db=self.client)
        self.tools['sample_rows'] = TableSampleRowsTool(current_table=self.current_table, db=self.client)
        #self.tools['table_fill_object_tool'] = TableFillObjectTool(current_table=self.current_table, db=self.client)
        return [self.tools['schema'], self.tools['sample_rows']]

    def generate_crew(self):
        self.generate_agents()
        self.generate_tasks()

        return Crew(
            agents=[self.agents.get('researcher')],
            tasks=[self.tasks.get('task1'), self.tasks.get('task2'), self.tasks.get('task3')],
            verbose=2,  # You can set it to 1 or 2 to different logging levels
        )

    def process(self):
        crew = self.generate_crew()
        result = crew.kickoff()
        return self.metadata_exporter.process(result)
