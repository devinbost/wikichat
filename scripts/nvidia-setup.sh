
# Author: Devin Bost
# Date: Jan 10, 2025
####
# Install GPU Operator:
####
# Patch Nouveau as needed:

#sudo tee /etc/modules-load.d/ipmi.conf <<< "ipmi_msghandler" \
#    && sudo tee /etc/modprobe.d/blacklist-nouveau.conf <<< "blacklist nouveau" \
#    && sudo tee -a /etc/modprobe.d/blacklist-nouveau.conf <<< "options nouveau modeset=0"
#sudo update-initramfs -u
## Reboot to ensure changes apply:
#sudo init 6

# Define the output file name


## SSH to the instance in a way that forwards the ports we will need to setup MC:
# ssh -i "~/.ssh/private_key.pem" ubuntu@ec2-ip-address.us-west-2.compute.amazonaws.com -L 30000:localhost:30000 -L 30880:localhost:30880

# Write the YAML content to the file
cat <<EOF > ds_license.yaml
apiVersion: kots.io/v1beta1
kind: License
(remaining contents of datastax license for mission control)
EOF

export DS_LICENSE_ID=(license ID from the mission control license file)
curl -f https://replicated.app/embedded/mission-control/stable -H "Authorization: $DS_LICENSE_ID" -o mission-control-stable.tgz
tar xvzf mission-control-stable.tgz
sudo ./mission-control install --license ds_license.yaml

# Go to localhost:30000 in your browser. Be sure to check the Database Worker box. Leave everything else as default.

# Example to port forward:

# After that, do the same for port 30880:
# Go here in your browser: localhost:30880
# Sign in with these defaults:
# Username: admin@example.com
# Password: password

# Go to Projects -> New Project. Name it: "nvidia-demo"
# Then, go to Create Cluster. Name it: "nvidia-hcd" (no quotes)
# Note the datacenter name (default is dc-1). 
# Set a rack name (can be anything).
# Check the box at the bottom to Deploy the Data API

# Create a superuser:
# Username: nvidia-hcd-superuser
# Password: superuserpass
# Save these credentials, along with the datacenter and cluster names. You will need these to connect to the DB. 

# Now, go to Clusters -> (your cluster) -> CQL Console and login.
# Then, run:
# CREATE KEYSPACE default_namespace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

###################################################################################################
# Start Nvidia installation:

export NGC_KEY=nvapi-your-apikey
export ARIZE_API_KEY=optional-arize-key
# SSH into embedded k8s cluster
sudo ./mission-control shell


# Install Helm CLI
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 && chmod 700 get_helm.sh && ./get_helm.sh
# Deploy GPU-Operator helm chart:
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

# ensure there are enough watches allowed (see https://github.com/NVIDIA/gpu-operator/issues/441):
sysctl -w fs.inotify.max_user_watches=100000 
sysctl -w fs.inotify.max_user_instances=100000
# ensure it persists after reboot:
echo "fs.inotify.max_user_watches=100000" | sudo tee -a /etc/sysctl.conf
echo "fs.inotify.max_user_instances=100000" | sudo tee -a /etc/sysctl.conf
# Apply changes via kernel reload
sudo sysctl -p


helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --version=v24.9.1 \
  --set toolkit.env[0].name=CONTAINERD_CONFIG \
  --set toolkit.env[0].value=/etc/k0s/containerd.d/nvidia.toml \
  --set toolkit.env[1].name=CONTAINERD_SOCKET \
  --set toolkit.env[1].value=/run/k0s/containerd.sock \
  --set toolkit.env[2].name=CONTAINERD_RUNTIME_CLASS \
  --set toolkit.env[2].value=nvidia



###############
# Install NeMo LLM
###

#!/bin/bash

# ensure unzip package is present
apt install unzip

# ensure jq is present if we need to check gpu usage
apt install jq -y

# Install NGC
# If on ARM, you will instead need this version:
# wget --content-disposition https://api.ngc.nvidia.com/v2/resources/nvidia/ngc-apps/ngc_cli/versions/3.57.1/files/ngccli_arm64.zip?redirect=true -O /tmp/ngccli_linux.zip && break || sleep $((2 ** i))

# assuming x86_64:
for i in {1..5}; do
    wget --content-disposition https://api.ngc.nvidia.com/v2/resources/nvidia/ngc-apps/ngc_cli/versions/3.57.1/files/ngccli_linux.zip?redirect=true -O /tmp/ngccli_linux.zip && break || sleep $((2 ** i))
done

