const console = logfile;

// Disable DMD when game is running
mainWindow.on("gamestarted", ev => hide);

// Turn DMD window back on when game ends
mainWindow.on("gameover", ev => show);

function hide(ev) {
    console.log('***** hide', ev.name);
    setTimeout(() => {
        dmdWindow.showWindow(false);
        topperWindow.showWindow(false);
    }, 10 * 1000); // wait 10 seconds - TODO: listen for actual window
}

function show(ev) {
    console.log('***** show', ev.name);
    dmdWindow.showWindow(true);
    topperWindow.showWindow(true);
}