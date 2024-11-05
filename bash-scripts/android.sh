# Install adb
# https://www.xda-developers.com/install-adb-windows-macos-linux/

# To use adb shell
# https://stackoverflow.com/questions/2517493/adb-command-not-found-in-linux-environment
sudo ln -s /android/platform-tools/adb /bin/adb

# To find/list all packages
pm list packages -f | grep <package_name>
