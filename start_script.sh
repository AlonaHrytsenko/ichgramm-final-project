#!/bin/bash

sudo dnf update
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker


sudo usermod -aG docker ec2-user

# Download for x86_64 architecture
DOCKER_CLI_PLUGINS_DIR="/usr/local/lib/docker/cli-plugins"
sudo mkdir -p $DOCKER_CLI_PLUGINS_DIR
sudo curl -SL https://github.com/docker/buildx/releases/download/v0.25.0/buildx-v0.25.0.linux-amd64 -o $DOCKER_CLI_PLUGINS_DIR/docker-buildx
sudo chmod +x $DOCKER_CLI_PLUGINS_DIR/docker-buildx

sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o $DOCKER_CLI_PLUGINS_DIR/docker-compose
sudo chmod +x $DOCKER_CLI_PLUGINS_DIR/docker-compose

export PATH=$PATH:$DOCKER_CLI_PLUGINS_DIR
sudo systemctl restart docker

dnf install -y git
cd /opt/
git clone https://github.com/AlonaHrytsenko/ichgramm-final-project.git
cd ichgramm-final-project

docker-compose up
