import os
from setuptools import setup, find_packages

# Get the directory where this current file is saved
here = os.path.abspath(os.path.dirname(__file__))

# Open the requirements.txt relative to this path
with open(os.path.join(here, 'requirements.txt'), 'r') as f:
    requirements = f.read().splitlines()

setup(
    name="datadocai",
    version="0.0.3",
    packages=find_packages(),
    description="create database documentation with AI",
    install_requires=requirements,
    author='Jeremy Jouvance',
    author_email='jeremy.jouvance@gmail.com',
    url='https://github.com/jeremyjouvancedev/DataDocAi',
    keywords=['chatgpt', 'database', 'trino', 'ai', 'documentation'],
    classifiers=[
        'Development Status :: 3 - Alpha',
        # Chose either "3 - Alpha", "4 - Beta" or "5 - Production/Stable" as the current state of your package
        'Intended Audience :: Developers',  # Define that your audience are developers
        'Topic :: Software Development :: Build Tools',
        'License :: OSI Approved :: MIT License',  # Again, pick a license
        'Programming Language :: Python :: 3',  # Specify which pyhton versions that you want to support
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
    ],
)