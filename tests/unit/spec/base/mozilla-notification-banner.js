/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: https://jasmine.github.io/2.0/introduction.html
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global describe, beforeEach, afterEach, it, expect, sinon */

describe('mozilla-notification-banner.js', function() {

    'use strict';

    beforeEach(function() {
        // stub out Mozilla.Cookie lib
        window.Mozilla.Cookies = sinon.stub();
        window.Mozilla.Cookies.enabled = sinon.stub().returns(true);
        window.Mozilla.Cookies.setItem = sinon.stub();
        window.Mozilla.Cookies.getItem = sinon.stub();
        window.Mozilla.Cookies.hasItem = sinon.stub();
    });

    describe('init', function() {

        var options = {};

        it('should call show() if cookie does not exist', function() {
            spyOn(Mozilla.NotificationBanner, 'cutsTheMustard').and.returnValue(true);
            spyOn(Mozilla.NotificationBanner, 'getCookie').and.returnValue(null);
            spyOn(Mozilla.NotificationBanner, 'show');
            Mozilla.NotificationBanner.init(options);
            expect(Mozilla.NotificationBanner.show).toHaveBeenCalled();
        });

        it('should call show() if cookie value does not equal "interacted', function() {
            spyOn(Mozilla.NotificationBanner, 'cutsTheMustard').and.returnValue(true);
            spyOn(Mozilla.NotificationBanner, 'getCookie').and.returnValue('foo');
            spyOn(Mozilla.NotificationBanner, 'show');
            Mozilla.NotificationBanner.init(options);
            expect(Mozilla.NotificationBanner.show).toHaveBeenCalled();
        });

        it('should not call show() if cookie has value equals "interacted"', function() {
            spyOn(Mozilla.NotificationBanner, 'cutsTheMustard').and.returnValue(true);
            spyOn(Mozilla.NotificationBanner, 'getCookie').and.returnValue(Mozilla.NotificationBanner.COOKIE_INTERACTION_VALUE);
            spyOn(Mozilla.NotificationBanner, 'show');
            Mozilla.NotificationBanner.init(options);
            expect(Mozilla.NotificationBanner.show).not.toHaveBeenCalled();
        });

        it('should not call show() if options is undefined', function() {
            spyOn(Mozilla.NotificationBanner, 'cutsTheMustard').and.returnValue(true);
            spyOn(Mozilla.NotificationBanner, 'getCookie').and.returnValue('foo');
            spyOn(Mozilla.NotificationBanner, 'show');
            Mozilla.NotificationBanner.init(undefined);
            expect(Mozilla.NotificationBanner.show).not.toHaveBeenCalled();
        });

        it('should not call show() if browser is not supported', function() {
            spyOn(Mozilla.NotificationBanner, 'cutsTheMustard').and.returnValue(false);
            spyOn(Mozilla.NotificationBanner, 'getCookie').and.returnValue('foo');
            spyOn(Mozilla.NotificationBanner, 'show');
            Mozilla.NotificationBanner.init(options);
            expect(Mozilla.NotificationBanner.show).not.toHaveBeenCalled();
        });
    });

    describe('show', function() {

        it('should display the notification and set a cookie', function() {
            var options = {
                'id': 'Foxy 1',
                'heading': 'Psst… it’s time for a tune up',
                'message': 'Stay safe and fast',
                'confirm': 'Update Firefox',
                'url': '/firefox/new/?scene=2',
                'close': 'Close'
            };

            spyOn(Mozilla.NotificationBanner, 'bind');
            spyOn(Mozilla.NotificationBanner, 'setCookie');
            Mozilla.NotificationBanner.show(options);

            var notification = document.querySelector('.notification-banner');

            expect(notification).not.toEqual(null);
            expect(Mozilla.NotificationBanner.bind).toHaveBeenCalled();
            expect(Mozilla.NotificationBanner.setCookie).toHaveBeenCalledWith(options.id);
            document.body.removeChild(notification);
        });

        it('should not display the notification if options are not satisfied', function() {
            var options = {
                'heading': 'Psst… it’s time for a tune up',
                'message': undefined,
                'url': '/firefox/new/?scene=2',
                'close': 'Close'
            };

            spyOn(Mozilla.NotificationBanner, 'bind');
            spyOn(Mozilla.NotificationBanner, 'setCookie');
            Mozilla.NotificationBanner.show(options);
            expect(document.querySelector('.notification-banner')).toEqual(null);
            expect(Mozilla.NotificationBanner.bind).not.toHaveBeenCalled();
            expect(Mozilla.NotificationBanner.setCookie).not.toHaveBeenCalled();
        });

        it('should not display the notification if options are missing', function() {
            var options = {
                // id is misssing
                'heading': 'Psst… it’s time for a tune up',
                'message': 'Stay safe and fast',
                'url': '/firefox/new/?scene=2',
                'close': 'Close'
            };

            spyOn(Mozilla.NotificationBanner, 'bind');
            spyOn(Mozilla.NotificationBanner, 'setCookie');
            Mozilla.NotificationBanner.show(options);
            expect(document.querySelector('.notification-banner')).toEqual(null);
            expect(Mozilla.NotificationBanner.bind).not.toHaveBeenCalled();
            expect(Mozilla.NotificationBanner.setCookie).not.toHaveBeenCalled();
        });

    });

    describe('create', function() {

        it('should return a properly formed notification DOM element', function() {
            var options = {
                'id': 'Foxy 1',
                'heading': 'Psst… it’s time for a tune up',
                'message': 'Stay safe and fast',
                'confirm': 'Update Firefox',
                'url': '/firefox/new/?scene=2',
                'close': 'Close'
            };

            var notification = Mozilla.NotificationBanner.create(options);

            expect(notification.querySelector('h2').innerText).toEqual(options.heading);
            expect(notification.querySelector('p').innerText).toEqual(options.message);
            expect(notification.querySelector('a').innerText).toEqual(options.confirm);
            expect(notification.querySelector('a').href).toContain(options.url);
            expect(notification.querySelector('button').innerText).toEqual(options.close);
        });

        it('should return false if any of the options are not satisfied', function() {
            var options = {
                'id': 'Foxy 1',
                'heading': 'Psst… it’s time for a tune up',
                'message': 'Stay safe and fast',
                'confirm': 'Update Firefox',
                'url': undefined,
                'close': 'Close'
            };

            var notification = Mozilla.NotificationBanner.create(options);

            expect(notification).toBeFalsy();
        });
    });

    describe('confirm', function() {

        it('should set a cookie before redirecting for regular click', function() {
            var event = {
                'metaKey': false,
                'ctrlKey': false,
                'target': '/firefox/new/?scene=2',
                'preventDefault': function () {}
            };

            spyOn(Mozilla.NotificationBanner, 'setCookie');
            spyOn(Mozilla.NotificationBanner, 'doRedirect');
            spyOn(event, 'preventDefault');
            Mozilla.NotificationBanner.confirm(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(Mozilla.NotificationBanner.setCookie).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_INTERACTION_VALUE);
            expect(Mozilla.NotificationBanner.doRedirect).toHaveBeenCalledWith(event.target);
        });

        it('should only set cookie for control click', function() {
            var event = {
                'metaKey': false,
                'ctrlKey': true,
                'target': '/firefox/new/?scene=2',
                'preventDefault': function () {}
            };

            spyOn(Mozilla.NotificationBanner, 'setCookie');
            spyOn(Mozilla.NotificationBanner, 'doRedirect');
            spyOn(event, 'preventDefault');
            Mozilla.NotificationBanner.confirm(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(Mozilla.NotificationBanner.setCookie).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_INTERACTION_VALUE);
            expect(Mozilla.NotificationBanner.doRedirect).not.toHaveBeenCalled();
        });
    });

    describe('close', function() {

        var notification;

        beforeEach(function() {
            var options = {
                'id': 'Foxy 1',
                'heading': 'Psst… it’s time for a tune up',
                'message': 'Stay safe and fast',
                'confirm': 'Update Firefox',
                'url': '/firefox/new/?scene=2',
                'close': 'Close'
            };

            spyOn(Mozilla.NotificationBanner, 'bind');
            Mozilla.NotificationBanner.show(options);
            notification = document.querySelector('.notification-banner');
            expect(notification).not.toEqual(null);
            expect(Mozilla.NotificationBanner.bind).toHaveBeenCalled();
        });

        it('should remove the notification from the DOM and set a cookie', function() {
            spyOn(Mozilla.NotificationBanner, 'setCookie');
            Mozilla.NotificationBanner.close();
            expect(notification).not.toEqual(null);
            expect(Mozilla.NotificationBanner.setCookie).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_INTERACTION_VALUE);
        });
    });

    describe('setCookie', function() {

        it('should set a cookie as expected', function() {
            spyOn(Mozilla.Cookies, 'setItem');
            Mozilla.NotificationBanner.setCookie('foo');
            expect(Mozilla.Cookies.setItem).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_CODE_ID, 'foo', jasmine.any(String), '/');
        });
    });

    describe('cookieExpiresDate', function() {

        it('should return a cookie expiry date 21 days in the future by default', function() {
            var expiry = Mozilla.NotificationBanner.cookieExpiresDate(new Date(2017, 6, 1, 10, 15));
            var date = new Date(expiry);
            expect(date.getFullYear()).toBe(2017);
            expect(date.getMonth()).toBe(6);
            expect(date.getDate()).toBe(22);
        });
    });

    describe('getCookie', function() {

        it('should return value if the cookie exists', function() {
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue('foo');
            var cookie = Mozilla.NotificationBanner.getCookie();
            expect(Mozilla.Cookies.getItem).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_CODE_ID);
            expect(cookie).toEqual('foo');
        });

        it('should return null if the cookie does not exist', function() {
            spyOn(Mozilla.Cookies, 'getItem').and.returnValue(null);
            var cookie = Mozilla.NotificationBanner.getCookie();
            expect(Mozilla.Cookies.getItem).toHaveBeenCalledWith(Mozilla.NotificationBanner.COOKIE_CODE_ID);
            expect(cookie).toEqual(null);
        });
    });
});
