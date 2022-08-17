// Copy pasta from Apron "Score Card" window
// http://mjrnet.org/pinscape/downloads/PinballY/Help/CustomMediaWindowExample.html

// START - Edit these values
// ------------------------------------------
// These alter the font sizes for the various card text
const titleSize = 40;
const headlineSize = 32;
const scoresSize = 26;
const footerSize = 32;
const defaultSize = 24;

// The font family to use for the score card
const fontFamily = 'Komika Title';

// Padding for the score card
const padding = 10;

// Change this value to display the card for longer or shorter intervals
const cardDisplaySeconds = 3;

// If you are adventurous you can modify the alpha/color
// See https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4 for helpful alpha values
const cardBgColor = 0xBF000000;
// ------------------------------------------
// END - Edit these values

const console = logfile;
let interval;

// Create the Score Card window.  This is an especially simple
// one, since it doesn't need to display any automatic media:
// all of the graphics will be custom drawn in Javascript.
let scoreCardWin = mainWindow.createMediaWindow({
    title: "Score Card",
    configVarPrefix: "custom.ScoreCard",
    backgroundImageMediaType: "bg image",
});

// Create a drawing layer for our generated score card image
let scoreCardLayer = scoreCardWin.createDrawingLayer(1);

// When it's time to update the Score Card Window media,
// generate a new image based on the current game's high
// scores
scoreCardWin.on("mediasyncload", ev => {
    // Check for previous interval cleanup
    if (interval) {
        clearInterval(interval);
    }

    // Draw a score card, given the game title, a headline,
    // and the score text.  We'll invoke this when a newly
    // selected game's high scores are retrieved.
    function drawScoreCard(title, headline, scores) {
        // translate the scores to HTML, changing special markup
        // characters to "&" equivalents, and then joining them
        // all together with line break (BR) tags
        scores = (scores || []).map(
            s => s.replace(/</g, "&lt;").replace(/&/g, "&")).join("<BR>");

        // Check for double break - this usually means a new "group" of scores
        // So we'll split into different groups and show each group for a set
        // amount of time (configurable above)
        if (scores.includes('<BR><BR>')) {
            scores = scores.split('<BR><BR>');
        }

        if (!Array.isArray(scores)) {
            // IF we don't have groups just show the scores
            drawScorecardLayer(title, headline, scores);
        } else {
            // Start by showing the first group immediately
            drawScorecardLayer(title, headline, scores[0]);

            // Track the array index
            let index = 1;

            // Create an interval to update the apron card
            interval = setInterval(() => {
                // If we are at the end, go back to the start
                if (index === scores.length) {
                    index = 0;
                }

                // Write the current group to the apron card
                drawScorecardLayer(title, headline, scores[index++]);
            }, cardDisplaySeconds * 1000);
        }
    }

    function drawScorecardLayer(title, headline, scores) {
        // set up the HTML layout
        let layout = new HtmlLayout(`
        <style>
        #outer {
        text-align: center;
        font-size: ${defaultSize}pt;
        font-family: ${fontFamily};
        padding: ${padding}px;
        color: white;
        }
        #outer div {
        padding: 1em;
        text-align: center;
        }
        #title { font-size: ${titleSize}pt; font-weight: bold; text-decoration: underline; }
        #headline { font-size: ${headlineSize}pt; font-weight: bold; }
        #scores { font-size: ${scoresSize}pt; }
        #footer { font-size: ${footerSize}pt; }
        </style>
        <div id="outer">
        <div id="title">${title}</div>
        <div id="headline">${headline}</div>
        <div id="scores">${scores}</div>
        <div id="footer">FOR AMUSEMENT ONLY</div>
        </div>`);

        // By default, we'll display the graphics in a 640x480
        // canvas.  But if the layout is too tall for that, we'll
        // expand the window vertically to make room.  We'll keep
        // the aspect ratio of the window the same so that the
        // geometry isn't distorted, and we'll still fit the
        // layout to the same 640-pixel width within the larger
        // window, so that it maintains the same dimensions in
        // the final display.  So start by figuring the height
        // needed for the layout at 640 pixels wide.
        let windowSize = { width: 640, height: 480 };
        let layoutRect = {
        x: 0,
        y: 0,
        width: windowSize.width,
        height: windowSize.height
        };
        let layoutSize = layout.measure(windowSize.width);

        // If the height is greater than our default 480 pixels,
        // make the window proportionally larger.
        if (layoutSize.height > windowSize.height)
        {
        windowSize.width *= layoutSize.height/windowSize.height;
        windowSize.height = layoutSize.height;
        layoutRect.height = layoutSize.height;
        }

        // Center the layout in the window
        layoutRect.x = (windowSize.width - layoutSize.width)/2;
        layoutRect.y = (windowSize.height - layoutSize.height)/2;

        // draw the window
        scoreCardLayer.draw(dc => {

        // Fill the background with solid opaque white.  If you
        // prefer to use custom graphics from a PNG or JPEG file
        // for the background fill, you can replace this with
        // a call to drawImage().
        let sz = dc.getSize();
        dc.fillRect(0, 0, sz.width, sz.height, cardBgColor);

        // draw the HTML layout
        layout.draw(dc, layoutRect);

        }, windowSize.width, windowSize.height);
    }

    // If there's a game, get its high score list and use it
    // to generate the score card.  If not, generate a default
    // placeholder card instead.
    if (ev.game) {
        // retrieve the high scores
        ev.game.getHighScores().then(
            scores => {
                // got 'em - draw the score card graphics
                drawScoreCard(ev.game.title.toUpperCase(),
                    "FREE PLAY - PRESS START", scores);
            },
            error => {
                // error - just draw a generic Free Play card
                drawScoreCard(ev.game.title.toUpperCase(),
                    "FREE PLAY - PRESS START");
            }
        );
    }
    else {
        // no game is selected; draw a generic placeholder
        drawScoreCard("PinballY", "Please select a game using the menus");
    }
});
