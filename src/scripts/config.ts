import { browser } from 'webextension-polyfill-ts'

export default class Config {
    static async set(key: string, item: object | string): Promise<any> {
        return await browser.storage.local.set({ [key]: item });
    }

    static async get(key: string): Promise<any> {
        let item = await browser.storage.local.get(key);
        return item[key];
    }
}