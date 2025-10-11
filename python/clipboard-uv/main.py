import threading
import time
import ctypes
from ctypes import wintypes

import re
from datetime import datetime, timedelta

import win32api
import win32con
import win32gui
import win32clipboard
import pyperclip   # dependency for text copy/paste

# ---- Win32 constants ----
WM_CLIPBOARDUPDATE = 0x031D

user32 = ctypes.windll.user32
shell32 = ctypes.windll.shell32

user32.AddClipboardFormatListener.argtypes = [wintypes.HWND]
user32.AddClipboardFormatListener.restype = wintypes.BOOL
user32.RemoveClipboardFormatListener.argtypes = [wintypes.HWND]
user32.RemoveClipboardFormatListener.restype = wintypes.BOOL
user32.RegisterClipboardFormatA.argtypes = [wintypes.LPCSTR]
user32.RegisterClipboardFormatA.restype = wintypes.UINT
shell32.DragQueryFileW.argtypes = [wintypes.HANDLE, wintypes.UINT,
                                   wintypes.LPWSTR, wintypes.UINT]
shell32.DragQueryFileW.restype = wintypes.UINT
shell32.DragFinish.argtypes = [wintypes.HANDLE]
shell32.DragFinish.restype = None

# Suppress exactly ONE event that we know we caused ourselves (prevents loops)
_suppress_next_event = False


# ==============================
# Helper: Safe clipboard opening
# ==============================
class ClipboardOpen:
    """
    Open the clipboard with retries (handles brief locks), and ensure it closes.
    """
    def __init__(self, retries=10, delay=0.02):
        self.retries = retries
        self.delay = delay

    def __enter__(self):
        for _ in range(self.retries):
            try:
                win32clipboard.OpenClipboard()
                return self
            except Exception:
                time.sleep(self.delay)
        # Final attempt (let it raise for visibility)
        win32clipboard.OpenClipboard()
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            win32clipboard.CloseClipboard()
        except Exception:
            pass


# =====================
# SAFE, ISOLATED READ HELPERS (each opens/closes clipboard)
# =====================
def _safe_opened(fn, default=None):
    """
    Open the clipboard, run fn(), close it; return default on failure.
    Isolates each operation so one failure doesn't affect others.
    """
    try:
        with ClipboardOpen():
            return fn()
    except Exception:
        return default


def read_text():
    def _do():
        if win32clipboard.IsClipboardFormatAvailable(win32con.CF_UNICODETEXT):
            try:
                return win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
            except Exception:
                return None
        return None
    return _safe_opened(_do, None)


def read_html():
    def _do():
        cf_html = user32.RegisterClipboardFormatA(b"HTML Format")
        if cf_html and win32clipboard.IsClipboardFormatAvailable(cf_html):
            try:
                data = win32clipboard.GetClipboardData(cf_html)
                if isinstance(data, bytes):
                    try:
                        return data.decode("utf-8", errors="replace")
                    except Exception:
                        return data.decode("latin1", errors="replace")
                return data
            except Exception:
                return None
        return None
    return _safe_opened(_do, None)


def read_file_drop_list():
    def _do():
        if not win32clipboard.IsClipboardFormatAvailable(win32con.CF_HDROP):
            return None
        try:
            hdrop = win32clipboard.GetClipboardData(win32con.CF_HDROP)
            count = shell32.DragQueryFileW(hdrop, 0xFFFFFFFF, None, 0)
            files = []
            buf = ctypes.create_unicode_buffer(260)  # can be resized if needed
            for i in range(count):
                needed = shell32.DragQueryFileW(hdrop, i, None, 0)
                if needed + 1 > len(buf):
                    buf = ctypes.create_unicode_buffer(needed + 1)
                shell32.DragQueryFileW(hdrop, i, buf, len(buf))
                files.append(buf.value)
            shell32.DragFinish(hdrop)
            return files
        except Exception:
            return None
    return _safe_opened(_do, None)


def read_available_formats():
    """
    Best-effort enumeration; delayed rendering apps (e.g., Sublime) can cause
    the clipboard to flip mid-enumeration. Return [] rather than erroring out.
    """
    def _do():
        fmts = []
        try:
            fmt = win32clipboard.EnumClipboardFormats(0)
            while fmt:
                fmts.append(fmt)
                fmt = win32clipboard.EnumClipboardFormats(fmt)
        except Exception:
            return []
        return fmts
    return _safe_opened(_do, [])


def read_clipboard_snapshot():
    # Open/close per operation; avoids “clipboard not open” races
    return {
        "text": read_text(),
        "html": read_html(),
        "files": read_file_drop_list(),
        "formats_present": read_available_formats(),
    }


# =====================
# YOUR HELPERS (UNCHANGED)
# =====================
def remove_outer_double_quotes():
    text = pyperclip.paste()
    print(f"Copied: {text}")

    try:
        if len(text) >= 2 and text[0] == '"' and text[-1] == '"':
            transformed = text[1:-1]
            pyperclip.copy(transformed)
        else:
            print("Not valid for string manipulation...")
    except Exception:
        pass


