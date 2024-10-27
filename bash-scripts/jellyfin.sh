#!/usr/bin/env bash

# Mount point for NTFS drive.
sudo mkdir -p /home/jellyfin/

# Jellyfin
sudo pacman -S --needed --noconfirm jellyfin-server jellyfin-web tailscale ntfs-3g

# Enable Jellyfin at boot.
sudo systemctl enable jellyfin.service

# Start Jellyfin service.
sudo systemctl start jellyfin.service

# Enable Tailscale at boot.
sudo systemctl enable tailscaled.service

# Start Tailscale service.
sudo systemctl start tailscaled.service

# Install using paru/yay.
paru -S --needed jellyfin-media-player
