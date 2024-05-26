#!/bin/bash

# set timezone
ln -sf /usr/share/zoneinfo/Asia/Manila /etc/localtime

# sync system clock to hardware clock
hwclock --systohc

# select locale to EN_PH.UTF-8
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

# packages clustered according to their function
# current list of  packages I need for my setup
pacman -S --noconfirm --needed dnsmasq network-manager-applet networkmanager openresolv r8168 base-devel linux-headers dialog dosfstools mtools blueman bluez bluez-utils alsa-utils pavucontrol pulseaudio pulseaudio-alsa pulseaudio-bluetooth ntfs-3g gvfs lxsession pcmanfm mtpfs gvfs-mtp ffmpeg vlc firefox exfatprogs bash-completion dmenu kitty nitrogen reflector rsync wget scrot stow xclip

# uncomment if grub bootloader will be used instead of systemd-boot
#pacman -S --noconfirm --needed efibootmgr grub os-prober dnsmasq network-manager-applet networkmanager openresolv r8168 base-devel linux-headers dialog dosfstools mtools blueman bluez bluez-utils alsa-utils pavucontrol pulseaudio pulseaudio-alsa pulseaudio-bluetooth ntfs-3g gvfs lxsession pcmanfm mtpfs gvfs-mtp ffmpeg vlc firefox bash-completion dmenu kitty nitrogen reflector rsync scrot xclip

# display server
#pacman -S --noconfirm --needed xorg

# proprietary display driver
pacman -S --noconfirm --needed nvidia nvidia-utils nvidia-settings

# display manager (login window)
#pacman -S --noconfirm --needed lightdm lightdm-gtk-greeter

# uncomment line if awesomewm will be used
#pacman -S --noconfirm --needed awesome

# uncomment the line below if xmonad/xmobar from pacman is preferred instead of the xmonad/xmobar via stack
#pacman -S --noconfirm --needed xmonad xmonad-contrib xmobar

# uncomment if grub will be used instead of systemd-boot
# install Grub bootloader
#grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB

# uncomment if grub will be used instead of systemd-boot
# make a config for Grub
#grub-mkconfig -o /boot/grub/grub.cfg

# systemd-boot basic config
bootctl --path=/boot install
#sed -i -e '1s/.//' /boot/loader/loader.conf
echo "default arch.conf" >> /boot/loader/loader.conf
touch /boot/loader/entries/arch.conf
echo "title   Arch Linux" >> /boot/loader/entries/arch.conf
echo "linux   /vmlinuz-linux" >> /boot/loader/entries/arch.conf
echo "initrd  /amd-ucode.img" >> /boot/loader/entries/arch.conf
echo "initrd  /initramfs-linux.img" >> /boot/loader/entries/arch.conf
echo "options root=/dev/sda2 rw quiet splash" >> /boot/loader/entries/arch.conf

# install r8168 ethernet driver and blacklist r8169 ethernet driver which is being installed by default
modprobe r8168
echo "blacklist r8169" >> /etc/modprobe.d/r8169_blacklist.conf
# uncomment line below if using btrfs instead of ext4
#sed -i -e '7s/()/(btrfs)/' /etc/mkinitcpio.conf
mkinitcpio -p linux

# enable packages to run on boot
systemctl enable NetworkManager
systemctl enable bluetooth.service
systemctl enable dnsmasq.service
systemctl enable reflector.timer
systemctl enable fstrim.timer

# add 'user'
useradd -m -G wheel arabella
echo arabella:mm | chpasswd
echo "arabella ALL=(ALL) ALL" >> /etc/sudoers.d/arabella

# set journal size and frequency of trim
journalctl --vacuum-size=50M
journalctl --vacuum-time=2weeks

# copy xmonad custom desktop entry for LightDM
#mkdir -p /usr/share/xsessions
#cp /arch/resource/xmonad/xmonad.desktop /usr/share/xsessions/

# remove repo from 'root' folder
rm -rf /arch/


printf "\e[1;32mDone! Type exit, umount -R /mnt and reboot.\e[0m\n"
