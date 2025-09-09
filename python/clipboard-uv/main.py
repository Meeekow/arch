import win32clipboard
import win32con
import win32gui
import ctypes

class ClipboardWatcher:
    def __init__(self):
        self._hwnd = None
        self._next_hwnd = None
        self._running = False

    def _wnd_proc(self, hwnd, msg, wparam, lparam):
        if msg == win32con.WM_DRAWCLIPBOARD:
            self.on_clipboard_change()
            # Pass message to next window in clipboard viewer chain
            if self._next_hwnd:
                ctypes.windll.user32.SendMessageW(self._next_hwnd, msg, wparam, lparam)
            return 0
        elif msg == win32con.WM_CHANGECBCHAIN:
            if wparam == self._next_hwnd:
                self._next_hwnd = lparam
            elif self._next_hwnd:
                ctypes.windll.user32.SendMessageW(self._next_hwnd, msg, wparam, lparam)
            return 0
        else:
            return ctypes.windll.user32.DefWindowProcW(hwnd, msg, wparam, lparam)

    def on_clipboard_change(self):
        win32clipboard.OpenClipboard()
        try:
            data = win32clipboard.GetClipboardData(win32con.CF_UNICODETEXT)
        except TypeError:
            data = ''
        win32clipboard.CloseClipboard()
        print(f"Clipboard changed: {data}")
        # Your cleaning logic here
        cleaned = self.clean_clipboard_text(data)
        if cleaned != data:
            win32clipboard.OpenClipboard()
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(cleaned)
            win32clipboard.CloseClipboard()
            print(f"Clipboard cleaned: {cleaned}")

    def clean_clipboard_text(self, text):
        if text.startswith('"'):
            text = text[1:]
        if text.endswith('"'):
            text = text[:-1]
        return text

    def run(self):
        wc = win32gui.WNDCLASS()
        wc.lpfnWndProc = self._wnd_proc
        wc.lpszClassName = 'ClipboardWatcher'
        class_atom = win32gui.RegisterClass(wc)

        self._hwnd = win32gui.CreateWindow(
            class_atom,
            'Clipboard Watcher',
            0,
            0, 0, 0, 0,
            0, 0, 0, None
        )

        # Use ctypes to call SetClipboardViewer
        self._next_hwnd = ctypes.windll.user32.SetClipboardViewer(self._hwnd)

        self._running = True
        print("Clipboard watcher running. Press Ctrl+C to stop.")
        try:
            while self._running:
                win32gui.PumpWaitingMessages()
        except KeyboardInterrupt:
            print("Stopping clipboard watcher...")
            ctypes.windll.user32.ChangeClipboardChain(self._hwnd, self._next_hwnd)
            win32gui.DestroyWindow(self._hwnd)
            self._running = False

if __name__ == "__main__":
    watcher = ClipboardWatcher()
    watcher.run()
