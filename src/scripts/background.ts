import browser from 'webextension-polyfill'
import CounterStorage from './counterStorage'
import SettingsStorage from './settingsStorage'
import Awake from './awake'
import Counter, { CounterDailyData } from './counter'
import Utils from './utils'
import { SettingsData } from './types'

// Amount of time in milliseconds it takes for counter changes to be saved
const saveIntervalTime = 15000;

const extensionUUID = Utils.getExtensionUUID();

let settings: SettingsData;
let currentTime: Date;

async function iterateCounter(counter: Counter): Promise<Counter> {
    // If it's a new day return a new counter
    if (new Date().getDate() != currentTime.getDate()) {
        currentTime = new Date;
        return await CounterStorage.get();
    }

    let tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    if (!tab || !tab.url) {
        return counter;
    }

    const url = new URL(tab.url);
    const hostname = url.hostname;
    if (!hostname || hostname === extensionUUID) {
        return counter;
    }

    counter.websiteTime[hostname] = counter.websiteTime[hostname] ? counter.websiteTime[hostname] + 1 : 1;

    const website = counter.websiteTime[hostname];
    // Send too much time spent notification
    if (settings.notifications && website % parseInt(settings.notificationTimer as string) === 0) {
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
    SettingsStorage.onChange((newSettings: SettingsData) => {
        settings = newSettings;
        console.log('Settings changed');
    });

    // Initialize counter
    let counter = await CounterStorage.get();
    currentTime = new Date;

    CounterStorage.onOverwrite((counterData: CounterDailyData | null) => {
        counter = counterData ? Counter.constructFromDailyData(counterData) : new Counter();
        console.log('Counter overwriten');
    });

    // Main loop
    const awake = new Awake;
    setInterval(async () => {
        if (awake.available()) {
            counter = await iterateCounter(counter);
            browser.action.setIcon({
                path: {
                    16: "assets/icons/16px.png",
                    32: "assets/icons/32px.png",
                    64: "assets/icons/64px.png",
                    128: "assets/icons/128px.png",
                    256: "assets/icons/256px.png",
                    512: "assets/icons/512px.png",
                    1024: "assets/icons/1024px.png"
                }
            });
        } else {
            browser.action.setIcon({
                path: {
                    16: "assets/icons/disabled/16px.png",
                    32: "assets/icons/disabled/32px.png",
                    64: "assets/icons/disabled/64px.png",
                    128: "assets/icons/disabled/128px.png",
                    256: "assets/icons/disabled/256px.png",
                    512: "assets/icons/disabled/512px.png",
                    1024: "assets/icons/disabled/1024px.png"
                }
            });
            // console.log(`Considered idle! idle - ${awake.idle}, media - ${awake.mediaPlaying}, focus - ${awake.windowUnfocused}`);
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
