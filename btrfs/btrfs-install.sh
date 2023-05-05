#!/bin/bash

# set timezone
ln -sf /usr/share/zoneinfo/Asia/Manila /etc/localtime

# sync system clock to hardware clock
hwclock --systohc

# select locale to en_US.UTF-8
sed -i '171s/.//' /etc/locale.gen

# generate locale
locale-gen

# add locale selected to configuration
echo "LANG=en_US.UTF-8" >> /etc/locale.conf

# set keyboard layout to QWERTY
echo "KEYMAP=us" >> /etc/vconsole.conf

# set hostname
echo "meredith" >> /etc/hostname

# configure 'hosts' file
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
echo "127.0.1.1 meredith" >> /etc/hosts

# set 'root' password
echo root:mm | chpasswd

# grub bootloader will be used instead of systemd-boot
pacman -S --noconfirm --needed btrfs-progs efibootmgr grub os-prober network-manager-applet networkmanager r8168 base-devel linux-headers firefox bash-completion reflector xfce4 xfce4-goodies

# display server
pacman -S --noconfirm --needed xorg

# proprietary display driver
pacman -S --noconfirm --needed nvidia nvidia-utils nvidia-settings

# display manager (login window)
pacman -S --noconfirm --needed lightdm lightdm-gtk-greeter

# uncomment if grub will be used instead of systemd-boot
# install Grub bootloader
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB

# uncomment if grub will be used instead of systemd-boot
# make a config for Grub
grub-mkconfig -o /boot/grub/grub.cfg

# install r8168 ethernet driver and blacklist r8169 ethernet driver which is being installed by default
modprobe r8168
echo "blacklist r8169" >> /etc/modprobe.d/r8169_blacklist.conf

# uncomment line below if using btrfs instead of ext4
sed -i -e '7s/()/(btrfs)/' /etc/mkinitcpio.conf
mkinitcpio -p linux

# enable packages to run on boot
systemctl enable NetworkManager
systemctl enable reflector.timer
systemctl enable fstrim.timer

# add 'user'
useradd -m -G wheel meeks
echo meeks:mm | chpasswd
echo "meeks ALL=(ALL) ALL" >> /etc/sudoers.d/meeks

# set journal size and frequency of trim
journalctl --vacuum-size=50M
journalctl --vacuum-time=2weeks

# remove repo from 'root' folder
rm -rf /arch/


printf "\e[1;32mDone! Type exit, umount -R /mnt and reboot.\e[0m\n"
