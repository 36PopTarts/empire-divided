class KeybindConfigurator extends FormApplication {
    constructor() {
        super(null);
    }
    get element() {
        return super.element;
    }
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            title: "Keybinds",
            id: "keybind-configurator",
            template: "modules/keybind-lib/templates/configurator.hbs",
            resizable: false,
            width: 600,
            closeOnSubmit: false,
            submitOnChange: false,
            submitOnClose: false,
        };
    }
    getData() {
        const data = {
            modules: [],
        };
        for (const [name, registeredBind,] of globalThis.KeybindLib.registeredBinds.entries()) {
            const [moduleName, bindName] = name.split(".");
            let moduleData = data.modules.find((m) => m.name == moduleName);
            if (!moduleData) {
                moduleData = {
                    name: moduleName,
                    title: game.modules.get(moduleName).data.title,
                    binds: [],
                };
                data.modules.push(moduleData);
            }
            moduleData.binds.push({
                bindName,
                ...registeredBind.options,
                key: registeredBind.keyBind.toString(),
            });
        }
        return data;
    }
    resetSetting(fullName) {
        const [moduleName, bindName] = fullName.split(".");
        const defaultSetting = game.settings.settings.get(fullName)
            .default;
        if (defaultSetting) {
            game.settings.set(moduleName, bindName, defaultSetting);
        }
        return defaultSetting;
    }
    activateListeners(html) {
        super.activateListeners(html);
        this.element
            .find("input")
            .on("keydown", (evt) => globalThis.KeybindLib._handleConfigInput(evt, html));
        this.element.find(`button[name="reset"]`).on("click", () => {
            const formData = this._getSubmitData();
            for (const fullName of Object.keys(formData)) {
                this.resetSetting(fullName);
            }
            this.render(true);
        });
        this.element.find(".fa-undo[data-bind]").on("click", (evt) => {
            const fullName = evt.target.dataset["bind"];
            if (!fullName)
                return;
            const val = this.resetSetting(fullName);
            this.element.find(`input[name="${fullName}"]`).val(val);
            globalThis.KeybindLib._resolveConflicts(html);
        });
        globalThis.KeybindLib._resolveConflicts(html);
    }
    async _updateObject(event, formData) {
        for (const [fullName, value] of Object.entries(formData)) {
            const [moduleName, bindName] = fullName.split(".");
            game.settings.set(moduleName, bindName, value);
        }
        this.render(true);
    }
}