if [ ! -f /tmp/ngccli_linux.zip ]; then
    echo "Failed to download ngccli_linux.zip. Exiting." >&2
    exit 1
fi

unzip /tmp/ngccli_linux.zip -d /tmp
if [ -d /tmp/ngc-cli ]; then
    export PATH="/tmp/ngc-cli:$PATH"
else
    echo "ngc-cli directory not found after unzipping. Exiting." >&2
    exit 1
fi

export NGC_CLI_API_KEY=$NGC_KEY
export NGC_API_KEY=$NGC_CLI_API_KEY
export NAMESPACE=nemo-microservices
#export CUSTOMIZER_VOLCANO_ENABLED=false

echo "setting config"
if ! ngc config set --org ohlfw0olaadg --team ea-participants --format_type ascii; then
    echo "Failed to set ngc config. Exiting." >&2
    exit 1
fi

if ! ngc registry resource download-version "ohlfw0olaadg/ea-participants/nemo-microservices-helm-chart-examples:0.3.2"; then
    echo "Failed to download resource. Exiting." >&2
    exit 1
fi

cd nemo-microservices-helm-chart-examples_v0.3.2 || { echo "Failed to change directory. Exiting."; exit 1; }

if [ -x ./install.sh ]; then
    sudo chown ubuntu:ubuntu -R nemo-microservices-helm-chart-examples_v0.3.2/
    tar -zxvf ./local-example.tar.gz
    ./install.sh
else
    echo "install.sh not found or not executable. Exiting." >&2
    exit 1
fi

# Ensure enough GPU memory is available for smaller GPUs
kubectl patch deployment nemo -n nemo-microservices --type=json -p='[{
  "op": "add",
  "path": "/spec/template/spec/containers/0/env/-",
  "value": {
    "name": "NIM_MAX_MODEL_LEN",
    "value": "10500"
  }
}]'

# Release the older pod holding the resource
oldest_pod=$(kubectl get pods -n nemo-microservices \
  -l app.kubernetes.io/instance=nemo,app.kubernetes.io/name=nim \
  --sort-by=.metadata.creationTimestamp \
  -o jsonpath='{.items[0].metadata.name}')

# Check if a Pod name was retrieved
if [ -n "$oldest_pod" ]; then
  # Delete the oldest Pod
  kubectl delete pod "$oldest_pod" -n nemo-microservices
else
  echo "No Pods found matching the specified labels."
fi

cat <<EOF > /etc/k0s/containerd.d/nvidia.toml
version = 2

[plugins]

  [plugins."io.containerd.grpc.v1.cri"]

    [plugins."io.containerd.grpc.v1.cri".containerd]
      default_runtime_name = "nvidia"

      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia]
          privileged_without_host_devices = false
          runtime_engine = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2"

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia.options]
            BinaryName = "/usr/local/nvidia/toolkit/nvidia-container-runtime"

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia-cdi]
          privileged_without_host_devices = false
          runtime_engine = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2"

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia-cdi.options]
            BinaryName = "/usr/local/nvidia/toolkit/nvidia-container-runtime.cdi"

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia-legacy]
          privileged_without_host_devices = false
          runtime_engine = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2"

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.nvidia-legacy.options]
            BinaryName = "/usr/local/nvidia/toolkit/nvidia-container-runtime.legacy"
EOF


export LLM_IP=$(kubectl get svc nemo-nim -n nemo-microservices -o jsonpath='{.spec.clusterIP}')
# This cURL will fail until all pods are running. Check with kubectl get pods -n nemo-microservices
# curl -X GET "http://$LLM_IP:8000/v1/models"

# curl -X 'POST' \
#     "http://$LLM_IP:8000/v1/completions" \
#     -H 'accept: application/json' \
#     -H 'Content-Type: application/json' \
#     -d '{
# "model": "meta/llama-3.1-8b-instruct",
# "prompt": "Please give me a joke about Llamas",
# "max_tokens": 64
# }'

##################
# Install NeMo Embedding
####

# Get helm chart. (Note that NGC_API_KEY should still be set from the earlier step.)
# https://docs.nvidia.com/nim/nemo-retriever/text-embedding/latest/deploying.html
helm fetch https://helm.ngc.nvidia.com/nim/nvidia/charts/nvidia-nim-llama-32-nv-embedqa-1b-v2-1.3.0.tgz --username='$oauthtoken' --password=$NGC_API_KEY

