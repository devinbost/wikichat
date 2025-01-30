# WikiChat

This project is a starter for creating a chatbot using Astra DB with Nvidia. It's designed to be easy to deploy and use, with a focus on performance and usability.

## Features

- **Astra DB Integration**: Store and retrieve data from your Astra DB database with ease.
- **LangChain.js Integration**: Uses the new Astra DB vectorstore to implement RAG.
- **Customizable**: Modify and extend the chatbot to suit your needs.

## Getting Started

### Prerequisites

- An Vector Database using Astra or DSE
- A VM with L40S GPUs or better (if using self-managed)

### Setup

1. Get an NGC key from NVIDIA. This currently requires early access approval.
2. Get a Mission Control License. 
3. Follow the instructions in the `nvidia/nvidia-setup.sh` script. (Just open the script and read through it and set the variables as needed.)
4. Setup the `.env.development` and `.env.production` files. 
5. For local testing, the docker compose files can be used. But, for the NVIDIA stack, you will want to use the LangFlow k8s objects defined in that nvidia-setup.sh script. After deploying via nvidia-setup.sh script, to start this application, just run:
`npm run localdev`
6. The most common issues are related to not having the environment variables setup correctly, such as not having a C* instance setup. After following all the instructions in the `nvidia-setup.sh` script (be sure to read it to the end), you should have mission control setup with a DSE or HCD database. Be sure the IP addresses are provided correctly.



Run the script in nvidia folder.

1. Clone this repository to your local machine.
2. Install the dependencies by running `npm install` in your terminal.
3. Set up the following environment variables in your `.env.production` and `.env.development` files:
- `LANGFLOW_APPLICATION_TOKEN`: Your LangFlow application token.
- `LANGFLOW_ID`: (Optional) UUID for LangFlow instance identification.
- `LANGFLOW_BASE_URL`: Base URL where LangFlow is running, e.g., `http://port.of.langflow:7860`.

- `LANGFLOW_LOG_LEVEL`: Log level for LangFlow; set to `debug` for verbose logging.

- `DEFAULT_ADMIN_EMAIL`: Default admin email for authentication.
- `DEFAULT_ADMIN_PASSWORD`: Default admin password for authentication, e.g., `"Test1234@#"`.

- `NEXTAUTH_SECRET`: Base64-encoded secret for NextAuth authentication.
- `AUTH_SECRET`: (Same value as `NEXTAUTH_SECRET`, this will be fixed).
- `OLLAMA_HOST`: (Optional) URL of the Ollama instance if running via Docker, e.g., `http://ollama:11434`.
- `NEXTAUTH_URL`: Endpoint where the app is hosted, e.g., `http://localhost:3000`.
- `HUGGINGFACE_MODEL_PATH`: (Optional) Path to the Hugging Face model, e.g., `/app/huggingface/all-MiniLM-L12-v2`.

- `NVIDIA_LLM_ENDPOINT`: Ensure this is the LLM service where the model is running via NeMo; see `nvidia-setup.sh`. Example: `http://10.12.231.107:8000`.
- `NVIDIA_EMBEDDING_ENDPOINT`: Ensure this is the LLM service where the model is running via NeMo; see `nvidia-setup.sh`. Example: `http://10.12.231.107:8000`.

- `CASSANDRA_CONTACT_POINTS`: IP address of the Cassandra node provided in the setup script, e.g., `"10.12.146.189"`.
- `CASSANDRA_USERNAME`: Username for Cassandra; must match what you set up during mission control installation, e.g., `"nvidia-hdc-superuser"`.
- `CASSANDRA_PASSWORD`: Password for Cassandra; must match what you set up during mission control installation, e.g., `"superuserpass"`.
- `CASSANDRA_DATA_ENDPOINT`: Cassandra Data API endpoint; must match what was set up during mission control installation, e.g., `"http://10.12.129.101:8181"`.
- `CASSANDRA_COLLECTION`: Cassandra collection name, e.g., `"instruction"`.
- `CASSANDRA_DC`: Cassandra data center name, e.g., `"dc-1"`.
- `DATA_API_PATH`: Version of the Data API, e.g., `"v1"`.

