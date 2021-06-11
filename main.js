const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require("path");
const isDev = require('electron-is-dev');

let mainWindow;
let splash;
let aboutWindow;

function createMainWindow() {
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
		splash.destroy();
		mainWindow.show();
	});
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}

function createWindow() {
	// Create splash screen
	splash = new BrowserWindow({ width: 480, height: 360, transparent: true, frame: false, alwaysOnTop: true, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
	splash.loadFile('splash.html');
	if (isDev) {
		splash.webContents.openDevTools();
	}
}

function createAboutWindow() {
	aboutWindow = new BrowserWindow({
		width: 480,
		height: 360,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
	});
	aboutWindow.loadFile('windows/about.html');
	aboutWindow.on('closed', function () {
		aboutWindow = null;
	});
	aboutWindow.removeMenu();
	if (isDev) {
		aboutWindow.openDevTools();
	}
}

function openDevTools(window) {
	window.webContents.openDevTools();
}

function relaunch() {
	// Configure the conformation dialog, storing the parameters in `options`
	const options = {
		type: 'question',
		buttons: ['Yes, relaunch', 'No, cancel'],
		defaultId: 1,
		title: 'Relaunch Confirmation',
		message: 'Are you sure you would like to relaunch the application?',
		detail: 'All processes will be immediately terminated.'
	};

	// Show the confirmation dialog and handle the response
	dialog.showMessageBox(null, options).then(response => {
		if (response.response === 0) {
			app.relaunch();
			app.exit();
		}
	})
}

const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Relaunch',
				click() {
					relaunch();
				}
			},
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
					createAboutWindow();
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

ipcMain.on('get-version', (event) => {
	event.sender.send('version', { version: app.getVersion() });
});

ipcMain.on('launch-app', () => {
	createMainWindow();
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
			event.sender.send('download-progress', { 'percent': data.percent });
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
		// During development, do not check for updates
		setTimeout(function () {
			event.sender.send('update-not-available');
		}, 5000);
	}
});

ipcMain.on('restart-app', () => {
	autoUpdater.quitAndInstall();
});