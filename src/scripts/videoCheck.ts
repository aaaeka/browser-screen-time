import browser from 'webextension-polyfill'
import SettingsStorage from './settingsStorage'
import { PlayingMediaChangeEvent, SettingsData } from './types'

interface VideoElementWithEvents {
    elem: HTMLVideoElement,
    play: EventListenerOrEventListenerObject,
    pause: EventListenerOrEventListenerObject,
    emptied: EventListenerOrEventListenerObject,
    pagehide: EventListenerOrEventListenerObject,
    volumechange: EventListenerOrEventListenerObject
}

let videoElements: Array<VideoElementWithEvents> = [];

// Interval at which currently playing videos are re-announced so the background
// state survives service worker restarts and missed events
const heartbeatIntervalTime = 5000;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const isAudible = (elem: HTMLVideoElement) => !elem.muted && elem.volume > 0;
const isPlayingAudibly = (elem: HTMLVideoElement) => !elem.paused && !elem.ended && isAudible(elem);

function createEvents(): void {
    const videoElems = document.querySelectorAll<HTMLVideoElement>('video:not(.bws-found)');
    for (const elem of videoElems) {
        elem.classList.add('bws-found');

        const getVideoSource = () => elem.currentSrc || elem.src || elem.getAttribute('src') || '';

        const sendMediaState = (state: 'playing' | 'paused') => {
            const changeEvent = {
                type: 'playingMedia',
                playingMedia: {
                    videoSource: getVideoSource(),
                    url: location.hostname,
                    state: state
                }
            };
            browser.runtime.sendMessage(changeEvent).catch(() => {});
        };

        const onPlay = () => {
            if (isAudible(elem)) {
                sendMediaState('playing');
            } else {
                sendMediaState('paused');
            }
        };

        const onPause = () => {
            sendMediaState('paused');
        };

        const onEmptied = () => {
            sendMediaState('paused');
        };

        const onPageHide = () => {
            sendMediaState('paused');
        };

        const onVolumeChange = () => {
            if (isPlayingAudibly(elem)) {
                sendMediaState('playing');
            } else {
                sendMediaState('paused');
            }
        };

        let videoElementWithListeners: VideoElementWithEvents = {
            elem: elem,
            play: onPlay,
            pause: onPause,
            emptied: onEmptied,
            pagehide: onPageHide,
            volumechange: onVolumeChange
        };

        elem.addEventListener('play', videoElementWithListeners.play);
        elem.addEventListener('pause', videoElementWithListeners.pause);
        elem.addEventListener('emptied', videoElementWithListeners.emptied);
        elem.addEventListener('volumechange', videoElementWithListeners.volumechange);
        // 'unload' is blocked by Permissions Policy on many sites, 'pagehide' is not
        window.addEventListener('pagehide', videoElementWithListeners.pagehide);

        videoElements.push(videoElementWithListeners);

        // The video may already be playing before listeners were attached
        if (isPlayingAudibly(elem)) {
            sendMediaState('playing');
        }
    }
}

function startHeartbeat(): void {
    if (heartbeatInterval !== null) {
        return;
    }
    heartbeatInterval = setInterval(() => {
        // Pick up videos that were added without triggering the observer
        createEvents();
        for (const item of videoElements) {
            if (isPlayingAudibly(item.elem)) {
                browser.runtime.sendMessage({
                    type: 'playingMedia',
                    playingMedia: {
                        videoSource: item.elem.currentSrc || item.elem.src || item.elem.getAttribute('src') || '',
                        url: location.hostname,
                        state: 'playing'
                    }
                }).catch(() => {});
            }
        }
    }, heartbeatIntervalTime);
}

function stopHeartbeat(): void {
    if (heartbeatInterval !== null) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
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
        item.elem.removeEventListener('volumechange', item.volumechange);
        window.removeEventListener('pagehide', item.pagehide);
    }
    videoElements = [];
}

const observer = new MutationObserver(createEvents);

SettingsStorage.onChangeOrLoad((settings: SettingsData) => {
    if (settings.videoCheck) {
        observer.disconnect();
        observer.observe(document.body, {
            subtree: true,
            childList: true
        });
        // Hook videos that already exist on the page
        createEvents();
        startHeartbeat();
    } else {
        observer.disconnect();
        stopHeartbeat();
        removeEvents();

        const changeEvent: PlayingMediaChangeEvent = {
            type: 'playingMedia',
            playingMedia: {
                videoSource: null,
                url: null,
                state: 'stopAll'
            }
        }
        browser.runtime.sendMessage(changeEvent).catch(() => {});
    }
});
