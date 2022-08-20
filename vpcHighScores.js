import { console } from "helpers.js";

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

// Max number of VPC scores to show (-1 = all)
const maxScores = -1;

// Max number of scores to show on a card
const maxScoresPerCard = 5;

// Change to suit - try to keep to a common ratio (4:3, 16:9) or else it may look weird
const cardWidth = 800;
const cardHeight = 600;

// Show error messages
const showErrorMessage = true;
// ------------------------------------------
// END - Edit these values

function fetchData(game) {
    return new Promise((resolve, reject) => {
        const scores = [];
        const gameData = getGameData(game);
        let msg;

        if (!gameData.vpsid) {
            msg = 'No VPSID';
            console.log(`***** ${msg} for ${gameData.description}`);

            return resolve(msg);
        }

        const req = new HttpRequest();
        req.open('GET', `https://virtualpinballchat.com:6080/api/v1/scoresByVpsId?vpsId=${gameData.vpsid}`);
        req.setRequestHeader('Authorization', 'Bearer ODYwMzEwODgxNTc3NDY3OTA0.YN5Y8Q.0P5EwvlXHG6YOtNfkWKt_xOFTtc');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send().then(tables => {
            tables = JSON.parse(tables);

            console.log(`***** VPC High Scores for ${gameData.description} (${gameData.vpsid})`);

            if (!Array.isArray(tables)) {
                msg = 'Invalid response found';
                console.log(`***** ${msg}`);

                return resolve(msg);
            }

            const tableScores = tables[0].scores;
            if (!tableScores || !tableScores.length) {
                msg = 'No High Scores posted';
                console.log(`***** ${msg}`);

                return resolve(msg);
            }

            try {

                for (let i = 0; i < tableScores.length; i++) {
                    const score = tableScores[i];
                    if (!score.user) {
                        continue;
                    }

                    scores.push(`${
                        (i + 1).toString()
                    }) ${
                        score.user.username.slice(0, 20)
                    }     ${
                        score.score.toLocaleString()
                    } (v${
                        score.versionNumber
                    })`);
                }
            } catch (e) {
                console.log(`***** Bad data:`, e.message);

                return resolve(e.message);
            }

            return resolve(scores);
        }).catch(err => {
            console.log(`***** Error downloading data:`, err.message);

            return resolve(err.message);
        });
    });
}

const db = {};
function getGameData(gameInfo) {
    console.log('***** filename:', gameInfo.filename);
    console.log('***** dbFile:', gameInfo.dbFile);

    const gameData = db[gameInfo.filename];
    if (gameData) {
        console.log('***** Game fetched from cache:', gameInfo.displayName);
        return gameData;
    }

    // Open and read db xml file
    const fso = createAutomationObject("Scripting.FileSystemObject");
    const file = fso.OpenTextFile(gameInfo.dbFile, 1);
    const contents = file.ReadAll();

    // Parse xml
    const doc = createAutomationObject("MSXML2.DOMDocument");
    doc.loadXML(contents);

    // Select the node for the current game and get child nodes
    const node = doc.selectSingleNode('menu/game[@name="' + gameInfo.filename + '"]');
    const children = node.childNodes;

    // Add child nodes to object
    const gameObj = {};
    for (let i = 0; i < children.length; i++) {
        const item = children.item(i);
        gameObj[item.nodeName] = item.text;
    }

    // Add game details to in-memory db store (so we don't have to read the file repeatedly)
    db[gameInfo.filename] = gameObj;

    // Close the file
    file.Close();

    // Return the game details
    return db[gameInfo.filename];
}

// Create the Score Card window.  This is an especially simple
// one, since it doesn't need to display any automatic media:
// all of the graphics will be custom drawn in Javascript.
let vpcCardWin = mainWindow.createMediaWindow({
    title: "VPC High Score Card",
    configVarPrefix: "custom.vpcScoreCard",
    backgroundImageMediaType: "bg image",
});

// Create a drawing layer for our generated score card image
let vpcCardLayer = vpcCardWin.createDrawingLayer(1);

