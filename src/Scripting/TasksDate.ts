import type { Moment, unitOfTime } from 'moment';
import moment from 'moment';
import { Notice } from 'obsidian';
import { TaskRegularExpressions } from '../Task';

/**
 * TasksDate encapsulates a date, for simplifying the JavaScript expressions users need to
 * write in 'group by function' lines.
 */
export class TasksDate {
    private readonly _date: Moment | null = null;

    public constructor(date: Moment | null) {
        this._date = date;
    }

    /**
     * Return the raw underlying moment (or null, if there is no date)
     */
    get moment(): Moment | null {
        return this._date;
    }

    /**
     * Return the date formatted as YYYY-MM-DD, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public formatAsDate(fallBackText: string = ''): string {
        return this.format(TaskRegularExpressions.dateFormat, fallBackText);
    }

    /**
     * Return the date formatted as YYYY-MM-DD HH:mm, or {@link fallBackText} if there is no date.
     @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public formatAsDateAndTime(fallBackText: string = ''): string {
        return this.format(TaskRegularExpressions.dateTimeFormat, fallBackText);
    }

    /**
     * Return the date formatted with the given format string, or {@link fallBackText} if there is no date.
     * See https://momentjs.com/docs/#/displaying/ for all the available formatting options.
     * @param format
     * @param fallBackText - the string to use if the date is null. Defaults to empty string.
     */
    public format(format: string, fallBackText: string = ''): string {
        return this._date ? this._date!.format(format) : fallBackText;
    }

    /**
     * Return the date as an ISO string, for example '2023-10-13T00:00:00.000Z'.
     * @param keepOffset
     * @returns - The date as an ISO string, for example: '2023-10-13T00:00:00.000Z',
     *            OR an empty string if no date, OR null for an invalid date.
     */
    public toISOString(keepOffset?: boolean): string | null {
        return this._date ? this._date!.toISOString(keepOffset) : '';
    }

    public postpone(unitOfTime: unitOfTime.DurationConstructor = 'days', amount: number = 1) {
        console.debug('🚀 ~ postpone ~ unitOfTime:', unitOfTime);
        if (!this._date) throw new Notice('Cannot postpone a null date');

        const today = moment().startOf('day');
        // According to the moment.js docs, isBefore is not stable so we use !isSameOrAfter: https://momentjs.com/docs/#/query/is-before/
        const isDateBeforeToday = !this._date.isSameOrAfter(today, 'day');
        if (!isDateBeforeToday) {
            return today.add(amount, unitOfTime);
        }

        return this._date.add(amount, unitOfTime);
    }
}
