#!/usr/bin/env bash


# add git credentials
git config --global user.email "mynameismeeko@gmail.com"
git config --global user.name "Meeko"


# FEDORA
# reboot after updating
sudo dnf update -y

# install nvidia proprietary driver
sudo dnf install akmod-nvidia
sudo dnf install xorg-x11-drv-nvidia-cuda
# wait for 5 mins and see if akmod compiles
# reboot if it compiles
modinfo -F version nvidia

# install media codecs
sudo dnf group install multimedia

#after reboot install packages
sudo dnf install google-chrome-stable kitty neovim qbittorrent wireguard-tools

# install docker and docker compose
sudo dnf -y install dnf-plugins-core
sudo dnf-3 config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# enable docker
sudo systemctl enable --now docker

# reload daemons
systemctl daemon-reload

# install tailscale
# sudo dnf config-manager --add-repo https://pkgs.tailscale.com/stable/fedora/tailscale.repo
sudo dnf install tailscale

# enable tailscale
sudo systemctl enable --now tailscaled

# connect to tailscale network
# tailscale up --accept-dns=false

# https://discussion.fedoraproject.org/t/latest-gnome-apps-not-working-in-fedora-41-using-wayland/134807/14
# hotfix for stutter and jitter
# echo export GSK_RENDERER=gl | sudo tee /etc/profile.d/gtk_renderer.sh > /dev/null
# ARCH LINUX
# install other packages that was not included during install
# sudo pacman -S --needed --noconfirm chromium less qbittorrent wireguard-tools systemd-resolvconf

# enable setting dns config
# sudo systemctl enable --now systemd-resolved

# install paru
# cd ~ && git clone https://aur.archlinux.org/paru-bin.git
# cd ~/paru-bin/ && makepkg -rsi --noconfirm
# cd ~ && rm -Rf ~/paru-bin/

# delete the ff. 5 lines if using btrfs instead of ext4
# configure mount options
# sudo sed -i '6s/relatime/noatime,commit=120/' /etc/fstab
# sudo sed -i '9s/relatime/noatime,commit=120/' /etc/fstab
# sudo sed -i '12s/relatime/noatime/' /etc/fstab
# sudo tune2fs -O fast_commit /dev/sda2

# configure NetworkManager
sudo touch /etc/NetworkManager/conf.d/rc-manager.conf
echo "[main]" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null
echo "rc-manager=resolvconf" | sudo tee -a /etc/NetworkManager/conf.d/rc-manager.conf > /dev/null

# set pacman hook for systemd-boot
# sudo mkdir -p /etc/pacman.d/hooks/
# sudo cp ~/arch/resource/systemd/100-systemd-boot.hook /etc/pacman.d/hooks/

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

# execute next script
# sh $HOME/arch/bash-scripts/jellyfin.sh

# move to center shortcut - Gnome DE
# gsettings set org.gnome.desktop.wm.keybindings move-to-center "['<Super>Space']"

# copy custom bashrc settings to current ~/.bashrc
# cat ~/arch/resource/bash/bashrc >> ~/.bashrc

# update git config
# sed -i "7s/github.com/$(sed -n '2p' /media/jellyfin/mnt/t.txt)@github.com/" /home/rara/arch/.git/config

# adjust/control volume
# https://askubuntu.com/questions/97936/terminal-command-to-set-audio-volume
# pactl set-sink-volume @DEFAULT_SINK@ 50%

