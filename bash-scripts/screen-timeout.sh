#!/bin/bash

# turn off screen timeout
xset s off
xset s 0 0
xset -dpms

# turn off auto-repeat for key press
xset -r

# Better Perf Tweaks?
# https://forum.level1techs.com/t/nvidia-gpu-settings-guide-for-better-performance/131660/6

# force 'Full Composition Pipeline'
# nvidia-settings -a CurrentMetaMode="DP-0:3440x1440_144 +0+0 {ForceFullCompositionPipeline=On}"

# disable 'Allow Flipping' (0=True, 1=False)
nvidia-settings -a 'AllowFlipping=0'

# set PowerMizer to prefer 'Maximum Performance'
nvidia-settings -a "[gpu:0] / GpuPowerMizerMode = 1"

# set 'openGL' to high quality (use 3 to use high performance)
nvidia-settings -a "OpenGLImageSettings = 0"
