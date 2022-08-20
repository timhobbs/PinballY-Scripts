import { console, toggleWindows } from 'helpers.js';

// Disable DMD when game is running
mainWindow.on("gamestarted", ev => {
    console.log('***** hide', ev.name);
    setTimeout(() => {
        toggleWindows(false);
    }, 10 * 1000); // wait 10 seconds - TODO: listen for actual window
});

// Turn DMD window back on when game ends
mainWindow.on("gameover", ev => {
    console.log('***** show', ev.name);
    toggleWindows(true);
});
