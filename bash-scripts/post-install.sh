#!/bin/bash

# add git credentials
git config --global user.email "mynameismeeko@gmail.com"
git config --global user.name "Meeko"

# mount hdd to copy over some files
sudo mount /dev/sdc1 /run/media/

# copy fonts
sudo mkdir -p /usr/share/fonts/mononoki/
sudo cp /run/media/fonts/* /usr/share/fonts/mononoki/

# copy wallpaper
#mkdir -p ~/meeko/{docs,movies,tv-series,wallpapers}
#cp /run/media/wallpapers/* ~/meeko/wallpapers/

# unmount hdd after copying over some files
sudo umount /dev/sdc1

# fix volume issue with pulseaudio
# https://askubuntu.com/questions/1187401/how-can-i-stop-firefox-from-dropping-volume-on-new-media
sudo sed -i '61s/;\s//' /etc/pulse/daemon.conf
sudo sed -i '61s/no/yes/' /etc/pulse/daemon.conf

# delete the ff. 5 lines if using btrfs instead of ext4
# configure mount options
sudo sed -i '6s/relatime/noatime,commit=120/' /etc/fstab
#sudo sed -i '9s/relatime/noatime,commit=120/' /etc/fstab
sudo sed -i '9s/relatime/noatime/' /etc/fstab
sudo tune2fs -O fast_commit /dev/sda2

# configure openresolv
sudo sed -i -e '$aname_servers="::1 127.0.0.1"' /etc/resolvconf.conf
sudo sed -i -e '$aresolv_conf_options="trust-ad"' /etc/resolvconf.conf

# configure dnsmasq
sudo sed -i -e '1s/^/server=8.8.8.8\n/' /etc/dnsmasq.conf
sudo sed -i -e '2s/^/server=8.8.4.4\n/' /etc/dnsmasq.conf
sudo sed -i -e '23s/.//' /etc/dnsmasq.conf
sudo sed -i -e '60s/.//' /etc/dnsmasq.conf
#sudo sed -i -e '123s/#listen-address=/listen-address=::1.127.0.0.1/' /etc/dnsmasq.conf
sudo sed -i -e '577s/#cache-size=150/cache-size=1000/' /etc/dnsmasq.conf
# uncomment the ff. 2 lines if ipv6 is needed
#sudo sed -i -e '3s/^/server=2606:4700:4700::1111\n/' /etc/dnsmasq.conf
#sudo sed -i -e '4s/^/server=2606:4700:4700::1001\n/' /etc/dnsmasq.conf
# uncomment if needed a custom time to live
#sudo sed -i -e '577s/#local-ttl=/local-ttl=3600/' /etc/dnsmasq.conf

# configure networkmanager
sudo touch /etc/NetworkManager/conf.d/rc-manager.conf
echo "[main]" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null
echo "rc-manager=resolvconf" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null

# turn off watchdog
#sudo touch /etc/modprobe.d/watchdog_blacklist.conf
#echo "blacklist iTCO_wdt" | sudo tee -a /etc/modprobe.d/watchdog_blacklist.conf > /dev/null
#echo "blacklist iTCO_vendor_support" | sudo tee -a /etc/modprobe.d/watchdog_blacklist.conf > /dev/null
# uncomment line below if using grub instead of systemd-boot
#sudo sed -i -e '6s/quiet/quiet nowatchdog nmi_watchdog=0/' /etc/default/grub

# uncomment line below if using grub instead of systemd-boot
# change grub timeout
#sudo sed -i -e '4s/5/0/' /etc/default/grub
#sudo grub-mkconfig -o /boot/grub/grub.cfg

# enable this if you want to ensure Nvidia is loaded at the earliest possible occasion
# or if there is a startup issues (i.e nvidia kernel module being loaded after the display manager)

# set DRM kernel mode setting
#sudo sed -i -e '7s/()/(nvidia nvidia_modeset nvidia_uvm nvidia_drm)/' /etc/mkinitcpio.conf
#sudo mkinitcpio -p linux

# set pacman hook for nvidia updates
#sudo mkdir -p /etc/pacman.d/hooks/
#sudo cp ~/arch/resource/nvidia/nvidia.hook /etc/pacman.d/hooks/

# set pacman hook for systemd-boot
sudo mkdir -p /etc/pacman.d/hooks/
sudo cp ~/arch/resource/systemd/100-systemd-boot.hook /etc/pacman.d/hooks/

# install vim-plug
cd ~/
sh -c 'curl -fLo "${XDG_DATA_HOME:-$HOME/.local/share}"/nvim/site/autoload/plug.vim --create-dirs \
       https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

# install synth-shell
git clone --recursive https://github.com/andresgongora/synth-shell.git --depth 1
chmod +x synth-shell/setup.sh
cd synth-shell && ./setup.sh

# synth User Config
sed -i '28s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '29s/".*"/"39"/' ~/.config/synth-shell/synth-shell-prompt.config

# synth Host Config
sed -i '32s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '33s/".*"/"228"/' ~/.config/synth-shell/synth-shell-prompt.config

# synth PWD Config
sed -i '36s/".*"/"black"/' ~/.config/synth-shell/synth-shell-prompt.config
sed -i '37s/".*"/"85"/' ~/.config/synth-shell/synth-shell-prompt.config

# copy custom bashrc settings to current ~/.bashrc
cat ~/arch/resource/bash/bashrc >> ~/.bashrc

# remove synth-shell repo
rm -rf ~/synth-shell/

# possible hotfix for slow umount/eject for usb drives
# after copying a big file
# NOTE: this will reduce the initial write speed to the
# device you are copying the files
# https://www.reddit.com/r/archlinux/comments/liq5i5/usb_taking_too_long_to_eject/
#sudo echo 'vm.dirty_bytes = 67108864' | sudo tee /etc/sysctl.d/60-dirty.conf
#sudo echo 'vm.dirty_background_bytes = 16777216' | sudo tee -a /etc/sysctl.d/60-dirty.conf

# make script executable
#chmod +x ~/arch/bash-scripts/screen-timeout.sh

