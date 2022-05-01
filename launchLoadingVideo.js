// START - Edit these values
// ------------------------------------------

// The name of the default launch animation
// This should be in your `Videos` folder
const defaultLaunchFileName = '[YOUR_FILE_NAME_HERE]';

// Whether or not to disable the wheel image when thew animation plays
const disableWheel = true;

// Whether or not to disable the messaging when thew animation plays
const disableMessaging = true;

// ------------------------------------------
// END - Edit these values

mainWindow.on("launchoverlayshow", (ev) => {
    // Get the current game info
    const gameInfo = ev.game;

    // Don't proceed if game is not configured
    if (!gameInfo.isConfigured) {
        return;
    }

    // Get the video
    mainWindow.launchOverlay.bg.loadVideo(gameList.resolveMedia('Videos', defaultLaunchFileName, 'video'));

    ev.preventDefault();
});

mainWindow.on("gamestarted", (ev) => {
    mainWindow.launchOverlay.bg.clear(0xff000000);
});

mainWindow.on("launchoverlaymessage", (ev) => {
    ev.hideWheelImage = disableWheel;

    // Hide loading messages only
    if (['terminating', 'gameover', 'after'].includes(ev.id)) {
        return;
    }
    ev.message = disableMessaging ? '' : ev.message;
});
