// Disable DMD when game is running
mainWindow.on("gamestarted", ev => {
    setTimeout(() => {
        dmdWindow.showWindow(false);
    }, 10 * 1000); // wait 10 seconds - TODO: listen for actual window
});

// Turn DMD window back on when game ends
mainWindow.on("gameover", ev => { dmdWindow.showWindow(true); });