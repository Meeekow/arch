#!/bin/bash

# configure snapper config named "root"
sudo snapper -c root set-config ALLOW_GROUPS=wheel TIMELINE_LIMIT_DAILY=7 TIMELINE_LIMIT_HOURLY=5

# copy scripts
sudo cp ~/arch/resource/btrfs/hooks/switchsnaprotorw /etc/initcpio/hooks/
sudo cp ~/arch/resource/btrfs/install/switchsnaprotorw /etc/initcpio/install/

# add to mkinitcpio.conf
sudo sed -i '52s/grub-btrfs-overlayfs/switchsnaprotorw/' /etc/mkinitcpio.conf

# generate new mkinitcpio
sudo mkinitcpio -p linux

