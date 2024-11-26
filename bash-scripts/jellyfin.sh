#!/usr/bin/env bash

# Install needed packages.
sudo pacman -S --needed --noconfirm docker docker-compose nvidia-container-toolkit tailscale ntfs-3g

# Enable/start docker.service
sudo systemctl enable docker.socket
sudo systemctl start docker.socket

# Configure the container runtime by using the nvidia-ctk command
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Mount point for NTFS drive.
sudo mkdir -p /media/jellyfin/{cache,config,mnt}

# Copy docker-compose.yml.
sudo ln -s $HOME/arch/resource/docker/docker-compose.yml /media/jellyfin

# Pull image for Jellyfin.
sudo docker pull jellyfin/jellyfin

# Enable Tailscale at boot.
sudo systemctl enable tailscaled.service

# Start Tailscale service.
sudo systemctl start tailscaled.service

# Install using paru/yay.
paru -S --needed jellyfin-media-player
