import { Shell32, console, toggleWindows } from "helpers.js";

// START - Edit these values
// ------------------------------------------

// Edit the path to point to your PBY scripts folder
// Be sure to edit the folder location in `table-edit.bat` as well
const batchFile = "c:\\Games\\PinballY\\Scripts\\table-edit.bat";

// // Uncomment the second line if you want to enable logging output
// let console = { log: () => {} };
// // console = logfile;

// Change this to whatever font family you use
const popupFont = 'Komika Title';

// ------------------------------------------
// END - Edit these values

const cameraEdit = command.allocate("CameraEdit");
let overlay;

// Add edit menu item and trigger vpx edit mode
mainWindow.on("menuopen", ev => { // when main menu is triggered
    if (ev.id === "main") {
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
    if (ev.id === cameraEdit) {  // if its triggered
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
            mainWindow.showPopup({
                backgroundColor: 0x404040,
                borderColor: 0xffffff,
                borderWidth: 5,
                y: 25,
                draw: dc => {
                    const s = new StyledText({ padding: 30 });
                    s.add({
                        font: popupFont,
                        size: 35,
                        text: 'The camera edit mode will open shortly. ' +
                            'Set the camera values appropriately and press "Start" to save or "Exit" to quit. ' +
                            'Once you have completed the camera mode you may need to press "Start"/"Exit" again.',
                        color: 0xffffff,
                        textAlign: 'justified',
                    });

                    const metrics = s.measure(1080 * 0.8);
                    console.log('***** metrics: ' + metrics.width + ' x ' + metrics.height);

                    s.draw(dc, { x: 0, y: 0, width: metrics.width, height: metrics.height });

                    return metrics.height;
                },
            });

            // Toggle windows
            toggleWindows(false);
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

        // Toggle windows
        toggleWindows(true);
    }
});

mainWindow.on("keydown", ev => {
    console.log('***** keydown: ' + ev.key + ' - overlay: ' + overlay);
    // React to escape or "Start" button (mapped to "1")
    if (['Escape', '1'].includes(ev.key) && overlay) {
        // Remove overlay
        console.log('***** Removing overlay based on keydown: ' + ev.key);
        overlay.clear(0x00000000);
        mainWindow.removeDrawingLayer(overlay);

        // Clear overlay
        overlay = void 0;
        console.log('***** overlay status: ' + overlay);

        // Unmute table audio
        mainWindow.doCommand(command.MuteTableAudio);

        // Press button to dismiss dialog
        mainWindow.doButtonCommand('Select', true, 0);

        // Toggle windows
        toggleWindows(true);

        // Prevent normal key event from proceeding
        ev.preventDefault();
    }
});

function getGameInfo() {
    return gameList.getWheelGame(0);
}
