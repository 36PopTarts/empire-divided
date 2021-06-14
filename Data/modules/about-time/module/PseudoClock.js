import { DTMod } from "./calendar/DTMod.js";
import { ElapsedTime } from "./ElapsedTime.js";
import { Quentry } from "./FastPirorityQueue.js";
const _moduleSocket = "module.about-time";
const _updateClock = "about-time.updateClock";
const _eventTrigger = "about-time.eventTrigger";
const _queryMaster = "about-time.queryMaster";
const _masterResponse = "about-time.masterResponse";
const _masterMutiny = "about-time.Arrrgh...Matey";
const _runningClock = "about-time.clockRunningStatus";
const _acquiredMaster = "about-time.pseudoclockMaster";
export const _addEvent = "about.time.addEvent";
export const _showTimer = "about-time.showTimer";
let _userId = "";
let debug;
debug = true;
let log = (...args) => {
    console.log("about-time | ", ...args);
};
export class PseudoClockMessage {
    constructor({ action, userId, newTime = 0 }, ...args) {
        this._action = action;
        this._userId = userId;
        this._newTime = newTime;
        this._args = args;
        return this;
    }
}
export class PseudoClock {
    static get clockStartYear() { return this._clockStartYear; }
    ;
    static setDebug(val) {
        debug = val;
    }
    static get isGM() { return PseudoClock._isGM; }
    static _initialize(currentTime = 0, realTimeMult = 0, realTimeInterval, running = false) {
        PseudoClock._running = running;
        PseudoClock._globalRunning = running;
        PseudoClock._realTimeMult = game.settings.get("about-time", "real-time-multiplier");
        PseudoClock._realTimeInterval = game.settings.get("about-time", "real-time-interval");
        //@ts-ignore
        PseudoClock.serverTime = game.time.serverTime;
        PseudoClock._save(true);
        if (!CONFIG.time.roundTime)
            CONFIG.time.roundTime = 6;
    }
    static get currentTime() {
        //@ts-ignore
        return game.time.worldTime;
    }
    static _createFromData(data) {
        PseudoClock._running = data._running;
        PseudoClock._globalRunning = data._running;
        PseudoClock._realTimeMult = game.settings.get("about-time", "real-time-multiplier");
        PseudoClock._realTimeInterval = game.settings.get("about-time", "real-time-interval");
        if (!CONFIG.time.roundTime)
            CONFIG.time.roundTime = 6;
        if (data._currentTime) {
            console.warn("save data contains current time using ", data._currentTime);
            game.settings.set("core", "time", data._currentTime);
        }
        else
            log("No settings saved time found");
    }
    static get isMaster() {
        return PseudoClock._isMaster;
    }
    static warnNotMaster(operation) {
        ui.notifications.error(`${game.user.name} ${operation} - ${game.i18n.localize("about-time.notMaster")}`);
        console.warn(`Non master timekeeper attempting to ${operation}`);
    }
    static warnNotGM(operation) {
        ui.notifications.error(`${game.user.name} ${operation} - ${game.i18n.localize("about-time.notMaster")}`);
        console.warn(`Non GM attempting to ${operation}`);
    }
    static status() {
        console.log(PseudoClock._realTimeMult, PseudoClock._running, PseudoClock._globalRunning);
    }
    static _displayCurrentTime() {
        //@ts-ignore .time
        console.log(`Elapsed time ${game.time.worldTime}`);
    }
    static getDHMS() {
        //@ts-ignore .time
        return DTMod.fromSeconds(game.time.worldTime);
    }
    static advanceClock(timeIncrement) {
        if (PseudoClock.isGM)
            //@ts-ignore
            game.time.advance(timeIncrement);
        else
            PseudoClock.warnNotGM("Advance clock");
    }
    static setClock(newTime) {
        if (PseudoClock.isGM) {
            newTime = Math.floor(newTime);
            game.settings.set("core", "time", newTime);
        }
    }
    static _realTimeHandler() {
        if (debug)
            log("Real time handler fired");
        //@ts-ignore .time
        let newServerTime = game.time.serverTime;
        if (!game.paused && PseudoClock._running) {
            //@ts-ignore
            let dt = newServerTime - this.serverTime;
            let gameTimeAdvance = PseudoClock._realTimeInterval * PseudoClock._realTimeMult;
            PseudoClock.advanceClock(gameTimeAdvance);
        }
        PseudoClock.serverTime = newServerTime;
    }
    static demote() {
        PseudoClock._isMaster = false;
        Hooks.callAll(_acquiredMaster, false);
        ElapsedTime._save(true);
        if (PseudoClock._realTimeTimerID)
            clearInterval(PseudoClock._realTimeTimerID);
    }
    static notifyMutiny() {
        let message = new PseudoClockMessage({ action: _masterMutiny, userId: _userId });
        PseudoClock._notifyUsers(message);
    }
    static mutiny() {
        PseudoClock.notifyMutiny();
        let timeout = game.settings.get("about-time", "election-timeout") / 2 * 1000;
        // 2 set a timeout, if it expires assume master timekeeper role.
        PseudoClock._queryTimeoutId = setTimeout(() => {
            log("Mutineer assuming master timekeeper role ", PseudoClock._realTimeInterval);
            PseudoClock._isMaster = true;
            PseudoClock._load();
            ElapsedTime._load();
            if (PseudoClock._realTimeTimerID)
                clearInterval(PseudoClock._realTimeTimerID);
            PseudoClock._realTimeTimerID = setInterval(PseudoClock._realTimeHandler, PseudoClock._realTimeInterval * 1000);
            Hooks.callAll(_acquiredMaster, true);
            let message = new PseudoClockMessage({ action: _masterResponse, userId: _userId });
            PseudoClock._notifyUsers(message);
        }, timeout);
    }
    static notifyRunning(status) {
        let message = new PseudoClockMessage({ action: _runningClock, userId: _userId }, status);
        PseudoClock._notifyUsers(message);
        Hooks.callAll(_runningClock, status);
    }
    /* Start the real time clock */
    static startRealTime() {
        if (PseudoClock._isMaster) {
            if (PseudoClock._realTimeTimerID)
                clearInterval(PseudoClock._realTimeTimerID);
            PseudoClock._realTimeTimerID = setInterval(PseudoClock._realTimeHandler, PseudoClock._realTimeInterval * 1000);
            PseudoClock._running = true;
            PseudoClock._globalRunning = true;
            PseudoClock.notifyRunning(true);
        }
        else
            PseudoClock.warnNotMaster("Start realtime");
    }
    static stopRealTime() {
        if (PseudoClock.isMaster) {
            if (PseudoClock.isMaster && PseudoClock.isRunning)
                if (PseudoClock._realTimeTimerID)
                    clearInterval(PseudoClock._realTimeTimerID);
            PseudoClock._running = false;
            PseudoClock._globalRunning = false;
            PseudoClock.notifyRunning(false);
        }
        else
            PseudoClock.warnNotMaster("Stop realtime");
    }
    static pauseRealTime() {
        PseudoClock._running = false;
    }
    static resumeRealTime() {
        PseudoClock._running = PseudoClock._globalRunning;
    }
    static isRunning() {
        return PseudoClock._globalRunning;
    }
    static _processAction(message) {
        if (message._userId === _userId)
            return;
        switch (message._action) {
            case _eventTrigger:
                Hooks.callAll(_eventTrigger, ...message._args);
                break;
            case _queryMaster:
                if (PseudoClock._isMaster) {
                    log(game.user.name, "responding as master time keeper");
                    //@ts-ignore
                    let message = new PseudoClockMessage({ action: _masterResponse, userId: _userId, newTime: game.time.worldTime });
                    PseudoClock._notifyUsers(message);
                }
                break;
            case _masterResponse:
                if (message._userId !== _userId) {
                    // cancel timeout
                    clearTimeout(PseudoClock._queryTimeoutId);
                    console.log("Master response message ", message);
                    //@ts-ignore
                    let userName = game.users.entities.find(u => u._id === message._userId).name;
                    log(userName, " as master timekeeper responded cancelling timeout");
                }
                break;
            case _masterMutiny:
                if (message._userId !== _userId && PseudoClock._isMaster) {
                    PseudoClock.demote();
                    //@ts-ignore
                    let userName = game.users.entities.find(u => u._id === message._userId).name;
                    log(userName, " took control as master timekeeper. Aaaahhhrrr");
                }
                break;
            case _runningClock:
                PseudoClock._globalRunning = message._args[0];
                Hooks.callAll(_runningClock);
                break;
            case _showTimer:
                Hooks.callAll(_showTimer, message._args[0]);
                break;
            case _addEvent:
                if (!PseudoClock.isMaster)
                    return;
                ElapsedTime._eventQueue.add(Quentry.createFromJSON(message._args[0]));
                ElapsedTime._save(true);
        }
    }
    ;
    static async notifyEvent(eventName, ...args) {
        let message = new PseudoClockMessage({ action: _eventTrigger, userId: _userId, newTime: 0 }, eventName, ...args);
        Hooks.callAll(_eventTrigger, ...message._args);
        return PseudoClock._notifyUsers(message);
    }
    static async _notifyUsers(message) {
        //@ts-ignore
        await game.socket.emit(_moduleSocket, message, resp => {
        });
    }
    static _setupSocket() {
        //@ts-ignore
        game.socket.on(_moduleSocket, (data) => {
            PseudoClock._processAction(data);
        });
    }
    ;
    static _load() {
        let saveData = game.settings.get("about-time", "pseudoclock");
        if (debug)
            log("_load", saveData);
        try {
            if (!saveData) {
                if (debug)
                    log("no saved data re-initializing");
                PseudoClock._initialize(0, 0, 30, false);
            }
            else {
                if (debug)
                    log("loaded saved Data. ", saveData);
                PseudoClock._createFromData(saveData);
            }
        }
        catch (err) {
            console.log(err);
            PseudoClock._initialize(0, 0, 30, false);
        }
        PseudoClock._fetchParams();
    }
    ;
    static _save(force) {
        let newSaveTime = Date.now();
        if (PseudoClock._isMaster) {
            if (debug)
                log("save times are ", newSaveTime, PseudoClock._lastSaveTime, PseudoClock._saveInterval);
            if ((newSaveTime - PseudoClock._lastSaveTime > PseudoClock._saveInterval) || force) {
                if (debug)
                    log("_save saving", new Date(), PseudoClock.currentTime);
                let saveData = {
                    _running: PseudoClock._running,
                };
                game.settings.set("about-time", "pseudoclock", saveData);
                // put something in to throttle saving
                PseudoClock._lastSaveTime = newSaveTime;
            }
        }
    }
    static init() {
        _userId = game.user.id;
        PseudoClock._isGM = game.user.isGM;
        PseudoClock._lastSaveTime = Date.now();
        PseudoClock._fetchParams();
        Hooks.on("updateWorldTime", (newTime, dt) => {
            Hooks.callAll("pseudoclockSet", newTime);
        });
        //@ts-ignore
        // find a better way to do this.
        PseudoClock._isMaster = false;
        PseudoClock._setupSocket();
        // 1 send a message to see if there is another master clock already out there
        if (debug)
            log("pseudoclock sending query master message");
        let message = new PseudoClockMessage({ action: _queryMaster, userId: _userId });
        PseudoClock._notifyUsers(message);
        if (PseudoClock.isGM) {
            let timeout = game.settings.get("about-time", "election-timeout") * 1000;
            // 2 set a timeout, if it expires assume master timekeeper role.
            PseudoClock._queryTimeoutId = setTimeout(() => {
                log("Assuming master timekeeper role", PseudoClock._realTimeInterval);
                PseudoClock.notifyMutiny();
                PseudoClock._isMaster = true;
                PseudoClock._load();
                if (PseudoClock._realTimeTimerID)
                    clearInterval(PseudoClock._realTimeTimerID);
                PseudoClock._realTimeTimerID = setInterval(PseudoClock._realTimeHandler, PseudoClock._realTimeInterval * 1000);
                Hooks.callAll(_acquiredMaster, true);
            }, timeout);
        }
        if (debug)
            log("election-timeout: timeout set id is ", PseudoClock._queryTimeoutId);
    }
    static _fetchParams() {
        PseudoClock._realTimeMult = game.settings.get("about-time", "real-time-multiplier");
        if (isNaN(PseudoClock._realTimeMult))
            PseudoClock._realTimeMult = 1;
        PseudoClock._realTimeInterval = (game.settings.get("about-time", "real-time-interval") || 15);
        if (game.settings.get("about-time", "seconds-per-round"))
            CONFIG.time.roundTime = game.settings.get("about-time", "seconds-per-round");
    }
}
PseudoClock._saveInterval = 1 * 60 * 1000; // only save every 1 minutes real time. make a param.
PseudoClock._clockStartYear = 1;
