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

// If it's a new day, save the current counter for the outgoing day and load the new day's counter.
// This runs on every tick (even when idle) so a stale counter is never saved under the new day's key.
async function rollOverIfNewDay(counter: Counter): Promise<Counter> {
    const today = new Date();
    if (Utils.formatDate(today) === Utils.formatDate(currentTime)) {
        return counter;
    }

    await CounterStorage.set(counter, currentTime);
    const newCounter = await CounterStorage.get();
    currentTime = today;
    return newCounter;
}

function iterateCounter(counter: Counter, tab: browser.Tabs.Tab | undefined): Counter {
    if (!tab || !tab.url) {
        return counter;
    }

    let url: URL;
    try {
        url = new URL(tab.url);
    } catch {
        return counter;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return counter;
    }

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

let lastIconActive: boolean | undefined;

// Setting the icon decodes the image files each time, so only do it when the state changes
function updateIcon(active: boolean): void {
    if (active === lastIconActive) {
        return;
    }
    lastIconActive = active;
    const folder = active ? 'assets/icons' : 'assets/icons/disabled';
    browser.action.setIcon({
        path: {
            16: `${folder}/16px.png`,
            32: `${folder}/32px.png`,
            64: `${folder}/64px.png`,
            128: `${folder}/128px.png`
        }
    }).catch(() => { lastIconActive = undefined; });
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
    let tickRunning = false;
    setInterval(async () => {
        // Skip overlapping ticks so counter updates and the day rollover can't interleave
        if (tickRunning) {
            return;
        }
        tickRunning = true;
        try {
            await tick();
        } finally {
            tickRunning = false;
        }
    }, 1000)

    async function tick(): Promise<void> {
        counter = await rollOverIfNewDay(counter);
        const tab = (await browser.tabs.query({ lastFocusedWindow: true, active: true }))[0];
        const active = awake.available(tab);
        if (active) {
            counter = iterateCounter(counter, tab);
        }
        updateIcon(active);
    }

    // Save loop - persist counter every interval regardless of active/idle state
    setInterval(async () => {
        await CounterStorage.set(counter, currentTime);
    }, saveIntervalTime)
}

main();
