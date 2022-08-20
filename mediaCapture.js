let editState = false;

mainWindow.on("command", ev => {
    console.log('***** mediaCapture command:', ev.name, ev.id);
    if (ev.name === 'CaptureGo') {  // if its triggered
        editState = true;
        console.log('***** mediaCapture editState: ' + editState);
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
        toggleWindows(true);
    }
});
