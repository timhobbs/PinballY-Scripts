import { getRandomVideo } from "helpers.js";

// START - Edit these values
// ------------------------------------------

// PREP: Place any number of loading videos in you `Videos` folder
// https://www.videezy.com/free-video/abstract-loop - check here for videos

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

    // Get a random video
    let video = getRandomVideo();

    // Only bother if we have a video
    if (!video) {
        return;
    }

    mainWindow.launchOverlay.bg.loadVideo(video);
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
