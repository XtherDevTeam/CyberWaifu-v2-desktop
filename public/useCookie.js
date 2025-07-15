const { app, session } = require('electron');


/**
 * electron15 后，跨域cookie无法携带，
 * 以下为解决办法
 */
function useCookie() {
    app.whenReady().then(() => {
        const filter = { urls: ['https://*/*', 'http://*/*'] };
        session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
            console.log('received headers', details.url, 'fucking electron')
            details.responseHeaders['Access-Control-Allow-Origin'] = [
                process.env.YOIMIYA === 'development' ? 'http://localhost:3000' : 'capacitor-electron://-'
            ]
            if (details.responseHeaders && details.responseHeaders['Set-Cookie']) {
                console.log(details.responseHeaders['Set-Cookie'])
                for (let i = 0; i < details.responseHeaders['Set-Cookie'].length; i++) {
                    details.responseHeaders['Set-Cookie'][i] += ';SameSite=None;Secure';
                    // store them using session.defaultSession.cookies.set()
                    let current = details.responseHeaders['Set-Cookie'][i].split(';')[0];
                    session.defaultSession.cookies.set({
                        url: details.url,
                        name: current.split('=')[0],
                        value: current.split('=')[1],
                        path: '/',
                        httpOnly: false,
                        sameSite: 'no_restriction',
                    });
                }
            }
            callback({ responseHeaders: details.responseHeaders });
        });
    });
}

function useCORS() {
    app.whenReady().then(() => {
        if (details.requestHeaders && details.requestHeaders['Origin']) {
            const filter = { urls: ['https://*/*'] };
            session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
                console.log('received mtherfker')
                details.requestHeaders['Origin'] = null;
                callback({ requestHeaders: details.requestHeaders })
            });
        }
    })
}

module.exports = {
    useCookie,
    useCORS
};