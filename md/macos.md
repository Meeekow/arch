installed apps
- raycast
- chrome
- protonvpn
- firefox
- bluestacks air for chin's work
- neovim
- homebrew
- git

applied tweaks
- instant hide / unhide of dock
```
defaults write com.apple.dock autohide-delay -float 0; killall Dock
```

raycast settings
###### General
- launch raycast at login
- raycast hotkey = capslock + space

###### Extensions
- Applications
    - set hotkey to launch chrome browser to capslock + b
    - set hotkey to launch messages to capslock + t
    - set hotkey to launch safari to capslock + s

- Clipboard History
    - set hotkey to launch clipboard history to capslock + v

- Quicklinks (Group)
    - add search google quicklink; set hotkey to launch clipboard history to capslock + f
    ```
    https://google.com/search?q={argument}
    ```

- Screenshots
    - set hotkey to launch paste recent screenshot to capslock + p

- Script Commands
    - set hotkey to launch youtube search to capslock + y
```
#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title YouTube Search (Profile 2)
# @raycast.mode silent
#
# Optional parameters:
# @raycast.icon 🎥
# @raycast.argument1 { "type": "text", "placeholder": "Search YouTube..." }

# Your Chrome profile name
PROFILE="Profile 2"

# Get the query text from Raycast
QUERY="$1"

# URL-encode the query to handle spaces/special characters
ENCODED_QUERY=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$QUERY")

# Build the YouTube search URL
URL="https://www.youtube.com/results?search_query=$ENCODED_QUERY"

# Open Chrome with the specified profile and the YouTube search URL
open -n -a "Google Chrome.app" --args --profile-directory="$PROFILE" "$URL"
```

- Window Management
    - set hotkey to launch left half to capslock + h
    - set hotkey to launch maximize to capslock + m
    - set hotkey to launch right half to capslock + ;

###### Advanced
- show raycast on screen containing mouse
- pop to root search after 90 seconds
- escape key behavior close window and pop to root
- auto-switch input source -
- navigation bindings macos standard
- page navigation keys square brackets
- root search sensitivity medium
- hyper key capslock (include shift in hyper key)
- quick press does nothing
- favicon provider raycast
- window capture copy to clipboard
- developer tools
    - auto reload on save
    - open raycast in development mode
