import Utils from './utils'
import Counter, { CounterDailyData, CounterData } from './counter'
import { CounterOverwriteEvent, CounterTimespanInterval, MsgEvent } from './types'
import browser from 'webextension-polyfill'
import { isEqual, addDays, isAfter } from 'date-fns'

export default class CounterStorage {
    static async set(counter: Counter) {
        browser.storage.local.set({ [Utils.getTodaysDate()]: counter });
    }

    static async getSingleDay(date: Date): Promise<Counter> {
        const key = Utils.formatDate(date);
        return (await browser.storage.local.get(key))[key];
    }

    static async get(interval: CounterTimespanInterval = [new Date, new Date]): Promise<Counter> {
        if (isEqual(interval[0], interval[1])) {
            const data = await this.getSingleDay(interval[0]);

            if (data) {
                return new Counter(data.netTime, data.websiteTime);
            }

            return new Counter;
        }

        let accumalativeCounter = new Counter;

        let currentDate = interval[0];
        while (!isAfter(currentDate, interval[1])) {
            const data = await this.getSingleDay(currentDate);

            if (data) {
                accumalativeCounter.netTime += data.netTime;
                for (let [url, time] of Object.entries(data.websiteTime)) {
                    accumalativeCounter.websiteTime[url] =
                        accumalativeCounter.websiteTime[url] ? accumalativeCounter.websiteTime[url] + time : time;
                }
            }

            currentDate = addDays(currentDate, 1);
        }

        return accumalativeCounter;
    }


    static onOverwrite(callback: (counterData: CounterDailyData | null) => void): void {
        browser.runtime.onMessage.addListener((message: MsgEvent) => {
            if (message.type !== 'counter') {
                return;
            }

            callback((message as CounterOverwriteEvent).counter);
        });
    }

    static async getAllJSONString(): Promise<string> {
        const allData = await browser.storage.local.get();
        if (allData.settings) {
            delete allData.settings;
        }
        return JSON.stringify(allData);
    }

    static async getSavedKeys(): Promise<Array<string>> {
        const allData = await browser.storage.local.get();
        return Object.keys(allData).filter((key) => key !== 'settings');
    }

    private static async sendOverwriteEvent(counterData: CounterData): Promise<void> {
        const currentDayKey = Utils.formatDate(new Date());
        const msg: CounterOverwriteEvent = {
            type: 'counter',
            counter: counterData[currentDayKey]
        }
        await browser.runtime.sendMessage(msg);
    }

    static async overwriteStorage(newData: unknown): Promise<void> {
        if (!Utils.isValidCounterData(newData)) {
            return;
        }
        const newCounterData = newData as CounterData;
        const allKeys = await this.getSavedKeys();
        await browser.storage.local.remove(allKeys);
        await browser.storage.local.set(newCounterData);
        await this.sendOverwriteEvent(newCounterData);
    }

    static async mergeStorage(newData: unknown): Promise<void> {
        if (!Utils.isValidCounterData(newData)) {
            return;
        }
        const newCounterData = newData as CounterData;
        const allKeys = await this.getSavedKeys();
        const oldCounterData = await browser.storage.local.get(allKeys);

        const updatedCounterData = Object.assign(newCounterData, oldCounterData);

        Object.keys(updatedCounterData).forEach((key) => {
            if (!newCounterData[key] || !oldCounterData[key]) {
                return;
            }

            updatedCounterData[key].netTime = newCounterData[key].netTime + oldCounterData[key].netTime;

            const newWebsiteTime = newCounterData[key].websiteTime;
            const oldWebsiteTime = oldCounterData[key].websiteTime;
            const updatedWebsiteTime = Object.assign(newWebsiteTime, oldWebsiteTime);

            Object.keys(updatedWebsiteTime).forEach((websiteKey) => {
                if (!newWebsiteTime[websiteKey] || !oldWebsiteTime[websiteKey]) {
                    return;
                }

                updatedWebsiteTime[websiteKey] = newWebsiteTime[websiteKey] + oldWebsiteTime[websiteKey];
            })
        });

        await browser.storage.local.set(updatedCounterData);
        await this.sendOverwriteEvent(newCounterData);
    }

    static async getSavedDates(): Promise<Array<Date>> {
        return (await this.getSavedKeys()).map((key) => new Date(key));
    }
}
