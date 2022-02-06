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
}