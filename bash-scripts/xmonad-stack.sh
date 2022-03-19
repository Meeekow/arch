#!/bin/bash

# install dependencies first
sudo pacman -S --needed git xorg-server xorg-apps xorg-xinit xorg-xmessage libx11 libxft libxinerama libxrandr libxss pkgconf

# go to ~/.config/xmonad directory
cd ~/.config/xmonad/

# clone github repo of xmonad, xmonad-contrib and xmobar
git clone https://github.com/xmonad/xmonad
git clone https://github.com/xmonad/xmonad-contrib
# git clone https://github.com/jaor/xmobar

# install stack
cd ~/.config/xmonad/
sudo pacman -S --needed stack

# make sure stack is up to date
cd ~/.config/xmonad/
stack upgrade

# initialize stack in ~/.config/xmonad
cd ~/.config/xmonad/
stack init

# add path to path env variables
export PATH="${PATH}:$HOME/.local/bin"

# install xmonad
cd ~/.config/xmonad/
stack install

# copy custom build script for xmonad-stack
cd ~/.config/xmonad/
cp /arch/bash-scripts/build ~/.config/xmonad/
chmod +x build

# symlink for recompile
sudo ln -s ~/.local/bin/xmonad /usr/bin
