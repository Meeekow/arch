#!/bin/bash

# add git credentials
git config --global user.email "mynameismeeko@gmail.com"
git config --global user.name "Meeko"

# Fonts
sudo mkdir -p /usr/share/fonts/mononoki/
sudo mount /dev/sdb1 /run/media/
sudo cp /run/media/fonts/* /usr/share/fonts/mononoki/

# Wallpaper
mkdir -p ~/Pictures/
sudo cp /run/media/wallpapers/* ~/Pictures/
sudo umount /dev/sdb1

# noatime -> /etc/fstab
# delete the ff. 3 lines if using btrfs instead of ext4
sudo sed -i '6s/relatime/noatime,commit=120/' /etc/fstab
sudo sed -i '9s/relatime/noatime/' /etc/fstab
sudo tune2fs -O fast_commit /dev/sda2

# configure openresolv -> /etc/resolvconf.conf
sudo sed -i -e '$aname_servers="::1 127.0.0.1"' /etc/resolvconf.conf
sudo sed -i -e '$aresolv_conf_options="trust-ad"' /etc/resolvconf.conf

# configure dnsmasq -> /etc/dnsmasq.conf
sudo sed -i -e '1s/^/server=1.1.1.1\n/' /etc/dnsmasq.conf
sudo sed -i -e '2s/^/server=1.0.0.1\n/' /etc/dnsmasq.conf
sudo sed -i -e '3s/^/server=2606:4700:4700::1111\n/' /etc/dnsmasq.conf
sudo sed -i -e '4s/^/server=2606:4700:4700::1001\n/' /etc/dnsmasq.conf
sudo sed -i -e '5s/^/cache-size=1000\n/' /etc/dnsmasq.conf

# configure NetworkManager -> /etc/NetworkManager/conf.d/rc-manager.conf
sudo touch /etc/NetworkManager/conf.d/rc-manager.conf
echo "[main]" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null
echo "rc-manager=resolvconf" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null

# turn off watchdog
sudo touch /etc/modprobe.d/watchdog_blacklist.conf
echo "blacklist iTCO_wdt" | sudo tee -a /etc/modprobe.d/watchdog_blacklist.conf > /dev/null
echo "blacklist iTCO_vendor_support" | sudo tee -a /etc/modprobe.d/watchdog_blacklist.conf > /dev/null
sudo sed -i -e '6s/quiet/quiet nowatchdog nmi_watchdog=0/' /etc/default/grub

# turn off grub timeout
sudo sed -i -e '4s/5/0/' /etc/default/grub
sudo grub-mkconfig -o /boot/grub/grub.cfg

# set DRM kernel mode setting
# sudo sed -i -e '7s/()/(nvidia nvidia_modeset nvidia_uvm nvidia_drm)/' /etc/mkinitcpio.conf
# sudo mkinitcpio -p linux

# set pacman hook for nvidia updates
# sudo mkdir -p /etc/pacman.d/hooks/
# sudo cp ~/arch/bash-scripts/nvidia.hook /etc/pacman.d/hooks/

# install vim-plug
cd ~/
sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

# install synth-shell
git clone --recursive https://github.com/andresgongora/synth-shell.git
chmod +x synth-shell/setup.sh
cd synth-shell && ./setup.sh

# Synth User Config
sed -i '28s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '29s/".*"/"39"/' ~/.config/synth-shell/synth-shell-prompt.config

# Synth Host Config
sed -i '32s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '33s/".*"/"228"/' ~/.config/synth-shell/synth-shell-prompt.config

# Synth PWD Config
sed -i '36s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '37s/".*"/"85"/' ~/.config/synth-shell/synth-shell-prompt.config

# copy aliases to current .bashrc -> ~/.bashrc
cat ~/arch/dotfiles/bashrc >> ~/.bashrc

# remove synth-shell repo
rm -rf ~/synth-shell/

# make scripts executable
sudo chmod +x ~/arch/bash-scripts/backup.sh
sudo chmod +x ~/arch/bash-scripts/screen-timeout.sh


reboot
