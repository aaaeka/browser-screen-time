import { browser } from 'webextension-polyfill-ts'
import CounterStorage from './counterStorage'
import Awake from './awake'
import Counter from './counter'

const saveIntervalTime = 15000; // Amount of time in millisecond it takes for counter changes to be saved

async function iterateCounter(counter: Counter): Promise<Counter> {
    let tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
    if (tab) {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        if (hostname) {
            counter.websiteTime[hostname] = counter.websiteTime[hostname] ? counter.websiteTime[hostname] + 1 : 1;

            counter.netTime++;
        }
    }

    return counter;
}

async function main(): Promise<void> {
    // Initialise counter
    let counter = await CounterStorage.get();

    // Main loop
    const awake = new Awake();
    setInterval(async () => {
        if (awake.available()) {
            counter = await iterateCounter(counter);
        } else {
            console.log(`Considered idle! idle - ${awake.idle}, media - ${awake.mediaPlaying}, focus - ${awake.windowUnfocused}`);
        }
    }, 1000)

    // Save loop
    setInterval(async () => {
        await CounterStorage.set(counter);
    }, saveIntervalTime)
}

main();