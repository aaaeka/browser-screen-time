import { browser } from 'webextension-polyfill-ts'
import { SettingsData, SettingsDataType, MsgEvent, SettingsChangeEvent } from './types'

export const defaultSettings: SettingsData = {
    idleTimer: '15', // 15 seconds
    videoCheck: true,
    notifications: false,
    notificationTimer: '7200' // 2 hours
}

export default class SettingsStorage {
    static async set(key: string, item: SettingsDataType): Promise<void> {
        let currentSettings: SettingsData = (await this.getNoDefaults()) ?? {};
        currentSettings[key] = item;
        await browser.storage.local.set({ settings: currentSettings });
    }

    static async get(): Promise<SettingsData> {
        const noDefaults = await this.getNoDefaults();
        return Object.assign(defaultSettings, noDefaults);
    }

    static async getNoDefaults(): Promise<SettingsData> {
        return (await browser.storage.local.get('settings')).settings;
    }

    static onChange(callback: Function): void {
        browser.runtime.onMessage.addListener((message: MsgEvent) => {
            if (message.type !== 'settings') {
                return;
            }

            callback((message as SettingsChangeEvent).settings);
        });
    }

    static async onChangeOrLoad(callback: Function): Promise<void> {
        callback(await this.get());
        this.onChange(callback);
    }
}