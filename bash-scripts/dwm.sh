#/bin/bash

# Bare essentials
sudo pacman -S --needed --noconfirm xorg-server xorg-xinit xorg-xrandr xorg-xsetroot

# Copy .xinitrc
head -n -5 /etc/X11/xinit/xinitrc >> $HOME/.xinitrc

# Add the following to .xinitrc
echo "xrandr --output DP-0 --mode 3440x1440 --rate 144.00 &" >> $HOME/.xinitrc
echo "lxsession &" >> $HOME/.xinitrc
echo "$HOME/arch/bash-scripts/autorun.sh &" >> $HOME/.xinitrc
echo "$HOME/arch/bash-scripts/time.sh &" >> $HOME/.xinitrc
echo "exec dwm" >> $HOME/.xinitrc
echo "" >> $HOME/.xinitrc

# Clone dwm repo
#git clone git://git.suckless.org/dwm --depth 1
#cd dwm/

# List of patches
# -- attachbottom
# -- centeredmaster
# -- movestack
# -- noborder
# -- pertag
# -- preserveonrestart
# -- restartsig
# -- warp