def add_before(s):
    # Find the after:YYYY/MM/DD pattern
    match = re.search(r"after:(\d{4}/\d{2}/\d{2})\s?", s)
    if not match:
        return s  # return unchanged if pattern not found

    # Extract the date string
    date_str = match.group(1)
    date_obj = datetime.strptime(date_str, "%Y/%m/%d").date()

    # Add one day
    next_day = date_obj + timedelta(days=1)
    next_day_str = next_day.strftime("%Y/%m/%d")

    # Append before: next_day
    return f"after:{date_str} before:{next_day_str}"


def shift_dates(s):
    # Find both after and before dates
    match = re.search(r"after:(\d{4}/\d{2}/\d{2})\s+before:(\d{4}/\d{2}/\d{2})\s?", s)
    if not match:
        return s  # return unchanged if pattern not found

    after_str, before_str = match.groups()

    # Parse them into datetime.date
    after_date = datetime.strptime(after_str, "%Y/%m/%d").date()
    before_date = datetime.strptime(before_str, "%Y/%m/%d").date()

    # Shift by 1 day
    new_after = after_date + timedelta(days=1)
    new_before = before_date + timedelta(days=1)

    return f"after:{new_after.strftime('%Y/%m/%d')} before:{new_before.strftime('%Y/%m/%d')}"


def transform_date():
    transformed = None
    text = pyperclip.paste()
    print(f"Copied: {text}")

    add_before_only = re.fullmatch(r"after:\d{4}/\d{2}/\d{2}\s?", text)
    shift_both_dates = re.fullmatch(r"after:\d{4}/\d{2}/\d{2}\sbefore:\d{4}/\d{2}/\d{2}\s?", text)

    try:
        if add_before_only:
            transformed = add_before(text)
        elif shift_both_dates:
            transformed = shift_dates(text)
        else:
            print("Not valid for string manipulation...")

        if transformed is not None:
            pyperclip.copy(transformed)
    except Exception:
        pass


# =====================
# Clipboard watcher core
# =====================
class ClipboardWatcher:
    CLASS_NAME = "ClipboardWatcherClass"

    def __init__(self, on_change):
        self.on_change = on_change
        self.hwnd = None
        self._thread = None

    def _wnd_proc(self, hwnd, msg, wparam, lparam):
        if msg == WM_CLIPBOARDUPDATE:
            try:
                snapshot = read_clipboard_snapshot()
                self.on_change(snapshot)
            except Exception as e:
                print("on_change error:", e)
            return 0
        elif msg == win32con.WM_DESTROY:
            try:
                user32.RemoveClipboardFormatListener(hwnd)
            except Exception:
                pass
            win32gui.PostQuitMessage(0)
            return 0
        return win32gui.DefWindowProc(hwnd, msg, wparam, lparam)

    def _message_pump(self):
        hInstance = win32api.GetModuleHandle(None)
        wndclass = win32gui.WNDCLASS()
        wndclass.hInstance = hInstance
        wndclass.lpszClassName = self.CLASS_NAME
        wndclass.lpfnWndProc = self._wnd_proc
        atom = win32gui.RegisterClass(wndclass)

        # Create message-only window (no UI)
        self.hwnd = win32gui.CreateWindow(
            atom, self.CLASS_NAME, 0,
            0, 0, 0, 0,
            win32con.HWND_MESSAGE, 0, hInstance, None
        )

        if not user32.AddClipboardFormatListener(self.hwnd):
            raise RuntimeError("AddClipboardFormatListener failed")

        # Run standard message loop
        win32gui.PumpMessages()

    def start(self, in_background=True):
        if in_background:
            if self._thread and self._thread.is_alive():
                return
            self._thread = threading.Thread(
                target=self._message_pump,
                name="ClipboardWatcherThread",
                daemon=True
            )
            self._thread.start()
        else:
            self._message_pump()

    def stop(self):
        if self.hwnd:
            try:
                win32gui.PostMessage(self.hwnd, win32con.WM_CLOSE, 0, 0)
            except Exception:
                pass
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)


# =====================
# Example usage
# =====================
if __name__ == "__main__":
    import pprint

    def on_clipboard_change(snapshot):
        global _suppress_next_event

        # If the immediately previous change was caused by us, skip this one.
        if _suppress_next_event:
            _suppress_next_event = False
            return

        print("=== Clipboard changed ===")
        pprint.pprint(snapshot)

        # Only operate on text
        current_text = snapshot["text"]
        if not isinstance(current_text, str):
            return

        # Wrap helpers that might modify the clipboard:
        # If the content changed, mark to suppress exactly ONE next event.
        before = pyperclip.paste()
        remove_outer_double_quotes()
        after = pyperclip.paste()
        if after != before:
            _suppress_next_event = True
            return  # We'll get called again for the change we just made

        before2 = after
        transform_date()
        after2 = pyperclip.paste()
        if after2 != before2:
            _suppress_next_event = True
            return  # We'll get called again for the change we just made

    watcher = ClipboardWatcher(on_clipboard_change)
    watcher.start(in_background=True)

    print("Clipboard watcher running. Press Ctrl+C to exit.")
    try:
        while True:
            time.sleep(1.0)
    except KeyboardInterrupt:
        print("Stopping watcher...")
        watcher.stop()
        print("Stopped.")
