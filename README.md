
<h1>DataDoc<b style="color: greenyellow">AI</b></h1>  

## Introduction

Welcome to the repository of our innovative AI tool for automatic database documentation. This tool is designed to work with various databases that can be connected through Trino, and it generates documentation in JSON format for easy access and integration.


## Features

- **Automatic Generation**: Automatically creates documentation for columns and tables of any database connected via Trino.
- **Multiple Exporter**: Saves the documentation in an easily readable and integrable.
  - Raw `JSON` Extract
  - `Trino` native comment
  - `Open Metadata`
  - `Datadocai Api`

- **Wide Compatibility**: Compatible with different types of databases connected through Trino.

## Getting Started

### Prerequisites

- Ensure you have Trino configured and working with your database.
- Python >= 3.10 and pip (for installing and running scripts).

### Installation

1. Clone this repository to your local machine.
   ```bash
   git clone https://github.com/jeremyjouvancedev/DataDocAi.git
   ```
2. Install the necessary dependencies.
   ```bash 
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configure your database connection settings in the configuration file.
4. Add the following in the `.env-local` file and `.env-docker` (for docker running)

```text
TRINO_HOST=
TRINO_PORT=
TRINO_USER=
TRINO_PASSWORD=
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXX
```

### Usage

1. Run the database and trino
   ```bash
   docker-compose up trino-coordinator
   ```

   That will run a postgres database linked to trino. The postgres database is init with fake data for testing. You are free to link any database you want behind trino.
   They are several connector available here: https://trino.io/docs/current/connector.html

2. Run the tool using the following command:
   ```bash
   pip install -e . # for datadocai local install
   python examples/gpt-4-example.py
   ```
3. The tool will start analyzing your database and generating documentation.
4. Once completed, you will find the JSON documentation files in the `outputs` folder.

### Run local models

1. Start the local model server
   The model by default is `mistral 7b` for better result you should use another bigger models with function calling.
   For mistral 7b you need a gpu with `22Go` ram available for `8k` tokens.
   ```
   docker-compose up vllm
   ```
2.  Run the tool using the following command:
   ```bash
   pip install -e . # for datadocai local install
   python examples/mistral-example.py
   ```

## Documentation

For more detailed information on usage and configuration, please refer to our detailed documentation [here](documentation/documentation.md).

## Contributing

Contributions are always welcome! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

If you encounter any problems or have questions, feel free to open an issue or contact us directly.

---
<p>Jeremy Jouvance <b style="color: greenyellow">AI</b>deaslab</p>


# Trino Config
## generate ssl certificate for trino

```shell
keytool -delete -alias trino -keystore docker/trino/coordinator/etc/keystore.jks
keytool -genkeypair -alias trino -keyalg RSA -keystore docker/trino/coordinator/etc/keystore.jks -validity 365 -keysize 2048 -ext "SAN=DNS:localhost,DNS:trino-coordinator"
cp docker/trino/coordinator/etc/keystore.jks docker/trino/worker/etc/keystore.jks
keytool -export -alias trino -rfc -file docker/trino/certificate.pem -keystore docker/trino/coordinator/etc/keystore.jks
```

## geneate password
```shell
htpasswd -B -C 10 docker/trino/coordinator/etc/password.db test
cp docker/trino/coordinator/etc/password.db docker/trino/worker/etc/
```

## generate share secret
```shell
openssl rand -hex 32
```