/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Create namespace
if (typeof Mozilla === 'undefined') {
    var Mozilla = {};
}

(function() {
    'use strict';

    var NotificationBanner = {};

    NotificationBanner.COOKIE_CODE_ID = 'mozilla-notification-banner';
    NotificationBanner.COOKIE_EXPIRATION_DAYS = 21; // default cookie expiry 21 days
    NotificationBanner.COOKIE_INTERACTION_VALUE = 'interacted';

    NotificationBanner.getCookie = function() {
        return Mozilla.Cookies.getItem(NotificationBanner.COOKIE_CODE_ID);
    };

    NotificationBanner.cookieExpiresDate = function(date) {
        var d = date || new Date();
        d.setTime(d.getTime() + (NotificationBanner.COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000));
        return d.toUTCString();
    };

    NotificationBanner.setCookie = function(value) {
        Mozilla.Cookies.setItem(NotificationBanner.COOKIE_CODE_ID, value, NotificationBanner.cookieExpiresDate(), '/');
    };

    NotificationBanner.doRedirect = function(target) {
        window.location.href = target;
    };

    NotificationBanner.close = function() {
        var notification = document.querySelector('.notification-banner');
        var close = notification.querySelector('.notification-banner-close');

        if (notification) {
            close.removeEventListener('click', NotificationBanner.close, false);
            document.body.removeChild(notification);
            NotificationBanner.setCookie(NotificationBanner.COOKIE_INTERACTION_VALUE);
        }
    };

    NotificationBanner.confirm = function(e) {
        // for control + click just set the cookie.
        if (e.metaKey || e.ctrlKey) {
            NotificationBanner.setCookie(NotificationBanner.COOKIE_INTERACTION_VALUE);
        }
        // else redirect after setting the cookie.
        else {
            e.preventDefault();
            NotificationBanner.setCookie(NotificationBanner.COOKIE_INTERACTION_VALUE);
            NotificationBanner.doRedirect(e.target);
        }
    };

    NotificationBanner.bind = function() {
        var confirm = document.querySelector('.notification-banner .notification-banner-confirm');
        var close = document.querySelector('.notification-banner .notification-banner-close');

        confirm.addEventListener('click', NotificationBanner.confirm, false);
        close.addEventListener('click', NotificationBanner.close, false);
    };

    NotificationBanner.create = function(opts) {

        var options = opts;

        if (typeof opts === 'object') {
            for (var i in opts) {
                if (opts.hasOwnProperty(i)) {
                    options[i] = opts[i];
                }
            }
        }

        if (typeof options.id !== 'string' ||
            typeof options.heading !== 'string' ||
            typeof options.message !== 'string' ||
            typeof options.confirm !== 'string' ||
            typeof options.url !== 'string' ||
            typeof options.close !== 'string') {
            return false;
        }

        var _notification = document.createDocumentFragment();
        var _container = document.createElement('div');
        var _content = document.createElement('div');
        var _contentContainer = document.createElement('div');
        var _heading = document.createElement('h2');
        var _message = document.createElement('p');
        var _confirm = document.createElement('a');
        var _close = document.createElement('button');

        _container.className = 'notification-banner';
        _content.className = 'content';
        _contentContainer.className = 'content-container';
        _heading.innerText = options.heading;
        _message.innerText = options.message;
        _confirm.className = 'notification-banner-confirm';
        _confirm.href = options.url;
        _confirm.innerText = options.confirm;
        _confirm.setAttribute('data-variation', options.id);
        _close.className = 'notification-banner-close';
        _close.innerText = options.close;

        _notification.appendChild(_container);
        _container.appendChild(_content);
        _content.appendChild(_contentContainer);
        _contentContainer.appendChild(_heading);
        _contentContainer.appendChild(_message);
        _contentContainer.appendChild(_confirm);
        _content.appendChild(_close);

        return _notification;
    };

    NotificationBanner.show = function(options) {
        var notification = NotificationBanner.create(options);

        if (notification) {
            document.body.insertBefore(notification, document.body.firstChild);
            NotificationBanner.bind();
            NotificationBanner.setCookie(options.id);
        }
    };

    NotificationBanner.cutsTheMustard = function() {
        return 'querySelector' in document &&
               'querySelectorAll' in document &&
               'addEventListener' in window &&
               'createDocumentFragment' in document;
    };

    NotificationBanner.init = function(options) {
        // Basic feature detection for showing the notification.
        if (NotificationBanner.cutsTheMustard() && typeof options === 'object') {
            // Only show notifications if cookies are supported.
            if (typeof Mozilla.Cookies !== 'undefined' && Mozilla.Cookies.enabled() && NotificationBanner.getCookie() !== NotificationBanner.COOKIE_INTERACTION_VALUE) {
                NotificationBanner.show(options);
            }
        }
    };

    window.Mozilla.NotificationBanner = NotificationBanner;
})();
