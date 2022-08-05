const forceCapture = command.allocate("CaptureForce");

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
    if (ev.id == forceCapture) {  // if its triggered
        mainWindow.doCommand(command.CaptureMediaSetup);
        mainWindow.doCommand(command.CaptureLayoutOk);
        mainWindow.doButtonCommand('Select', true, 0);
    }
});
