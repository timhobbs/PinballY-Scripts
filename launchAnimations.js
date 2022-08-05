// START - Edit these values
// ------------------------------------------

// The name of the default launch animation
// This should be in your `Videos` folder
const defaultLaunchFileName = '[YOUR_FILE_NAME_HERE]';

// Use a random video
// If this is `true` then the default file above is ignored
const useRandomVideo = true

// Whether or not to disable the wheel image when the animation plays
const disableWheel = true;

// Whether or not to disable the messaging when the animation plays
const disableMessaging = true;

// Uncomment the second line if you want to enable logging output
let console = { log: () => {} };
// console = logfile;

// Check to `true` if you want to output table animation details to the log
const debug = false;

// ------------------------------------------
// END - Edit these values

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
    // const processes = getRunningProcesses();
    // processes.forEach(p => console.log(`*****: ${p}`));

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

function getSystemVideo(system) {
    console.log(`***** game-specific video: ${system.displayName}`);
    return gameList.resolveMedia('Videos', system.displayName, 'video');
}

function getVideo(system) {
    const systemVideo = getSystemVideo(system);
    if (systemVideo) {
        return systemVideo;
    }

    if (!useRandomVideo) {
        console.log(`***** default video: ${defaultLaunchFileName}`);
        return gameList.resolveMedia('Videos', defaultLaunchFileName, 'video');
    }

    return getRandomVideo();
}

const videoFiles = [];
function getRandomVideo() {
    // Get all the files in the folder
    if (!videoFiles.length) {
        const fso = createAutomationObject("Scripting.FileSystemObject");
        const files = fso.GetFolder(fso.GetAbsolutePathName('../Media/Videos')).Files;
        for (let file of files) {
            videoFiles.push(file.Name);
        }
    }

    const randomVideoFile = videoFiles[getRandomInt(videoFiles.length)];
    console.log(`***** random video: ${randomVideoFile}`);
    return gameList.resolveMedia('Videos', randomVideoFile);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRunningProcesses() {
    const processes = [];
    const locator = createAutomationObject("WbemScripting.SWbemLocator");
    const service = locator.ConnectServer(".", "root\cimv2");
    service.Security_.ImpersonationLevel = 3
    const processCollection = service.ExecQuery("SELECT * FROM Win32_Process");
    for (let process of processCollection) {
        processes.push(process.Name)
    }

    return processes;
}
