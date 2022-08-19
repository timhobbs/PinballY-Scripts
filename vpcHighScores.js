const console = logfile;

mainWindow.on("gamestarted", ev => {
    const gameData = getGameData(ev.game);
    if (gameData.vpsid) {
        console.log('***** vpdsid:', gameData.vpsid);
    }
});

const db = {};
function getGameData(game) {
    console.log('***** filename:', game.filename);
    console.log('***** dbFile:', game.dbFile);

    const gameData = db[game.filename];
    if (gameData) {
        return gameData;
    }

    // Open and read db xml file
    const fso = createAutomationObject("Scripting.FileSystemObject");
    const file = fso.OpenTextFile(game.dbFile, 1);
    const contents = file.ReadAll();

    // Parse xml
    const doc = createAutomationObject("MSXML2.DOMDocument");
    doc.loadXML(contents);

    // Select the node for the current game and get child nodes
    const node = doc.selectSingleNode('menu/game[@name="' + game.filename + '"]');
    const children = node.childNodes;

    // Add child nodes to object
    const gameObj = {};
    for (let i = 0; i < children.length; i++) {
        const item = children.item(i);
        console.log('***** item', item.nodeName);
        console.log('***** item', item.text);
        gameObj[item.nodeName] = item.text;
    }

    // Add game details to in-memory db store (so we don't have to read the file repeatedly)
    db[game.filename] = gameObj;

    console.log('***** gameObj:', JSON.stringify(gameObj));

    // Return the game details
    return db[game.filename];
}
