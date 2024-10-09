#!/bin/bash

# Ensure script stops on error
set -e

# Define image names
NEXTJS_IMAGE="nextjs-app"
LANGFLOW_IMAGE="langflow-app"
OLLAMA_IMAGE="ollama/ollama:latest"
POSTGRES_IMAGE="postgres:16"
MYSQL_IMAGE="mysql:8.0"

# Define output tar files
NEXTJS_TAR="nextjs-app.tar"
LANGFLOW_TAR="langflow-app.tar"
OLLAMA_TAR="ollama.tar"
POSTGRES_TAR="postgres.tar"
MYSQL_TAR="mysql.tar"

# Define volume names (if any volumes need to be saved)
# For now, we assume no volumes need to be saved
# If volumes need to be saved, define them here and adjust the script accordingly

# Define build and deploy directories
BUILD_DIR="build_artifacts"
DEPLOY_DIR="deployment_package"
SOURCE_DIR=$(pwd)

# Create directories for build artifacts and deployment package
mkdir -p $BUILD_DIR
mkdir -p $DEPLOY_DIR

echo "Building Docker images for x86_64..."

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null
    then
        echo "Docker could not be found. Please install Docker and try again."
        exit 1
    fi
}

# Function to build Docker images
build_images() {
    echo "Building Docker images..."

    # Build Next.js App
    docker build --platform linux/amd64 -t $NEXTJS_IMAGE -f Dockerfile.app .

    # Build Langflow App
    docker build --platform linux/amd64 -t $LANGFLOW_IMAGE -f Dockerfile.langflow .

    # Pull Postgres and MySQL images for linux/amd64
    docker pull --platform linux/amd64 $POSTGRES_IMAGE
    docker pull --platform linux/amd64 $MYSQL_IMAGE

    docker pull --platform linux/amd64 $OLLAMA_IMAGE
}

# Function to save Docker images as tar files
save_images() {
    echo "Saving Docker images to tar files..."

    docker save -o $BUILD_DIR/$NEXTJS_TAR $NEXTJS_IMAGE
    docker save -o $BUILD_DIR/$LANGFLOW_TAR $LANGFLOW_IMAGE
    docker save -o $BUILD_DIR/$OLLAMA_TAR $OLLAMA_IMAGE
    docker save -o $BUILD_DIR/$POSTGRES_TAR $POSTGRES_IMAGE
    docker save -o $BUILD_DIR/$MYSQL_TAR $MYSQL_IMAGE
}

# Function to create deployment package
create_deployment_package() {
    echo "Creating deployment package..."

    # Copy tar files to deployment package directory
    cp $BUILD_DIR/*.tar $DEPLOY_DIR

    # Copy necessary project files into the deployment package directory
    echo "Copying project files to deployment package..."

    # Copy docker-compose file and other necessary files
    cp docker-compose.yaml $DEPLOY_DIR/

    # Copy any other necessary files or directories (e.g., models, flows)
    # Adjust the rsync command as needed
    rsync -av --progress $SOURCE_DIR/ $DEPLOY_DIR/ \
        --exclude build_artifacts \
        --exclude deployment_package \
        --exclude .git \
        --exclude node_modules \
        --exclude .next \
        --exclude *.tar \
        --exclude "*.log" \
        --exclude "Dockerfile.*"

    echo "Deployment package created at $DEPLOY_DIR"
}

# Function to clean up old tar files
cleanup_old_files() {
    echo "Cleaning up old tar files..."
    rm -f $BUILD_DIR/*.tar
}

# Main execution starts here
check_docker
cleanup_old_files
build_images
save_images
create_deployment_package

echo "Process completed. Your deployment package is ready."