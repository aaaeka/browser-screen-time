import { browser, Idle } from 'webextension-polyfill-ts'
import { MsgEvent, PlayingMedia, PlayingMediaChangeEvent } from './types'

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
        browser.runtime.onMessage.addListener((message: MsgEvent) => {
            if (message.type !== 'playingMedia') {
                return;
            }
            const media = (message as PlayingMediaChangeEvent).playingMedia;

            if (media.state === 'playing') {
                currentlyPlaying.push(media);
            } else {
                currentlyPlaying = currentlyPlaying.filter((item: PlayingMedia) =>
                    item.videoSource !== media.videoSource &&
                    item.url !== media.url
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