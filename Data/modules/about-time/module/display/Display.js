import { ElapsedTime } from "../ElapsedTime.js";
import { DateTime } from "../calendar/DateTime.js";
import { DTMod } from "../calendar/DTMod.js";
import { PseudoClock } from "../PseudoClock.js";
import { CalendarEditor } from "../calendarEdtior/CalendarEditor.js";
import { calendars } from "../calendar/DTCalc.js";
let displayMain = null;
export class SimpleCalendarDisplay extends FormApplication {
    constructor(object = {}, options = null) {
        super(object, options);
    }
    static showClock() {
        if (!displayMain) {
            displayMain = new SimpleCalendarDisplay();
            SimpleCalendarDisplay.setupHooks();
        }
        displayMain.render(true);
    }
    static updateClock() {
        if (displayMain) {
            displayMain.render(false);
        }
    }
    activateListeners(html) {
        // super.activateListeners(html);
        if (!game.user.isGM)
            return;
        $(html)
            .find("#about-time-calendar-hdr")
            .click(event => {
            var _a;
            if (["0.5.1", "0.5.0"].includes(game.data.version)) {
                var calendar_weather = game.modules.find(module => module.id === 'calendar-weather' && module.active);
            }
            else {
                //@ts-ignore
                var calendar_weather = (_a = game.modules.get('calendar-weather')) === null || _a === void 0 ? void 0 : _a.active;
            }
            if (!calendar_weather)
                new CalendarEditor(calendars[Object.keys(calendars)[game.settings.get("about-time", "calendar")]], { editable: true, closeOnSubmit: true, submitOnClose: false, submitOnUnfocus: false }).render(true);
        });
        $(html)
            .find("#about-time-calendar-btn-min")
            .click(event => {
            // @ts-ignore
            let now = game.Gametime.DTNow();
            let timeSpec = { hours: now.hours, minutes: now.minutes + 1, seconds: 0 };
            ElapsedTime.setTime(timeSpec);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-tenMin")
            .click(event => {
            // @ts-ignore
            let now = game.Gametime.DTNow();
            let timeSpec = { hours: now.hours, minutes: now.minutes + 10, seconds: 0 };
            ElapsedTime.setTime(timeSpec);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-long")
            .click(event => {
            ElapsedTime.advanceTime({ hours: 1 });
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-day")
            .click(event => {
            let now = DateTime.now();
            ElapsedTime.setAbsolute(now.add(new DTMod({ days: now.hours < 7 ? 0 : 1 })).setAbsolute({ hours: 7, minutes: 0, seconds: 0 }));
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-night")
            .click(event => {
            let newDT = DateTime.now().add(new DTMod({ days: 1 })).setAbsolute({ hours: 0, minutes: 0, seconds: 0 });
            ElapsedTime.setAbsolute(newDT);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-long-rest")
            .click(event => {
            ElapsedTime.advanceTime({ hours: 8 });
            this.render(false);
        });
        if (PseudoClock.isMaster) {
            $(html)
                .find("#about-time-calendar-time")
                .click(event => {
                if (PseudoClock.isRunning())
                    PseudoClock.stopRealTime();
                else
                    PseudoClock.startRealTime();
                this.render(false);
            });
        }
    }
    get title() {
        let now = DateTime.now().shortDate();
        return now.date + " " + now.time;
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/about-time/templates/simpleCalendarDisplay.html";
        // options.width = 520;
        // options.height = 520; // should be "auto", but foundry has problems with dynamic content
        options.resizable = true;
        options.title = DateTime.now().longDateSelect(game.settings.get("about-time", "calendarFormat")).time;
        return options;
    }
    /**
     * Provides data to the form, which then can be rendered using the handlebars templating engine
     */
    getData() {
        return {
            now: DateTime.now().longDateSelect(game.settings.get("about-time", "calendarFormat")),
            running: (PseudoClock.isRunning() === undefined || PseudoClock._globalRunning) && !game.paused,
            //@ts-ignore
            isMaster: game.Gametime.isMaster(),
            //@ts-ignore
            isGM: game.user.isGM
        };
    }
    close() {
        displayMain = null;
        return super.close();
    }
    static setupHooks() {
        Hooks.on("updateWorldTime", SimpleCalendarDisplay.updateClock);
        Hooks.on("renderPause", SimpleCalendarDisplay.updateClock);
        Hooks.on("updateCombat", SimpleCalendarDisplay.updateClock);
        Hooks.on("deleteCombat", SimpleCalendarDisplay.updateClock);
        Hooks.on("about-time.clockRunningStatus", SimpleCalendarDisplay.updateClock);
    }
}