- `INGEST_FLOW_NAME`: Name of the ingest flow, e.g., `"ingest"`.
- `SEARCH_FLOW_NAME`: Name of the search flow, e.g., `"search"`.

- `REST_API_KEY`: Specific API key for the REST component.
- `REST_LSL_KEY`: Specific API key for the REST component.
- `REST_ENDPOINT`: Specific endpoint for the REST API component.

- `ASTRA_DB_TOKEN`: (Optional) Required if using `system="cassandra"` query types.
- `ASTRA_DB_DATABASE_ID`: (Optional) Required if using `system="cassandra"` query types.

- `MYSQL_DB`: Required if using `system="mysql"` query types. Example: `"MYSQL"`.
- `MYSQL_USER`: Username for MySQL, e.g., `"root"`.
- `MYSQL_PASSWORD`: Password for MySQL authentication, e.g., `"Mysql!@#"` (ensure strong security).
- `MYSQL_HOST`: Hostname or IP of the MySQL server, e.g., `"mysql"`.

- `OPENAI_KEY`: OpenAI API key for backward compatibility with earlier versions, e.g., `"sk-proj-example"`.

- `GOOGLE_CLIENT_ID`: (Optional) Google OAuth client ID for authentication, e.g., `"example.apps.googleusercontent.com"`.
- `GOOGLE_CLIENT_SECRET`: (Optional) Google OAuth client secret for authentication, e.g., `"example"`.

