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

    def extract_json(self, text):
        # Regular expression pattern to find text enclosed in <JSON></JSON>
        pattern = r"<JSON>(.*?)</JSON>"

        # Searching the text using the pattern
        matches = re.findall(pattern, text, re.DOTALL)

        # Return all matches
        return matches