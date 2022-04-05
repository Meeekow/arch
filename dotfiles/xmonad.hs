import XMonad
import XMonad.Config.Desktop
import Data.Monoid

-- actions
import XMonad.Actions.UpdatePointer
import XMonad.Actions.WithAll (killAll)

-- system
import System.Exit (ExitCode(ExitSuccess), exitWith)
import System.IO (hPutStrLn)

-- hooks
import XMonad.Hooks.DynamicLog
import XMonad.Hooks.EwmhDesktops
import XMonad.Hooks.InsertPosition (insertPosition, Focus(Newer), Position(End))
import XMonad.Hooks.ManageDocks (avoidStruts, docks)

-- utils
import XMonad.Util.EZConfig (additionalKeysP, additionalMouseBindings)
import XMonad.Util.Loggers
import XMonad.Util.Run (spawnPipe)
import XMonad.Util.SpawnOnce (spawnOnce)

-- media keys
import Graphics.X11.ExtraTypes.XF86

-- layouts
import XMonad.Layout.NoBorders (smartBorders)
import XMonad.Layout.Renamed
import XMonad.Layout.ResizableTile
import XMonad.Layout.Spacing
import XMonad.Layout.ThreeColumns

import qualified XMonad.StackSet as W
import qualified Data.Map        as M

------------------------------------------------------------------------
-- EZConfig Bindings
------------------------------------------------------------------------

            -- Notation in comments is in QWERTY layout, actual hotkeys are in DVORAK layout
myTestKey = [
            -- Spawn
              ("M-S-<Return>", spawn "kitty")                                        -- Alt + S + Enter | launch terminal
            , ("M-l", spawn "dmenu_run -i -p \"Run: \"")                             -- Alt + p         | launch dmenu
            , ("<F1>", spawn "firefox --sync")                                       -- F1              | launch firefox
            , ("<F2>", spawn "firefox --sync -private-window google.com")            -- F2              | launch firefox in incognito mode
            , ("<F3>", spawn "firefox --sync -private-window google.com & kitty")    -- F3              | launch firefox in incognito mode and kitty
            , ("<Print>", spawn "sleep 0.2; scrot -s 'foo.png' -e 'xclip -selection clipboard -t image/png -i $f'; rm -rf foo.png") -- Alt + Printscreen | launch screenshot -> copy to clipboard -> remove screenshot from disk

            -- Kill
            , ("M-S-<Backspace>", kill)                                              -- Alt + S + BkSpc | kill focused window in current workspace
            , ("<F4>", killAll)                                                      -- F4              | kill all window in current workspace

            -- Navigation
            , ("M-<Space>", sendMessage NextLayout)                                  -- Alt + Space     | cycle through available layouts
            , ("M-<Tab>", windows W.focusDown)                                       -- Alt + Tab       | cycle through available window(s)
            , ("M-h", windows W.focusDown)                                           -- Alt + j         | navigation
            , ("M-t", windows W.focusUp)                                             -- Alt + k         | navigation

            -- Focus
            , ("M-m", windows W.focusMaster)                                         -- Alt + m         | refocus to master window
            , ("M-<Return>", windows W.swapMaster)                                   -- Alt + S + Enter | make current window the master
            , ("M-r", withFocused $ windows . W.sink)                                -- Alt + o         | push window back into tiling

            -- Reorder / Resize
            , ("M-S-h", windows W.swapDown)                                          -- Alt + S + j     | reorder windows
            , ("M-S-t", windows W.swapUp)                                            -- Alt + S + k     | reorder windows
            , ("M-v", sendMessage Shrink)                                            -- Alt + >         | adjust master window size
            , ("M-z", sendMessage Expand)                                            -- Alt + ?         | adjust master window size
            , ("M-j", sendMessage MirrorShrink)                                      -- Alt + c         | adjust slave window size
            , ("M-k", sendMessage MirrorExpand)                                      -- Alt + v         | adjust slave window size

            -- Compile / Restart / Exit
            , ("M-S-p", io (exitWith ExitSuccess))                                   -- Alt + S + r     | logout current session
            , ("M-p", spawn "xmonad --recompile; pkill xmobar; xmonad --restart")
            ]

------------------------------------------------------------------------
-- Keybindings not yet converted to EZConfig format
------------------------------------------------------------------------

myKeys conf@(XConfig {XMonad.modMask = modm}) = M.fromList $
  [ ((modm .|. shiftMask, xK_space), setLayout $ XMonad.layoutHook conf)

  , ((0, xF86XK_AudioRaiseVolume), spawn "pactl set-sink-volume @DEFAULT_SINK@ +5%")
  , ((0, xF86XK_AudioLowerVolume), spawn "pactl set-sink-volume @DEFAULT_SINK@ -5%")
  , ((0, xF86XK_AudioMute), spawn "pactl set-sink-mute @DEFAULT_SINK@ toggle")

  ]

  ++

  [ ((m .|. modm, k), windows $ f i)
    | (i, k) <- zip (XMonad.workspaces conf) [xK_1 .. xK_9]
    , (f, m) <- [(W.greedyView, 0), (W.shift, shiftMask)]
  ]

  ++

  [ ((m .|. modm, key), screenWorkspace sc >>= flip whenJust (windows . f))
    | (key, sc) <- zip [xK_w, xK_e, xK_r] [0..]
    , (f, m) <- [(W.view, 0), (W.shift, shiftMask)]
  ]

