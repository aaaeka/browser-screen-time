import { browser, Idle } from 'webextension-polyfill-ts'
import { PlayingMedia } from './types'

export default class Awake {
    idle: boolean
    mediaPlaying: boolean
    windowUnfocused: boolean

    constructor() {
        this.idle = false;
        this.mediaPlaying = false;
        this.windowUnfocused = false;

        // Idle config
        const consideredIdleTime = 15; // Seconds
        browser.idle.setDetectionInterval(consideredIdleTime);

        // Create events
        browser.idle.onStateChanged.addListener((state: Idle.IdleState) => {
            this.idle = state == "locked" || state == "idle";
        });

        // Keep track of how many different media sources are playing
        let currentlyPlaying: Array<PlayingMedia> = [];
        browser.runtime.onMessage.addListener((message: PlayingMedia) => {
            if (message.state === 'playing') {
                currentlyPlaying.push(message);
            } else {
                currentlyPlaying = currentlyPlaying.filter((media: PlayingMedia) => 
                    media.videoSource !== message.videoSource &&
                    media.url !== message.url
                )
            }
            this.mediaPlaying = currentlyPlaying.length !== 0;
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