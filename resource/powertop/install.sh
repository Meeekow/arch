#!/usr/bin/env bash

# Copy to systemd
sudo cp $HOME/arch/resource/powertop/powertop.service /etc/systemd/system/

# Enable to load on boot.
sudo systemctl enable powertop.service
