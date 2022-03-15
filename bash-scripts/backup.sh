#! /bin/bash


# neovim
rsync -c ~/.config/nvim/init.vim ~/arch/dotfiles/

# kitty terminal
rsync -c ~/.config/kitty/kitty.conf ~/arch/dotfiles/

# picom compositor
# rsync -c ~/.config/picom/picom.conf ~/arch/dotfiles/

# xmobar
rsync -c ~/.config/xmobar/xmobarrc ~/arch/dotfiles/

# xmonad
rsync -c ~/.xmonad/xmonad.hs ~/arch/dotfiles/

# mozilla firefox user.js
string="meeks"
basedir=$(find ~/.mozilla/firefox -name "*.$string" -type d)
rsync -c $basedir/user.js ~/arch/dotfiles/


echo "Done..."