// Modifiers show up as the key code if no other key is pressed
const extraKeys = [
    "Unidentified",
    "AltLeft",
    "ControlLeft",
    "ControlRight",
    "MetaLeft",
    "MetaRight",
    "OSLeft",
    "OSRight",
    "ShiftLeft",
    "ShiftRight",
    "F5",
];
// Map between names and props
const modifiers = [
    ["ctrlKey", "Ctrl"],
    ["shiftKey", "Shift"],
    ["metaKey", "Meta"],
    ["altKey", "Alt"],
];
const allowedKeyPattern = /^[A-Z]\w+$/;
function checkKeyAllowed(key) {
    if (key === "Unidentified") {
        throw new Error(`Key "Unidentified" is not allowed`);
    }
    if (!allowedKeyPattern.test(key)) {
        throw new Error(`Unexpected key format "${key}". Key is required to be a modifier (Ctrl|Shift|Meta|Alt) ` +
            `or in KeyboardEvent.code format: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code`);
    }
}
class KeyEvent {
    constructor() {
        this.altKey = false;
        this.ctrlKey = false;
        this.shiftKey = false;
        this.metaKey = false;
    }
    static fromObject(keyEventObject) {
        if (!keyEventObject.key) {
            throw new Error(`Object is missing "key" property`);
        }
        checkKeyAllowed(keyEventObject.key);
        const keyEvent = new KeyEvent();
        keyEvent.key = keyEventObject.key;
        keyEvent.altKey = !!keyEventObject.altKey;
        keyEvent.ctrlKey = !!keyEventObject.ctrlKey;
        keyEvent.shiftKey = !!keyEventObject.shiftKey;
        keyEvent.metaKey = !!keyEventObject.metaKey;
        keyEvent.originalEvent = keyEventObject.originalEvent || null;
        return keyEvent;
    }
    // Create a new KeyEvent from a source event
    static fromEvent(event) {
        if (isJQueryEvent(event)) {
            event = event.originalEvent;
        }
        if (extraKeys.includes(event.code)) {
            return null;
        }
        const keyEvent = new KeyEvent();
        keyEvent.originalEvent = event;
        keyEvent.altKey = event.altKey;
        keyEvent.ctrlKey = event.ctrlKey;
        keyEvent.shiftKey = event.shiftKey;
        keyEvent.metaKey = event.metaKey;
        keyEvent.key = event.code;
        return keyEvent;
    }
    static fromString(str) {
        if (!str)
            return null;
        const pieces = str.split("+").map((key) => key.trim());
        const keyEvent = new KeyEvent();
        for (const piece of pieces) {
            checkKeyAllowed(piece);
            const mod = modifiers.find(([, name]) => name === piece);
            if (mod) {
                keyEvent[mod[0]] = true;
            }
            else if (keyEvent.key) {
                throw new Error("More than one non-modifier detected in key combination");
            }
            else {
                keyEvent.key = piece;
            }
        }
        return keyEvent;
    }
    toString() {
        const keys = modifiers.filter(([mod]) => this[mod]).map(([, name]) => name);
        if (this.key) {
            keys.push(this.key);
        }
        return keys.join(" + ");
    }
    static getEvent(event) {
        if (event instanceof KeyEvent)
            return event;
        if (event?.constructor?.name == "KeyboardEvent" ||
            event["originalEvent"] ||
            event["code"]) {
            return KeyEvent.fromEvent(event);
        }
        if (typeof event === "string") {
            return KeyEvent.fromString(event);
        }
        console.log(event);
    }
    equals(keyEvent) {
        if (!keyEvent)
            return false;
        return (this.altKey == keyEvent.altKey &&
            this.ctrlKey == keyEvent.ctrlKey &&
            this.shiftKey == keyEvent.shiftKey &&
            this.metaKey == keyEvent.metaKey &&
            this.key == keyEvent.key);
    }
}
function matchEvent(event1, event2) {
    const keyEvent1 = KeyEvent.getEvent(event1);
    const keyEvent2 = KeyEvent.getEvent(event2);
    if (keyEvent1 === null || keyEvent1 === null)
        return;
    return keyEvent1?.equals(keyEvent2);
}
// Type utils
function isJQueryEvent(event) {
    return !!event["originalEvent"];
}

