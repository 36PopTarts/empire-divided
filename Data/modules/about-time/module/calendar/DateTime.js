/**
 * A class to represent data times. Uses to DTCalc to support arbitrary calendars.
 * Support DateTime arithmetic via DTMod
 */
import { DTMod } from "./DTMod.js";
import { DTCalc } from "./DTCalc.js";
import { PseudoClock } from "../PseudoClock.js";
export class DateTime extends DTMod {
    constructor({ years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
        super(new DTMod({ years: years, months, days, hours, minutes, seconds }));
        return this;
    }
    /**
     * returns a new DateTime. convenience method to support DateTime.create({...})
     * If no year is specified defaults to clock start year.
     * NOTE days and months are 0 index, January 1st (in gregorian calendar) is {months: 0, days: 0}
     * @param p
     */
    static create({ years = DTCalc.clockStartYear, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = {}) {
        let dt = new DateTime({ years, months, days, hours, minutes, seconds });
        return dt.normalize();
    }
    /**
     * return a DateTime representint the current game time clock.
     */
    static now() {
        let dt = new DateTime({ years: DTCalc.clockStartYear, seconds: PseudoClock.currentTime });
        return dt.normalize();
    }
    /**
     * Date arithmetic can result in strange DateTimes like
     * {years:2020, months: -1, days: -1, hours: 0, minutes:0, seconds: -1}
     * 1 month and 1 day and 1 second before 00:00:00) on January 1st 2020.
       {years: 2019, months: 10, days: 28, hours: 23, minutes: 59, seconds: 59}
       29 November 2019 adn 23 hours, 59 minutes and 59 seconds.
     */
    normalize() {
        if (!DTCalc.dpy || !DTCalc.dpm) {
            console.warn("about-time | calendar not initialised - cannot construct date/time");
            return null;
        }
        let totalSeconds = this.seconds + this.minutes * DTCalc.spm + this.hours * DTCalc.sph;
        // correct for negative time;
        let numDays = Math.floor(totalSeconds / DTCalc.spd);
        this.seconds = totalSeconds - numDays * DTCalc.spd;
        this.days += numDays;
        this.hours = Math.floor(this.seconds / DTCalc.sph);
        this.seconds = this.seconds % DTCalc.sph;
        this.minutes = Math.floor(this.seconds / DTCalc.spm);
        this.seconds = this.seconds % DTCalc.spm;
        // add in whole monhts - deail with negative months as well
        let yearsOfMonths = Math.floor(this.months / DTCalc.mpy);
        this.years += yearsOfMonths;
        this.months -= (yearsOfMonths * DTCalc.mpy);
        /*
         Work out how many years of days assuming every year is a leap year
          (we can add at least these many years)
        reduce days by the acutal number
        */
        let tempYears = Math.floor(this.days / DTCalc.dpy[1]);
        if (tempYears !== 0) { // reduce by number of whole years
            this.days -= (DTCalc.numLeapYears(this.years - 1 + tempYears) - DTCalc.numLeapYears(this.years - 1));
            this.years += tempYears;
            this.days -= tempYears * DTCalc.dpy[0];
        }
        tempYears = Math.floor(this.days / DTCalc.dpy[1]);
        if (tempYears !== 0) { // If there were enough leap years we mights till have a number of years left
            this.days -= (DTCalc.numLeapYears(this.years - 1 + tempYears) - DTCalc.numLeapYears(this.years - 1));
            this.years += tempYears;
            this.days -= tempYears * DTCalc.dpy[0];
        }
        if (this.days >= DTCalc.daysInYear(this.years)) { // is this a problem for days after feb 29
            this.days -= DTCalc.daysInYear(this.years);
            this.years += 1;
        }
        // If negative days keep adding months of days until we get positive days is at most 1 year of days.
        while (this.days < 0) {
            if (this.months === 0) {
                this.months = DTCalc.mpy;
                this.years -= 1;
            }
            this.months -= 1;
            this.days += DTCalc.dpm[this.months][DTCalc.isLeapYear(this.years)];
        }
        // process left over days to see if there are whole monhts
        while (this.days >= DTCalc.dpm[this.months][DTCalc.isLeapYear(this.years)]) {
            this.days -= DTCalc.dpm[this.months][DTCalc.isLeapYear(this.years)];
            this.months += 1;
            if (this.months === DTCalc.mpy) {
                this.months = 0;
                this.years += 1;
            }
        }
        return this;
    }
    rawAdd(increment) {
        this.years = Math.floor(this.years + (increment.years || 0));
        this.months = Math.floor(this.months + (increment.months || 0));
        this.days = Math.floor(this.days + (increment.days || 0));
        this.hours = Math.floor(this.hours + (increment.hours || 0));
        this.minutes = Math.floor(this.minutes + (increment.minutes || 0));
        this.seconds = Math.floor(this.seconds + (increment.seconds || 0));
        return this;
    }
    /**
     *
     * @param increment DTMod. Add the icrement to a DateTime and return the normailized result.
     */
    add(increment) {
        this.rawAdd(increment);
        this.normalize();
        return this;
    }
    setAbsolute({ years = null, months = null, days = null, hours = null, minutes = null, seconds = null } = {}) {
        this.years = years === null ? this.years : years;
        this.months = months === null ? this.months : months;
        this.days = days === null ? this.days : days;
        this.hours = hours === null ? this.hours : hours;
        this.minutes = minutes === null ? this.minutes : minutes;
        this.seconds = seconds === null ? this.seconds : seconds;
        return this.normalize();
    }
    /**
     *
     * @param seconds convert the number of seconds to a DateTime. Requires a start year which defualts to clockStartYear
     * @param startYear
     */
    static createFromSeconds(seconds, startYear = DTCalc.clockStartYear) {
        if (DTCalc.debug)
            DTCalc.log("craeate from seconds", DateTime.create({ years: startYear, seconds: seconds }), DateTime.create({ years: startYear, seconds: seconds }).normalize());
        return DateTime.create({ years: startYear, seconds: seconds }).normalize();
    }
    /**
     * retun the number of days represented by a date. Return the residual hours minutes seconds as well.
     */
    toDays() {
        let days = this.days;
        let monthsPerYear = DTCalc.dpm.length;
        // roll up the time part to days.
        let seconds = DTCalc.timeToSeconds({ hours: this.hours, minutes: this.minutes, seconds: this.seconds });
        let time = DTMod.fromSeconds(seconds);
        days += time.days;
        delete time.days;
        // How many years worth on months in the spec.
        let yearsOfMonths = (Math.floor(this.months / monthsPerYear));
        let calcYear = this.years + yearsOfMonths;
        let months = this.months - yearsOfMonths;
        // add in the days for the number of months
        for (let i = 0; i < months; i++) {
            days += DTCalc.dpm[i][DTCalc.isLeapYear(calcYear)];
        }
        days += calcYear * DTCalc.dpy[0];
        days += DTCalc.numLeapYears(calcYear - 1) * (DTCalc.dpy[1] - DTCalc.dpy[0]);
        if (DTCalc.debug)
            DTCalc.log("DateTime toDays", days, DateTime.create({ days, hours: time.hours, minutes: time.minutes, seconds: time.seconds }));
        return { days: days, time };
    }
    /**
     * return the number of days between d1 and d2
     * @param d1
     * @param d2
     */
    static daysBetween(d1, d2) {
        return d2.toDays().days - d1.toDays().days;
    }
    /**
     * return the dow for a given DateTime (0=Monday or equivalent)
     */
    dow() {
        // 1. No intercalary days, number of days since start is enough to calc dow
        if (DTCalc.yearlyICDays === 0) {
            return ((this.toDays().days + DTCalc.firstDay) % DTCalc.dpw + DTCalc.dpw) % DTCalc.dpw;
        }
        // 2. Intercalary days but no leap ears - every year is the same length.
        if (DTCalc.numLeapYears(this.years) === 0) {
            // no leap years, so fixed legth year so can do a division by year
            let days = this.toDays().days;
            let precession = Math.floor(days / DTCalc.dpy[0]) * DTCalc.yearlyICDays;
            days -= precession;
            // now account for the days to date
            days -= DTCalc.cumICDays[this.months];
            return (days + DTCalc.firstDay) % DTCalc.dpw;
        }
        if (true || !game.settings.get("about-time", "newDowCalc")) {
            // 3. Leap years and intercalary days so hope that weekday reset at the start of the month.
            // Assume day resets at start of each month.
            return this.days % DTCalc.dpw;
            // 4. Leap years and intercalary days.
            // Pretend we have a calemdar with no intercalary days in it
        }
        else { // assumes starts at year 0
            // Start with elapsed days
            let days = this.toDays().days;
            // subtract intercalary days for non leap years
            days -= Math.max((this.years - 1) * DTCalc.yearlyICDays, 0);
            days = DTCalc.leapYearRule(this.years); // The ICDays calc assumes every years is a leap year
            days -= DTCalc.cumICDays[this.months];
            console.log("dow calc", this.toDays().days, this.years, DTCalc.yearlyICDays, (this.years - 1) * DTCalc.yearlyICDays);
            console.log("dow calc", this.months, DTCalc.cumICDays[this.months], days % DTCalc.dpw, this.days);
            return days % DTCalc.dpw;
        }
    }
    /**
     * Adjust the calendar so that the dow() of this will be dow
     * @param dow the new dow for this.
     */
    setCalDow(dow) {
        if (DTCalc.debug)
            DTCalc.log("DateTime: setting first day ", dow, this.dow(), DTCalc.firstDay);
        DTCalc.setFirstDay(((dow % DTCalc.dpw) - this.dow() + DTCalc.dpw + DTCalc.firstDay) % DTCalc.dpw);
    }
    /**
     * convert the date to a number of Seconds.
     */
    toSeconds() {
        if (DTCalc.debug)
            DTCalc.log("calcseconds", this.years, this.months, this.days, this.hours, this.minutes, this.seconds);
        let days = this.toDays();
        return DTCalc.timeToSeconds({ days: days.days, hours: days.time.hours, minutes: days.time.minutes, seconds: days.time.seconds });
    }
    /**
     * Some formatting methods
     */
    shortDate() {
        let pad = DTCalc.padNumber;
        let yearD = this.years - (this.years < 1 && !DTCalc.hasYearZero ? 1 : 0);
        let monthNum = this.months + 1 - DTCalc.cumICDays[this.months];
        let dayNum = DTCalc.ICMonths[this.months] ? 0 : this.days + 1;
        if (["ja"].includes(game.settings.get("core", "language"))) {
            return {
                date: `${pad(dayNum, 2)}/${pad(monthNum, 2)}/${yearD}}`,
                time: `${pad(this.hours, 2)}:${pad(this.minutes, 2)}:${pad(this.seconds, 2)}`
            };
        }
        else {
            return {
                date: `${yearD}/${pad(monthNum, 2)}/${pad(dayNum, 2)}`,
                time: `${pad(this.hours, 2)}:${pad(this.minutes, 2)}:${pad(this.seconds, 2)}`
            };
        }
    }
    longDate() {
        return this.longDateSelect({});
    }
    longDateExtended() {
        return {
            day: this.days + 1,
            dow: this.dow(),
            dowString: DTCalc.weekDays[this.dow()],
            month: this.months + 1,
            monthString: DTCalc.months[this.months],
            year: this.years - (this.years < 1 && !DTCalc.hasYearZero ? 1 : 0),
            hour: this.hours,
            minute: this.minutes,
            second: this.seconds
        };
    }
    longDateSelect({ day = true, month = true, year = true, hours = true, minutes = true, seconds = true, monthDay = true }) {
        let pad = DTCalc.padNumber;
        let yearD = this.years - (this.years < 1 && !DTCalc.hasYearZero ? 1 : 0);
        if (DTCalc.ICMonths[this.months]) {
            return {
                "date": `${DTCalc.months[this.months]} ${yearD}`,
                "time": `${pad(this.hours, 2)}:${pad(this.minutes, 2)}:${pad(this.seconds, 2)}`
            };
        }
        let years = year ? `  ${yearD}` : "";
        let months = month ? ` ${DTCalc.months[this.months]}` : "";
        let days = day ? `${DTCalc.weekDays[this.dow()]}` : "";
        let monthDays = monthDay ? ` ${pad(this.days + 1, 2)}` : "";
        return {
            "date": `${days}${months}${monthDays}${years}`,
            "time": `${pad(this.hours, 2)}:${pad(this.minutes, 2)}:${pad(this.seconds, 2)}`
        };
    }
}
