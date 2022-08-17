# PinballY-Scripts

## What scripts?

- `launchAnimations`: adds custom media for loading animations
- `launchLoadingVideo`: displays a single loading animation file for all tables
- `randomLoadingAnimations`: displays a random file from `Videos` for loading animation
- `showApronCard`: adds a new apron card screen that displays high scores for tables
- `toggleDmdWindow`: toggles the DMD window off when a table is started

## How do I set it up?

### Loading Animations

Unfortuantely PBY doesnt support rotation for video (though I openened a bug because I think it should have been enabled) so you will need to rotate videos to portrait mode. Loading animations on VPU are not setup so I have included a batch file that can re-orient them properly for now. Hopefully PBY will be updated to allow custom media rotation so that the videos won't need to be processed. The updside: running the videos through `ffmpeg` to re-orient them reduces the file size pretty significantly in most cases, but I don't really notice any serious lack of quality or anything. YMMV...

To use the batch file you will need to alter the path to `ffmpeg`. The batch file is intended to be ran from a subfolder so it doesn't overwrite the video files, but you can also change that is you wish. The custom media is setup per-system (FP, VP9, VPX, etc.) with a folder name of `Loading Animations`. To use the batch file you will first want to add/navigate to the proepr folder (e.g., `Media\Visual Pinball X\Loading Animations`) and add a subfolder (any name will do; I chose `to-fix`) and add the animation videos to rotate as well as the batch file.

![to-fix](./images/to-fix.png)

Then, simply double click the batch file and all the videos will be re-oriented and saved into the parent directory where PBY can access them. Oncethe process is complete you can remove the videos from `to-fix` (or whatever you named the folder) but keep the batch file there for later, just in case...


![loading-animations](./images/loading-animations.png)

### Getting it working

1. Add the script to your `main.js`
    ```
    import 'launchAnimations.js';
    ```
2. Edit the `launchAnimations.js` file to set the values as you like. At a minimum you will want to change the default video name if you want a default loading animation to play.
    ```
    // START - Edit these values
    // ------------------------------------------

    // The name of the default launch animation
    // This should be in you `Videos` folder
    const defaultLaunchFileName = 'playfield.mp4';

    // Use a random video
    // If this is `true` then the default file above is ignored
    const useRandomVideo = true

    // Whether or not to disable the wheel image when the animation plays
    const disableWheel = true;

    // Whether or not to disable the messaging when the animation plays
    const disableMessaging = true;

    // ------------------------------------------
    // END - Edit these values
    ```
3. Run PinballY

## Additional Scripts

### Show Apron Card

Originally a copy/paste of the suggestion in the help docs, this morphed a bit to show parsed score information and cycle thru the scores when there are multiple score "groups". It was also modified to allow for some simple customizations for those that are not JS savvy or are not comfortable editing scripts.

#### Examples

**Multiple Groups**

![avg-1.png](./images/avg-1.png)

![avg-2.png](./images/avg-2.png)

**No High Score Info**

![bgs-1.png](./images/bgs-1.png)

### Toggle DMD Window

I was haviing some weird behavior with my FUllDMD and any PuP packs where the PBY DMD would display a black screen over the top of the PuP pack making it so the PuP animation/image would not show. This was a quick script I created to toggle the PBY DMD off when a game starts and toggle it back on when the game ends.

## Additonal Menu Items

![pby-edit-menu](./images/pby-edit-menu.png)

- `tableEdit.js`: will add a menu item to allow you to enter camera edit mode in VPX
- `forceCapture.js`: bypasses the normal media capture flow to use the same previous settings for the current capture (e.g., if you have selected to capture the table image and dmd image, then those will be the settings used for the force capture)

### Table Edit

You will want to alter the script to point to the location of your `table-edit.bat` file (included in the repo). You will also want to edit the batch file to point to your VPX install location.

## Media Processing

I have included a batch files to process media:

- `to-mp4.bat`: converts `.mov` files to `.mp4`
