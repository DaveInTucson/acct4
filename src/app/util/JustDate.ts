const g_monthInfo = [
    { length:  0, name1: '0', name3: '000', name: 'zero month?!'},
    { length: 31, daysBeforeMonth:   0, name1: 'J', name3: 'Jan', name: 'January'},
    { length: 28, daysBeforeMonth:  31, name1: 'F', name3: 'Feb', name: 'February'},
    { length: 31, daysBeforeMonth:  59, name1: 'M', name3: 'Mar', name: 'March'},
    { length: 30, daysBeforeMonth:  90, name1: 'A', name3: 'Apr', name: 'April'},
    { length: 31, daysBeforeMonth: 120, name1: 'M', name3: 'May', name: 'May'},
    { length: 30, daysBeforeMonth: 151, name1: 'J', name3: 'Jun', name: 'June'},
    { length: 31, daysBeforeMonth: 181, name1: 'J', name3: 'Jul', name: 'July'},
    { length: 31, daysBeforeMonth: 212, name1: 'A', name3: 'Aug', name: 'August'},
    { length: 30, daysBeforeMonth: 242, name1: 'S', name3: 'Sep', name: 'September'},
    { length: 31, daysBeforeMonth: 273, name1: 'O', name3: 'Oct', name: 'October'},
    { length: 30, daysBeforeMonth: 303, name1: 'N', name3: 'Nov', name: 'November'},
    { length: 31, daysBeforeMonth: 334, name1: 'D', name3: 'Dec', name: 'December'},
    ];
  

// This is just a convenience class to make it easier to create JustDate objects
// some number of days before or after "today".
export class DayDelta
{
    delta: number;

    constructor(delta: number)
    { 
        this.delta = delta; 
    }

    makeDate() : Date
    {
        let d = new Date();
        d.setDate(d.getDate() + this.delta);
        return d;
    }
}

// The JavaScript Date class should really have been called DateTime.
// Sometimes it's convenient to have a class that represents a date 
// without the time part 

export class JustDate {
    year  : number = 0;
    month : number = 0;
    day   : number = 0;

    // not strictly necessary to store a date, but convenient for plotting
    dayOfYear : number = 0;
    daysLeft  : number = 0;

    constructor(year?: number|string|Date|DayDelta, month?: number, day?: number) {

        if (typeof year === 'number') {
            if (typeof month != 'number' || typeof day !== 'number')
                throw new RangeError('you must specify month and day with year');

            this.setFromYMD(year, month, day);
        }
        else if (typeof year === 'string') {
            this.setFromString(year);
        }
        else if (year instanceof Date) {
            this.setFromDate(year);
        }
        else if (year instanceof DayDelta)
        {
            this.setFromDate(year.makeDate());
        }
        else {
            this.setToday();
        }
    }

    addDays(daysToAdd: number): JustDate
    {
        let year = this.year;
        let month = this.month;
        let day = this.day + daysToAdd;

        while (day > daysInMonth(year, month))
        {
            day -= daysInMonth(year, month);
            month++;
            if (month > 12)
            {
                month -= 12;
                year++;
            }
        }

        while (day < 1)
        {
            month--;
            if (month < 1)
            {
                month += 12;
                year--;
            }
            day += daysInMonth(year, month);
        }

        return new JustDate(year, month, day);
    }
    setFromYMD(year: number, month: number, day: number): void {
        if (month < 1 || month > 12)
        throw new RangeError('month ' + month + ' not between 1 and 12');
        let daysInMonth = g_monthInfo[month].length + (isLeapYear(year) ? 1 : 0);
        if (day < 1 || day > daysInMonth)
        throw new RangeError('day ' + day + ' out of range for month ' + month);

        this.year = year;
        this.month = month;
        this.day = day;
        this._setDayOfYear();
    }

    setFromString(dateString: string): void {
        let matchData = dateString.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
        if (!matchData)
            throw new RangeError('unknown date format: ' + dateString);

        let year = parseInt(matchData[1]);
        let month = parseInt(matchData[2]);
        let day = parseInt(matchData[3]);
        this.setFromYMD(year, month, day);
    }

    setFromDate(d: Date): void
    {
        this.year = d.getFullYear();
        this.month = d.getMonth() + 1;
        this.day = d.getDate();

        this._setDayOfYear();
    }

    setToday(): void { this.setFromDate(new Date()); }

    compareTo(d: JustDate): number
    {
        if (this.year != d.year)
            return this.year - d.year;

        if (this.month != d.month)
            return this.month - d.month;

        return this.day - d.day;
    }

    _setDayOfYear(): void {
        this.dayOfYear = (g_monthInfo[this.month]?.daysBeforeMonth ?? 0) + this.day;
        this.daysLeft = 365 - this.dayOfYear;

        if (isLeapYear(this.year)) {
            if (this.month > 2)
            { this.dayOfYear++; }
            else 
            { this.daysLeft++; }
        }
    }

    toSQLString(): string {
        let month: string | number = this.month;
        let day: string | number = this.day;

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return this.year + '-' + month + '-' + day;
    }
} // JustDate


export function getMonthName(monthNumber : number): string
{
    if (monthNumber < 1 || monthNumber > 12)
      throw new RangeError('month number ' + monthNumber + ' not between 1 and 12');

    return g_monthInfo[monthNumber].name;
}
  
export function getMonthInitial(monthNumber: number): string
{
    if (monthNumber < 1 || monthNumber > 12)
      throw new RangeError('month number ' + monthNumber + ' not between 1 and 12');

    return g_monthInfo[monthNumber].name1;
}

export function isLeapYear(year: number): boolean
{
    if (year % 4 !== 0) return false;
    if (year % 400 === 0) return true;
    if (year % 100 === 0) return false;
    return true;
}

export function daysInMonth(year: number, month: number) : number
{
    if (month < 1 || month > 12)
      throw new RangeError('month number ' + month + ' not between 1 and 12');

      if (isLeapYear(year) && month == 2)
        return 29;

    return g_monthInfo[month].length;
}

export function daysInYear(year: number): number
{
  return isLeapYear(year) ? 366 : 365;
}

export function isSQLFormat(date: string) : boolean {
    return null != date.match(/^\d\d\d\d-\d\d-\d\d$/);
}


export function daysBetweenJustDates(from:JustDate, to:JustDate) : number
{
    if (from.year == to.year)
        return to.dayOfYear - from.dayOfYear;

    let multiplier = 1;
    if (from.year > to.year)
    {
        multiplier = -1;
        let tmp = from;
        from = to;
        to = tmp;
    }

    let daysBetween = from.daysLeft;
    for (let year = from.year + 1; year < to.year; year++)
        daysBetween += daysInYear(year);

    daysBetween += to.dayOfYear;
    return multiplier * daysBetween;
}
