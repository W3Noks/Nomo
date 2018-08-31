const electron = require('electron')
const path = require('path')
const url = require('url')

process.env.NODE_ENV = 'development'

const {app, BrowserWindow, Menu, ipcMain, globalShortcut, shell} = electron

let mainMenuTemplate, mainWindow

function isMac() {
    return process.platform == 'darwin'
}

app.on('ready', start)

app.on('closed', stop)

ipcMain.on('app->quit', (e, arg) => {
    console.log(arg)
    stop()
})

function stop() {
    mainWindow = null
    app.quit()
}

function start() {
    shell.openItem(`file://${__dirname}/create_nomo_source_folder.bat`)

    mainWindow = new BrowserWindow({
        show: false,
        width: 992,
        frame: false,
        opacity: 0.95,
        resizable: false,
        webPreferences: {
          nativeWindowOpen: true
        }
    })

    let loadingWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        transparent: true,
        opacity: 0.9
    })

    let preferencesWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 400,
        frame: false,
        parent: mainWindow,
        modal: true,
        alwaysOnTop: true
    })

    loadingWindow.loadURL(`file://${__dirname}/src/loadingWindow.html`)
    preferencesWindow.loadURL(`file://${__dirname}/src/setPreferences.html`)
    mainWindow.loadURL(`file://${__dirname}/src/index.html`)

    ipcMain.on('app->dirname.message', (e, arg) => {
        e.sender.send('app->dirname.reply', app.getPath('documents'))
    })
    ipcMain.on('ready-to-show', () => {
        setTimeout(() => {
            loadingWindow.destroy()
            mainWindow.show()
        }, 300)
    })
    ipcMain.on('first-connection', () => {
        preferencesWindow.show()
    })
    ipcMain.on('preferences->set', (e, arg) => {
        mainWindow.show()
        preferencesWindow.close()
        stop()
    })


    buildMainMenu()
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)


    globalShortcut.register('CmdOrCtrl+Down', () => {
        mainWindow.minimize()
    })
    globalShortcut.register('CmdOrCtrl+Up', () => {
        mainWindow.restore()
    })


}

function buildMainMenu() {
     mainMenuTemplate = []
/*        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Quitter',
                    accelerator: 'CmdOrCtrl+Q',
                    click() {
                        app.quit()
                    }
                }
            ]
        }
    ] */

    if (isMac()) mainMenuTemplate.unshift({})
    
    if (process.env.NODE_ENV == 'development') {
        mainMenuTemplate.push({
            label: 'Outils de développement',
            submenu: [
                {
                    label: 'Recharger',
                    role: 'reload',
                },
                {
                    label: 'Console de développement',
                    accelerator: 'CmdOrCtrl+I',
                    click(i, activeWindow) {
                        activeWindow.toggleDevTools()
                    }
                }
            ]
        })
    }
}