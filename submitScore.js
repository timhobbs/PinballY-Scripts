import { console } from "helpers.js";

const submitScore = command.allocate("SubmitScore");

// Add edit menu item and trigger vpx edit mode
mainWindow.on("menuopen", ev => { // when main menu is triggered
    if (ev.id === "pause game") {
        ev.addMenuItem(
            { after: command.ResumeGame },  // where should the new item be placed in menu?
            { title: "Submit Score", cmd: submitScore } // name of the new menu item
        );
    }
});

mainWindow.on("command", ev => {
    if (ev.id === submitScore) {  // if its triggered
        const activeWindow = mainWindow.getActiveWindow();
        console.log('***** submitScore window name:', activeWindow.name);

        activeWindow.setWindowPos(HWND.BOTTOM);

        console.log('***** submit score:', JSON.stringify(ev));
    }
});
