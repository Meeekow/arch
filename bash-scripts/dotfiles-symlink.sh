#!/usr/bin/env bash

mkdir -p $HOME/.config/kitty/
ln -s $HOME/arch/dotfiles/kitty.conf $HOME/.config/kitty/

mkdir -p $HOME/.config/nvim/
ln -s $HOME/arch/dotfiles/init.vim $HOME/.config/nvim/

# firefox
ln -s $HOME/arch/dotfiles/user.js $HOME/.mozilla/firefox/*.default-release/

# execute next script
bash $HOME/arch/bash-scripts/post-install.sh

