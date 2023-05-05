#!/bin/bash

# Arch Linux
sudo pacman -S --needed qemu virt-manager virt-viewer vde2 bridge-utils dnsmasq openbsd-netcat

sudo pacman -S --needed ebtables iptables

sudo pacman -S --needed libguestfs

sudo systemctl enable libvirtd.service
sudo systemctl start libvirtd.service

sudo usermod -a -G libvirt $USER

sudo systemctl restart libvirtd

# Start NAT link
sudo virsh net-start default
