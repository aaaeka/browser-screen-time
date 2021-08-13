import Config from './config'
import Utils from './utils'
import { Counter, CounterTimespanKind, WebsiteData } from './types'

export default class CounterStorage {
    static async set(counter: Counter) {
        Config.set(Utils.getTodaysDate(), counter);
    }

    static async get(timespan: CounterTimespanKind = CounterTimespanKind.Today): Promise<Counter> {
        let date = new Date;
        
        let accumalativeCounter: Counter = {
            netTime: 0,
            websiteTime: {}
        };

        if (timespan === CounterTimespanKind.Today) {
            return await Config.get(Utils.getTodaysDate());
        }

        for (let i: number = timespan; i > 0; i--) { 
            let data: Counter = await Config.get(Utils.formatDate(date));

            if (data) {
                accumalativeCounter.netTime += data.netTime;
                for (let [url, time] of Object.entries(data.websiteTime)) {
                    accumalativeCounter.websiteTime[url] =
                        accumalativeCounter.websiteTime[url] ? accumalativeCounter.websiteTime[url] + time : time;
                }
            }

            console.log(Utils.formatDate(date));
            date.setMilliseconds(date.getMilliseconds() - 864e5);
        }

        console.log(accumalativeCounter);
        return accumalativeCounter;
    }
    
    static mostUsed(counter: Counter): Array<WebsiteData> {
        // Convert map to array so sorting operations can be made
        let sites: Array<WebsiteData> = [];
        for (const [url, time] of Object.entries(counter.websiteTime)) {
            sites.push({
                time: time,
                url: url,
                color: null,
                percentage: time / counter.netTime * 100
            });
        }

        let amountOfSites = 4;
        let sorted = sites.sort((a: any, b: any) => b.time - a.time);
        // Slice & give colors to most used sites
        const colors = ['#227C9D', '#17C3B2', '#FFCB77', '#FE6D73'];
        let mostUsed: Array<WebsiteData> = sorted.slice(0, amountOfSites).map((value: WebsiteData, i: number) => Object.assign(value, { color: colors[i] }));
        // Add additional "other" site which has all the other sites' time combined
        if (sorted.length > amountOfSites) {
            const time = sorted.slice(amountOfSites, sorted.length - 1).reduce((accumulator: number, current: WebsiteData): number => accumulator + current.time, 1);
            let other: WebsiteData = { 
                time: time,
                url: 'other',
                color: '#CFCFCF',
                percentage: time / counter.netTime * 100
            };
            mostUsed.push(other);
        }

        return mostUsed;
    }
}