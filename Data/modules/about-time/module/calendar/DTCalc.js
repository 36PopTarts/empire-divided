export const Gregorian = {
    "month_len": {
        "January": { days: [31, 31] },
        "February": { days: [28, 29] },
        "March": { days: [31, 31] },
        "April": { days: [30, 30] },
        "May": { days: [31, 31] },
        "June": { days: [30, 30] },
        "July": { days: [31, 31] },
        "August": { days: [31, 31] },
        "September": { days: [30, 30] },
        "October": { days: [31, 31] },
        "November": { days: [30, 30] },
        "December": { days: [31, 31] },
    },
    "leap_year_rule": "(year) => Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400)",
    "weekdays": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "clock_start_year": 1970,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": false
};
export const Golarian = {
    "month_len": {
        "Abadius": { days: [31, 31] },
        "Calistril": { days: [28, 29] },
        "Pharast": { days: [31, 31] },
        "Gozran": { days: [30, 30] },
        "Desnus": { days: [31, 31] },
        "Sarenith": { days: [30, 30] },
        "Erastus": { days: [31, 31] },
        "Arodus": { days: [31, 31] },
        "Rova": { days: [30, 30] },
        "Lamashan": { days: [31, 31] },
        "Neth": { days: [30, 30] },
        "Kuthona": { days: [31, 31] },
    },
    "leap_year_rule": "(year) =>  Math.floor(year / 8 + 1)",
    "weekdays": ["Moonday", "Toilday", "Wealday", "Oathday", "Fireday", "Starday", "Sunday"],
    "clock_start_year": 0,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": false
};
export const Greyhawk = {
    // month lengths non-leap year and leapyear
    "month_len": {
        "Needfest": { days: [7, 7] },
        "Fireseek": { days: [28, 28] },
        "Readying": { days: [28, 28] },
        "Coldeven": { days: [28, 28] },
        "Growfest": { days: [7, 7] },
        "Planting": { days: [28, 28] },
        "Flocktime": { days: [28, 28] },
        "Wealsun": { days: [28, 28] },
        "Richfest": { days: [7, 7] },
        "Reaping": { days: [28, 28] },
        "Goodmonth": { days: [28, 28] },
        "Harvester": { days: [28, 28] },
        "Brewfest": { days: [7, 7] },
        "Patchwall": { days: [28, 28] },
        "Ready'reat": { days: [28, 28] },
        "Sunsebb": { days: [28, 28] }
    },
    // rule for calculating number of leap years from 0 to year
    "leap_year_rule": "(year) => 0",
    // days of week
    "weekdays": ["Starday", "Sunday", "Moonday", "Godsday", "Waterday", "Earthday", "Freeday"],
    "notes": {},
    // what is the base year for the real time clock
    "clock_start_year": 0,
    "first_day": 0,
    // time constants
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    // does the year have a year 0? Gregorian does not.
    "has_year_0": true
};
export const Warhammer = {
    "month_len": {
        "Hexenstag": { days: [1, 1], intercalary: true },
        "Nachexen": { days: [32, 32] },
        "Jahdrung": { days: [33, 33] },
        "Mitterfruhl": { days: [1, 1], intercalary: true },
        "Pflugzeit": { days: [33, 33] },
        "Sigmarzeit": { days: [33, 33] },
        "SommerZeit": { days: [33, 33] },
        "Sonnstill": { days: [1, 1], intercalary: true },
        "Vorgeheim": { days: [33, 33] },
        "Geheimnistag": { days: [1, 1], intercalary: true },
        "Nachgeheim": { days: [32, 32] },
        "Erntezeit": { days: [33, 33] },
        "Mitterbst": { days: [1, 1], intercalary: true },
        "Brauzeit": { days: [33, 33] },
        "Kalderzeit": { days: [33, 33] },
        "Ulriczeit": { days: [33, 33] },
        "Mondstille": { days: [1, 1], intercalary: true },
        "Vorhexen": { days: [33, 33] },
    },
    "leap_year_rule": "(year) => 0",
    "weekdays": ["Wellentag", "Aubentag", "Marktag", "Backertag", "Bezahltag", "Konistag", "Angestag", "Festag"],
    "clock_start_year": 0,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": true,
};
export const Harptos = {
    "month_len": {
        "Hammer": { days: [30, 30] },
        "Midwinter": { days: [1, 1], intercalary: true },
        "Alturiak": { days: [30, 30] },
        "Ches": { days: [30, 30] },
        "Tarsakh": { days: [30, 30] },
        "Greengrass": { days: [1, 1], intercalary: true },
        "Mirtul": { days: [30, 30] },
        "Kythorn": { days: [30, 30] },
        "Flamerule": { days: [30, 30] },
        "Midsummer": { days: [1, 1], intercalary: true },
        "Shieldmeet": { days: [0, 1], intercalary: true },
        "Eleasis": { days: [30, 30] },
        "Eleint": { days: [30, 30] },
        "Higharvestide": { days: [1, 1], intercalary: true },
        "Marpenoth": { days: [30, 30] },
        "Uktar": { days: [30, 30] },
        "Feast Of the Moon": { days: [1, 1], intercalary: true },
        "Nightal": { days: [30, 30] },
    },
    "leap_year_rule": "(year) => Math.floor(year / 4) + 1",
    "weekdays": ["1st-Day", "2nd-Day", "3rd-Day", "4th-Day", "5th-Day", "6th-Day", "7th-Day", "8th-Day", "9th-Day", "10th-Day"],
    "clock_start_year": 0,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": true
};
export const Exandrian = {
    "month_len": {
        "Horisal": { days: [29, 29] },
        "Misuthar": { days: [30, 30] },
        "Dualahei": { days: [30, 30] },
        "Thunsheer": { days: [31, 31] },
        "Unndilar": { days: [28, 28], },
        "Brussendar": { days: [31, 31] },
        "Sydenstar": { days: [32, 32] },
        "Fessuran": { days: [29, 29] },
        "Quen'pillar": { days: [27, 27] },
        "Cuersaar": { days: [29, 29] },
        "Duscar": { days: [32, 32] },
    },
    "leap_year_rule": "(year) => 0",
    "weekdays": ["Miresen", "Grissen", "Whelsen", "Conthsen", "Folsen", "Yulisen", "Da'leysen"],
    "clock_start_year": 0,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": true
};
export const Glorantha = {
    "month_len": {
        "Sea season - Disorder week": { "days": [7, 7] },
        "Sea season - Harmony week": { "days": [7, 7] },
        "Sea season - Death week": { "days": [7, 7] },
        "Sea season - Fertility week": { "days": [7, 7] },
        "Sea season - Stasis week": { "days": [7, 7] },
        "Sea season - Movement week": { "days": [7, 7] },
        "Sea season - Illusion week": { "days": [7, 7] },
        "Sea season - Truth week": { "days": [7, 7] },
        "Fire season - Disorder week": { "days": [7, 7] },
        "Fire season - Harmony week": { "days": [7, 7] },
        "Fire season - Death week": { "days": [7, 7] },
        "Fire season - Fertility week": { "days": [7, 7] },
        "Fire season - Stasis week": { "days": [7, 7] },
        "Fire season - Movement week": { "days": [7, 7] },
        "Fire season - Illusion week": { "days": [7, 7] },
        "Fire season - Truth week": { "days": [7, 7] },
        "Earth season - Disorder week": { "days": [7, 7] },
        "Earth season - Harmony week": { "days": [7, 7] },
        "Earth season - Death week": { "days": [7, 7] },
        "Earth season - Fertility week": { "days": [7, 7] },
        "Earth season - Stasis week": { "days": [7, 7] },
        "Earth season - Movement week": { "days": [7, 7] },
        "Earth season - Illusion week": { "days": [7, 7] },
        "Earth season - Truth week": { "days": [7, 7] },
        "Dark season - Disorder week": { "days": [7, 7] },
        "Dark season - Harmony week": { "days": [7, 7] },
        "Dark season - Death week": { "days": [7, 7] },
        "Dark season - Fertility week": { "days": [7, 7] },
        "Dark season - Stasis week": { "days": [7, 7] },
        "Dark season - Movement week": { "days": [7, 7] },
        "Dark season - Illusion week": { "days": [7, 7] },
        "Dark season - Truth week": { "days": [7, 7] },
        "Storm season - Disorder week": { "days": [7, 7] },
        "Storm season - Harmony week": { "days": [7, 7] },
        "Storm season - Death week": { "days": [7, 7] },
        "Storm season - Fertility week": { "days": [7, 7] },
        "Storm season - Stasis week": { "days": [7, 7] },
        "Storm season - Movement week": { "days": [7, 7] },
        "Storm season - Illusion week": { "days": [7, 7] },
        "Storm season - Truth week": { "days": [7, 7] },
        "Sacred Time - First week": { "days": [7, 7] },
        "Sacred Time - Second week": { "days": [7, 7] }
    },
    "weekdays": ["Freezeday", "Waterday", "Clayday", "Windsday", "Fireday", "Wildday", "Godsday"],
    "clock_start_year": 0,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": false,
    "leap_year_rule": "() => 0"
};
export const Eberron = {
    "month_len": {
        "Zarantyr": { days: [28, 28] },
        "Olarune": { days: [28, 28] },
        "Therendor": { days: [28, 28] },
        "Eyre": { days: [28, 28] },
        "Dravago": { days: [28, 28] },
        "Nymm": { days: [28, 28] },
        "Lharvion": { days: [28, 28] },
        "Barrakas": { days: [28, 28] },
        "Rhaan": { days: [28, 28] },
        "Sypheros": { days: [28, 28] },
        "Aryth": { days: [28, 28] },
        "Vult": { days: [28, 28] },
    },
    "leap_year_rule": "(year) => 0",
    "weekdays": ["Sul", "Mol", "Zol", "Wir", "Zor", "Far", "Sar"],
    "clock_start_year": 998,
    "first_day": 0,
    "notes": {},
    "hours_per_day": 24,
    "seconds_per_minute": 60,
    "minutes_per_hour": 60,
    "has_year_0": true
};
let userCalendarSpec = duplicate(Gregorian);
export const calendars = {
    "UserCreated": userCalendarSpec,
    "Gregorian": Gregorian,
    "Warhammer": Warhammer,
    "Greyhawk": Greyhawk,
    "Harptos": Harptos,
    "Golarian": Golarian,
    "Exandrian": Exandrian,
    "Glorantha": Glorantha,
    "Eberron": Eberron
};
export class DTCalc {
    static changeDefaultCalendar() {
        DTCalc.createFromData(calendars[Object.keys(calendars)[game.settings.get("about-time", "calendar")]]);
    }
    static userCalendarChanged() {
        DTCalc.loadUserCalendar();
        if (game.settings.get("about-time", "calendar") === 0)
            DTCalc.createFromData();
    }
    static createFromData(calendarSpec = calendars[Object.keys(calendars)[game.settings.get("about-time", "calendar")]]) {
        //    let tc = new DTCalc();
        DTCalc.spm = calendarSpec.seconds_per_minute;
        DTCalc.mph = calendarSpec.minutes_per_hour;
        DTCalc.hpd = calendarSpec.hours_per_day;
        DTCalc.spd = DTCalc.hpd * DTCalc.mph * DTCalc.spm;
        DTCalc.spw = DTCalc.spd * DTCalc.dpw;
        DTCalc.sph = DTCalc.spm * DTCalc.mph;
        // @ts-ignore
        DTCalc.dpm = Object.keys(calendarSpec.month_len).map(key => calendarSpec.month_len[key].days);
        DTCalc.dpy = [0, 1].map(i => DTCalc.sum(...Object.values(DTCalc.dpm).map(a => a[i])));
        if (isNaN(DTCalc.dpy[1]))
            DTCalc.dpy[1] = DTCalc.dpy[0]; // just in case leap months not set
        if (typeof calendarSpec.leap_year_rule === "string")
            DTCalc.leapYearRule = eval(calendarSpec.leap_year_rule);
        else
            DTCalc.leapYearRule = calendarSpec.leap_year_rule ? calendarSpec.leap_year_rule : (year) => 0;
        DTCalc.spy = DTCalc.spd * DTCalc.dpy[0]; // seconds in a normal year
        DTCalc.months = Object.keys(calendarSpec.month_len);
        DTCalc.mpy = DTCalc.months.length;
        DTCalc.month_len = calendarSpec.month_len;
        DTCalc.weekDays = calendarSpec.weekdays;
        DTCalc.dpw = calendarSpec.weekdays.length;
        ;
        DTCalc.clockStartYear = calendarSpec.clock_start_year;
        DTCalc.firstDay = calendarSpec.first_day;
        DTCalc.hasYearZero = calendarSpec.has_year_0;
        DTCalc.ICMonths = Object.keys(DTCalc.month_len).map(k => DTCalc.month_len[k].intercalary ? 1 : 0);
        DTCalc.yearlyICDays = DTCalc.ICMonths.reduce((acc, v) => acc + v);
        DTCalc.cumICDays = [];
        const cumSum = (sum => value => sum += value)(0);
        DTCalc.cumICDays = DTCalc.ICMonths.map(cumSum);
    }
    /**
     *
     * @param year how many leap years from uear 0 to year "year"
     */
    static numLeapYears(year) {
        return this.leapYearRule(year);
    }
    static setFirstDay(day) {
        DTCalc.firstDay = (day + DTCalc.dpw) % DTCalc.dpw;
        if (game.settings.get("about-time", "calendar") === 0) {
            userCalendarSpec.first_day = DTCalc.firstDay;
        }
    }
    static padNumber(n, digits = 2) {
        return `${n}`.padStart(digits, "0");
    }
    static padYear(n, digits = 2) {
        return `${n}`.padStart(digits, " ");
    }
    /**
     *
     * @param year is year "year" a leap year 1 for yes, 0 for no.
     */
    static isLeapYear(year) {
        return (this.leapYearRule(year) > this.leapYearRule(year - 1)) ? 1 : 0;
    }
    /**
     *
     * @param year how days in the year "year" - know about leap years
     */
    static daysInYear(year) {
        return this.dpy[this.isLeapYear(year)];
    }
    /**
     *
     * @param months -number of months to calculate for
     * return number of seconds in the first "months" months of the year.
     * Assumes non-leap year
     */
    static monthsToSeconds(months) {
        //@ts-ignore fromRange
        if (months === 0)
            return 0;
        //@ts-ignore
        let days = Array.fromRange(months).reduce((acc, index) => acc + DTCalc.dpm[index], 0);
        // let days = [...Array(months).keys()].map(i=>this.dpm[i]).reduce((a,b) => a + b);
        return days * DTCalc.spd;
    }
    /**
     *
     * @param {days, hours, minutes, second} return the equivalent total number of seconds.
     */
    static timeToSeconds({ days = 0, hours = 0, minutes = 0, seconds = 0 }) {
        return days * DTCalc.spd + hours * DTCalc.sph + minutes * DTCalc.spm + seconds;
    }
    static loadUserCalendar() {
        var _a;
        userCalendarSpec = duplicate(game.settings.get("about-time", "savedCalendar"));
        if (!((_a = userCalendarSpec) === null || _a === void 0 ? void 0 : _a.month_len)) {
            console.error("about-time | User Calendar load failed setting to gregorian");
            userCalendarSpec = Gregorian;
        }
        else
            userCalendarSpec.leap_year_rule = eval(userCalendarSpec.leap_year_rule);
        calendars["UserCreated"] = userCalendarSpec;
        return userCalendarSpec;
    }
    static saveUserCalendar(newCalendarSpec = userCalendarSpec) {
        let savedCalendarSpec = duplicate(newCalendarSpec);
        userCalendarSpec = newCalendarSpec;
        calendars["UserCreated"] = newCalendarSpec;
        //@ts-ignore
        if (game.user.isGM) {
            if (!savedCalendarSpec.leap_year_rule)
                savedCalendarSpec.leap_year_rule = () => 0;
            savedCalendarSpec.leap_year_rule = savedCalendarSpec.leap_year_rule.toString();
            game.settings.set("about-time", "savedCalendar", savedCalendarSpec);
        }
    }
}
DTCalc.log = (...args) => {
    console.log("about-time | ", ...args);
};
DTCalc.sum = (...args) => args.reduce((acc, v) => acc + v);
