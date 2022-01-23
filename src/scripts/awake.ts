import { browser, Idle } from 'webextension-polyfill-ts'
import SettingsStorage from './settingsStorage'
import { MsgEvent, PlayingMedia, PlayingMediaChangeEvent, SettingsData } from './types'

export default class Awake {
    idle: boolean
    mediaPlaying: boolean
    windowUnfocused: boolean

    constructor() {
        this.idle = false;
        this.mediaPlaying = false;
        this.windowUnfocused = false;

        // Set up settings
        SettingsStorage.onChangeOrLoad((settings: SettingsData) => {
            browser.idle.setDetectionInterval(parseInt(settings.idleTimer as string));
            console.log('change')
        });

        // Create events
        browser.idle.onStateChanged.addListener((state: Idle.IdleState) => {
            this.idle = state === 'locked' || state === 'idle';
        });

        // Keep track of how many different media sources are playing
        let currentlyPlaying: Array<PlayingMedia> = [];
        browser.runtime.onMessage.addListener((message: MsgEvent) => {
            if (message.type !== 'playingMedia') {
                return;
            }
            const media = (message as PlayingMediaChangeEvent).playingMedia;

            switch (media.state) {
                case 'playing':
                    currentlyPlaying.push(media);
                    break;
                case 'paused':
                    // Remove the media if it matches
                    const sameMediaCheck = (item: PlayingMedia) => !(item.videoSource === media.videoSource && item.url === media.url);
                    currentlyPlaying = currentlyPlaying.filter(sameMediaCheck);
                    break;
                case 'stopAll':
                    // Remove all media
                    currentlyPlaying = [];
                    break;
            }

            this.mediaPlaying = currentlyPlaying.length !== 0;
            // console.log(media, currentlyPlaying.length)
        });

        browser.windows.onFocusChanged.addListener(async () => {
            let window = await browser.windows.getCurrent();
            this.windowUnfocused = !window.focused;
        });
    }

    public available(): boolean {
        // Always true if media playing
        // If idle or unfocused - false
        return this.mediaPlaying || !(this.idle || this.windowUnfocused);
    }
}