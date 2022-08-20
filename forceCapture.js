import { console, toggleWindows } from "helpers.js";

const forceCapture = command.allocate("CaptureForce");
let editState = false;

// Add edit menu item and trigger vpx edit mode
mainWindow.on("menuopen", ev => { // when main menu is triggered
    if (ev.id == "main") {
        ev.addMenuItem(
            { after: command.PlayGame },  // where should the new item be placed in menu?
            { title: "Force Media Capture", cmd: forceCapture } // name of the new menu item
        );
    }
});

mainWindow.on("command", ev => {
    console.log('***** forceCapture command:', ev.name, ev.id);
    if (ev.id === forceCapture) {  // if its triggered
        editState = true;
        console.log('***** forceCapture editState: ' + editState);
        toggleWindows(false);
        mainWindow.doCommand(command.CaptureMediaSetup);
        mainWindow.doCommand(command.CaptureLayoutOk);
        mainWindow.doButtonCommand('Select', true, 0);
    }
});

mainWindow.on("mediasyncbegin", ev => {
    console.log('***** forceCapture mainWindow mediasyncbegin: ' + ev.game + ' - editState: ' + editState);
    if (editState === true) {
        editState = false;
        console.log('***** forceCapture mediasyncbegin editState: ' + editState);
        toggleWindows(true);
    }
});
