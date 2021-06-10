const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require("path");
const isDev = require('electron-is-dev');

let mainWindow;
let splash;

function createWindow() {
	// Create splash screen
	splash = new BrowserWindow({ width: 480, height: 360, transparent: true, frame: false, alwaysOnTop: true, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
	splash.loadFile('splash.html');
	splash.webContents.openDevTools();

	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
	});
	mainWindow.loadFile('index.html');
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	mainWindow.once('ready-to-show', () => {
		//splash.destroy();
		mainWindow.show();
	});
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

function openDevTools(window) {
	window.webContents.openDevTools();
}

const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				}
			}
		],
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Open Developer Tools',
				accelerator: process.platform == 'darwin' ? 'Command+Shift+I' : 'Ctrl+Shift+I',
				click() {
					openDevTools(mainWindow);
				}
			}
		],
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'About',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click() {
					about();
				}
			}
		]
	}
]

app.on('ready', () => {
	createWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('app_version', (event) => {
	event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('check-for-updates', (event) => {
	if (!isDev) {
		autoUpdater.checkForUpdates();
		autoUpdater.on('update-available', () => {
			event.sender.send('update-available');
		});
		autoUpdater.on('update-not-available', () => {
			event.sender.send('update-not-available');
		});
		autoUpdater.on('download-progress', (data) => {
			event.sender.send('download-progress', {'percent': data.percent});
		});
		autoUpdater.on('update-downloaded', () => {
			event.sender.send('update-downloaded');
		});
		autoUpdater.on('error', (error) => {
			event.sender.send('update-error');
			alert(error);
			console.log(error);
		});
	} else {
		event.sender.send('update-not-available');
	}
});

/*
autoUpdater.on('update-available', () => {
	mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
});*/

ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});