class RegisteredKeybind {
    constructor(moduleName, bindName, options) {
        this.moduleName = moduleName;
        this.bindName = bindName;
        this.fullName = `${moduleName}.${bindName}`;
        this.options = { ...options };
        delete this.options.name;
    }
    get keyBind() {
        const setting = game.settings.get(this.moduleName, this.bindName);
        if (setting) {
            return KeyEvent.fromString(setting);
        }
    }
}
const defaultOptions = {
    scope: "client",
    config: false,
    type: String,
};
class KeybindLib {
    static isBoundTo(evt, moduleName, bindName) {
        const bind = this.registeredBinds.get(`${moduleName}.${bindName}`);
        if (!bind)
            return false;
        return matchEvent(evt, bind.keyBind);
    }
    static register(moduleName, bindName, options) {
        if (!game.modules.get(moduleName) && moduleName !== game.system.id) {
            throw new Error(`Module or system does not exist: ${moduleName}`);
        }
        const fullName = `${moduleName}.${bindName}`;
        const opt = { ...defaultOptions, ...options, fullName };
        if (this.registeredBinds.has(fullName))
            throw new Error(`Keybind already registered, module: ${moduleName}, bindName: ${bindName}`);
        const setting = game.settings.settings.get(`${moduleName}.${bindName}`);
        if (setting) {
            if (setting.type != String) {
                throw new Error(`Keybind Lib | Setting for keybind already registered, needs to be String. Incorrect type: ${setting.type}, module: ${moduleName}, bindName: ${bindName}`);
            }
            console.info(`Keybind Lib | Setting for keybind already registered, will be used; module: ${moduleName}, bindName: ${bindName}`);
        }
        else {
            game.settings.register(moduleName, bindName, {
                ...options,
                type: String,
            });
        }
        this.registeredBinds.set(fullName, new RegisteredKeybind(moduleName, bindName, opt));
    }
    // UI methods for configurator conflicts
    static _resolveConflicts(html) {
        // Reset visuals
        const inputs = html.find(".keybind-input");
        inputs.removeClass("keybind-conflict");
        inputs.parent().find(".conflict-info").detach();
        // Collect all on-screen inputs
        const values = {};
        inputs.each(function () {
            values[this.getAttribute("name")] = KeyEvent.fromString(this.value);
        });
        // Collect all off-screen keybinds
        // KeybindLib.registeredBinds.entries();
        // for (const [fullName, reg] of KeybindLib.registeredBinds.entries()) {
        //   if (!values[fullName]) {
        //     values[fullName] = reg.keyBind;
        //   }
        // }
        // Find all conflicts
        const vals = Object.entries(values);
        const conflicts = {};
        vals.forEach(([fn, e]) => {
            for (const [fn2, e2] of vals) {
                if (fn != fn2 && e.equals(e2)) {
                    conflicts[fn] = conflicts[fn] || [];
                    conflicts[fn].push(fn2);
                }
            }
        });
        // Modify DOM
        Object.entries(conflicts).forEach(([fn, conflicts]) => {
            const input = $(html).find(`input[name="${fn}"]`);
            if (input.length == 0)
                return;
            const conflictTitles = conflicts.map((fn) => KeybindLib.registeredBinds.get(fn).options.name);
            let conflictText = conflictTitles
                .map((title) => game.i18n.localize(title))
                .join(", ");
            conflictText = game.i18n.format("KEYBINDLIB.ConflictsWith", {
                conflicts: conflictText,
            });
            input.addClass("keybind-conflict");
            input.after(`<span class="hint conflict-info">${conflictText}</span>`);
        });
    }
    static _handleConfigInput(evt, html) {
        const keyEvent = KeyEvent.fromEvent(evt);
        if (!keyEvent)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        evt.target.value = keyEvent.toString();
        this._resolveConflicts(html);
    }
    static _onKeyDown(evt) {
        const keyEvent = KeyEvent.fromEvent(evt);
        if (!keyEvent)
            return;
        for (const [bindName, bind] of this.registeredBinds.entries()) {
            if (bind.keyBind.equals(keyEvent)) {
                console.log("Keybind Lib | Key down", bindName);
                bind.options?.onKeyDown?.(keyEvent);
            }
        }
    }
    static _onKeyUp(evt) {
        const keyEvent = KeyEvent.fromEvent(evt);
        if (!keyEvent)
            return;
        for (const [bindName, bind] of this.registeredBinds.entries()) {
            if (bind.keyBind.equals(keyEvent)) {
                console.log("Keybind Lib | Key up", bindName);
                bind.options?.onKeyUp?.(keyEvent);
            }
        }
    }
    static _registerEventListeners() {
        document.addEventListener("keydown", this._onKeyDown.bind(KeybindLib));
        document.addEventListener("keyup", this._onKeyUp.bind(KeybindLib));
    }
}
KeybindLib.registeredBinds = new Map();
function registerMenu() {
    if (KeybindLib.registeredBinds.size === 0)
        return;
    let bindsNotInConfig = false;
    KeybindLib.registeredBinds.forEach((bind) => (bindsNotInConfig = bindsNotInConfig || !bind.options.config));
    if (!bindsNotInConfig)
        return;
    game.settings.registerMenu("keybind-lib", "keybinds", {
        name: "KEYBINDLIB.MenuName",
        label: "KEYBINDLIB.MenuLabel",
        icon: "fas fa-keyboard",
        type: KeybindConfigurator,
        restricted: false,
    });
}
Hooks.on("ready", () => {
    KeybindLib._registerEventListeners();
    // Allow time for modules to register if they use the ready hook
    setTimeout(registerMenu, 200);
});
Hooks.on("renderSettingsConfig", (app, html) => {
    for (const [fullName] of KeybindLib.registeredBinds.entries()) {
        const input = $(html).find(`input[name="${fullName}"]`);
        input.attr("readonly", "true");
        input.addClass("keybind-input");
        input.parent().addClass("keybind-fields");
        input
            .parent()
            .append(`<i class="far fa-keyboard keybind-lib-settings-icon"></i>`);
        input.on("keydown", (evt) => KeybindLib._handleConfigInput(evt, html));
    }
    KeybindLib._resolveConflicts(html);
});
globalThis.KeybindLib = KeybindLib;

export { KeybindLib };
//# sourceMappingURL=keybind-lib.js.map
