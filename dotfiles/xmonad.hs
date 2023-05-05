import XMonad
import XMonad.Config.Desktop
import Data.Monoid

-- actions
import XMonad.Actions.UpdatePointer
import XMonad.Actions.WithAll (killAll)
import XMonad.Actions.EasyMotion (selectWindow, EasyMotionConfig(..), ChordKeys(AnyKeys))

-- system
import System.Exit (ExitCode(ExitSuccess), exitWith)

-- hooks
import XMonad.Hooks.EwmhDesktops
import XMonad.Hooks.InsertPosition (insertPosition, Focus(Newer), Position(End))
import XMonad.Hooks.ManageDocks (avoidStruts, avoidStrutsOn, docks, manageDocks)
import XMonad.Hooks.StatusBar
import XMonad.Hooks.StatusBar.PP
import XMonad.Hooks.WindowSwallowing

-- utils
import XMonad.Util.EZConfig (additionalKeysP, additionalMouseBindings)
import XMonad.Util.Loggers
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
myCustomKey = [
            -- Spawn
              ("M-S-<Return>", spawn "kitty")                                        -- Alt + S + Enter | launch terminal
            , ("M-r", spawn "dmenu_run -i -p \"Run: \"")                             -- Alt + s         | launch dmenu
            , ("<F1>", spawn "firefox --sync")                                       -- F1              | launch firefox
            , ("<F2>", spawn "firefox --sync -private-window google.com")            -- F2              | launch firefox in incognito mode
            , ("<F3>", spawn "firefox --sync -private-window google.com & kitty")    -- F3              | launch firefox in incognito mode and kitty
            , ("<Print>", spawn "sleep 0.2; scrot -s 'foo.png' -e 'xclip -selection clipboard -t image/png -i $f'; rm -rf foo.png") -- Alt + Printscreen | launch screenshot -> copy to clipboard -> remove screenshot from disk

            -- Kill
            , ("M-S-c", kill)                                                        -- Alt + S + c     | kill focused window in current workspace
            , ("<F4>", killAll)                                                      -- F4              | kill all window in current workspace

            -- Navigation
            , ("M-<Space>", sendMessage NextLayout)                                  -- Alt + Space     | cycle through available layouts
            , ("M-<Tab>", windows W.focusDown)                                       -- Alt + Tab       | cycle through available window(s)
            , ("M-h", windows W.focusDown)                                           -- Alt + j         | navigation
            , ("M-e", windows W.focusUp)                                             -- Alt + k         | navigation

            -- Easy Motion
            , ("M-s", (selectWindow def{txtCol="Green", cancelKey=xK_Escape, sKeys = AnyKeys [xK_n, xK_r, xK_t, xK_s]}) >>= (`whenJust` windows . W.focusWindow))
            , ("M-S-s", (selectWindow def{txtCol="Red", cancelKey=xK_Escape, sKeys = AnyKeys [xK_n, xK_r, xK_t, xK_s]}) >>= (`whenJust` killWindow))

            -- Focus
            , ("M-f", windows W.focusMaster)                                         -- Alt + m         | refocus to master window
            , ("M-<Return>", windows W.swapMaster)                                   -- Alt + Enter     | make current window the master
            , ("M-j", withFocused $ windows . W.sink)                                -- Alt + z         | push window back into tiling

            -- Reorder / Resize
            , ("M-S-h", windows W.swapDown)                                          -- Alt + S + j     | reorder windows
            , ("M-S-e", windows W.swapUp)                                            -- Alt + S + k     | reorder windows
            , ("M-v", sendMessage Shrink)                                            -- Alt + t         | adjust master window size
            , ("M-z", sendMessage Expand)                                            -- Alt + y         | adjust master window size
            , ("M-l", sendMessage MirrorShrink)                                      -- Alt + w         | adjust slave window size
            , ("M-d", sendMessage MirrorExpand)                                      -- Alt + e         | adjust slave window size

            -- Compile / Restart / Exit
            , ("M-S-p", io (exitWith ExitSuccess))                                   -- Alt + S + r     | logout current session
            , ("M-p", spawn "xmonad --recompile; pkill xmobar; xmonad --restart")    -- Alt + r         | recompile and restart
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

myWorkspaces                = ["1","2","3","4","5","6","7","8","9"]

------------------------------------------------------------------------
-- Defines what will be started whenever xmonad session is initialized
------------------------------------------------------------------------

myStartupHook = do
  spawnOnce "xrandr --output DP-0 --mode 3440x1440 --rate 144.00"
  spawnOnce "setxkbmap nerps -option caps:backspace"
  spawnOnce "lxsession &"
  spawnOnce "nitrogen --restore &"
  --spawnOnce "picom &"
  spawnOnce "bash /home/meeks/arch/bash-scripts/screen-timeout.sh"

------------------------------------------------------------------------
-- Defines how windows will be arranged
------------------------------------------------------------------------

myLayout =
    -- removes "Spacing" string for layouts on xmobar
    renamed [CutWordsLeft 1]
  $ smartBorders
  $ (avoidStruts $ spacingRaw True (Border 0 10 0 10) True (Border 10 0 10 0) True $ tiled ||| column) ||| avoidStrutsOn [] Full
  where
      tiled = renamed [Replace "tall"] $ ResizableTall 1 (3/100) (1/2) []
      column = renamed [Replace "column"] $ ThreeColMid 1 (3/100) (1/3)

------------------------------------------------------------------------
-- Defines how apps will behave once spawned
------------------------------------------------------------------------

myManageHook = composeAll
    [ insertPosition End Newer      -- open new windows at the end
    , manageDocks                   -- for avoidStruts & avoidStrutsOn
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
-- Window Swallowing
------------------------------------------------------------------------

myHandleEventHook = swallowEventHook (className =? "kitty") (return True)

------------------------------------------------------------------------
-- Run the configuration defined on this file; other functions not defined here will run as usual with their default keybinding and behavior
------------------------------------------------------------------------

main :: IO ()
main = xmonad
     . ewmhFullscreen
     . ewmh
     . withEasySB (statusBarProp "xmobar ~/.config/xmobar/xmobarrc" (pure myXmobarPP)) defToggleStrutsKey
     $ myConfig

myXmobarPP :: PP
myXmobarPP = def
    { ppSep             = magenta " • "
    , ppTitleSanitize   = xmobarStrip
    , ppCurrent         = wrap " " "" . xmobarBorder "Top" "#8be9fd" 2
    , ppHidden          = white . wrap " " ""
    , ppHiddenNoWindows = lowWhite . wrap " " ""
    , ppUrgent          = red . wrap (yellow "!") (yellow "!")
    , ppOrder           = \[ws, l, _, wins] -> [ws, l, wins]
    , ppExtras          = [logTitles formatFocused formatUnfocused]
    }
  where
    formatFocused   = wrap (white    "[") (white    "]") . magenta . ppWindow
    formatUnfocused = wrap (lowWhite "[") (lowWhite "]") . blue    . ppWindow

    -- | Windows should have *some* title, which should not not exceed a
    -- sane length.
    ppWindow :: String -> String
    ppWindow = xmobarRaw . (\w -> if null w then "untitled" else w) . shorten 30

    blue, lowWhite, magenta, red, white, yellow :: String -> String
    magenta  = xmobarColor "#ff79c6" ""
    blue     = xmobarColor "#bd93f9" ""
    white    = xmobarColor "#f8f8f2" ""
    yellow   = xmobarColor "#f1fa8c" ""
    red      = xmobarColor "#ff5555" ""
    lowWhite = xmobarColor "#bbbbbb" ""

myConfig = def
    {
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
        handleEventHook    = myHandleEventHook,
        logHook            = updatePointer (0.5, 0.5) (0, 0)
    } `additionalKeysP` myCustomKey
