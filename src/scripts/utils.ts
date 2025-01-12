import browser from 'webextension-polyfill';

export default class Utils {
    static formatDate(date: Date): string {
        return `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()}`;
    }

    static formatDateShort(date: Date): string {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    static getTodaysDate(): string {
        let date = new Date;
        return this.formatDate(date);
    }

    static formatTime(seconds: number): string {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor(seconds / 3600) % 24;
        const minutes = Math.floor(seconds / 60) % 60;

        let output = '';
        output += days ? `${days}d ` : '';
        output += hours ? `${hours}h ` : '';
        // Show minutes only of days is 0
        output += minutes && !days ? `${minutes}min ` : '';
        // Show seconds only if hours and days is 0
        output += !days && !hours ? `${seconds % 60}s` : '';

        return output.trim();
    }

    static getExtensionUUID(): string {
        // Browser UUID is different in both browsers so different calls
        // need to be made depending on the browsers
        // This call will succeed only in Firefox
        if (typeof browser.runtime.getBrowserInfo === 'function') {
            const url = browser.runtime.getURL('manifest.json');
            const match = url.match(/^moz-extension:\/\/([^\/]+)\//);
            return match ? match[1] : '';
        }

        return browser.runtime.id;
    }

    static isValidCounterData(data: unknown): boolean {
        const expectedColors = ["#227C9D", "#17C3B2", "#FFCB77", "#FE6D73"];
        const expectedOtherColor = "#CFCFCF";

        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new Error('The input must be a non-null object.');
        }

        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (!/^\d{4} \d{1,2} \d{1,2}$/.test(key)) {
                throw new Error(`Invalid top-level key format: "${key}". Expected "YYYY M D".`);
            }

            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                throw new Error(`The value of key "${key}" must be a non-null object.`);
            }

            const { netTime, websiteTime, colors, otherColor } = value;

            if (typeof netTime !== 'number') {
                throw new Error(`The "netTime" key under "${key}" must be a number.`);
            }

            if (
                typeof websiteTime !== 'object' ||
                websiteTime === null ||
                Array.isArray(websiteTime) ||
                !Object.values(websiteTime).every(time => typeof time === 'number')
            ) {
                throw new Error(`The "websiteTime" key under "${key}" must be an object with numeric values.`);
            } else {
                const totalWebsiteTime = Object.values(websiteTime).reduce((sum, time) => (sum as number) + (time as number), 0);
                if (totalWebsiteTime !== netTime) {
                    throw new Error(
                        `In day "${key}", the sum of "websiteTime" (${totalWebsiteTime}) does not match "netTime" (${netTime}).`
                    );
                }
            }

            // I don't know why I made it so the counter saves colors but hey I don't really want to change it now :D
            if (!Array.isArray(colors) || JSON.stringify(colors) !== JSON.stringify(expectedColors)) {
                throw new Error(`The "colors" key under "${key}" must match the expected colors.`);
            }

            if (otherColor !== expectedOtherColor) {
                throw new Error(`The "otherColor" key under "${key}" must match the expected value.`);
            }
        });

        return true;
    }
}
