const { app, session } = require('electron');

/**
 * electron15 后，跨域cookie无法携带，
 * 以下为解决办法
 */
function useCookie() {
    app.whenReady().then(() => {
        const filter = { urls: ['https://*/*'] };
        session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
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
                        secure: true,
                        httpOnly: false,
                        sameSite: 'no_restriction',
                    });
                }
            }
            callback({ responseHeaders: details.responseHeaders });
        });
    });
}

module.exports = {
    useCookie,
};