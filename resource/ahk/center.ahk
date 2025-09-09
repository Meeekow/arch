#Requires AutoHotkey v2.0
#SingleInstance Force
SetTitleMatchMode "2" ; Allow partial match in window titles


; Activate / Deactivate Python environment - MF Pricing
#HotIf WinActive("C:\Windows\System32\cmd.exe")
#a::Send(".venv\Scripts\activate")
#d::Send(".venv\Scripts\deactivate")
#r::
{
  Send("del /f /q Price")
  Send("{Tab}")
}
#HotIf


; Append current date when searching - GMail Inbox
#e::
{
  activeTitle := WinGetTitle("A")

  ; Check if the active window is Chrome and title matches exactly
  if InStr(activeTitle, "- mark@bookdrop.com") || InStr(activeTitle, "- conrad.soriano@bookdrop.com") {
    DateDir  := FormatTime(, "yyyy/MM/dd")
    Send(DateDir)
  }
  return
}


; Rename File - Amazon Performance Notifications
#r::
{
  DateDir  := FormatTime(, "MM.dd.yy")
  activeTitle := WinGetTitle("A")

  if InStr(activeTitle, "Save As") {
    Send("{Left 4}")
    Sleep 10
    Send("{Backspace 8}")
    Sleep 10
    Send(DateDir)
  }
}


; Create a new folder and renamed to a specific format
#w::
{
  DateDir  := FormatTime(, "MM-dd-yyyy")
  DirCreate "C:\Users\rara\Downloads\" DateDir
}


; Center focused window
#c::CenterWindow("A")
CenterWindow(winTitle*) {
    hwnd := WinExist(winTitle*)
    WinGetPos ,, &W, &H, hwnd
    mon := GetNearestMonitorInfo(hwnd)
    WinMove mon.WALeft + mon.WAWidth // 2 - W // 2, mon.WATop + mon.WAHeight // 2 - H // 2,,, hwnd
}

GetNearestMonitorInfo(winTitle*) {
    static MONITOR_DEFAULTTONEAREST := 0x00000002
    hwnd := WinExist(winTitle*)
    hMonitor := DllCall("MonitorFromWindow", "ptr", hwnd, "uint", MONITOR_DEFAULTTONEAREST, "ptr")
    NumPut("uint", 104, MONITORINFOEX := Buffer(104))
    if (DllCall("user32\GetMonitorInfo", "ptr", hMonitor, "ptr", MONITORINFOEX)) {
        Return  { Handle   : hMonitor
                , Name     : Name := StrGet(MONITORINFOEX.ptr + 40, 32)
                , Number   : RegExReplace(Name, ".*(\d+)$", "$1")
                , Left     : L  := NumGet(MONITORINFOEX,  4, "int")
                , Top      : T  := NumGet(MONITORINFOEX,  8, "int")
                , Right    : R  := NumGet(MONITORINFOEX, 12, "int")
                , Bottom   : B  := NumGet(MONITORINFOEX, 16, "int")
                , WALeft   : WL := NumGet(MONITORINFOEX, 20, "int")
                , WATop    : WT := NumGet(MONITORINFOEX, 24, "int")
                , WARight  : WR := NumGet(MONITORINFOEX, 28, "int")
                , WABottom : WB := NumGet(MONITORINFOEX, 32, "int")
                , Width    : Width  := R - L
                , Height   : Height := B - T
                , WAWidth  : WR - WL
                , WAHeight : WB - WT
                , Primary  : NumGet(MONITORINFOEX, 36, "uint")
            }
    }
    throw Error("GetMonitorInfo: " A_LastError, -1)
}