// START - Edit these values
// ------------------------------------------

// Edit the path to point to your PBY scripts folder
// Be sure to edit the folder location in `table-edit.bat` as well
const batchFile = "c:\\Games\\PinballY\\Scripts\\table-edit.bat";

// ------------------------------------------
// END - Edit these values

const console = logfile;
const cameraEdit = command.allocate("CameraEdit");
let overlay;

// Add edit menu item and trigger vpx edit mode
mainWindow.on("menuopen", ev => { // when main menu is triggered
    if (ev.id == "main") {
        const gameInfo = getGameInfo();
        const systemClass = gameInfo && gameInfo.system ? gameInfo.system.systemClass : '';
        if (systemClass !== 'VPX') {
            return;
        }

        ev.addMenuItem(
            { after: command.PlayGame },  // where should the new item be placed in menu?
            { title: "Camera Edit", cmd: cameraEdit } // name of the new menu item
        );
    }
});

mainWindow.on("command", ev => {
    console.log('***** tableEdit command: ' + ev.name);
    if (ev.id == cameraEdit) {  // if its triggered
        const gameInfo = getGameInfo();
        const filename = '"' + gameInfo.resolveGameFile().filename + '"';
        console.log('***** command: ' + ev.name + ' - ' + filename);

        // run the command
        // call batch file (hidden mode) and handover the Color as parameter
        let result = Shell32.ShellExecuteW(
            null, "open", batchFile, filename, null, SW_HIDE
        );

        // The result of ShellExecute() is a fake handle value that we
        // have to interpret as an integer to make sense of.  A value
        // higher than 32 indicates success; a value 32 or lower is an
        // error code.  See the Windows SDK documentation for details.
        if (result.toNumber() > 32) {
            // success!  do any follow-up here
            console.log('***** Shell success: Create overlay');
            overlay = mainWindow.createDrawingLayer(4000);
            overlay.clear(0xff404040);

            // Mute table audio
            mainWindow.doCommand(command.MuteTableAudio);

            // Show message
            mainWindow.message('The camera edit mode will open shortly. ' +
                'Set the camera values appropriately and press "Start" to save or the escape key to exit. ' +
                'Once you have completed the camera mode you may need to press the escape key again.', "info");
        } else {
            // launch failed
            mainWindow.message(`Program launch failed (code ${result.toNumber()})`, "error");
        }
    }

    if (ev.name === 'KillGame') {
        if (!overlay) {
            return;
        }

        // Remove overlay
        console.log('***** Removing overlay');
        overlay.clear(0x00000000);
        mainWindow.removeDrawingLayer(overlay);

        // Clear overlay
        overlay = void 0;
        console.log('***** overlay status: ' + overlay);

        // Unmute table audio
        mainWindow.doCommand(command.MuteTableAudio);
    }
});

mainWindow.on("keydown", ev => {
    console.log('***** keydown: ' + ev.key);
    if (ev.key === 'Escape' && overlay) {
        // Remove overlay
        console.log('***** Removing overlay based on keydown: ' + ev.key);
        overlay.clear(0x00000000);
        mainWindow.removeDrawingLayer(overlay);

        // Clear overlay
        overlay = void 0;
        console.log('***** overlay status: ' + overlay);

        // Unmute table audio
        mainWindow.doCommand(command.MuteTableAudio);

        // Prevent normal key event from proceeding
        ev.preventDefault();
    }
});

function getGameInfo() {
    return gameList.getWheelGame(0);
}

let Shell32 = dllImport.bind("Shell32.dll", `
    HINSTANCE ShellExecuteW(
        HWND    hwnd,
        LPCWSTR lpOperation,
        LPCWSTR lpFile,
        LPCWSTR lpParameters,
        LPCWSTR lpDirectory,
        INT     nShowCmd
    );
`);
