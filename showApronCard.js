// Copy pasta from Apron "Score Card" window
// http://mjrnet.org/pinscape/downloads/PinballY/Help/CustomMediaWindowExample.html

// Create the Score Card window.  This is an especially simple
// one, since it doesn't need to display any automatic media:
// all of the graphics will be custom drawn in Javascript.
let scoreCardWin = mainWindow.createMediaWindow({
    title: "Score Card",
    configVarPrefix: "custom.ScoreCard"
});

// Create a drawing layer for our generated score card image
let scoreCardLayer = scoreCardWin.createDrawingLayer(1);

// When it's time to update the Score Card Window media,
// generate a new image based on the current game's high
// scores
scoreCardWin.on("mediasyncload", ev => {
    // Draw a score card, given the game title, a headline,
    // and the score text.  We'll invoke this when a newly
    // selected game's high scores are retrieved.
    function drawScoreCard(title, headline, scores)
    {
        // translate the scores to HTML, changing special markup
        // characters to "&" equivalents, and then joining them
        // all together with line break (BR) tags
        scores = (scores || []).map(
            s => s.replace(/</g, "&lt;").replace(/&/g, "&")).join("<BR>");

        // set up the HTML layout
        let layout = new HtmlLayout(`
            <style>
            #outer {
              text-align: center;
              font: normal 16pt 'Komika Title';
              padding: 16px;
              color: black;
            }
            #outer div {
              padding: 1em;
              text-align: center;
            }
            #title { font-size: 30pt; }
            #headline { font-size: 24pt; }
            #scores { font-size: 18pt; }
            #footer { font-size: 24pt; }
            </style>
            <div id="outer">
               <div id="title">` + title + `</div>
               <div id="headline">` + headline + `</div>
               <div id="scores">` + scores + `</div>
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
            dc.fillRect(0, 0, sz.width, sz.height, 0xffffffff);

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