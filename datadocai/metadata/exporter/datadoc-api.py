from datadocai.metadata.exporter.base import MetadataExporterBase


class MetadataDataDocAiExporter(MetadataExporterBase):
    def prepare(self):
        # find catalog id
        ## if not found sync
        # find schema id
        ## if not found sync
        # find table id
        ## if not found sync
        pass

    def process(self, json):
        # update doc of the table

        # for each columns get column id
        # get or create column
        # update documentation

        pass
