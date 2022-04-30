// START - Edit these values
// ------------------------------------------

// The name of the default launch animation
// This should be in you `Videos` folder
const defaultLaunchFileName = 'homeplayfieldsamplevideos';

// Whethar or not to disable the wheel image when thew animation plays
const disableWheel = true;

// Whethar or not to disable the messaging when thew animation plays
const disableMessaging = true;

// ------------------------------------------
// END - Edit these values

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

mainWindow.on("launchoverlayshow", (ev) => {
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
        animation = gameList.resolveMedia('Videos', defaultLaunchFileName, 'video');
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
    // Clear the overlay when the game starts
    mainWindow.launchOverlay.bg.clear(0xff000000);
});

mainWindow.on("launchoverlaymessage", (ev) => {
    // Set wheel display
    ev.hideWheelImage = disableWheel;

    // Hide loading messages only
    if (['terminating', 'gameover', 'after'].includes(ev.id)) {
        return;
    }

    // Set messages
    ev.message = disableMessaging ? '' : ev.message;
});
