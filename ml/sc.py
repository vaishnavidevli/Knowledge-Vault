# import pyautogui
# import pyperclip
# import time
#
# def type_clipboard_content():
#     time.sleep(5)  # Gives you 5 seconds to switch to the target window
#     text = pyperclip.paste()
#     if text:
#         pyautogui.typewrite(text, interval=0.01)  # Adjust typing speed here
#
# if __name__ == "__main__":
#     type_clipboard_content()

import pyautogui
import pyperclip
import time


def type_clipboard_content():
    time.sleep(5)
    text = pyperclip.paste()
    if text:
        lines = text.replace('\r\n', '\n').replace('\r', '\n').split('\n')
        for i, line in enumerate(lines):
            # Count leading spaces
            stripped = line.lstrip(' ')
            spaces = len(line) - len(stripped)

            # Press home to go to start of line
            pyautogui.press('home')

            # Press space manually for each indent space
            for _ in range(spaces):
                pyautogui.press('space')

            # Type the rest of the line
            for char in stripped:
                pyautogui.typewrite(char, interval=0)

            if i < len(lines) - 1:
                pyautogui.press('enter')


if __name__ == "__main__":
    type_clipboard_content()
