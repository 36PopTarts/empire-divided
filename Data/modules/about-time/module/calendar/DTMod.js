// date-time modifer applied to DateTime
import { DTCalc } from "./DTCalc.js";
/**
 * A modifer for add opeations to DateTimes.
 * can be any combination of years, months, days, hours, minutes,  seconds
 */
export class DTMod {
    constructor({ years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
        this.years = years;
        this.months = months;
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        return this;
    }
    /**
     * Short hand creation method DTMod.create({....})
     * @param data {years=0, months=0, days=0,hours=0, minutes=0, seconds=0}
     */
    static create(data = {}) {
        return new DTMod(data);
    }
    /**
   * Add together two DTMods. no managment of values other than making them integers
   * @param increment the DTMod to add to the current.
   * returns a new mod
   */
    add(increment) {
        let years = Math.floor(this.years + (increment.years || 0));
        let months = Math.floor(this.months + (increment.months || 0));
        let days = Math.floor(this.days + (increment.days || 0));
        let hours = Math.floor(this.hours + (increment.hours || 0));
        let minutes = Math.floor(this.minutes + (increment.minutes || 0));
        let seconds = Math.floor(this.seconds + (increment.seconds || 0));
        return new DTMod({ years, months, days, hours, minutes, seconds });
    }
    /**
     * WARNING does not work for leap years
     * A convenience method to allow conversion of time specs to seconds.
     */
    toSeconds() {
        let seconds = Object.keys(DTMod.mapper).reduce((acc, key) => acc = acc + DTMod.mapper[key](this[key]), 0);
        if (seconds > DTCalc.dpy[0] * DTCalc.spd) {
            console.warn("DTMod conversion to seconds more than 1 year");
            console.log("DTMod", this);
        }
        //    seconds += DTCalc.numLeapYears(this.years) * DTCalc.spd;
        return seconds;
    }
    /* The following methods are all for using DTMods to represent times and do time arithmetic */
    static timeString(timeInSeconds) {
        let dmhs = this.fromSeconds(timeInSeconds);
        let pad = DTCalc.padNumber;
        return `${pad(dmhs.hours)}:${pad(dmhs.minutes)}:${pad(dmhs.seconds)}`;
    }
    static fromSeconds(seconds) {
        let days = Math.floor(seconds / DTCalc.spd);
        seconds = seconds % DTCalc.spd;
        let hours = Math.floor(seconds / DTCalc.sph);
        seconds = seconds % DTCalc.sph;
        let minutes = Math.floor(seconds / DTCalc.spm);
        seconds = seconds % DTCalc.spm;
        return new DTMod({ hours: hours, minutes: minutes, seconds: seconds, days: days });
    }
}
DTMod.mapper = {
    "years": (years) => years * DTCalc.spy,
    "months": DTCalc.monthsToSeconds,
    "days": (days) => days * DTCalc.spd,
    "hours": (hours) => hours * DTCalc.sph,
    "minutes": (minutes) => minutes * DTCalc.spm,
    "seconds": (s) => s
};
