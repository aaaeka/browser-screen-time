import { WebsiteMap, WebsiteData } from './types'

export default class Counter {
    public netTime: number;
    public websiteTime: WebsiteMap;
    private colors: Array<string>;
    private otherColor: string;

    constructor(netTime: number = 0, websiteTime: WebsiteMap = {}) {
        this.netTime = netTime;
        this.websiteTime = websiteTime;
        this.colors = ['#227C9D', '#17C3B2', '#FFCB77', '#FE6D73'];
        this.otherColor = '#CFCFCF';
    }
    
    public mostUsed(): Array<WebsiteData> {
        let amountOfSites = this.colors.length;
        let sorted = this.sort();
        let mostUsed: Array<WebsiteData> = sorted.slice(0, amountOfSites);
        // Add additional "other" site which has all the other sites' time combined
        if (sorted.length > amountOfSites) {
            const time = sorted.slice(amountOfSites, sorted.length - 1).reduce((accumulator: number, current: WebsiteData): number => accumulator + current.time, 1);
            let other: WebsiteData = { 
                time: time,
                url: 'other',
                color: '#CFCFCF',
                percentage: time / this.netTime * 100
            };
            mostUsed.push(other);
        }

        return mostUsed;
    }
    
    public sort(): Array<WebsiteData> {
        let sites = this.mapToArray().sort((a: any, b: any) => b.time - a.time);
        
        // Give color to sites
        for (let i = 0; i < sites.length; i++) {
            if (i < this.colors.length) {
                sites[i].color = this.colors[i];
                continue;
            }
            
            sites[i].color = this.otherColor;
        }
        
        return sites;
    }
    
    private mapToArray(): Array<WebsiteData> {
        let sites: Array<WebsiteData> = [];
        for (const [url, time] of Object.entries(this.websiteTime)) {
            sites.push({
                time: time,
                url: url,
                color: null,
                percentage: time / this.netTime * 100
            });
        }
        
        return sites;
    }
}