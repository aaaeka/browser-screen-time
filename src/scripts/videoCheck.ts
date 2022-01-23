import { browser } from 'webextension-polyfill-ts'
import SettingsStorage from './settingsStorage'
import { PlayingMediaChangeEvent, SettingsData } from './types'

interface VideoElementWithEvents {
    elem: Element,
    play: EventListenerOrEventListenerObject,
    pause: EventListenerOrEventListenerObject,
    emptied: EventListenerOrEventListenerObject,
    unload: EventListenerOrEventListenerObject
}

let videoElements: Array<VideoElementWithEvents> = [];

function createEvents(): void {
    let videoElems = document.querySelectorAll('video:not(.bws-found)');
    console.log('video check inside');
    for (const elem of videoElems) {
        elem.classList.add('bws-found');
        const changeEvent = {
            type: 'playingMedia',
            playingMedia: {
                videoSource: elem.getAttribute('src'),
                url: location.hostname,
                state: null
            }
        };

        const onPlay = () => {
            changeEvent.playingMedia.state = 'playing';
            browser.runtime.sendMessage(changeEvent);
        };
        const onPause = () => {
            changeEvent.playingMedia.state = 'paused';
            browser.runtime.sendMessage(changeEvent);
        };
        const onEmptied = () => {
            changeEvent.playingMedia.state = 'paused';
            browser.runtime.sendMessage(changeEvent);
        };
        const onUnload = () => {
            changeEvent.playingMedia.state = 'paused';
            browser.runtime.sendMessage(changeEvent);
        };

        let videoElementWithListeners: VideoElementWithEvents = {
            elem: elem,
            play: onPlay,
            pause: onPause,
            emptied: onEmptied,
            unload: onUnload
        };

        elem.addEventListener('play', videoElementWithListeners.play);
        elem.addEventListener('pause', videoElementWithListeners.pause);
        elem.addEventListener('emptied', videoElementWithListeners.emptied);
        window.addEventListener('unload', videoElementWithListeners.unload);

        videoElements.push(videoElementWithListeners);
    }
}

function removeEvents(): void {
    for (const item of videoElements) {
        if (!item.elem) {
            continue;
        }

        item.elem.classList.remove('bws-found');

        item.elem.removeEventListener('play', item.play);
        item.elem.removeEventListener('pause', item.pause);
        item.elem.removeEventListener('emptied', item.emptied);
        window.removeEventListener('unload', item.unload);
    }
    videoElements = [];
}

const observer = new MutationObserver(createEvents);

SettingsStorage.onChangeOrLoad((settings: SettingsData) => {
    if (settings.videoCheck) {
        observer.observe(document.body, {
            subtree: true,
            childList: true
        });
    } else {
        observer.disconnect();
        removeEvents();

        const changeEvent: PlayingMediaChangeEvent = {
            type: 'playingMedia',
            playingMedia: {
                videoSource: null,
                url: null,
                state: 'stopAll'
            }
        }
        browser.runtime.sendMessage(changeEvent);
    }
});