#!/bin/bash


ln -sf /usr/share/zoneinfo/Asia/Manila /etc/localtime
hwclock --systohc
sed -i '173s/.//' /etc/locale.gen
locale-gen
echo "LANG=en_PH.UTF-8" >> /etc/locale.conf

# uncomment either line below for keyboard layout
# echo "KEYMAP=dvorak" >> /etc/vconsole.conf
echo "KEYMAP=us" >> /etc/vconsole.conf

echo "meredith" >> /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
echo "127.0.1.1 meredith" >> /etc/hosts
echo root:mm | chpasswd

# uncomment these 2 lines if download speed is meh
# pacman -S --noconfirm --needed rsync reflector
# reflector --download-timeout 15 --latest 5 --protocol https --sort rate --country "Singapore" --save /etc/pacman.d/mirrorlist

pacman -S --noconfirm --needed grub efibootmgr networkmanager network-manager-applet dialog mtools dosfstools base-devel linux-headers bluez bluez-utils blueman alsa-utils pulseaudio pulseaudio-bluetooth pulseaudio-alsa pavucontrol ntfs-3g lxsession pcmanfm gvfs bash-completion scrot os-prober xclip r8168 dnsmasq openresolv vlc firefox ffmpeg rsync reflector dmenu kitty nitrogen

pacman -S --noconfirm --needed xorg

pacman -S --noconfirm --needed nvidia nvidia-utils nvidia-settings

pacman -S --noconfirm --needed lightdm lightdm-gtk-greeter

# uncomment line below if xmonad from pacman is preferred instead of the stack xmonad
# pacman -S --noconfirm --needed xmonad xmonad-contrib xmobar dmenu kitty nitrogen

grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

modprobe r8168
echo "blacklist r8169" >> /etc/modprobe.d/r8169_blacklist.conf
# uncomment line below if using btrfs instead of ext4
# sed -i -e '7s/()/(btrfs)/' /etc/mkinitcpio.conf
mkinitcpio -p linux

systemctl enable NetworkManager
systemctl enable bluetooth.service
systemctl enable dnsmasq.service
systemctl enable reflector.timer
systemctl enable fstrim.timer

useradd -m -G wheel meeks
echo meeks:mm | chpasswd
echo "meeks ALL=(ALL) ALL" >> /etc/sudoers.d/meeks

journalctl --vacuum-size=50M
journalctl --vacuum-time=2weeks

chmod +x /arch/bash-scripts/dotfiles.sh
chmod +x /arch/bash-scripts/post-install.sh
chmod +x /arch/bash-scripts/xmonad-stack.sh

mkdir -p /usr/share/xsessions
cp /arch/dotfiles/xmonad.desktop /usr/share/xsessions/


printf "\e[1;32mDone! Type exit, umount -R /mnt and reboot.\e[0m\n"
