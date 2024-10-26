#!/bin/bash

# add path to env variables
export PATH="${PATH}:$HOME/.local/bin"

# install missing dependencies
sudo pacman -S --needed --noconfirm git xorg-server xorg-apps xorg-xinit xorg-xmessage libx11 libxft libxinerama libxrandr libxss pkgconf

# change to this directory and clone repo below
cd ~/.config/xmonad/

# clone github repo of xmonad, xmonad-contrib and xmobar to ~/.config/xmonad
git clone https://github.com/xmonad/xmonad --depth 1
git clone https://github.com/xmonad/xmonad-contrib --depth 1
git clone https://codeberg.org/xmobar/xmobar.git --depth 1

# install stack directly instead of using the repo version
curl -sSL https://get.haskellstack.org/ | sh

# make sure stack is up to date
stack upgrade

# initialize stack in ~/.config/xmonad
stack init --force

# configure xmobar-stack compile flags
sed -i -e '46s/^/extra-deps: [netlink-1.1.1.0]\n/' ~/.config/xmonad/stack.yaml
sed -i -e '50s/^/flags:\n xmobar:\n    all_extensions: true\n/' ~/.config/xmonad/stack.yaml

# install xmonad-stack
stack install

# symlink custom build script for xmonad-stack
sudo ln -s ~/arch/resource/xmonad/build ~/.config/xmonad/

# symlink xmonad and xmobar from local bin to /usr/bin
sudo ln -s ~/.local/bin/xmonad /usr/bin
sudo ln -s ~/.local/bin/xmobar /usr/bin
