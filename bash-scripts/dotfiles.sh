#!/bin/bash


mkdir -p ~/.config/kitty/
cp /arch/dotfiles/kitty.conf ~/.config/kitty/

mkdir -p ~/.config/nvim/
cp /arch/dotfiles/init.vim ~/.config/nvim/

# mkdir -p ~/.config/picom/
# cp /arch/dotfiles/picom.conf ~/.config/picom/

mkdir -p ~/.config/vlc/
cp /arch/dotfiles/vlcrc ~/.config/vlc/

mkdir -p ~/.config/xmobar/
cp /arch/dotfiles/xmobarrc ~/.config/xmobar/

# directory for pacman-xmonad
# mkdir -p ~/.xmonad/
# cp /arch/dotfiles/xmonad.hs ~/.xmonad/

# directory for stack-xmonad
mkdir -p ~/.config/xmonad/
cp /arch/dotfiles/xmonad.hs ~/.config/xmonad/


reboot
