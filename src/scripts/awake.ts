import browser, { Idle, Runtime } from 'webextension-polyfill'
import SettingsStorage from './settingsStorage'
import { MsgEvent, PlayingMediaChangeEvent, SettingsData } from './types'

interface ActiveMedia {
    tabId?: number,
    videoSource: string | null,
    url: string | null,
    lastSeen: number
}

// Playing media is dropped if not re-announced within this time (content script heartbeat is 5s)
const mediaTimeout = 15000;

export default class Awake {
    idle: boolean
    private currentlyPlaying: Array<ActiveMedia>
    windowUnfocused: boolean
    private videoCheck: boolean

    constructor() {
        this.idle = false;
        this.currentlyPlaying = [];
        this.windowUnfocused = false;
        this.videoCheck = true;

        // Check initial window focus state
        browser.windows.getAll().then((windows) => {
            this.windowUnfocused = !windows.some(w => w.focused);
        }).catch(() => {
            this.windowUnfocused = true;
        });

        // Set up settings
        SettingsStorage.onChangeOrLoad((settings: SettingsData) => {
            browser.idle.setDetectionInterval(parseInt(settings.idleTimer as string));
            this.videoCheck = !!settings.videoCheck;
        });

        // Create events
        browser.idle.onStateChanged.addListener((state: Idle.IdleState) => {
            this.idle = state === 'locked' || state === 'idle';
        });

        // Keep track of which media sources are playing
        browser.runtime.onMessage.addListener((message: MsgEvent, sender: Runtime.MessageSender) => {
            if (message.type !== 'playingMedia') {
                return;
            }
            const media = (message as PlayingMediaChangeEvent).playingMedia;
            const tabId = sender.tab?.id;

            switch (media.state) {
                case 'playing': {
                    const existing = this.currentlyPlaying.find(item =>
                        item.tabId === tabId && item.videoSource === media.videoSource && item.url === media.url);
                    if (existing) {
                        existing.lastSeen = Date.now();
                    } else {
                        this.currentlyPlaying.push({
                            tabId,
                            videoSource: media.videoSource,
                            url: media.url,
                            lastSeen: Date.now()
                        });
                    }
                    break;
                }
                case 'paused':
                    // Remove the media if it matches
                    const sameMediaCheck = (item: ActiveMedia) =>
                        !(item.tabId === tabId && item.videoSource === media.videoSource && item.url === media.url);
                    this.currentlyPlaying = this.currentlyPlaying.filter(sameMediaCheck);
                    break;
                case 'stopAll':
                    // Remove all media for this tab (or all if no tabId)
                    this.currentlyPlaying = tabId !== undefined
                        ? this.currentlyPlaying.filter(item => item.tabId !== tabId)
                        : [];
                    break;
            }
        });

        // Clean up media sources when tabs close so they don't remain stuck
        browser.tabs.onRemoved.addListener((tabId: number) => {
            this.currentlyPlaying = this.currentlyPlaying.filter(item => item.tabId !== tabId);
        });

        browser.windows.onFocusChanged.addListener((windowId: number) => {
            this.windowUnfocused = windowId === browser.windows.WINDOW_ID_NONE;
        });
    }

    // Only media playing in the given (active) tab is relevant for keeping the timer running
    public isMediaPlaying(activeTab?: browser.Tabs.Tab): boolean {
        const activeTabId = activeTab?.id;
        if (!this.videoCheck || activeTabId === undefined) {
            return false;
        }
        // The browser itself reports whether the tab is making sound, which doesn't depend on content scripts
        if (activeTab?.audible) {
            return true;
        }
        const now = Date.now();
        this.currentlyPlaying = this.currentlyPlaying.filter(item => now - item.lastSeen < mediaTimeout);
        return this.currentlyPlaying.some(item => item.tabId === activeTabId);
    }

    public available(activeTab?: browser.Tabs.Tab): boolean {
        // If window is unfocused (user switched to another window/profile or another app),
        // timer should not count.
        if (this.windowUnfocused) {
            return false;
        }

        // When focused:
        // - Media playing in the active tab keeps the timer running even if hands-off (idle)
        // - Otherwise, only count if user is not idle
        return this.isMediaPlaying(activeTab) || !this.idle;
    }
}
