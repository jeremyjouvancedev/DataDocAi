
<h1>DataDoc<b style="color: greenyellow">AI</b></h1>  

![Texte alternatif](/assets/datadocai.png "datadocai").

## Introduction

Welcome to the repository of our innovative AI tool for automatic database documentation. This tool is designed to work with various databases that can be connected through Trino, and it generates documentation in JSON format for easy access and integration.


## Features

- **Automatic Generation**: Automatically creates documentation for columns and tables of any database connected via Trino.
- **Multiple Exporter**: Saves the documentation in an easily readable and integrable.
  - Raw `JSON` Extract
  - `Trino` native comment (add the comment in the database behind directly)
  - `Datadocai Api` integration with the web app 
  - `Open Metadata` (Will be available soon)
  
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
   make install
   ```
3. Configure your database connection settings in the configuration file.
4. Add the following in the `.env-local` file and `.env-docker` (for docker running)

```text
# .env-local

OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

TRINO_HOST=localhost
TRINO_PORT=8443
TRINO_USER=test
TRINO_PASSWORD=test
TRINO_CERTIFICATE_PATH=docker/trino/certificate.pem

POSTGRES_USER=trino
POSTGRES_PASSWORD=trino
POSTGRES_HOST=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PORT=5432
```

```text
# .env-docker

OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

TRINO_HOST=trino-coordinator
TRINO_PORT=8443
TRINO_USER=test
TRINO_PASSWORD=test
TRINO_CERTIFICATE_PATH=/home/app/datadocai/api/certificate.pem

POSTGRES_USER=trino
POSTGRES_PASSWORD=trino
POSTGRES_HOST=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PORT=5432
```


### Usage

1. Run the database and trino
   ```bash
   docker-compose up trino-coordinator
   ```

   That will run a postgres database linked to trino. The postgres database is init with fake data for testing. You are free to link any database you want behind trino.
   They are several connector available here: https://trino.io/docs/current/connector.html

2. You can run multiple notebooks under `examples` folder
3. The tool will start analyzing your database and generating documentation.
4. Once completed, you will find the JSON documentation files in the `outputs` folder.

### Run local models

1. Start the local model server
   The model by default is `mistral-nemo:12b-instruct-2407-q4_0` for better result you should use another bigger models with function calling.
   For mistral-nemo:12b-instruct-2407-q4_0 you need a gpu with `7Go` ram available for `128k` tokens.
   ```
   docker-compose up ollama
   ```
2. Run the command for downloading and make the model available
   ```
   docker compose exec ollama ollama pull mistral-nemo:12b-instruct-2407-q4_0
   ```
3.  Run the example `example/exporter-json/local-mistral-nemo-example.ipynb`

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