// [BLOCK: electron_bridge_imports]
// Import Electron's secure context bridge and IPC messaging system
const { contextBridge, ipcRenderer } = require('electron');
// [END BLOCK]

// [BLOCK: expose_ipc_to_renderer]
// Expose limited, secure API to the renderer process via window.electron
contextBridge.exposeInMainWorld('electron', {
    
    // [BLOCK: send_method]
    // Sends a message from renderer to the main process
    send: (channel, data) => ipcRenderer.send(channel, data),
    // [END BLOCK]
    
    // [BLOCK: receive_method]
    // Allows renderer to receive messages from the main process
    receive: (channel, callback) => 
        ipcRenderer.on(channel, (event, ...args) => callback(...args))
    // [END BLOCK]

});
// [END BLOCK]
