#! /bin/bash


# Turn off screen timeout.
xset s off
xset s 0 0
xset -dpms

# Turn off auto-repeat for key presses.
xset -r

# Force 'Full Composition Pipeline'
# nvidia-settings -a CurrentMetaMode="DP-0:3440x1440_144 +0+0 {ForceFullCompositionPipeline=On}"

# Disable 'allow flipping' (0=True, 1=False)
nvidia-settings -a 'AllowFlipping=0'

# Set PowerMizer to prefer 'Maximum Performance'
nvidia-settings -a "[gpu:0] / GpuPowerMizerMode = 1"

# Set 'openGL' to high quality (use 3 to use high performance)
nvidia-settings -a "OpenGLImageSettings = 0"