DOCKER_CONFIG='{"auths":{"nvcr.io":{"username":"$oauthtoken", "password":"'${NGC_API_KEY}'" }}}'
echo -n $DOCKER_CONFIG | base64 -w0
NGC_REGISTRY_PASSWORD=$(echo -n $DOCKER_CONFIG | base64 -w0 )
kubectl apply -n nemo-microservices -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ngc-secret
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: ${NGC_REGISTRY_PASSWORD}
EOF

# This NIM uses persistent storage for storing downloaded models. These instructions require that you have a <a href="https://artifacthub.io/packages/helm/kvaps/nfs-server-provisioner">local-nfs</a> storage class provisioner installed in your cluster.
helm repo add nfs-ganesha-server-and-external-provisioner https://kubernetes-sigs.github.io/nfs-ganesha-server-and-external-provisioner/


helm install nfs-server nfs-ganesha-server-and-external-provisioner/nfs-server-provisioner --set storageClass.name=local-nfs

helm upgrade --install \
  --namespace nemo-microservices \
  nemo-embedder \
  --set persistence.class="local-nfs" \
--set persistence.createPV=true \
  nvidia-nim-llama-32-nv-embedqa-1b-v2-1.3.0.tgz


## Test the embedding endpoint:
# This cURL will fail until all pods are running. Check with kubectl get pods -n nemo-microservices
# export EMBEDDING_IP=$(kubectl get svc nemo-embedder-nvidia-nim-llama-32-nv-embedqa-1b-v2 -n nemo-microservices -o jsonpath='{.spec.clusterIP}')
# curl -X 'POST' \
#   "http://$EMBEDDING_IP:8000/v1/embeddings" \
#   -H 'accept: application/json' \
#   -H 'Content-Type: application/json' \
#   -d '{
# "input": "hello world",
# "model": "nvidia/llama-3.2-nv-embedqa-1b-v2",
# "input_type": "passage"
# }'

###########
## Install Nvidia-powered LangFlow:
####


# Define the output file name
OUTPUT_FILE="langflow-nvidia-deployment.yaml"

# Write the YAML content to the file
cat <<EOF > $OUTPUT_FILE
apiVersion: apps/v1
kind: Deployment
metadata:
  name: langflow-nvidia
  labels:
    app: langflow-nvidia
  namespace: langflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: langflow-nvidia
  template:
    metadata:
      labels:
        app: langflow-nvidia
    spec:
      containers:
      - name: langflow-nvidia
        image: devingbost/langflow_nvidia:v2
        command: ["uv", "run", "langflow", "run", "--host", "0.0.0.0", "--port", "7860"]
        env:
        - name: COLUMNS
          value: "200"
        - name: ARIZE_API_KEY
          value: "$ARIZE_API_KEY"
        - name: ARIZE_COLLECTOR_ENDPOINT
          value: "https://otlp.arize.com"
        ports:
        - containerPort: 7860
          protocol: TCP
        resources:
          limits:
            memory: "8Gi"
            cpu: "4"
        imagePullPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: langflow-nvidia-service
  labels:
    app: langflow-nvidia
  namespace: langflow
spec:
  type: ClusterIP
  selector:
    app: langflow-nvidia
  ports:
  - protocol: TCP
    port: 7860
    targetPort: 7860
EOF

kubectl create namespace langflow


# Apply the YAML file using kubectl
kubectl apply -f $OUTPUT_FILE


# Test it:
# This cURL will fail until all pods are running. Check with kubectl get pods -n langflow
export LANGFLOW_IP=$(kubectl get svc langflow-nvidia-service -n langflow -o jsonpath='{.spec.clusterIP}')
curl -X GET http://$LANGFLOW_IP:7860/health
echo $LANGFLOW_IP

# Forward this IP and port by exiting the terminal and starting one like this:

# ssh -i "~/.ssh/private_key.pem" ubuntu@ec2-ip-address.us-west-2.compute.amazonaws.com -L 30000:localhost:30000 -L 30880:localhost:30880 -L 7860:$LANGFLOW_IP:7860
# except where $LANGFLOW_IP is replaced with the actual value from running: echo $LANGFLOW_IP (above)

# Then, to configure LangFlow, use the service endpoints you obtain via:
# kubectl get svc -n nemo-microservices

# Find the data api service by finding the database namespace. Check kubectl get svc -A to search for it if not sure.

# Then, you will want to get the Cassandra svc from k8s and expose it, like this:
# kubectl get namespaces
# kubectl expose svc nvidia-hcd-dc-1-all-pods-service --name nvidia-hcd-dc-1-all-pods-service-external --type NodePort -n nvidia-demo-8q938j30