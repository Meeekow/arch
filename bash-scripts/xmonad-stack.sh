#!/bin/bash

# install dependencies first
sudo pacman -S --needed git xorg-server xorg-apps xorg-xinit xorg-xmessage libx11 libxft libxinerama libxrandr libxss pkgconf

# make directory for stack xmonad
mkdir -p ~/.config/xmonad && cd ~/.config/xmonad

# copy xmonad.hs config to ~/.config/xmonad
cp ~/arch/dotfiles/xmonad.hs .

# clone github repo of xmonad, xmonad-contrib and xmobar
git clone https://github.com/xmonad/xmonad
git clone https://github.com/xmonad/xmonad-contrib

# install stack
sudo pacman -S --needed stack

# initialize stack in ~/.config/xmonad
stack init

# add path to path env variables
export PATH="${PATH}:$HOME/.local/bin"

# install xmonad
stack install

# copy custom build script for xmonad-stack
cp ~/arch/bash-scripts/build .
chmod +x build

# make entry for lightdm display manager
cp ~/arch/dotfiles/xmonad.desktop /usr/share/xsessions/

# symlink for recompile
ln -s ~/.local/bin/xmonad /usr/bin
