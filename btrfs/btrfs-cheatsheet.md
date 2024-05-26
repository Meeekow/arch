### CREATE SNAPPER CONFIG FOR A SUBVOLUME ###
# Log in as root
sudo -

# IN THIS EXAMPLE, WE ARE MAKING A CONFIG FOR OUR ROOT DIRECTORY
# If a directory named "/.snapshots" already exists, unmount and then delete
umount /.snapshots
rm -rf /.snapshots

# Create snapper config for our root subvolume
# This will create a ".snapshots" subvolume under our root directory
snapper -c root create-config /

# Delete the newly created subvolume in our root directory
btrfs subvolume delete /.snapshots

# Recreate the subvolume we just deleted but this time as a normal directory instead of being a subvolume
mkdir /.snapshots

# Before mounting, make sure a correct entry exists on our /etc/fstab
mount -va

# Take ownership of the created directory
chown -R :$USER /.snapshots

# Set default subvolid for snapshots
# Usually the id for root subvolume is 256
btrfs subvolume set-default 256 /

# Enable grub-btrfsd
systemctl enable --now grub-btrfsd

# Enable snapper timeline
systemctl enable --now snapper-timeline.timer

# Edit snapper config in "/etc/snapper/configs/<NAME OF CONFIG>"
sudo snapper -c root set-config ALLOW_GROUPS=wheel TIMELINE_LIMIT_DAILY=7 TIMELINE_LIMIT_HOURLY=5

# Exit root session
exit

# Run snapper bash script
# NOTE: RUN ONCE ONLY
./arch/btrfs/snapper.sh

# Make a snapshot for base install
snapper -c root create -d "BASE INSTALL"


### RECOVER FROM A SNAPSHOT ###
# Mount toplevel subvolid
mount /dev/<DEVICE> -o subvolid=5 /mnt

# Change directory to /mnt
cd /mnt

# Rename the subvolume we want to rollback
mv @ @.broken

# Create a rw snapshot of the snapshot snapper took
# NOTE: <NUMBER> should correspond to the snapper snapshot you wish to restore
btrfs subvolume snapshot /mnt/@snapshots/<NUMBER>/snapshot /mnt/@

# Reboot
reboot


### CLEANUP AFTER RESTORING A SNAPSHOT ###
# Login as root
su -

# Mount toplevel subvolid
mount /dev/<DEVICE> -o subvolid=5 /mnt

# Delete first the tmp file that was created
# when we rebooted in read-only mode to
# restore a snapshot
btrfs subvolume delete tmp/tmp.*/*

# Make a snapshot for the fixed system
# Will change the default subvolid
# Will enable us to delete the subvolume we no longer need
snapper --ambit classic rollback

# We delete the subvolume that was moved
btrfs subvolume delete @.broken


### RESTORE LINKS ###
restorecon -RFv <SUBVOLUME>


### LINKS ###
# https://forum.garudalinux.org/t/using-existing-snapper-snapshots-on-drives-without-a-config/27293

