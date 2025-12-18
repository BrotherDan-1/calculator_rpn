[BLOCK: App Overview]
App Name: Command Line Calculator (command_line_calculator)
-------------------------------------------------------------
This Electron-based desktop calculator lets users input basic arithmetic
expressions in a single command-line input field. The result is evaluated
safely and displayed below the input box. All results are automatically
copied to the system clipboard for convenience.
[END BLOCK]

[BLOCK: Features]
Features:
---------
- Simple command-based arithmetic input (e.g., 2+2, 5*3, (10+2)/4)
- Custom frameless title bar
- Clipboard integration: results auto-copied
- Keyboard support: press Enter to evaluate
- Clear button to reset input and output
- Floating point results rounded to 10 decimal places
[END BLOCK]

[BLOCK: File Structure]
File Structure:
---------------
├── index.html         # App layout and DOM elements
├── renderer.js        # Handles UI behavior, input, and communication with main
├── preload.js         # Exposes safe APIs to renderer (IPC bridge)
├── main.js            # Electron main process, evaluates expressions securely
├── styles.css         # UI styling and layout
[END BLOCK]

[BLOCK: Usage Instructions]
Usage Instructions:
-------------------
1. Run the app using `npm start` (Electron required)
2. Type an arithmetic expression in the input field (e.g., (7 + 3) * 2)
3. Press Enter to evaluate or click the Clear button to reset
4. Result is shown below and copied to clipboard automatically
[END BLOCK]

[BLOCK: Security Notes]
Security Notes:
---------------
- The app uses a regex to restrict allowed characters before calling `eval()`.
  Only numbers, +, -, *, /, parentheses, spaces, and decimal points are accepted.
- Clipboard support is handled through Electron’s `clipboard` module.
- Node integration is disabled in the renderer for improved security.
[END BLOCK]

[BLOCK: Customization]
Customization:
--------------
- Update `title-bar` text in `index.html` to rename the app
- Modify styles in `styles.css` for layout or color changes
- Adjust result precision in `renderer.js` by modifying the `.toFixed()` call
[END BLOCK]

[BLOCK: Author]
Author:
-------
BrotherDan with Dev Guru
[END BLOCK]
