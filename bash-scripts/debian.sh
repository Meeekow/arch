#!/bin/bash

# Check /etc/apt/sources.list
sudo vi /etc/apt/sources.list

# Make sure all packages are up to date.
sudo apt update && sudo apt upgrade -y

# Additional packages.
sudo apt install curl git neovim netplan.io ntfs-3g openvswitch-switch powertop -y

# Clone github repository.
git clone https://github.com/meeekow/arch

# Copy netplan config for static ip.
sudo cp $USER/arch/resource/netplan/50-cloud-init.yaml /etc/netplan/

# Add read, write permission.
sudo chmod 600 /etc/netplan/50-cloud-init.yaml

# Restart network.
sudo systemctl restart systemd-networkd.service

# Try and apply netplan settings.
sudo netplan try
sudo netplan apply

# Install Docker Engine.
cd $HOME/arch/resource/docker/
chmod +x install.sh
./install.sh

# Add user so we don't have to sudo everytime.
sudo usermod -aG docker $USER

# Install Pihole and Unbound via Docker.
mkdir -p "$HOME/pihole/"
cd $HOME/pihole/
cp $HOME/arch/resource/docker/pihole/docker-compose.yml .

# Install Tailscale directly to OS.
cd $HOME/arch/resource/tailscale/
chmod +x install.sh
./install.sh

# Install Jellyfin.
mkdir -p "$HOME/jellyfin/"
cd $HOME/jellyfin/
cp $HOME/arch/resource/docker/jellyfin/docker-compose.yml .

# Add user so we can use iGPU to render.
sudo usermod -aG render $USER

# Install Qbittorrent-nox directly to OS.
sudo apt install qbittorrent-nox -y

# Initialize QBittorrent-nox.
qbittorrent-nox

# Exit running qbittorrent-nox.

# Start service on current session.
sudo systemctl start qbittorrent-nox@qbtuser
# Enable service on boot.
sudo systemctl enable qbittorrent-nox@qbtuser

# Restart network.
# Install Docker Engine.
# Configure Pi-Hole and Unbound.
# Configure Tailscale.
# Configure Jellyfin.
# Configure Qbittorrent-nox.

