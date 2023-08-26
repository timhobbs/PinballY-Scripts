import 'launchAnimations.js';
import 'tableEdit.js';
import 'forceCapture.js';
// import 'gameEvents.js';
import 'showApronCard.js';
import 'vpcHighScores.js';
import 'submitScore.js';
import 'mediaCapture.js';

import { console } from 'helpers.js';

// import 'randomLoadingAnimation.js';
// import 'launchLoadingVideo.js';

const debug = true;

// Log commands
if (debug) {
    // const console = logfile;
    mainWindow.on('command', ev => {
        console.log(`***** currentCommand: ${ev.name}`);
    });
}
