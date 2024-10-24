#!/bin/bash

mkdir -p ~/.config/kitty/
ln -s ~/arch/dotfiles/kitty.conf ~/.config/kitty/

mkdir -p ~/.config/nvim/
ln -s ~/arch/dotfiles/init.vim ~/.config/nvim/

# firefox
ln -s ~/arch/dotfiles/user.js ~/.mozilla/firefox/*.default-release/

# mpv
cp -r /usr/share/doc/mpv/ ~/.config/
ln -s ~/arch/dotfiles/mpv.conf ~/.config/mpv/

#mkdir -p ~/.config/xmobar/
#ln -s ~/arch/dotfiles/xmobarrc ~/.config/xmobar/

# directory for pacman-xmonad
#mkdir -p ~/.xmonad/
#ln -s ~/arch/dotfiles/xmonad.hs ~/.xmonad/

# directory for stack-xmonad
#mkdir -p ~/.config/xmonad/
#ln -s ~/arch/dotfiles/xmonad.hs ~/.config/xmonad/

# execute next script
#sh ./arch/bash-scripts/xmonad-stack.sh
#echo "XMonad via Stack script executed."
#echo "Rebooting now..."
#sleep 1


#reboot
