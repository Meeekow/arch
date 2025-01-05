#!/usr/bin/env bash
# https://docs.docker.com/engine/install/ubuntu/

# Uninstall old versions
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Prerequisites
sudo apt install gnome-terminal -y

# Install using the apt repository
# Execute line by line
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install the Docker packages
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Make directory for jellyfin via docker
mkdir -p /media/jellyfin/{cache,config,mnt}

# Copy docker-compose.yml from personal repository
sudo cp $HOME/arch/resource/docker/server/docker-compose.yml /media/jellyfin/

# Add your user to the docker group
sudo usermod -aG docker $USER

# Add the jellyfin user to the render group
sudo usermod -aG render $USER

