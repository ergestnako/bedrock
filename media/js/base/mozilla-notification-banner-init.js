/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var client = window.Mozilla.Client;

    var options = [
        {
            'id': 'direct-1',
            'heading': 'Your browser security is at risk.',
            'message': 'Update Firefox now to protect yourself from the latest malware.',
            'confirm': 'Update now',
            'url': '/firefox/new/?scene=2',
            'close': 'Close'
        },
        {
            'id': 'direct-2',
            'heading': 'Your Firefox is out-of-date.',
            'message': 'Get the most recent version to keep browsing securely.',
            'confirm': 'Update Firefox',
            'url': '/firefox/new/?scene=2',
            'close': 'Close'
        },
        {
            'id': 'foxy-1',
            'heading': 'Psst… it’s time for a tune up',
            'message': 'Stay safe and fast with a quick update.',
            'confirm': 'Update Firefox',
            'url': '/firefox/new/?scene=2',
            'close': 'Close'
        },
        {
            'id': 'foxy-2',
            'heading': 'Time to browse better!',
            'message': 'Get the latest version of Firefox for extra speed and safety.',
            'confirm': 'Update now',
            'url': '/firefox/new/?scene=2',
            'close': 'Close'
        }
    ];

    // Notification should only be shown to users on Firefox for desktop.
    if (client._isFirefoxDesktop) {
        client.getFirefoxDetails(function(details) {
            // Check that user is not up to date, on release channel and not on Firefox ESR.
            if (!details.isUpToDate && details.channel === 'release' && !details.isESR && details.accurate) {

                // Check that cookies are enabled before seeing if one already exists.
                if (typeof Mozilla.Cookies !== 'undefined' && Mozilla.Cookies.enabled()) {
                    var cookie = Mozilla.NotificationBanner.getCookie();

                    if (cookie) {
                        for (var i in options) {
                            if (options[i].id === cookie) {
                                Mozilla.NotificationBanner.init(options[i]);
                                break;
                            }
                        }
                    } else {
                        var choice = Math.floor(Math.random() * 4); // choose one of 4 variations.
                        Mozilla.NotificationBanner.init(options[choice]);
                    }
                }
            }
        });
    }
})();
