import time
import random
import keyboard
import win32con
import win32gui
import pyautogui
import pyperclip
import win32com.client
import numpy as np
import cv2
from mss import mss
from pywinauto import Desktop


# Constants
GET_ASIN = 'win+enter'
# GET_ASIN = 'ctrl+space'
UNLIKELY = 'ctrl+enter'
LIKELY = 'shift+enter'
# LIKELY = 'win+enter'
PROTON = 'alt+enter'

CHECK_IMAGE = 'check.png'
SEARCH_IMAGE = 'search.png'
NEW_TAB_IMAGE = 'new_tab.png'
CLOUDFLARE = 'cloudflare.png'
TEMPLATE_MATCH_THRESHOLD = 0.85

# Globals
last_click_pos = (0, 0)
current_tab = 1
loaded_templates = {}

right_half_region = {
    "top": 0,
    "left": 1720,
    "width": 1720,
    "height": 1440
}


def wait(seconds=0.2):
    time.sleep(seconds)


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


def click_image_on_screen(template_path, threshold=TEMPLATE_MATCH_THRESHOLD, region=None, timeout=10):
    """Find and click an image on the screen using template matching with a retry mechanism."""
    template = get_template(template_path)
    if template is None:
        print(f"[ERROR] Couldn't load template: {template_path}")
        return False

    start_time = time.time()  # Store the start time
    while True:
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

        """Check if the timeout is exceeded."""
        elapsed_time = time.time() - start_time
        if elapsed_time > timeout:
            print(f"[INFO] Timeout reached. Image not found: {template_path}")
            return False

        """Add a small delay before retrying to avoid overloading the CPU."""
        wait(0.05)


def click_captcha_or_bypass(
    captcha_template_path,
    bypass_template_path=None,
    threshold=TEMPLATE_MATCH_THRESHOLD,
    region=None,
    timeout=60
):
    """Wait for a CAPTCHA image to appear and click it, but exit early if a bypass image is detected."""

    captcha_template = get_template(captcha_template_path)
    if captcha_template is None:
        print(f"[ERROR] Couldn't load CAPTCHA template: {captcha_template_path}")
        return False

    bypass_template = None
    if bypass_template_path:
        bypass_template = get_template(bypass_template_path)
        if bypass_template is None:
            print(f"[ERROR] Couldn't load bypass template: {bypass_template_path}")

    start_time = time.time()

    while True:
        screenshot = screenshot_fullscreen(region)

        # Check for CAPTCHA
        captcha_result = cv2.matchTemplate(screenshot, captcha_template, cv2.TM_CCOEFF_NORMED)
        captcha_locations = np.where(captcha_result >= threshold)

        if captcha_locations[0].size > 0:
            # Found CAPTCHA, click it
            pt = next(zip(*captcha_locations[::-1]))
            center = (
                pt[0] + captcha_template.shape[1] // 2 + (region['left'] if region else 0),
                pt[1] + captcha_template.shape[0] // 2 + (region['top'] if region else 0)
            )
            print(f"[INFO] CAPTCHA found. Clicking at {center}")
            pyautogui.moveTo(center)
            pyautogui.click()
            return True

        # Check for bypass image
        if bypass_template is not None:
            bypass_result = cv2.matchTemplate(screenshot, bypass_template, cv2.TM_CCOEFF_NORMED)
            if np.any(bypass_result >= threshold):
                print("[INFO] CAPTCHA not required. Bypass image detected.")
                return False  # or return True if bypass = success

        # Check for timeout
        if time.time() - start_time > timeout:
            print(f"[INFO] Timeout waiting for CAPTCHA: {captcha_template_path}")
            return False

        wait(0.05)


def get_asin():
    """Trigger sequence to get ASIN from Chrome and paste into target UI."""
    global last_click_pos
    try:
        chrome = find_chrome_window()
        if chrome is None:
            return

        chrome.set_focus()
        wait(0.07)

        pyautogui.click()
        wait(0.02)
        pyautogui.press('esc')
        pyautogui.click()
        wait(0.02)
        pyautogui.press('esc')
        wait(0.02)

        last_click_pos = pyautogui.position()
        print(last_click_pos)
        wait(0.05)

        pyautogui.hotkey('ctrl', 'c')
        wait(0.05)

        if not click_image_on_screen(CHECK_IMAGE, region=right_half_region):
            return

        pyautogui.hotkey('ctrl', 'v')
        wait(0.05)

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
        wait()

        pyautogui.press('right')
        wait(0.05)
        pyautogui.press('right')
        wait(0.05)

        pyautogui.write("Highly Likely" if res == "Highly Likely" else "Unlikely")
        wait(0.05)

        pyautogui.press(['enter', 'home'])
        wait(0.05)

        pyautogui.moveTo(last_click_pos[0], last_click_pos[1] + 21)
    except Exception as e:
        print(f"[ERROR] in log_result: {e}")


def focus_proton():
    """Bring Proton VPN window to focus."""
    focus_window("Proton VPN")
    wait(0.05)
    connect_to_random_country()


def connect_to_random_country():
    global last_click_pos
    with open("countries.txt", "r") as file:
        countries = file.readlines()
        country = random.choice(countries)
        print(f"Connecting to {country.strip()}...")
        pyperclip.copy(country)

    pyautogui.hotkey('ctrl', 'f') # use ProtonVPN native CTRL+F
    wait()

    pyautogui.hotkey('ctrl', 'a') # highlight all contents on the search bar
    wait()

    pyautogui.hotkey('ctrl', 'v') # paste new country
    wait()

    pyautogui.moveTo(1434, 605) # click connect
    pyautogui.click()
    wait()

    firefox_container_tab()

    pyautogui.moveTo(last_click_pos[0], last_click_pos[1])


def firefox_container_tab():
    global current_tab

    focus_window("Mozilla")
    wait()
    click_image_on_screen(NEW_TAB_IMAGE)
    wait()

    if current_tab < 10:
        pyautogui.hotkey('alt', str(current_tab))
    else:
        up_presses = 13 - current_tab
        pyautogui.press(['up'] * up_presses)

    current_tab = (current_tab % 11) + 1
    wait()
    
    pyautogui.press('enter')
    wait()
    
    pyperclip.copy("https://booksrun.com/counterfeit/calculator")
    wait()
    pyautogui.hotkey('ctrl', 'v')
    wait()
    pyautogui.press('enter')
    wait()

    pyautogui.hotkey('ctrl', 'shift', 'tab')
    wait()
    pyautogui.hotkey('ctrl', 'w')
    wait()

    click_captcha_or_bypass(CLOUDFLARE, CHECK_IMAGE, region=right_half_region)


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
