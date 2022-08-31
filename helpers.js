export const console = logfile;

export const toggleWindows = (state) => {
    console.log('***** toggleWindows:', state);

    // Wait a few seconds before hiding so that any process looking for windows finds them
    // If we are toggling the windows back on just do it immediately...
    const delay = state ? 0 : 5000;
    setTimeout(() => {
        dmdWindow.showWindow(state);
        topperWindow.showWindow(state);
        backglassWindow.showWindow(state);
    }, delay);
};

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
};

export const Shell32 = dllImport.bind("Shell32.dll", `
    HINSTANCE ShellExecuteW(
        HWND    hwnd,
        LPCWSTR lpOperation,
        LPCWSTR lpFile,
        LPCWSTR lpParameters,
        LPCWSTR lpDirectory,
        INT     nShowCmd
    );
`);

const videoFiles = [];
export const getRandomVideo = () => {
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
};

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
