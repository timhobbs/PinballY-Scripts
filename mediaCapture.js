import { console, toggleWindows } from 'helpers.js';

let editState = false;

mainWindow.on("command", ev => {
    console.log('***** mediaCapture command:', ev.name, ev.id);
    if (ev.name === 'CaptureGo') {  // if its triggered
        editState = true;
        console.log('***** mediaCapture editState: ' + editState);
        toggleWindows(false);
    }
});

mainWindow.on("mediasyncbegin", ev => {
    console.log('***** forceCapture mainWindow mediasyncbegin: ' + ev.game + ' - editState: ' + editState);
    if (editState === true) {
        editState = false;
        toggleWindows(true);
    }
});
