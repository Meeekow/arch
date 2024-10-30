#!/usr/bin/env bash

# Install needed packages.
sudo pacman -S --needed --noconfirm docker docker-compose tailscale ntfs-3g

# Enable/start docker.service
sudo systemctl enable docker.socket
sudo systemctl start docker.socket

# Mount point for NTFS drive.
sudo mkdir -p /media/jellyfin/{cache,config,mnt}

# Copy docker-compose.yml.
sudo ln -s /home/rara/arch/resource/docker/docker-compose.yml /media/jellyfin

# Pull image for Jellyfin.
sudo docker pull jellyfin/jellyfin

# Enable Tailscale at boot.
sudo systemctl enable tailscaled.service

# Start Tailscale service.
sudo systemctl start tailscaled.service

# Install using paru/yay.
paru -S --needed jellyfin-media-player
