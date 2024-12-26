#!/usr/bin/env bash

# Install Pi-hole
curl -sSL https://install.pi-hole.net | bash

# Change generated password by the installer
pihole -a -p mm

# Install Unbound
sudo apt install unbound

# Copy unbound.conf for pihole
sudo cp $HOME/arch/resource/pihole/pi-hole.conf /etc/unbound/unbound.conf.d/

# Restart
sudo service unbound restart

# Test unbound (run this twice to see if it's working)
dig pi-hole.net @127.0.0.1 -p 5335

# Add this to settings in webui and then save
# 127.0.0.1#5335
