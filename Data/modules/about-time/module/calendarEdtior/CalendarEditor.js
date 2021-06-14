import { calendars } from "../calendar/DTCalc.js";
import { DateTime } from "../calendar/DateTime.js";
import { DTCalc } from "../calendar/DTCalc.js";
import { ElapsedTime } from "../ElapsedTime.js";
export class CalendarEditor extends FormApplication {
    constructor(calendarSpec = calendars[Object.keys(calendars)[game.settings.get("about-time", "calendar")]], options) {
        // check for calendar-weather being loaded.
        super(duplicate(calendarSpec), options);
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/about-time/templates/calendarEditor.html";
        options.width = 550;
        // options.height = 520; // should be "auto", but foundry has problems with dynamic content
        options.title = "Calendar Editor";
        options.editable = game.user.isGM;
        return options;
    }
    getData() {
        let data = super.getData();
        let now = DateTime.now();
        data.now = now.longDate();
        data.month_keys = Object.keys(this.object.month_len);
        data.months = Object.keys(data.object.month_len).map(name => {
            return {
                name: name,
                days0: data.object.month_len[name].days[0],
                days1: data.object.month_len[name].days[1],
                intercalary: data.object.month_len[name].intercalary
            };
        });
        data.DateYears = now.years;
        data.DateMonths = now.months + 1;
        data.DateDays = now.days + 1;
        data.TimeHours = now.hours;
        data.TimeMinutes = now.minutes;
        data.TimeSeconds = now.seconds;
        data.dow = now.dow();
        //@ts-ignore
        data.format = mergeObject(game.settings.get("about-time", "calendarFormat"), { day: true, month: true, year: true, hours: true, minutes: true, seconds: true, monthDay: true }, { overwrite: false });
        return data;
    }
    async _updateObject(event, formData) {
        let new_month_len = {};
        formData["months.name"].forEach((name, index) => {
            new_month_len[name] = { days: [parseInt(formData["months.days0"][index]), parseInt(formData["months.days1"][index])], intercalary: formData["months.intercalary"][index] };
        });
        this.object.month_len = new_month_len;
        this.object.weekdays = formData["dayname"];
        this.object.hours_per_day = parseInt(formData.hours_per_day);
        this.object.minutes_per_hour = parseInt(formData.minutes_per_hour);
        this.object.seconds_per_minute = parseInt(formData.seconds_per_minute);
        this.object.has_year_0 = formData.has_year_0;
        let dataFormat = mergeObject(game.settings.get("about-time", "calendarFormat"), {
            "month": formData["format.month"],
            "monthDay": formData["format.monthDay"],
            "year": formData["format.year"],
            "day": formData["format.day"]
        }, 
        //@ts-ignore
        { overwrite: true });
        game.settings.set("about-time", "calendarFormat", dataFormat);
        //TODO leap year rules
        DTCalc.saveUserCalendar(this.object);
        DTCalc.userCalendarChanged();
        let newDateTime = DateTime.create({
            years: parseInt(formData.DateYears), months: parseInt(formData.DateMonths) - 1, days: parseInt(formData.DateDays) - 1,
            hours: parseInt(formData.TimeHours), minutes: parseInt(formData.TimeMinutes), seconds: parseInt(formData.TimeSeconds)
        });
        ElapsedTime.setDateTime(newDateTime);
        newDateTime.setCalDow(parseInt(formData.dow));
        this.object.first_day = DTCalc.firstDay;
        DTCalc.saveUserCalendar(this.object);
        game.settings.set("about-time", "calendar", 0);
        DTCalc.userCalendarChanged();
        ElapsedTime._save(true);
    }
    activateListeners(html) {
        super.activateListeners(html);
        if (!game.user.isGM)
            return;
        html.find('.month-delete').click(async (ev) => {
            if (Object.keys(this.object.month_len).length <= 1)
                return; // must have at least one month
            let li = $(ev.currentTarget);
            let id = li.attr("month-id");
            delete this.object.month_len[id];
            li.slideUp(200);
            this.render(false);
        });
        html.find('.month-create').click(async (ev) => {
            let newMonthName = "New Month " + Object.keys(this.object.month_len).length;
            this.object.month_len[newMonthName] = { days: [1, 1], intercalary: false };
            this.render(false);
        });
        html.find('.weekday-delete').click(async (ev) => {
            if (this.object.weekdays.length <= 1)
                return; // must have one weekday
            let li = $(ev.currentTarget).parents(".weekday");
            let id = Number(li.attr("weekday-id"));
            this.object.weekdays.splice(id, 1);
            li.slideUp(200);
            this.render(false);
        });
        html.find('.weekday-create').click(async (ev) => {
            let newMonthName = "New Day " + this.object.weekdays.length;
            this.object.weekdays.push(newMonthName);
            this.render(false);
        });
    }
}
