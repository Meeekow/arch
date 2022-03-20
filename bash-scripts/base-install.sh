#!/bin/bash

# Set timezone
ln -sf /usr/share/zoneinfo/Asia/Manila /etc/localtime

# Sync system clock to hardware clock
hwclock --systohc

# Select locale to EN_PH.UTF-8
sed -i '173s/.//' /etc/locale.gen

# Generate locale
locale-gen

# Add locale selected to configuration
echo "LANG=en_PH.UTF-8" >> /etc/locale.conf

# Change keyboard layout accordingly
# Uncomment "Dvorak" line if using Standard Qwerty
# Defaults to Qwerty Layout since I am using a programmable keyboard
# echo "KEYMAP=dvorak" >> /etc/vconsole.conf
echo "KEYMAP=us" >> /etc/vconsole.conf

# Set hostname
echo "meredith" >> /etc/hostname

# Configure 'hosts' file
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
echo "127.0.1.1 meredith" >> /etc/hosts

# Set 'root' password
echo root:mm | chpasswd

# Packages separated according to their function
# Current packages I need for my setup
pacman -S --noconfirm --needed grub efibootmgr networkmanager network-manager-applet dialog mtools dosfstools base-devel linux-headers bluez bluez-utils blueman alsa-utils pulseaudio pulseaudio-bluetooth pulseaudio-alsa pavucontrol ntfs-3g lxsession pcmanfm gvfs bash-completion scrot os-prober xclip r8168 dnsmasq openresolv firefox vlc ffmpeg rsync reflector dmenu kitty nitrogen

# Display Server
pacman -S --noconfirm --needed xorg

# Proprietary Display
pacman -S --noconfirm --needed nvidia nvidia-utils nvidia-settings

# Display Manager
pacman -S --noconfirm --needed lightdm lightdm-gtk-greeter

# Uncomment the line below if xmonad/xmobar from pacman is preferred instead of the xmonad/xmobar via stack
# pacman -S --noconfirm --needed xmonad xmonad-contrib xmobar

# Install Grub Bootloader
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB

# Make a config for Grub
grub-mkconfig -o /boot/grub/grub.cfg

# Install r8168 Ethernet Driver and blacklist r8169 Ethernet Driver which is being installed by default
modprobe r8168
echo "blacklist r8169" >> /etc/modprobe.d/r8169_blacklist.conf
# Uncomment line below if using btrfs instead of ext4
# sed -i -e '7s/()/(btrfs)/' /etc/mkinitcpio.conf
mkinitcpio -p linux

# Enable packages to run during boot
systemctl enable NetworkManager
systemctl enable bluetooth.service
systemctl enable dnsmasq.service
systemctl enable reflector.timer
systemctl enable fstrim.timer

# Add 'user'
useradd -m -G wheel meeks
echo meeks:mm | chpasswd
echo "meeks ALL=(ALL) ALL" >> /etc/sudoers.d/meeks

# Set journal size and frequency of trimming the journal
journalctl --vacuum-size=50M
journalctl --vacuum-time=2weeks

# Make scripts executable as part of the installation automation
chmod +x /arch/bash-scripts/dotfiles.sh
chmod +x /arch/bash-scripts/post-install.sh
chmod +x /arch/bash-scripts/xmonad-stack.sh

# Copy xmonad custom desktop entry for LightDM
mkdir -p /usr/share/xsessions
cp /arch/dotfiles/xmonad.desktop /usr/share/xsessions/


# END OF BASE INSTALL
printf "\e[1;32mDone! Type exit, umount -R /mnt and reboot.\e[0m\n"
