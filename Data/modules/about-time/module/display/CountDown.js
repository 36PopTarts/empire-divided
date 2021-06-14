import { ElapsedTime } from "../ElapsedTime.js";
import { DateTime } from "../calendar/DateTime.js";
import { DTMod } from "../calendar/DTMod.js";
import { _showTimer, PseudoClock } from "../PseudoClock.js";
let displayMain = null;
export class CountDown extends FormApplication {
    constructor(object = {}, options = null, duration = DTMod.create({ minutes: 10 })) {
        super(object, options);
        this.targetTime = DateTime.now().add(duration);
    }
    static showTimer() {
        if (displayMain)
            displayMain.render(true);
    }
    static startTimer(duration, forceRealtime = false) {
        if (forceRealtime && game.user.isGM) {
            game.settings.set("about-time", "real-time-multiplier", 1);
            game.settings.set("about-time", "real-time-interval", 1);
        }
        if (!displayMain) {
            displayMain = new CountDown({}, {}, duration);
            CountDown.setupHooks();
        }
        else
            displayMain.resetTimer(duration);
        displayMain.render(true);
        if (game.user.isGM) {
            // PseudoClock.showTimer(displayMain.targetTime);
        }
    }
    resetTimer(duration) {
        this.targetTime = DateTime.now().add(duration);
    }
    static updateClock() {
        if (displayMain) {
            displayMain.render(false);
        }
    }
    activateListeners(html) {
        super.activateListeners(html);
        if (!game.user.isGM)
            return;
        $(html)
            .find("#about-time-calendar-btn-min")
            .click(event => {
            let now = DateTime.now();
            let timeSpec = { hours: now.hours, minutes: now.minutes + 1, seconds: 0 };
            ElapsedTime.setTime(timeSpec);
            this.render(false);
        });
        $(html)
            .find("#about-time-calendar-btn-tenMin")
            .click(event => {
            let now = DateTime.now();
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
            .find("#about-time-calendar-time")
            .click(event => {
            if (PseudoClock.isMaster) {
                if (PseudoClock.isRunning())
                    PseudoClock.stopRealTime();
                else
                    PseudoClock.startRealTime();
                this.render(false);
            }
        });
    }
    get title() {
        let timeRemaining = Math.max(0, this.targetTime.toSeconds() - DateTime.now().toSeconds());
        return DTMod.timeString(timeRemaining);
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/about-time/templates/countDown.html";
        // options.width = 520;
        // options.height = 520; // should be "auto", but foundry has problems with dynamic content
        options.title = DateTime.now().longDate().time;
        return options;
    }
    /**
     * Provides data to the form, which then can be rendered using the handlebars templating engine
     */
    getData() {
        //@ts-ignore
        let timeRemaining = Math.max(0, this.targetTime.toSeconds() - DateTime.now().toSeconds());
        return {
            now: DateTime.now().shortDate(),
            running: (PseudoClock.isRunning() === undefined || PseudoClock._globalRunning) && !game.paused,
            //@ts-ignore
            isMaster: game.Gametime.isMaster(),
            //@ts-ignore
            isGM: game.user.isGM,
            targetTime: this.targetTime,
            timeRemaining: DTMod.timeString(timeRemaining)
        };
    }
    static setupHooks() {
        Hooks.on("pseudoclockSet", CountDown.updateClock);
        Hooks.on("renderPause", CountDown.updateClock);
        Hooks.on("updateCombat", CountDown.updateClock);
        Hooks.on("deleteCombat", CountDown.updateClock);
        Hooks.on("about-time.clockRunningStatus", CountDown.updateClock);
    }
}
Hooks.on(_showTimer, targetTime => {
    CountDown.startTimer(DTMod.create({ seconds: 0 }));
    displayMain.targetTime = DateTime.create(targetTime);
});
