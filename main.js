// [BLOCK: electron_app_imports]
// Import core Electron modules
const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
// [END BLOCK]

// [BLOCK: global_window_reference]
// Store reference to the main application window
let mainWindow;
// [END BLOCK]

// [BLOCK: create_main_window]
// Create the main browser window once the app is ready
app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        webPreferences: {
            preload: __dirname + '/preload.js',   // Load preload script (optional but secure)
            contextIsolation: true,               // ✅ Isolate context for security
            enableRemoteModule: false,            // ✅ Disable remote (deprecated)
            nodeIntegration: false                // ✅ Prevent direct Node access in renderer
        },
        frame: false,     // Use custom title bar (frameless window)
        transparent: false,
        resizable: true
    });

    // Load the main interface
    mainWindow.loadFile('index.html');
});
// [END BLOCK]

// [BLOCK: evaluate_expression_handler]
// IPC listener for evaluating a math expression sent from renderer.js
ipcMain.on('evaluate-expression', (event, expression) => {
    try {
        // [BLOCK: validation]
        // Only allow safe characters: digits, math symbols, parentheses, spaces
        const allowedChars = /^[0-9+\-*/(). ]+$/;
        if (!allowedChars.test(expression)) {
            event.reply('calculation-result', 'Invalid characters detected!');
            return;
        }
        // [END BLOCK]

        // [BLOCK: safe_eval]
        // Evaluate the expression (assumes only math expressions are allowed)
        const result = eval(expression);
        // Copy result to clipboard
        clipboard.writeText(result.toString());
        // Return result to renderer
        event.reply('calculation-result', result.toString());
        // [END BLOCK]
    } catch (error) {
        // Send error back to renderer
        event.reply('calculation-result', 'Error in calculation');
    }
});
// [END BLOCK]
