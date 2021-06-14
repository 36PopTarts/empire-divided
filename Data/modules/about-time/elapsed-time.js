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
import { PseudoClock } from "./module/PsuedoClock.js";
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
    console.log('elapsed-time | Initializing elapsedtime');
    // Assign custom classes and constants here
    // Register custom module settings
    registerSettings();
    // Preload Handlebars templates
    await preloadTemplates();
    // Register custom sheets (if any)
    // setupDisplay();
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
    // Do anything after initialization but before
    // ready
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
    console.log('elapsed-time | Ready elapsedtime ****************************** ');
    PseudoClock.init();
    ElapsedTime.init();
    let operations = {
        isMaster: PseudoClock.isMaster,
        isRunning: PseudoClock.isRunning,
        gsetInterval: ElapsedTime.gsetInterval,
        gsetIntervalAt: ElapsedTime.gsetInvervalAt,
        gsetTimeout: ElapsedTime.gsetTimeout,
        gsetTimeoutAt: ElapsedTime.gsetTimeoutAt,
        doAt: ElapsedTime.doAt,
        reminderAt: ElapsedTime.reminderAt,
        clearTimeout: ElapsedTime.gclearTimeout,
        currentTime: ElapsedTime.currentTime,
        currentTimeString: ElapsedTime.currentTimeString,
        getTimeString: ElapsedTime.getTimeString,
        setDebug: ElapsedTime.setDebug,
        longRest: ElapsedTime.longRest,
        showQueue: ElapsedTime.showQueue,
        queue: ElapsedTime._eventQueue
    };
    if (PseudoClock.isMaster()) {
        const extras = {
            startRunning: PseudoClock.startRealTime,
            stopRunning: PseudoClock.stopRealTime,
            advanceClock: ElapsedTime.advanceClock,
            advanceTime: ElapsedTime.advanceTime,
            setClock: PseudoClock.setClock,
            setTime: ElapsedTime.setTime,
            flushQeue: ElapsedTime._flushQueue,
            reset: ElapsedTime._initialize,
            status: ElapsedTime.status,
            _save: ElapsedTime._save,
            _load: ElapsedTime._load,
            _queue: ElapsedTime._eventQueue
        };
        operations = mergeObject(operations, extras);
    }
    // @ts-ignore
    game.Gametime = operations;
});