- `LANGFLOW_SUPERUSER`: Username for the LangFlow superuser, e.g., `"admin"`.
- `LANGFLOW_SUPERUSER_PASSWORD`: Password for the LangFlow superuser, e.g., `"securepassword"`.
- `LANGFLOW_SECRET_KEY`: Randomly generated secure key for LangFlow authentication.
- `LANGFLOW_AUTO_LOGIN`: Set to `True` for automatic login; change to `False` once [PR #4611](https://github.com/langflow-ai/langflow/pull/4611) is merged.
- `NVIDIA_EMBEDDING_ENDPOINT`: Set to the appropriate endpoint, like: `http://10.23.231.107:8000`
- `NVIDIA_EMBEDDING_MODEL`: Set to the appropriate embedding model, like: `nvidia/llama-3.2-nv-embedqa-1b-v2`
- `NVIDIA_LLM_ENDPOINT`: Set to the appropriate endpoint, like: `http://10.244.231.107:8000`. Be sure to not mix up with embedding endpoint.
- `NVIDIA_LLM_MODEL`: Set to the appropriate model name, like `meta/llama-3.1-8b-instruct`. Be sure it matches what you deployed.

After you've imported LangFlow into your environment, be sure to test the flow. If any variables didn't get picked up, they will need to be fixed, and then you will need to re-export the JSON for the flow and update the tweaks in `/app/api/langflow/route.ts`
### Running the Project

To start the development server, run `npm run devlocal` in your terminal. Open [http://localhost:3000](http://localhost:3000) to view the chatbot in your browser. 


-------

# Legacy deployment (non-NVIDIA, uses OLlama):

## Initial setup:

Add the MySQL database setup script (that creates the required tables and populates them) in `./mysql-init/`
This script will be invoked to populate the database automatically when starting `docker-compose`
Note that since this MySQL database has plain text credentials stored in the compose file, it should only be used for testing.

### Setup ollama
Install ollama from the main website

Run:
`ollama pull llama3.1:latest`
from your terminal.
This downloads the model that we will bundle into the docker deployment. 

Running the Ollama docker image requires following these instructions on the host machine to support the Nvidia drivers (for GPU support): https://hub.docker.com/r/ollama/ollama

Then, run `cp -r ~/.ollama/models/* ./models`
(There's an empty models directory created for you.)

### HuggingFace setup
Run steps to download huggingface model to `huggingface/(model name)` like:
`huggingface/all-MiniLM-L12-v2` into the root directory.
```
from sentence_transformers import SentenceTransformer
modelPath = "path/to/app/huggingface/all-MiniLM-L12-v2"

model = SentenceTransformer('sentence-transformers/all-MiniLM-L12-v2')
model.save(modelPath)
```
This is the directory that will be used in the env file for docker.

### Environment variables:
Create two env files:

- `.env.development` (for local development & testing)
- `.env.production` (for deployment)

The difference is that `.env.production` uses environment variables that are associated with docker networking.

```
ASTRA_DB_API_ENDPOINT=https://....astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:kGW...
ASTRA_DB_NAMESPACE=default_namespace
OPENAI_API_KEY=sk-proj-9H...
# Optional: Set up tracing
# LANGCHAIN_TRACING_V2="true"
# LANGCHAIN_SESSION="wikichat"
# LANGCHAIN_API_KEY="ls..."

#Fiddler Ingestion
# FIDDLER_MODEL_ID=REPLACE_ME
# FIDDLER_TOKEN=REPLACE_ME
# FIDDLER_BASE_URL=REPLACE_ME

#Langflow Calling
LANGFLOW_APPLICATION_TOKEN=AstraCS:g...
# SIA v2 chat:
FLOW_ID_OR_NAME=openai_flow
# To run the huggingface/ollama flow, use:
# FLOW_ID_OR_NAME=local_flow
LANGFLOW_ID=453...
LANGFLOW_BASE_URL=http://127.0.0.1:7860
LANGFLOW_BASE_URL=http://127.0.0.1:7860

# Put all of your LangFlow variables in here.
OPENAI_KEY=sk-proj-9...
ASTRA_DB_TOKEN=AstraCS:Tq...
ASTRA_ENDPOINT=https://...apps.astra.datastax.com
ASTRA_DB_DATABASE_ID=c8...
MYSQL_DB=MYSQL # note that mysql is case sensitive for the DB name
MYSQL_USER=root
MYSQL_PASSWORD=example
MYSQL_HOST=localhost

DEBUG=-next:jsconfig-paths-plugin,* npm run dev

OLLAMA_HOST=http://localhost:11434

HUGGINGFACE_MODEL_PATH=sentence-transformers/all-MiniLM-L12-v2
```



In the `.env.production` version, use these values instead:
```
LANGFLOW_BASE_URL=http://langflow:7860
LANGFLOW_BASE_URL=http://langflow:7860
MYSQL_HOST=host.docker.internal (if mysql is running on host machine)

HUGGINGFACE_MODEL_PATH=/app/huggingface/all-MiniLM-L12-v2
```

## Local testing:
Command for starting the app locally for debugging/testing:
`LANGFLOW_STORE_ENVIRONMENT_VARIABLES=true LANGFLOW_VARIABLES_TO_GET_FROM_ENVIRONMENT=ASTRA_ENDPOINT,ASTRA_DB_TOKEN,ASTRA_DB_DATABASE_ID,OPENAI_KEY,MYSQL_DB,MYSQL_USER,MYSQL_PASSWORD,MYSQL_HOST,LANGCHAIN_TRACING_V2,LANGCHAIN_SESSION,LANGCHAIN_API_KEY,OLLAMA_HOST python -m langflow run --env-file /Users/devin.bost/proj/repos/wikichat/.env.development`
Then, run:
`npm dev run`

## Docker testing:
To test the docker deployment, run this:
`docker-compose down; clear; docker-compose up --build 2>&1 | tee output.log`
Then, go to localhost:3000 to access the app.


## Secure connection bundle
You will need to download the secure connection bundle and set the path of it like:
PATH_SECURE_CONNECT_BUNDLE=./app/secure-connect-wikichat.zip

Update the docker compose with the contents:

```
DEFAULT_ADMIN_PASSWORD="Test1234@#"
DEFAULT_ADMIN_EMAIL=superadmin@localhost.com
```
This gives you the initial admin account that you need to grant additional users admin permissions.
Be sure to not commit these credentials to source control!

Create them also in a `.env.local` file

You must obtain these OAUTH values and add them to that file as well:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```