import json
import os

from crewai import Agent, Task, Crew, Process

from datadocai.models import CurrentTable
from datadocai.database import DatabaseClient
from datadocai.tools import TableSchemaTool, TableSampleRowsTool, TableFillObjectTool
from .exporter.json import MetadataJsonExporter, MetadataExporterBase

from langchain.agents import create_openai_functions_agent
from langchain_core.prompts import ChatPromptTemplate
from .states import AgentState
from langchain_core.agents import AgentFinish
from langgraph.prebuilt.tool_executor import ToolExecutor
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from datadocai.models import DocumentationTable, DocumentationColumn
from langgraph.graph import END, StateGraph, START


class TableMetadataManager:
    def __init__(self, current_table: CurrentTable,
                 database_client: DatabaseClient, llm,
                 metadata_exporter: MetadataExporterBase = None):
        self.client = database_client
        self.current_table = current_table
        self.llm = llm

        self.metadata_exporter = metadata_exporter

        self.agents = {}
        self.tasks = {}
        self.tools = {}

        if self.metadata_exporter:
            self.metadata_exporter.prepare()

    def generate_tools(self):
        return [TableSchemaTool(current_table=self.current_table, db=self.client),
                TableSampleRowsTool(current_table=self.current_table, db=self.client)]

    def generate_agent(self):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system",
                 "You are an intelligent assistant that generates detailed descriptions of database tables and their columns based on the provided schema and sample data. Your goal is to provide clear, concise, and insightful descriptions."),
                ("placeholder", "{chat_history}"),
                ("human", "{input}"),
                ("placeholder", "{agent_scratchpad}"),
            ]
        )

        tools = self.generate_tools()
        agent_runnable = create_openai_functions_agent(self.llm, tools, prompt)
        return agent_runnable

    def generate_nodes(self):
        agent_runnable = self.generate_agent()
        tools = self.generate_tools()

        tool_executor = ToolExecutor(tools)

        # Define the agent
        def run_agent(data):
            agent_outcome = agent_runnable.invoke(data)
            return {"agent_outcome": agent_outcome}

        # Define the function to execute tools
        def execute_tools(data):
            # Get the most recent agent_outcome - this is the key added in the `agent` above
            agent_action = data["agent_outcome"]
            output = tool_executor.invoke(agent_action)
            return {"intermediate_steps": [(agent_action, str(output))]}

        # Define logic that will be used to determine which conditional edge to go down
        def should_continue(data):
            # If the agent outcome is an AgentFinish, then we return `exit` string
            # This will be used when setting up the graph to define the flow
            if isinstance(data["agent_outcome"], AgentFinish):
                return "respond"
            # Otherwise, an AgentAction is returned
            # Here we return `continue` string
            # This will be used when setting up the graph to define the flow
            else:
                return "continue"

        # Define the function that responds to the user
        def respond(state: AgentState):
            parser = PydanticOutputParser(pydantic_object=DocumentationTable)

            prompt = PromptTemplate(
                template="Base on the following report fill the output.\n{format_instructions}\n{query}\n",
                input_variables=["query"],
                partial_variables={"format_instructions": parser.get_format_instructions()},
            )

            chain = prompt | self.llm | parser

            response = chain.invoke({'query': state['agent_outcome'].return_values['output']})

            return {"agent_outcome": response}

        return run_agent, execute_tools, should_continue, respond

    def generate_graph(self):
        run_agent, execute_tools, should_continue, respond = self.generate_nodes()

        # Define a new graph
        workflow = StateGraph(AgentState)

        # Define the two nodes we will cycle between
        workflow.add_node("agent", run_agent)
        workflow.add_node("action", execute_tools)
        workflow.add_node("respond", respond)

        # Set the entrypoint as `agent`
        # This means that this node is the first one called
        workflow.add_edge(START, "agent")

        # We now add a conditional edge
        workflow.add_conditional_edges(
            # First, we define the start node. We use `agent`.
            # This means these are the edges taken after the `agent` node is called.
            "agent",
            # Next, we pass in the function that will determine which node is called next.
            should_continue,
            # Finally we pass in a mapping.
            # The keys are strings, and the values are other nodes.
            # END is a special node marking that the graph should finish.
            # What will happen is we will call `should_continue`, and then the output of that
            # will be matched against the keys in this mapping.
            # Based on which one it matches, that node will then be called.
            {
                # If `tools`, then we call the tool node.
                "continue": "action",
                # Otherwise we finish.
                "respond": "respond",
            },
        )

        # We now add a normal edge from `tools` to `agent`.
        # This means that after `tools` is called, `agent` node is called next.
        workflow.add_edge("action", "agent")
        workflow.add_edge("respond", END)

        return workflow

    def compile_graph(self):
        workflow = self.generate_graph()
        return workflow.compile()

    def process(self) -> tuple[DocumentationTable, dict]:
        app = self.compile_graph()

        inputs = {"input": f"Create a documentation for the table: {self.current_table.trino_table}",
                  "chat_history": []}

        result = app.invoke(inputs)
        exporter_result = None

        if self.metadata_exporter:
            exporter_result = self.metadata_exporter.process(result['agent_outcome'])

        return result, exporter_result
