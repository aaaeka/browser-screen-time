import Config from './config'
import Utils from './utils'
import Counter from './counter'
import { WebsiteData, CounterTimespanInterval } from './types'
import { browser } from 'webextension-polyfill-ts'
import { isEqual, addDays, isAfter } from 'date-fns'

export default class CounterStorage {
    static async set(counter: Counter) {
        Config.set(Utils.getTodaysDate(), counter);
    }

    static async get(interval: CounterTimespanInterval = [new Date, new Date]): Promise<Counter> {
        if (isEqual(interval[0], interval[1])) {
            const data = await Config.get(Utils.formatDate(interval[0]));
            if (data) {
                return new Counter(data.netTime, data.websiteTime);
            }
            
            return new Counter;
        }

        let accumalativeCounter = new Counter;

        let currentDate = interval[0];
        while (!isAfter(currentDate, interval[1])) {
            let data: Counter = await Config.get(Utils.formatDate(currentDate));

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
                return;
            }
            
            dates.push(new Date(key)) 
        }
        
        return dates;
    }
}