// When it's time to update the Score Card Window media,
// generate a new image based on the current game's high
// scores
let interval;
vpcCardWin.on("mediasyncload", ev => {
    // Check for previous interval cleanup
    if (interval) {
        clearInterval(interval);
    }

    // Draw a score card, given the game title, a headline,
    // and the score text.  We'll invoke this when a newly
    // selected game's high scores are retrieved.
    function drawScoreCard(title, headline, scores) {

        // Show error/info message
        if (!Array.isArray(scores)) {
            drawScorecardLayer(title, headline, scores);
            console.log('***** scores', scores);

            return;
        }

        console.log('***** scores', scores.length);

        // Get max amount of scores
        if (maxScores !== -1) {
            scores = scores.slice(0, maxScores - 1);
            console.log(`***** scores trimmed to maxScores length:`, scores.length);
        }

        // Show a single card
        if (scores.length <= maxScoresPerCard) {
            drawScorecardLayer(title, headline, scoresToString(scores));
            console.log(`***** drawing single scores card:`, scores.length);

            return;
        }

        // Split the scores into multiple cards
        const scoreSplit = Math.floor(scores.length / maxScoresPerCard);
        console.log(`***** scores split:`, scoreSplit);

        const tempScores = [];
        for (let i = 0; i < scoreSplit; i++) {
            const scoresSlice = scores.slice(i * maxScoresPerCard, i * maxScoresPerCard + maxScoresPerCard);
            console.log(`***** scores slice:`, JSON.stringify(scoresSlice));
            tempScores.push(scoresSlice);
        }

        // If we have remaining scores, add them
        if (scores.length % scoreSplit * maxScoresPerCard > 0) {
            const scoresRemaining = scores.slice(scoreSplit * maxScoresPerCard);
            console.log(`***** scores remaining:`, JSON.stringify(scoresRemaining));
            tempScores.push(scoresRemaining);
        }

        scores = tempScores;
        console.log(`***** scores reset:`, scores.length);

        // Start by showing the first group immediately
        drawScorecardLayer(title, headline, scoresToString(scores[0]));

        // Track the array index
        let index = 1;

        // Create an interval to update the apron card
        interval = setInterval(() => {
            // If we are at the end, go back to the start
            if (index === scores.length) {
                index = 0;
            }

            // Write the current group to the apron card
            drawScorecardLayer(title, headline, scoresToString(scores[index++]));
        }, cardDisplaySeconds * 1000);

    }

    function scoresToString(scores) {
        // translate the scores to HTML, changing special markup
        // characters to "&" equivalents, and then joining them
        // all together with line break (BR) tags
        return scores.map(
            s => s.replace(/</g, "&lt;").replace(/\s/g, "&nbsp;").replace(/&/g, "&")).join("<BR>");
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

        // By default, we'll display the graphics in a 800x600
        // canvas.  But if the layout is too tall for that, we'll
        // expand the window vertically to make room.  We'll keep
        // the aspect ratio of the window the same so that the
        // geometry isn't distorted, and we'll still fit the
        // layout to the same 800-pixel width within the larger
        // window, so that it maintains the same dimensions in
        // the final display.  So start by figuring the height
        // needed for the layout at 800 pixels wide.
        let windowSize = { width: cardWidth, height: cardHeight };
        let layoutRect = {
        x: 0,
        y: 0,
        width: windowSize.width,
        height: windowSize.height
        };
        let layoutSize = layout.measure(windowSize.width);

        // If the height is greater than our default 600 pixels,
        // make the window proportionally larger.
        if (layoutSize.height > windowSize.height) {
            windowSize.width *= layoutSize.height/windowSize.height;
            windowSize.height = layoutSize.height;
            layoutRect.height = layoutSize.height;
        }

        // Center the layout in the window
        layoutRect.x = (windowSize.width - layoutSize.width)/2;
        layoutRect.y = (windowSize.height - layoutSize.height)/2;

        // draw the window
        vpcCardLayer.draw(dc => {

        // Fill the background.
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
        console.log('***** ev.game fetch data:', ev.game.displayName)
        fetchData(ev.game).then(scores => {
            if (!Array.isArray(scores) && !showErrorMessage) {
                scores = '';
            }

            if (Array.isArray(scores) && !scores.length) {
                scores = 'No scores available';
            }

            // draw the score card graphics
            drawScoreCard(ev.game.title.toUpperCase(),
                "VPC HIGH SCORE CORNER", scores);
        });
    } else {
        // no game is selected; draw a generic placeholder
        drawScoreCard("PinballY", "Please select a game using the menus");
    }
});
