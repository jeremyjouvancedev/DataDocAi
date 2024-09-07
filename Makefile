# Makefile

# Store the invoking user in a variable
USER := $(shell whoami)

# Use bash
SHELL := /bin/bash

# Load environment variables from .env-local file
ifneq (,$(wildcard ./.env-local))
    include .env-local
    export $(shell sed 's/=.*//' .env-local)
endif

# run all command in the same shell
.ONESHELL:
.DEFAULT_GOAL := runserver

# Python virtual environment directory
VENV := api/venv

# Command to activate virtual environment
ACTIVATE := source $(VENV)/bin/activate

# Django manage.py location in subfolder 'api'
MANAGE := ./api/manage.py

# Create a Python virtual environment
create_venv:
	python3 -m venv $(VENV)

# Install the required packages
install: create_venv
	$(ACTIVATE); \
	pip install -r api/requirements.txt; \
	pip install -r requirements.txt; \
	pip install --force-reinstall -e . # reinstall each time the command launch -e reflect changing automatically


# Run the Django development server
runserver:
	@echo "Starting the Django server on port 8000 as user ${USER}..."
	$(ACTIVATE); python $(MANAGE) runserver

# Migrate the database
migrate:
	python $(MANAGE) migrate

# Create a superuser
createsuperuser:
	python $(MANAGE) createsuperuser

# Collect static files
collectstatic:
	python $(MANAGE) collectstatic --noinput

# Clean up .pyc files
clean:
	find . -name "*.pyc" -exec rm -f {} \;
	find . -type d -name "__pycache__" -exec rm -r {} + -o -name "*.pyc" -exec rm -f {} +