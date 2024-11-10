#!/bin/bash

mkdir -p ~/.config/kitty/
ln -s ~/arch/dotfiles/kitty.conf ~/.config/kitty/

mkdir -p ~/.config/nvim/
ln -s ~/arch/dotfiles/init.vim ~/.config/nvim/

# firefox
ln -s ~/arch/dotfiles/user.js ~/.mozilla/firefox/*.default-release/

# execute next script
sh $HOME/arch/bash-scripts/post-install.sh

