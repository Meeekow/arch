#!/bin/bash

# install dependencies first
sudo pacman -S --needed git xorg-server xorg-apps xorg-xinit xorg-xmessage libx11 libxft libxinerama libxrandr libxss pkgconf stack

# go to ~/.config/xmonad directory
cd ~/.config/xmonad/

# clone github repo of xmonad, xmonad-contrib and xmobar
git clone https://github.com/xmonad/xmonad
git clone https://github.com/xmonad/xmonad-contrib
git clone https://github.com/jaor/xmobar

# make sure stack is up to date
stack upgrade

# initialize stack in ~/.config/xmonad
stack init --force

# configure xmobar compile flags
sed -i -e '46s/^/extra-deps: [netlink-1.1.1.0]\n/' ~/.config/xmonad/stack.yaml
sed -i -e '50s/^/flags:\n xmobar:\n    all_extensions: true\n/' ~/.config/xmonad/stack.yaml

# add path to path env variables
export PATH="${PATH}:$HOME/.local/bin"

# install xmonad
stack install

# copy custom build script for xmonad-stack
ln -s ~/arch/bash-scripts/build ~/.config/xmonad/
chmod +x build

# symlink xmonad and xmobar from local bin to /usr/bin
sudo ln -s ~/.local/bin/xmonad /usr/bin
sudo ln -s ~/.local/bin/xmobar /usr/bin