------------------------------------------------------------------------
-- Variables
------------------------------------------------------------------------

myModMask                   = mod1Mask
myTerminal                  = "kitty"

myFocusFollowsMouse         :: Bool
myFocusFollowsMouse         = True
myClickJustFocuses          :: Bool
myClickJustFocuses          = False

myBorderWidth               = 0
myNormalBorderColor         = "#1c1c1c"
myFocusedBorderColor        = "#98fb98"

myppLayout                  = "#e6f538"
myppCurrent                 = "#e6f538"
myppVisible                 = "red"
myppHidden                  = "#ee4b2b"
myppHiddenNoWindows         = "white"
myppTitle                   = "#e6f538"
myppUrgent                  = "red"
windowCount                 = gets $ Just . show . length . W.integrate' . W.stack . W.workspace . W.current . windowset

myWorkspaces                = ["1","2","3","4","5","6","7","8","9"]

------------------------------------------------------------------------
-- Defines what will be started whenever xmonad session is initialized
------------------------------------------------------------------------

myStartupHook = do
  spawnOnce "xrandr --output DP-0 --mode 3440x1440 --rate 144.00"
  spawnOnce "setxkbmap -layout us -variant dvorak -option caps:escape"
  spawnOnce "lxsession &"
  spawnOnce "nitrogen --restore &"
  --spawnOnce "picom &"
  spawnOnce "bash /home/meeks/arch/bash-scripts/screen-timeout.sh"

------------------------------------------------------------------------
-- Defines how windows will be arranged
------------------------------------------------------------------------

myLayout =
      renamed [CutWordsLeft 1]      -- removes "Spacing" string for layouts on xmobar
    $ smartBorders
    $ spacingRaw True (Border 0 10 0 10) True (Border 10 0 10 0) True
    $ avoidStruts (tiled ||| column) ||| Full

    where
        tiled = renamed [Replace "tall"] $ ResizableTall 1 (3/100) (1/2) []
        column = renamed [Replace "column"] $ ThreeColMid 1 (3/100) (1/3)

------------------------------------------------------------------------
-- Defines how apps will behave once spawned
------------------------------------------------------------------------

myManageHook = composeAll
    [ insertPosition End Newer      -- open new windows at the end
    , resource  =? "desktop_window" --> doIgnore
    , resource  =? "kdesktop"       --> doIgnore ]

------------------------------------------------------------------------
-- Defines the behavior of Mod + Mouse Button when pressed/clicked, below are all default behaviors
------------------------------------------------------------------------

myMouseBindings (XConfig {XMonad.modMask = modm}) = M.fromList $

    -- mod-button1, Set the window to floating mode and move by dragging
    [ ((modm, button1), (\w -> focus w >> mouseMoveWindow w
                                       >> windows W.shiftMaster))

    -- mod-button2, Raise the window to the top of the stack
    , ((modm, button2), (\w -> focus w >> windows W.shiftMaster))

    -- mod-button3, Set the window to floating mode and resize by dragging
    , ((modm, button3), (\w -> focus w >> mouseResizeWindow w
                                       >> windows W.shiftMaster))
    -- you may also bind events to the mouse scroll wheel (button4 and button5)
    ]

------------------------------------------------------------------------
-- Run the configuration defined on this file; other functions not defined here will run as usual with their default keybinding and behavior
------------------------------------------------------------------------

main =  do
  xmproc <- spawnPipe "xmobar -x 0 ~/.config/xmobar/xmobarrc"
  xmonad $ ewmh $ docks def {
        terminal           = myTerminal,
        focusFollowsMouse  = myFocusFollowsMouse,
        clickJustFocuses   = myClickJustFocuses,
        borderWidth        = myBorderWidth,
        modMask            = myModMask,
        workspaces         = myWorkspaces,
        normalBorderColor  = myNormalBorderColor,
        focusedBorderColor = myFocusedBorderColor,

        keys               = myKeys,
        mouseBindings      = myMouseBindings,

        layoutHook         = myLayout,
        manageHook         = myManageHook,
        startupHook        = myStartupHook,
        logHook            = dynamicLogWithPP xmobarPP
                              { ppOutput = \x -> hPutStrLn xmproc x
                              , ppCurrent = xmobarColor myppCurrent "" . wrap "[" "]"     -- current workspace in xmobar
                              , ppHidden = xmobarColor myppHidden ""                      -- hidden workspace in xmobar
                              , ppTitle = xmobarColor myppTitle "" . shorten 35           -- title of active window in xmobar
                              , ppLayout = xmobarColor myppLayout ""                      -- current tiling layout
                              , ppSep = " • "                                             -- separators in xmobar
                              , ppExtras = [windowCount]                                  -- number of windows in current workspace
                              , ppOrder = \(ws:l:t:ex) -> ex++[l, ws, t]                  -- output ppExtras info to xmobar
                              --, ppVisible = xmobarColor myppVisible ""                  -- visible but not current workspace
                              --, ppHiddenNoWindows = xmobarColor myppHiddenNoWindows ""  -- hidden workspace (no windows)
                              --, ppUrgent = xmobarColor myppUrgent "" . wrap "!" "!"     -- urgent workspace
                              } >> updatePointer (0.5, 0.5) (0, 0)
    } `additionalKeysP` myTestKey
