import { console, getRandomVideo } from 'helpers.js';
import { debug, defaultLaunchFileName, disableMessaging, disableWheel, useRandomVideo } from 'env.js';

// Note: The video play order is as follows:
//  Game specific
//  System
//  Default (if random = false)
//  Random

// Create the animation custom media type
gameList.createMediaType({
    id: 'animation',
    configId: 'animation',
    name: 'Loading Animation',
    menuOrder: 900,
    folder: 'Loading Animations',
    perSystem: true,
    format: 'Video',
    extensions: '.f4v .mp4 .mov .mpg .mkv .wmv .m4v .avi',
    hasDropButton: true,
    rotation: 180,
});

// DEBUG: Outputs list of tables and the animations for the table
if (debug) {
    const allGames = gameList.getAllGames();
    allGames
        .filter(game => game.isConfigured)
        .forEach(game => {
            console.log(
                `displayName: ${game.displayName}\n` +
                `animation:`
            );

            const animation = game.resolveMedia('animation', true);
            animation.forEach(a => console.log(`\t${a}`));
        });
}

// Listen for command so we can skip loading animations when capturing media
let currentCommand;
mainWindow.on('command', ev => {
    currentCommand = ev.name;
    console.log(`***** launchAnimations command:`, currentCommand);
});

mainWindow.on("launchoverlayshow", (ev) => {
    // Skip if we are capturing media
    if (currentCommand.startsWith('Capture') || currentCommand.startsWith('Batch')) {
        return;
    }

    // Get the current game info
    const gameInfo = ev.game;

    // Don't proceed if game is not configured
    if (!gameInfo.isConfigured) {
        return;
    }

    // Get the first animation match
    let animation = gameInfo.resolveMedia('animation', true)[0];
    if (!animation) {
        // If we did not have an animation then use the default
        animation = getVideo(gameInfo.system);
    }

    // If we STILL don't have an animation do not proceed
    if (!animation) {
        return;
    }

    // Load the animation
    mainWindow.launchOverlay.bg.loadVideo(animation);

    // Do not continue normal processing
    ev.preventDefault();
});

mainWindow.on("gamestarted", (ev) => {
    console.log(`***** launchAnimations gamestarted`);
    // const processes = getRunningProcesses();
    // processes.forEach(p => console.log(`*****: ${p}`));

    // Clear the overlay when the game starts
    // Until we can get something proper in place (to know the window is open)
    // we'll just put an artifical delay here
    const delay = 5000;
    setTimeout(() => {
        mainWindow.launchOverlay.bg.clear(0xff000000);
    }, delay);
});

mainWindow.on("launchoverlaymessage", (ev) => {
    console.log(`***** launchAnimations launchoverlaymessage`);

    // Set wheel display
    ev.hideWheelImage = disableWheel;

    // Hide loading messages only
    if (['terminating', 'gameover', 'after'].includes(ev.id)) {
        return;
    }

    // Set messages
    ev.message = disableMessaging ? '' : ev.message;
});

function getSystemVideo(system) {
    console.log(`***** launchAnimations game-specific video: ${system.displayName}`);
    return gameList.resolveMedia('Videos', system.displayName, 'video');
}

function getVideo(system) {
    const systemVideo = getSystemVideo(system);
    if (systemVideo) {
        return systemVideo;
    }

    if (!useRandomVideo) {
        console.log(`***** launchAnimations default video: ${defaultLaunchFileName}`);
        return gameList.resolveMedia('Videos', defaultLaunchFileName, 'video');
    }

    return getRandomVideo();
}
