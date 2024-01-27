FROM python:3.11

USER root

RUN apt-get update -y
RUN apt-get install -y libpq-dev g++ libsm6 libxext6 libcrypt1 libkrb5-dev


#
# Nonroot user creation
#
RUN groupadd -g 1001 app \
    && useradd --create-home -u 1001 -g app -s /bin/bash -m app

WORKDIR /home/app/datadocai

USER app

# Python buffered env
ENV PYTHONUNBUFFERED=1
# Add python binary to path
ENV PATH=/home/app/.local/bin:$PATH

# Copy All final files
COPY --chown=app:1001 . .

# Installation
RUN pip install --upgrade pip
RUN pip install --upgrade -r api/requirements.txt

# Installation of datadocai package
USER root

RUN pip install --upgrade setuptools
RUN pip install -e .

USER app

ENV PYTHONPATH="/home/app/datadocai/datadocai:$PYTHONPATH"

WORKDIR /home/app/datadocai/api

