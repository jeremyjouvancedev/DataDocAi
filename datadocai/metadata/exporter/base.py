import re
from abc import ABC, abstractmethod
from datadocai.models import CurrentTable


class MetadataExporterBase(ABC):
    def __init__(self, current_table: CurrentTable):
        self.current_table = current_table

    @abstractmethod
    def prepare(self):
        pass

    @abstractmethod
    def process(self, json):
        pass
