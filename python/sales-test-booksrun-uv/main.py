import time
import keyboard
import pyautogui
import win32con
import win32gui
import win32com.client
import numpy as np
import cv2
from mss import mss
from pywinauto import Desktop

# Constants
GET_ASIN = 'ctrl+space'
UNLIKELY = 'ctrl+enter'
LIKELY = 'win+enter'
PROTON = 'alt+enter'

CHECK_IMAGE = 'check.png'
SEARCH_IMAGE = 'search.png'
TEMPLATE_MATCH_THRESHOLD = 0.85

# Globals
last_click_pos = (0, 0)
loaded_templates = {}

right_half_region = {
    "top": 0,
    "left": 1720,
    "width": 1720,
    "height": 1440
}


def focus_window(window_title):
    """Bring a window with a specific title to the foreground."""
    def enum_handler(hwnd, _):
        if win32gui.IsWindowVisible(hwnd):
            if window_title.lower() in win32gui.GetWindowText(hwnd).lower():
                shell = win32com.client.Dispatch("WScript.Shell")
                shell.SendKeys('%')  # Simulate ALT key press
                win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                win32gui.SetForegroundWindow(hwnd)

    win32gui.EnumWindows(enum_handler, None)


def find_chrome_window():
    """Find the Chrome window with Google Sheets open."""
    try:
        return Desktop(backend="uia").window(title_re=".*Google Sheets -.*Chrome")
    except Exception as e:
        print(f"[ERROR] Couldn't find Chrome window: {e}")
        return None


def screenshot_fullscreen(region=None):
    """Capture a screenshot of the entire screen or a specific region."""
    with mss() as sct:
        monitor = sct.monitors[1] if region is None else region
        img = np.array(sct.grab(monitor))
        return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)


def get_template(template_path):
    """Load and cache an image template."""
    if template_path not in loaded_templates:
        template = cv2.imread(template_path, cv2.IMREAD_COLOR)
        if template is None:
            print(f"[ERROR] Couldn't load image: {template_path}")
        loaded_templates[template_path] = template
    return loaded_templates[template_path]


def click_image_on_screen(template_path, threshold=TEMPLATE_MATCH_THRESHOLD, region=None):
    """Find and click an image on the screen using template matching."""
    template = get_template(template_path)
    if template is None:
        print(f"[ERROR] Couldn't load template: {template_path}")
        return False

    screenshot = screenshot_fullscreen(region)
    result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
    locations = np.where(result >= threshold)

    x_offset = region['left'] if region else 0
    y_offset = region['top'] if region else 0

    for pt in zip(*locations[::-1]):
        center = (
            pt[0] + template.shape[1] // 2 + x_offset,
            pt[1] + template.shape[0] // 2 + y_offset
        )
        print(f"[DEBUG] Clicking at screen position: {center}")
        pyautogui.moveTo(center)
        pyautogui.click()
        return True

    print(f"[INFO] Image not found: {template_path}")
    return False


def get_asin():
    """Trigger sequence to get ASIN from Chrome and paste into target UI."""
    global last_click_pos
    try:
        chrome = find_chrome_window()
        if chrome is None:
            return

        chrome.set_focus()
        time.sleep(0.07)

        pyautogui.click()
        time.sleep(0.02)
        pyautogui.press('esc')
        pyautogui.click()
        time.sleep(0.02)
        pyautogui.press('esc')
        time.sleep(0.02)

        last_click_pos = pyautogui.position()
        time.sleep(0.05)

        pyautogui.hotkey('ctrl', 'c')
        time.sleep(0.05)

        if not click_image_on_screen(CHECK_IMAGE, region=right_half_region):
            return

        pyautogui.hotkey('ctrl', 'v')
        time.sleep(0.05)

        # Uncomment if you want to search immediately
        click_image_on_screen(SEARCH_IMAGE, region=right_half_region)
    except Exception as e:
        print(f"[ERROR] in get_asin: {e}")


def log_result(res="Unlikely"):
    """Log result into Google Sheets and reset focus."""
    try:
        chrome = find_chrome_window()
        if chrome is None:
            return

        chrome.set_focus()
        time.sleep(0.2)

        pyautogui.press('right')
        time.sleep(0.05)
        pyautogui.press('right')
        time.sleep(0.05)

        pyautogui.write("Highly Likely" if res == "Highly Likely" else "Unlikely")
        time.sleep(0.05)

        pyautogui.press(['enter', 'home'])
        time.sleep(0.05)

        pyautogui.moveTo(last_click_pos[0], last_click_pos[1] + 21)
    except Exception as e:
        print(f"[ERROR] in log_result: {e}")


def focus_proton():
    """Bring Proton VPN window to focus."""
    focus_window("Proton VPN")


def main():
    """Main event loop to listen for hotkeys."""
    print("[INFO] Program started. Listening for hotkeys...")
    keyboard.add_hotkey(GET_ASIN, get_asin)
    keyboard.add_hotkey(UNLIKELY, lambda: log_result("Unlikely"))
    keyboard.add_hotkey(LIKELY, lambda: log_result("Highly Likely"))
    keyboard.add_hotkey(PROTON, focus_proton)
    keyboard.wait()


if __name__ == "__main__":
    main()
