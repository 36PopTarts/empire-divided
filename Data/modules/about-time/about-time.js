/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { ElapsedTime } from "./module/ElapsedTime.js";
import { PseudoClock } from "./module/PseudoClock.js";
import { DTMod } from "./module/calendar/DTMod.js";
import { runDateTimeTests } from "./module/calendar/DTSTests.js";
import { DTCalc } from "./module/calendar/DTCalc.js";
import { calendars } from "./module/calendar/DTCalc.js";
import { DateTime } from "./module/calendar/DateTime.js";
import { SimpleCalendarDisplay } from "./module/display/Display.js";
import { CountDown } from "./module/display/CountDown.js";
import { CalendarEditor } from "./module/calendarEdtior/CalendarEditor.js";
import { RealTimeCountDown } from "./module/display/RealTimeCountDown.js";
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
    console.log('about-time | Initializing about-time');
    // Assign custom classes and constants here
    // Register custom module settings
    registerSettings();
    // Preload Handlebars templates
    await preloadTemplates();
    // Register custom sheets (if any)
});
let operations;
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
    // Do anything after initialization but before
    // ready
    operations = {
        isMaster: () => PseudoClock.isMaster,
        isRunning: PseudoClock.isRunning,
        doAt: ElapsedTime.doAt,
        doIn: ElapsedTime.doIn,
        doEvery: ElapsedTime.doEvery,
        doAtEvery: ElapsedTime.doAtEvery,
        reminderAt: ElapsedTime.reminderAt,
        reminderIn: ElapsedTime.reminderIn,
        reminderEvery: ElapsedTime.reminderEvery,
        reminderAtEvery: ElapsedTime.reminderAtEvery,
        notifyAt: ElapsedTime.notifyAt,
        notifyIn: ElapsedTime.notifyIn,
        notifyEvery: ElapsedTime.notifyEvery,
        notifyAtEvery: ElapsedTime.notifyAtEvery,
        clearTimeout: ElapsedTime.gclearTimeout,
        getTimeString: ElapsedTime.currentTimeString,
        getTime: ElapsedTime.currentTimeString,
        queue: ElapsedTime.showQueue,
        chatQueue: ElapsedTime.chatQueue,
        ElapsedTime: ElapsedTime,
        DTM: DTMod,
        DTC: DTCalc,
        DT: DateTime,
        DMf: DTMod.create,
        DTf: DateTime.create,
        DTNow: DateTime.now,
        calendars: calendars,
        _notifyEvent: PseudoClock.notifyEvent,
        startRunning: PseudoClock.startRealTime,
        stopRunning: PseudoClock.stopRealTime,
        mutiny: PseudoClock.mutiny,
        advanceClock: ElapsedTime.advanceClock,
        advanceTime: ElapsedTime.advanceTime,
        setClock: PseudoClock.setClock,
        setTime: ElapsedTime.setTime,
        setAbsolute: ElapsedTime.setAbsolute,
        setDateTime: ElapsedTime.setDateTime,
        flushQueue: ElapsedTime._flushQueue,
        reset: ElapsedTime._initialize,
        resetCombats: ElapsedTime.resetCombats,
        status: ElapsedTime.status,
        pc: PseudoClock,
        showClock: SimpleCalendarDisplay.showClock,
        CountDown: CountDown,
        RealTimeCountDown: RealTimeCountDown,
        _save: ElapsedTime._save,
        _load: ElapsedTime._load,
    };
    //@ts-ignore
    game.Gametime = operations;
    //@ts-ignore
    window.Gametime = operations;
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
    // emergency clearing of the queue ElapsedTime._flushQueue();
    DTCalc.loadUserCalendar();
    DTCalc.createFromData();
    PseudoClock.init();
    ElapsedTime.init();
    if (ElapsedTime.debug) {
        runDateTimeTests();
    }
    /*
    new CalendarEditor(
        calendars[Object.keys(calendars)[game.settings.get("about-time", "calendar")]],
        {editable: true, closeOnSubmit: true, submitOnClose: false, submitOnUnfocus: false}
    ).render(false);
    */
    //@ts-ignore
    window.CalendarEditor = CalendarEditor;
});
