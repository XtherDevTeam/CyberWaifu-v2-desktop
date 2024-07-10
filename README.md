# CyberWaifu V2 Desktop Client

This is the desktop client for CyberWaifu V2 made with Electron and React.

### Running the app

To run the app, you need to have Node.js and npm installed on your machine.

```sh
npm install
# start the server
npm run start
# in another terminal, run electron
YOIMIYA=development npm run electron-start
```

The app will start on `http://localhost:3000`.

### Building the app

To build the app, run:

```sh
# build the app
npm run build
# package the app for distribution
npx electron-builder
```

Then, you shall be able to find the packaged app in the `dist` folder.

### License

This project is licensed under the MIT license.