import Utils from './utils'
import Counter from './counter'
import { CounterTimespanInterval } from './types'
import { browser } from 'webextension-polyfill-ts'
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
    
    static async getSavedDates(): Promise<Array<Date>> {
        const allData = await browser.storage.local.get();
        let dates: Array<Date> = [];
        
        for (const key of Object.keys(allData)) {
            // Only parse keys that start with 20
            // I guess it wont work in the 22nd century
            // But hey what can you do
            if (!key.startsWith('20')) {
                continue;
            }

            dates.push(new Date(key)) 
        }
        
        return dates;
    }
}