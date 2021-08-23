export default class Utils {
    static formatDate(date: Date): string {
        return `${date.getFullYear()} ${date.getMonth()} ${date.getDate()}`;
    }

    static getTodaysDate(): string {
        let date = new Date;
        return this.formatDate(date);
    }

    static formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60) % 60;

        let output = '';
        output += hours ? `${hours}h ` : ''
        output += minutes ? `${minutes}min ` : '';
        // Show seconds only if hours is 0
        output += !hours ? `${seconds % 60}s` : '';

        return output.trim();
    }
}