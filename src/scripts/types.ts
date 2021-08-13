export interface WebsiteData {
    time: number,
    color: string,
    url: string,
    percentage: number
}

export interface WebsiteMap {
    // Url         Time
    [key: string]: number
}

export interface Counter {
    netTime: number,
    websiteTime: WebsiteMap
}

export enum CounterTimespanKind {
    Today = 1,
    Week = 7,
    Month = 30
}

export interface CounterTimespanData {
    kind: number,
    name: string,
    fullName: string
}

export interface CounterTimespans {
    today: CounterTimespanData,
    week: CounterTimespanData,
    month: CounterTimespanData
}
 
export interface PlayingMedia {
    videoSource: string,
    url: string,
    state: 'playing' | 'paused'
}