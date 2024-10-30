#!/usr/bin/env bash


# install other packages that was not included during install
sudo pacman -S --needed --noconfirm chromium less qbittorrent

# install paru
cd ~ && git clone https://aur.archlinux.org/paru-bin.git
cd ~/paru-bin/ && makepkg -rsi --noconfirm
cd ~ && rm -Rf ~/paru-bin/

# install protonvpn
paru -S --needed proton-vpn-gtk-app

# add git credentials
git config --global user.email "mynameismeeko@gmail.com"
git config --global user.name "Meeko"

# delete the ff. 5 lines if using btrfs instead of ext4
# configure mount options
sudo sed -i '6s/relatime/noatime,commit=120/' /etc/fstab
#sudo sed -i '9s/relatime/noatime,commit=120/' /etc/fstab
sudo sed -i '12s/relatime/noatime/' /etc/fstab
sudo tune2fs -O fast_commit /dev/sda2

# configure NetworkManager
sudo touch /etc/NetworkManager/conf.d/rc-manager.conf
echo "[main]" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null
echo "rc-manager=resolvconf" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null

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

# remove synth-shell repo
rm -rf ~/synth-shell/

# copy custom bashrc settings to current ~/.bashrc
# cat ~/arch/resource/bash/bashrc >> ~/.bashrc

# move to center shortcut - Gnome DE
# gsettings set org.gnome.desktop.wm.keybindings move-to-center "['<Super>Space']"

