import { ElapsedTime } from "./ElapsedTime.js";
import { DTCalc } from "./calendar/DTCalc.js";
import { calendars } from "./calendar/DTCalc.js";
import { Gregorian } from "./calendar/DTCalc.js";
import { PseudoClock } from "./PseudoClock.js";
export const registerSettings = function () {
    // Register any custom module settings here
    let modulename = "about-time";
    game.settings.register("about-time", "real-time-multiplier", {
        name: game.i18n.localize("about-time.GTM.name"),
        hint: game.i18n.localize("about-time.GTM.hint"),
        scope: "world",
        config: true,
        default: 1,
        type: Number,
        onChange: PseudoClock._fetchParams
    });
    game.settings.register("about-time", "real-time-interval", {
        name: game.i18n.localize("about-time.RTU.name"),
        hint: game.i18n.localize("about-time.RTU.hint"),
        scope: "world",
        config: true,
        default: 30,
        type: Number,
        onChange: PseudoClock._fetchParams
    });
    game.settings.register("about-time", "seconds-per-round", {
        name: game.i18n.localize("about-time.SPR.name"),
        hint: game.i18n.localize("about-time.SPR.hint"),
        default: 6,
        type: Number,
        scope: 'world',
        config: true,
        onChange: ElapsedTime._fetchParams
    });
    game.settings.register("about-time", "election-timeout", {
        name: game.i18n.localize("about-time.MCT.name"),
        hint: game.i18n.localize("about-time.MCT.hint"),
        default: 5,
        type: Number,
        scope: 'world',
        config: true,
        onChange: ElapsedTime._fetchParams
    });
    game.settings.register("about-time", "calendar", {
        name: game.i18n.localize("about-time.CAL.name"),
        hint: game.i18n.localize("about-time.CAL.hint"),
        scope: "world",
        default: 0,
        type: Number,
        choices: Object.keys(calendars),
        config: true,
        onChange: DTCalc.changeDefaultCalendar
    });
    game.settings.register("about-time", "store", {
        name: "Elapsed Time event queue",
        hint: "Don't touch this",
        default: {},
        type: Object,
        scope: 'world',
        config: false
    });
    game.settings.register("about-time", "calendarFormat", {
        name: "Elapsed Time event queue",
        hint: "Don't touch this",
        default: {},
        type: Object,
        scope: 'client',
        config: false
    });
    game.settings.register("about-time", "savedCalendar", {
        name: "Hidden",
        hint: "Don't touch this",
        default: Gregorian,
        type: Object,
        scope: 'world',
        config: false,
        onChange: DTCalc.userCalendarChanged
    });
    game.settings.register("about-time", "pseudoclock", {
        name: "Pseudo clock status",
        hint: "Don't touch this",
        default: {},
        type: Object,
        scope: 'world',
        config: false
    });
    game.settings.register("about-time", "debug", {
        name: "Debug output",
        hint: "Debug output",
        default: false,
        type: Boolean,
        scope: 'client',
        config: true,
        onChange: ElapsedTime._fetchParams
    });
};
