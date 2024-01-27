# Exporter

## Json

The Json exporter is the default one. when the LLM fill the json model, the json exporter save into the folder `outputs/{CATALOG_NAME}/{TABLE_NAME}`.

## Trino (INCOMING)

The Trino exporter save the descriptions by using the `COMMENT` sql command. https://trino.io/docs/current/sql/comment.html

## DataDoc Api (INCOMING)

The data doc exporter save the descriptions in the data doc api.

## Open Metadata (INCOMING)

The Open Metadata exporter save descriptions into the open metadata server thanks to the Api and the Python SDK.
Before adding comments yould should start and sync open metadata in order to add comment.

