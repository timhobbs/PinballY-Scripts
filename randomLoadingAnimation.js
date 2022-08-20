import { disableMessaging, disableWheel } from 'env.js';

import { getRandomVideo } from 'helpers.js';

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
