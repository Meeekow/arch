# Install Nvidia
https://wiki.debian.org/NvidiaGraphicsDrivers

# Enable Wayland
https://www.reddit.com/r/debian/comments/k3ouhc/comment/kavzuw3/?utm_source=share&utm_medium=web2x&context=3

1. Enable Wayland in daemon.
```
sudo nvim /etc/gdm3/daemon.conf
```
- Uncomment the line "WaylandEnable=false" and change it to "WaylandEnable=true".

2. Update GRUB configuration.
```
sudo nvim /etc/default/grub
```
- Change the last GRUB_CMDLINE from "" to "nvidia-drm.modeset=1".

3. Reboot system.
```
sudo reboot
```

4. Modify GDM rules.
```
sudo nvim /usr/lib/udev/rules.d/61-gdm.rules
```
- Modify the file to look like this:
```
LABEL="gdm_prefer_xorg"
#RUN+="/usr/libexec/gdm-runtime-config set daemon PreferredDisplayServer xorg"
GOTO="gdm_end"

LABEL="gdm_disable_wayland"
RUN+="/usr/libexec/gdm-runtime-config set daemon WaylandEnable true"
GOTO="gdm_end"

LABEL="gdm_end"
```
- Ensure that "WaylandEnable" is set to true.

5. Reboot the system again.
```
sudo reboot
```

# Install .deb
1. Go to the directory where the file is located.
2. Use either of the commands below.
```
sudo dpkg -i <.deb file>
```

```
sudo apt install ./<.deb file>
```
3. If there is any error.
```
sudo apt --fix-broken install
```
