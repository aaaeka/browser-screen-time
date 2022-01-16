import { browser } from 'webextension-polyfill-ts'
import CounterStorage from './counterStorage'
import SettingsStorage from './settingsStorage'
import Awake from './awake'
import Counter from './counter'
import Utils from './utils'
import { SettingsChangeEvent, SettingsData } from './types'

const saveIntervalTime = 15000; // Amount of time in millisecond it takes for counter changes to be saved

let settings: SettingsData;
let currentTime: Date;

async function iterateCounter(counter: Counter): Promise<Counter> {
    // If it's a new day return a new counter
    if (new Date().getDate() != currentTime.getDate()) {
        currentTime = new Date;
        return await CounterStorage.get();
    }

    let tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    if (!tab) {
        return counter;
    }

    const url = new URL(tab.url);
    const hostname = url.hostname;
    if (!hostname) {
        return counter;
    }

    counter.websiteTime[hostname] = counter.websiteTime[hostname] ? counter.websiteTime[hostname] + 1 : 1;

    const website = counter.websiteTime[hostname];
    // Send too much time spent notification
    if (settings.notifications && website % (settings.notificationTimer as number) === 0) {
        browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('assets/icons/256px.png'),
            title: 'Browser screen time',
            message: `You have already spent ${Utils.formatTime(website)} on ${hostname}!`
        });
    }

    counter.netTime++;

    return counter;
}

async function main(): Promise<void> {
    // Initialize settings
    settings = await SettingsStorage.get();
    // Update settings on change
    SettingsStorage.onChange((msg: SettingsChangeEvent) => {
        settings = msg.settings;
    });

    // Initialize counter
    let counter = await CounterStorage.get();
    currentTime = new Date;

    // Main loop
    const awake = new Awake;
    setInterval(async () => {
        if (awake.available()) {
            counter = await iterateCounter(counter);
        } else {
            console.log(`Considered idle! idle - ${awake.idle}, media - ${awake.mediaPlaying}, focus - ${awake.windowUnfocused}`);
        }
    }, 1000)

    // Save loop
    setInterval(async () => {
        if (awake.available()) {
            await CounterStorage.set(counter);
        }
    }, saveIntervalTime)
}

main();