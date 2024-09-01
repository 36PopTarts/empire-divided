/**
 * Shorthand for game.settings.register().
 * Default data: {scope: "world", config: true}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
function addSetting(key, data) {
	const commonData = {
		name: t(`${key}.name`),
		hint: t(`${key}.hint`),
		scope: "world",
		config: true,
	};
	game.settings.register("healthEstimate", key, Object.assign(commonData, data));
}

/**
 * Shorthand for game.settings.register().
 * Default data: {scope: "world", config: false}
 * @function addSetting
 * @param {string} key
 * @param {object} data
 */
function addMenuSetting(key, data) {
	const commonData = {
		name: t(`${key}.name`),
		hint: t(`${key}.hint`),
		scope: "world",
		config: false,
	};
	game.settings.register("healthEstimate", key, Object.assign(commonData, data));
}

/**
 * Check whether the entry is an empty string or a falsey value
 * @param string
 * @returns {boolean}
 */
function isEmpty(string) {
	return !string || string.length === 0 || /^\s*$/.test(string);
}

/**
 * Shorthand for game.i18n.localize()
 * @param {string} key
 * @returns {string}
 */
function t(key) {
	return game.i18n.localize(`healthEstimate.${key}`);
}
/**
 * Shorthand for game.i18n.format()
 * @param {string} key
 * @param {object} data
 * @returns {string}
 */
function f(key, data = {}) {
	return game.i18n.format(`healthEstimate.${key}`, data);
}

/**
 * Shorthand for game.settings.set
 * @param {string} key
 * @param value
 */
async function sSet(key, value) {
	await game.settings.set("healthEstimate", key, value);
}

/**
 * Shorthand for game.settings.get
 * @param {string} key
 * @returns {any}
 */
function sGet(key) {
	return game.settings.get("healthEstimate", key);
}

/**
 * Shorthand for game.settings.settings.get
 * @param {string} key
 * @returns {Object}
 */
function settingData(key) {
	return game.settings.settings.get(`healthEstimate.${key}`);
}

function disableCheckbox(checkbox, boolean) {
	checkbox.prop("disabled", !boolean);
}

/**
 * Repositions the token's elevation tooltip.
 * @param {Token} token 	The token being refreshed
 * @param {Boolean} force 	Flag that enforces the default position. It is meant to avoid conflict with any modules that change the value.
 */
function repositionTooltip(token, force = false) {
	const tooltipPosition = game.healthEstimate.tooltipPosition;
	const docWidth = token.document.width;
	const { width } = token.getSize();
	const offset = 0.35 / Math.max(1, docWidth);
	if (tooltipPosition === "left") token.tooltip.x = width * (-offset);
	else if (force && tooltipPosition === "default") token.tooltip.x = width / 2;
	else if (tooltipPosition === "right") token.tooltip.x = width * (1 + offset);
}

// Modified code from Health Monitor by Jesse Vo (jessev14)
// License: MIT

/**
 *
 * @param {Token} token
 */
function getActorHealth(token) {
	try {
		const fraction = Number(game.healthEstimate.getFraction(token));
		const { estimate, index } = game.healthEstimate.getStage(token, fraction);
		const isDead = game.healthEstimate.isDead(token, estimate.value);
		if (isDead) {
			estimate.label = game.healthEstimate.deathStateName;
		}

		return { estimate, index, isDead };
	} catch(err) {
		console.error(
			`Health Estimate | Error on function getActorHealth(). Token Name: "${token.name}". ID: "${token.id}". Type: "${token.document.actor.type}".`,
			err
		);
		return {};
	}
}

/**
 *
 * @param {Token} token
 */
function addCharacter(token) {
	const breakCondition = game.healthEstimate.breakOverlayRender(token);
	if (breakCondition || typeof breakCondition === "undefined") {
		return;
	}
	const { estimate, index, isDead } = getActorHealth(token);
	if (estimate) {
		game.healthEstimate.actorsCurrentHP[token.id] = {
			name: token.document.name || token.name,
			stage: { estimate, index },
			dead: isDead,
		};
	}
}

/**
 *
 * @param {Token} token
 */
function outputStageChange(token) {
	// Get the last data state
	const actorData = game.healthEstimate.actorsCurrentHP[token.id];
	const oldStage = actorData.stage;

	// Get the new data state
	const { estimate, index, isDead } = getActorHealth(token);

	// Update data state if needed
	if (index !== oldStage.index || isDead || actorData.dead !== isDead) {
		actorData.stage = { estimate, index };
		actorData.dead = isDead;
	}

	let name = actorData.name;
	if (game.cub && game.cub.hideNames.shouldReplaceName(token.actor)) {
		name = game.cub.hideNames.getReplacementName(token.actor);
	} else if (
		game.modules.get("xdy-pf2e-workbench")?.active
		&& game.settings.get("xdy-pf2e-workbench", "npcMystifier")
		&& game.settings.get("healthEstimate", "PF2E.workbenchMystifier")
		&& token.name !== (token?.actor?.prototypeToken.name ?? "")
		&& !token.actor.hasPlayerOwner
	) {
		name = token?.name;
	} else if (
		token.document.getFlag("healthEstimate", "hideName")
		&& [0, 10, 20, 40].includes(token.document.displayName)
		&& !token.actor.hasPlayerOwner
	) {
		name = sGet("core.unknownEntity");
	}
	const css = index > oldStage.index ? "<span class='hm_messageheal'>" : "<span class='hm_messagetaken'>";

	// Output change if label isn't empty and is different from the last, for the case where
	// the same stage is used for different fractions e.g. "Unconscious, Bloodied, Hurt, Hurt, Injured"
	if (estimate.label && estimate.label !== oldStage.estimate.label) {
		const chatData = {
			content: `${css + f("core.isNow", { name, desc: estimate.label })}</span>`,
		};
		ChatMessage.create(chatData, {});
	}
}

// injectConfig library by @theripper93
// License: MIT
// Documentation: https://github.com/theripper93/injectConfig

var injectConfig = {
	inject: function injectConfig(app, html, data, object) {
		this._generateTabStruct(app, html, data, object);
		const tabSize = data.tab?.width ?? 100;
		object = object || app.object;
		const moduleId = data.moduleId;
		let injectPoint;
		if (typeof data.inject === "string") {
			injectPoint = html.find(data.inject).first().closest(".form-group");
		} else {
			injectPoint = data.inject;
		}
		injectPoint = injectPoint
			? $(injectPoint)
			: data.tab
			? html.find(".tab").last()
			: html.find(".form-group").last();
		let injectHtml = "";
		for (const [k, v] of Object.entries(data)) {
			if (k === "moduleId" || k === "inject" || k === "tab") continue;
			const elemData = data[k];
			const flag = `flags.${moduleId}.${k || ""}`;
			const flagValue = object?.getFlag(moduleId, k) ?? elemData.default ?? getDefaultFlag(k);
			const notes = v.notes ? `<p class="notes">${v.notes}</p>` : "";
			v.label = v.units ? `${v.label}<span class="units"> (${v.units})</span>` : v.label;
			switch (elemData.type) {
				case "text":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="text" name="${flag}" value="${flagValue}" placeholder="${
						v.placeholder || ""
					}">${notes}
                    </div>`;
					break;
				case "number":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="number" name="${flag}" min="${v.min}" max="${v.max}" step="${
						v.step ?? 1
					}" value="${flagValue}" placeholder="${v.placeholder || ""}">${notes}
                    </div>`;
					break;
				case "checkbox":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="checkbox" name="${flag}" ${flagValue ? "checked" : ""}>${notes}
                    </div>`;
					break;
				case "select":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <select name="${flag}">`;
					for (const [i, j] of Object.entries(v.options)) {
						injectHtml += `<option value="${i}" ${flagValue === i ? "selected" : ""}>${j}</option>`;
					}
					injectHtml += `</select>${notes}
                    </div>`;
					break;
				case "range":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                        <div class="form-fields">
                            <input type="range" name="${flag}" value="${flagValue}" min="${v.min}" max="${
						v.max
					}" step="${v.step ?? 1}">
                            <span class="range-value">${flagValue}</span>${notes}
                        </div>
                    </div>`;
					break;
				case "color":
					injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                        <div class="form-fields">
                            <input class="color" type="text" name="${flag}" value="${flagValue}">
                            <input type="color" data-edit="${flag}" value="${flagValue}">
                        </div>
                        ${notes}
                    </div>`;
					break;
				case "custom":
					injectHtml += v.html;
					break;
			}
			if (elemData.type?.includes("filepicker")) {
				const fpType = elemData.type.split(".")[1] || "imagevideo";
				injectHtml += `<div class="form-group">
                <label for="${k}">${v.label || ""}</label>
                <div class="form-fields">     
                    <button type="button" class="file-picker" data-extras="${
						elemData.fpTypes ? elemData.fpTypes.join(",") : ""
					}" data-type="${fpType}" data-target="${flag}" title="Browse Files" tabindex="-1">
                        <i class="fas fa-file-import fa-fw"></i>
                    </button>
                    <input class="image" type="text" name="${flag}" placeholder="${
					v.placeholder || ""
				}" value="${flagValue}">
                </div>${notes}
            </div>`;
			}
		}
		injectHtml = $(injectHtml);
		injectHtml.on("click", ".file-picker", this.fpTypes, _bindFilePicker);
		injectHtml.on("change", "input[type=\"color\"]", _colorChange);
		if (data.tab) {
			const injectTab = createTab(data.tab.name, data.tab.label, data.tab.icon).append(injectHtml);
			injectPoint.after(injectTab);
			app?.setPosition({ height: "auto", width: data.tab ? app.options.width + tabSize : "auto" });
			return injectHtml;
		}
		injectPoint.after(injectHtml);
		if (app) app?.setPosition({ height: "auto", width: data.tab ? app.options.width + tabSize : "auto" });
		return injectHtml;

		function createTab(name, label, icon) {
			/* let tabs = html.find(".sheet-tabs").last();
            if(!tabs.length) tabs = html.find(`nav[data-group="main"]`);*/
			const tabs = html.find(".sheet-tabs").first().find(".item").last();
			const tab = `<a class="item" data-tab="${name}"><i class="${icon}"></i> ${label}</a>`;
			tabs.after(tab);
			const tabContainer = `<div class="tab" data-tab="${name}"></div>`;
			return $(tabContainer);
		}

		function getDefaultFlag(inputType) {
			switch (inputType) {
				case "number":
					return 0;
				case "checkbox":
					return false;
			}
			return "";
		}

		function _colorChange(e) {
			const input = $(e.target);
			const edit = input.data("edit");
			const value = input.val();
			injectHtml.find(`input[name="${edit}"]`).val(value);
		}

		function _bindFilePicker(event) {
			event.preventDefault();
			const button = event.currentTarget;
			const input = $(button).closest(".form-fields").find("input") || null;
			const extraExt = button.dataset.extras ? button.dataset.extras.split(",") : [];
			const options = {
				field: input[0],
				type: button.dataset.type,
				current: input.val() || null,
				button: button,
			};
			const fp = new FilePicker(options);
			fp.extensions ? fp.extensions.push(...extraExt) : (fp.extensions = extraExt);
			return fp.browse();
		}
	},
	quickInject: function quickInject(injectData, data) {
		injectData = Array.isArray(injectData) ? injectData : [injectData];
		for (const doc of injectData) {
			let newData = data;
			if (doc.inject) {
				newData = JSON.parse(JSON.stringify(data));
				data.inject = doc.inject;
			}
			Hooks.on(`render${doc.documentName}Config`, (app, html) => {
				injectConfig.inject(app, html, newData);
			});
		}
	},
	_generateTabStruct: function _generateTabStruct(app, html, data, object) {
		const isTabs = html.find(".sheet-tabs").length;
		const useTabs = data.tab;
		if (isTabs || !useTabs) return;
		const tabSize = data.tab?.width || 100;
		const layer = app?.object?.layer?.options?.name;
		const icon = $(".main-controls").find(`li[data-canvas-layer="${layer}"]`).find("i").attr("class");

		const $tabs = $(`<nav class="sheet-tabs tabs">
        <a class="item active" data-tab="basic"><i class="${icon}"></i> ${game.i18n.localize("LIGHT.HeaderBasic")}</a>
        </nav>
        <div class="tab active" data-tab="basic"></div>`);
		// move all content of form into tab
		const form = html.find("form").first();
		form.children().each((i, e) => {
			$($tabs[2]).append(e);
		});

		form.append($tabs);
		const submitButton = html.find("button[type='submit']").first();
		form.append(submitButton);

		html.on("click", ".item", (e) => {
			html.find(".item").removeClass("active");
			$(e.currentTarget).addClass("active");
			html.find(".tab").removeClass("active");
			html.find(`[data-tab="${e.currentTarget.dataset.tab}"]`).addClass("active");
			app.setPosition({ height: "auto", width: data.tab ? app.options.width + tabSize : "auto" });
		});
	},
};

class HealthEstimateHooks {
	static canvasInit(canvas) {
		game.healthEstimate.combatRunning = game.healthEstimate.isCombatRunning();
		game.healthEstimate.lastZoom = null;
	}

	static onceCanvasReady() {
		game.healthEstimate.combatOnly = sGet("core.combatOnly");
		game.healthEstimate.alwaysShow = sGet("core.alwaysShow");
		game.healthEstimate.combatRunning = game.healthEstimate.isCombatRunning();
		Hooks.on("refreshToken", HealthEstimateHooks.refreshToken);
		if (game.healthEstimate.alwaysShow) {
			canvas.tokens?.placeables.forEach((token) => game.healthEstimate._handleOverlay(token, true));
		}
		if (game.healthEstimate.scaleToZoom) Hooks.on("canvasPan", HealthEstimateHooks.onCanvasPan);
		Hooks.on("canvasInit", HealthEstimateHooks.canvasInit);
	}

	/**
	 * HP storing code for canvas load or token created
	 */
	static onCanvasReady() {
		/** @type {[Token]} */
		const tokens = canvas.tokens?.placeables.filter((e) => e.actor) ?? [];
		tokens.forEach(addCharacter);

		if (game.healthEstimate.alwaysShow) {
			canvas.tokens?.placeables.forEach((token) => {
				game.healthEstimate._handleOverlay(token, true);
			});
		}
	}

	static onCanvasPan(canvas, constrained) {
		const scale = () => {
			const zoomLevel = Math.min(1, canvas.stage.scale.x);
			if (game.healthEstimate.lastZoom !== zoomLevel) {
				canvas.tokens?.placeables
					.filter((t) => t.healthEstimate?.visible)
					.forEach((token) => {
						if (token.healthEstimate?._texture) {
							token.healthEstimate.style.fontSize = game.healthEstimate.scaledFontSize;
						}
					});
			}
			game.healthEstimate.lastZoom = zoomLevel;
		};
		if (game.healthEstimate.alwaysShow) {
			if (this.timeout) clearTimeout(this.timeout);
			this.timeout = setTimeout(scale, 100);
		} else scale();
	}

	static onCreateToken(tokenDocument, options, userId) {
		if (tokenDocument.object) addCharacter(tokenDocument.object);
	}

	// /////////
	// ACTOR //
	// /////////

	static onUpdateActor(actor, data, options, userId) {
		if (game.healthEstimate.alwaysShow) {
			// Get all the tokens because there can be two tokens of the same linked actor.
			const tokens = canvas.tokens?.placeables.filter((token) => token?.actor?.id === actor.id);
			// Call the _handleOverlay method for each token.
			tokens?.forEach((token) => game.healthEstimate._handleOverlay(token, true));
		}
		if (game.healthEstimate.outputChat && game.users.activeGM?.isSelf) {
			// Find a single token associated with the updated actor.
			const token = canvas.tokens?.placeables.find((token) => token?.actor?.id === actor.id);
			if (token) {
				const tokenId = token?.id;
				const tokenHP = game.healthEstimate.actorsCurrentHP?.[tokenId];
				if (
					tokenId
					&& tokenHP
					&& !game.healthEstimate.breakOverlayRender(token)
					&& !game.healthEstimate.hideEstimate(token)
				) {
					outputStageChange(token);
				}
			}
		}
	}

	static deleteActor(actorDocument, options, userId) {
		let tokens = canvas.tokens?.placeables.filter((e) => e.document.actorId === actorDocument.id);
		tokens.forEach((token) => token.refresh());
	}

	static deleteActiveEffect(activeEffect, options, userId) {
		if (activeEffect.img === game.healthEstimate.deathMarker) {
			let tokens = canvas.tokens?.placeables.filter((e) => e.actor && e.actor.id === activeEffect.parent.id);
			for (let token of tokens) {
				if (token.document.flags?.healthEstimate?.dead) token.document.unsetFlag("healthEstimate", "dead");
			}
		}
	}

	// /////////
	// TOKEN //
	// /////////

	static refreshToken(token, flags) {
		game.healthEstimate._handleOverlay(token, game.healthEstimate.showCondition(token.hover));
		if (flags.refreshSize && game.healthEstimate.tooltipPosition) repositionTooltip(token);
	}

	static onCombatStart(combat, updateData) {
		if (!game.healthEstimate.combatOnly) return;
		game.healthEstimate.combatRunning = true;
		canvas.tokens?.placeables.forEach((token) => {
			game.healthEstimate._handleOverlay(token, game.healthEstimate.showCondition(token.hover));
		});
	}

	static onUpdateCombat(combat, options, userId) {
		if (!game.healthEstimate.combatOnly) return;
		game.healthEstimate.combatRunning = game.healthEstimate.isCombatRunning();
		canvas.tokens?.placeables.forEach((token) => {
			game.healthEstimate._handleOverlay(token, game.healthEstimate.showCondition(token.hover));
		});
	}

	// /////////////
	// RENDERING //
	// /////////////

	/**
	 * Chat Styling
	 */
	static onRenderChatMessage(app, html, data) {
		if (html.find(".hm_messageheal").length) html.addClass("hm_message hm_messageheal");
		else if (html.find(".hm_messagetaken").length) html.addClass("hm_message hm_messagetaken");
	}

	/**
	 * Handler called when token configuration window is opened. Injects custom form html and deals
	 * with updating token.
	 * @category GMOnly
	 * @function
	 * @async
	 * @param {SettingsConfig} settingsConfig
	 * @param {JQuery} html
	 */
	static renderSettingsConfigHandler(settingsConfig, html) {
		// Chat Output setting changes
		const outputChat = game.settings.get("healthEstimate", "core.outputChat");
		const outputChatCheckbox = html.find('input[name="healthEstimate.core.outputChat"]');
		const unknownEntityInput = html.find('input[name="healthEstimate.core.unknownEntity"]');
		disableCheckbox(unknownEntityInput, outputChat);
		outputChatCheckbox.on("change", (event) => {
			disableCheckbox(unknownEntityInput, event.target.checked);
		});

		// Additional PF1 system settings
		if (game.settings.settings.has("healthEstimate.PF1.showExtra")) {
			const showExtra = game.settings.get("healthEstimate", "PF1.showExtra");
			const showExtraCheckbox = html.find('input[name="healthEstimate.PF1.showExtra"]');
			const disabledNameInput = html.find('input[name="healthEstimate.PF1.disabledName"]');
			const dyingNameInput = html.find('input[name="healthEstimate.PF1.dyingName"]');
			disableCheckbox(disabledNameInput, showExtra);
			disableCheckbox(dyingNameInput, showExtra);

			showExtraCheckbox.on("change", (event) => {
				disableCheckbox(disabledNameInput, event.target.checked);
				disableCheckbox(dyingNameInput, event.target.checked);
			});
		}

		// Additional PF2e system settings
		if (game.settings.settings.has("healthEstimate.PF2E.workbenchMystifier")) {
			const workbenchMystifierCheckbox = html.find('input[name="healthEstimate.PF2E.workbenchMystifier"]');
			disableCheckbox(workbenchMystifierCheckbox, outputChat);

			outputChatCheckbox.on("change", (event) => {
				disableCheckbox(workbenchMystifierCheckbox, event.target.checked);
			});
		}
	}

	/**
	 * Handler called when token configuration window is opened. Injects custom form html and deals
	 * with updating token.
	 * @category GMOnly
	 * @function
	 * @async
	 * @param {TokenConfig} tokenConfig
	 * @param {JQuery} html
	 */
	static async renderTokenConfigHandler(tokenConfig, html) {
		const moduleId = "healthEstimate";
		const tab = {
			name: moduleId,
			label: "Estimates",
			icon: "fas fa-scale-balanced",
		};
		injectConfig.inject(tokenConfig, html, { moduleId, tab }, tokenConfig.object);

		const posTab = html.find(`.tab[data-tab="${moduleId}"]`);
		const tokenFlags = tokenConfig.options.sheetConfig
			? tokenConfig.object.flags?.healthEstimate
			: tokenConfig.token.flags?.healthEstimate;

		const data = {
			hasPlayerOwner: tokenConfig.token.hasPlayerOwner,
			hideHealthEstimate: tokenFlags?.hideHealthEstimate ? "checked" : "",
			hideName: tokenFlags?.hideName ? "checked" : "",
			dontMarkDead: tokenFlags?.dontMarkDead ? "checked" : "",
			dontMarkDeadHint: f("core.keybinds.dontMarkDead.hint", { setting: t("core.NPCsJustDie.name") }),
			hideNameHint: f("core.keybinds.hideNames.hint", { setting: t("core.outputChat.name") }),
		};

		const insertHTML = await renderTemplate(`modules/${moduleId}/templates/token-config.html`, data);
		posTab.append(insertHTML);
	}
}

class EstimationProvider {
	constructor() {
		/**
		 * Non-exhaustive list of possible character-types that should use the DeathStateName. This is way to avoid vehicles being "Dead"
		 * @type {string[]}
		 */
		this.organicTypes = ["character", "pc", "monster", "mook", "npc", "familiar", "traveller", "animal"]; // There must be a better way

		/**
		 * Code that will be run during HealthEstimate.getTokenEstimate()
		 * @type {string}
		 */
		this.customLogic = "";

		/**
		 * Default value of the Death State setting.
		 * @type {Boolean}
		 * */
		this.deathState = false;

		/**
		 * Default value of the Death State Name setting.
		 * @type {String}
		 */
		this.deathStateName = t("core.deathStateName.default");

		/**
		 * Configuration for the Death Marker setting.
		 * @type {Object}
		 */
		this.deathMarker = {
			/** Sets if the setting will be visible in the module's settings */
			config:
				!CONFIG.statusEffects.find((x) => x.id === "dead")
				|| game.modules.get("combat-utility-belt")?.active
				|| game.modules.get("condition-lab-triggler")?.active,
			/** Sets the setting's default value */
			default: CONFIG.statusEffects.find((x) => x.id === "dead")?.img || "icons/svg/skull.svg",
		};

		/**
		 *
		 * @type {Object}
		 */
		this.vehicleRules = {
			/** Sets if the setting will be visible in the module's settings */
			config: false,
			/** List with actor types that are considered vehicles (e.g. spacecraft, drone, etc) */
			vehicles: ["vehicle"],
		};

		/**
		 * Sets if the "Add Temporary Health" setting is enabled.
		 * @type {Boolean}
		 */
		this.addTemp = false;

		/**
		 * Sets if the "Hide on tokens with 0 max HP" setting is enabled.
		 * @type {Boolean}
		 */
		this.breakOnZeroMaxHP = false;

		/**
		 * Default value of the Estimations setting.
		 * @type {{Array}}
		 */
		this.estimations = [
			{
				name: "",
				ignoreColor: false,
				rule: "default",
				estimates: [
					{ value: 0, label: t("core.estimates.states.0") },
					{ value: 25, label: t("core.estimates.states.1") },
					{ value: 50, label: t("core.estimates.states.2") },
					{ value: 75, label: t("core.estimates.states.3") },
					{ value: 99, label: t("core.estimates.states.4") },
					{ value: 100, label: t("core.estimates.states.5") },
				],
			},
		];
	}

	/**
	 * Calculates the fraction of the current health divided by the maximum health.
	 * @param {TokenDocument} token
	 * @returns {Number}	Number between 0.0 and 1.0.
	 */
	fraction(token) {
		throw new Error("A subclass of the SystemProvider must implement the fraction method.");
	}

	/**
	 * Returns a set of system-specific settings. All settings are registered as part of the healthEstimate module.
	 *
	 * Names and Hints are unnecessary if they are set as "systemname.setting.name" and "systemname.setting.hint".
	 *
	 * Scope is unnecessary if "world"
	 *
	 * Config is unnecessary if true
	 * @returns {{string: {SettingConfig}}}
	 */
	get settings() {
		return {};
	}

	/**
	 * Is used on the breakCondition getter.
	 * @returns {String}
	 *
	 * @see alienrpgEstimationProvider
	 */
	get isVehicle() {
		return `['${this.vehicleRules.vehicles.join("','")}'].includes(token.actor.type)`;
	}

	/**
	 * A set of conditionals written as a string that will stop the rendering of the estimate.
	 * @returns {String}
	 *
	 * @see dnd5eEstimationProvider
	 * @see pf2eEstimationProvider
	 */
	static get breakCondition() {
		return undefined;
	}

	/**
	 * This is for the big marker shown on defeated tokens (the skull marker by default).
	 * Only use this if your system doesn't add the marker as an effect.
	 * @returns {Boolean}
	 *
	 * @see dsa5EstimationProvider
	 * @see pf2eEstimationProvider
	 * @see swadeEstimationProvider
	 */
	static tokenEffects(token) {
		return undefined;
	}

	/**
	 * Validates if a given HP object is valid.
	 * @param {TokenDocument} token
	 * @param {{value: Number, max: Number, temp: Number?}} hp	The HP object.
	 * @param {String} hpPath	The HP Data Path.
	 */
	_checkValidHP(token, hp, hpPath) {
		if (hp === undefined || hp === null) {
			if (hpPath === "") {
				throw new Error(
					`The HP is undefined, try using the ${game.i18n.localize(
						"healthEstimate.core.custom.FractionHP.name"
					)} setting.`
				);
			} else {
				throw new Error(
					`The ${game.i18n.localize(
						"healthEstimate.core.custom.FractionHP.name"
					)} setting ("${hpPath}") is wrong.`
				);
			}
		} else if (hp.max === undefined) {
			throw new Error(
				`Token ${token.name}'s HP has no maximum value and the etimation can't be calculated without it.`
			);
		}
	}
}

class CoC7EstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.attribs.hp;
		if (hp.max > 0) return hp.value / hp.max;
		return 0;
	}

	get breakCondition() {
		return "|| token.actor.type === 'container'";
	}
}

class D35EEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.customLogic = `
		const hp = token.actor.system.attributes.hp;
		let addTemp = 0;
		if (game.settings.get("healthEstimate", "core.addTemp")) {
			addTemp = hp.temp;
		}
		const totalHp = hp.value + addTemp;`;
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: game.i18n.localize("D35E.Disabled"),
				ignoreColor: true,
				rule: "game.settings.get(\"healthEstimate\", \"PF1.showExtra\") && (totalHp === 0 || Array.from(token.actor.effects.values()).some((x) => x.name === game.i18n.localize(\"D35E.Disabled\")))",
				estimates: [{ value: 100, label: game.i18n.localize("D35E.Disabled") }],
			},
			{
				name: game.i18n.localize("D35E.Staggered"),
				ignoreColor: true,
				rule: "game.settings.get(\"healthEstimate\", \"PF1.showExtra\") && (hp.nonlethal > 0 && totalHp == hp.nonlethal) || Array.from(token.actor.effects.values()).some((x) => x.name === game.i18n.localize(\"D35E.Staggered\"))",
				estimates: [{ value: 100, label: game.i18n.localize("D35E.Staggered") }],
			},
			{
				name: game.i18n.localize("D35E.Unconscious"),
				ignoreColor: true,
				rule: "game.settings.get(\"healthEstimate\", \"PF1.showExtra\") && (hp.nonlethal > totalHp || Array.from(token.actor.effects.values()).some((x) => x.name === game.i18n.localize(\"D35E.Unconscious\")))",
				estimates: [{ value: 100, label: game.i18n.localize("D35E.Unconscious") }],
			},
		];
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		let addTemp = 0;
		let addNonlethal = 0;
		if (sGet("core.addTemp")) {
			addTemp = hp.temp;
		}
		if (sGet("PF1.addNonlethal")) {
			addNonlethal = hp.nonlethal;
		}
		return (hp.value - addNonlethal + addTemp) / hp.max;
	}

	get settings() {
		return {
			"PF1.addNonlethal": {
				type: Boolean,
				default: true,
			},
			"PF1.showExtra": {
				name: f("PF1.showExtra.name", {
					condition1: t("PF1.disabledName.default"),
					condition2: t("PF1.dyingName.default"),
				}),
				hint: f("PF1.showExtra.hint", {
					condition1: t("PF1.disabledName.default"),
					condition2: t("PF1.dyingName.default"),
				}),
				type: Boolean,
				default: true,
			},
			"PF1.disabledName": {
				type: String,
				default: t("PF1.disabledName.default"),
				config: false,
			},
			"PF1.dyingName": {
				type: String,
				default: t("PF1.dyingName.default"),
				config: false,
			},
		};
	}

	get breakCondition() {
		return "||game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0";
	}
}

class a5eEstimationProvider extends EstimationProvider {
	/*
		Thanks to the original author of the 5E provider for basically providing the code needed to add A5E support.
		Thanks to Nekro and Phil for using the same datapaths in A5E as what is used in 5E, making changes basically unnessary.
	*/

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		let temp = 0;
		if (sGet("core.addTemp")) {
			temp = hp.temp;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}
}

class ageSystemEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.health;
		return hp.value / hp.max;
	}

	get breakCondition() {
		return "|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.health.max === 0)";
	}
}

class alienrpgEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules = {
			config: true,
			vehicles: ["vehicles", "spacecraft"],
		};
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles & Spaceships",
				rule: "type === \"vehicles\" || type === \"spacecraft\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		if (token.actor.type === "vehicles") {
			const hull = token.actor.system.attributes.hull;
			return hull.value / hull.max;
		} else if (token.actor.type === "spacecraft") {
			const hull = token.actor.system.attributes.hull.value;
			const damage = token.actor.system.attributes.damage.value;
			return (hull - damage) / hull;
		}
		const hp = token.actor.system.header.health;
		return hp.value / hp.max;
	}

	get breakCondition() {
		return `
		|| ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP')
			&& (
				(${this.isVehicle} && token.actor.system.attributes.hull.max === 0)
				|| (!${this.isVehicle} && token.actor.system.header.health.max === 0)
			)
		)`;
	}
}

class archmageEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		let temp = 0;
		if (token.actor.type === "character" && sGet("core.addTemp")) {
			temp = hp.temp;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return "|| game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0";
	}
}

class bandOfBladesEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.harm;
		let harmLevel = 0;
		for (let [key, value] of Object.entries(hp)) {
			for (let entry of Object.values(value)) {
				if (!isEmpty(entry)) {
					// Testing for empty or whitespace
					switch (key) {
						case "light":
							harmLevel += 1;
							break;
						case "medium":
							harmLevel += 3;
							break;
						case "heavy":
							harmLevel += 9;
							break;
						case "deadly":
							return 0;
					}
				}
			}
		}
		return 1 - (harmLevel / 18);
	}

	get breakCondition() {
		return `
		|| token.actor.type === "role"
		|| token.actor.type === "chosen"
		|| token.actor.type === "minion"
		|| token.actor.type === "\uD83D\uDD5B clock"`;
	}
}

class bladeRunnerEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.health;
		return hp.value / hp.max;
	}
}

class bladesInTheDarkEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.harm;
		let harmLevel = 0;
		for (let [key, value] of Object.entries(hp)) {
			for (let entry of Object.values(value)) {
				if (!isEmpty(entry)) {
					// Testing for empty or whitespace
					switch (key) {
						case "light":
							harmLevel += 1;
							break;
						case "medium":
							harmLevel += 3;
							break;
						case "heavy":
							harmLevel += 9;
							break;
						case "deadly":
							return 0;
					}
				}
			}
		}
		return 1 - (harmLevel / 18);
	}

	get breakCondition() {
		return `
		|| token.actor.type === "npc"
		|| token.actor.type === "crew"
		|| token.actor.type === "\uD83D\uDD5B clock"
		|| token.actor.type === "factions"`;
	}
}

class CustomSystemBuilderEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hpPath = sGet("core.custom.FractionHP");
		const hp =
			foundry.utils.getProperty(token, hpPath) || token.actor.system.attributes?.hp || token.actor.system.hp;
		const thpPath = sGet("custom-system-builder.tempHP");
		const temp = thpPath && token.actor.type === "character" ? Number(foundry.utils.getProperty(token, thpPath).temp) : 0;

		this._checkValidHP(token, hp, hpPath);
		const FractionMath = sGet("core.custom.FractionMath");
		switch (FractionMath) {
			case 0:
				return Math.min((Number(hp.value) + temp) / Number(hp.max), 1);
			case 1:
			default:
				return (Number(hp.max) + temp - Number(hp.value)) / (Number(hp.max) + temp);
		}
	}

	get settings() {
		return {
			"core.custom.FractionHP": {
				hint: f("custom-system-builder.FractionHP.hint", {
					dataPath1: '"actor.system.attributeBar.hp"',
					dataPath2: '"actor.system.attributeBar.health"',
				}),
				type: String,
				default: "",
			},
			"custom-system-builder.tempHP": {
				hint: f("custom-system-builder.tempHP.hint", { setting: t("core.custom.FractionHP.name") }),
				type: String,
				default: "",
			},
			"core.custom.FractionMath": {
				type: Number,
				default: 0,
				choices: {
					0: t("core.custom.FractionMath.choices.0"),
					1: t("core.custom.FractionMath.choices.1"),
				},
			},
		};
	}
}

class cyberpunkRedCoreEstimationProvider extends EstimationProvider {
	// This game has its own estimates, called Wound State, which are calculated by the system.
	// The issue is that this data is only broadcast to GMs, not other users.
	// See https://github.com/mclemente/healthEstimate/issues/119
	// and https://gitlab.com/cyberpunk-red-team/fvtt-cyberpunk-red-core/-/issues/680
	constructor() {
		super();
		this.estimations = [
			{
				name: "",
				rule: "default",
				estimates: [
					{ value: 0, label: game.i18n.localize("CPR.global.woundState.dead") },
					{ value: 1, label: game.i18n.localize("CPR.global.woundState.mortallyWounded") },
					{ value: 50, label: game.i18n.localize("CPR.global.woundState.seriouslyWounded") },
					{ value: 99, label: game.i18n.localize("CPR.global.woundState.lightlyWounded") },
					{ value: 100, label: game.i18n.localize("CPR.global.woundState.notWounded") },
				],
			},
			{
				name: `${game.i18n.localize("TYPES.Actor.Blackice")}/${game.i18n.localize("TYPES.Actor.Demon")}`,
				rule: "type === \"blackIce\" || type === \"demon\"",
				estimates: [
					{ value: 0, label: t("cyberpunk-red-core.unorganics.0") },
					{ value: 50, label: t("cyberpunk-red-core.unorganics.2") },
					{ value: 99, label: t("cyberpunk-red-core.unorganics.3") },
					{ value: 100, label: t("cyberpunk-red-core.unorganics.4") },
				],
			},
		];
	}

	fraction(token) {
		let hp;
		if (token.actor.system.derivedStats) {
			hp = token.actor.system.derivedStats.hp;
		} else if (token.actor.system.stats) {
			hp = token.actor.system.stats.rez;
		}
		return hp.value / hp.max;
	}

	get breakCondition() {
		return "|| token.actor.type === 'container'";
	}
}

class cyphersystemEstimationProvider extends EstimationProvider {
	fraction(token) {
		const actor = token.actor;
		if (actor.type === "pc") {
			const pools = actor.system.pools;
			let curr = pools.might.value + pools.speed.value + pools.intellect.value;
			let max = pools.might.max + pools.speed.max + pools.intellect.max;
			if (actor.system.settings.general.additionalPool.active) {
				curr += pools.additional.value;
				max += pools.additional.max;
			}
			const result = Math.min(1, curr / max);
			let limit = 1;

			switch (actor.system.combat.damageTrack.state) {
				case "Impaired":
					limit = sGet("cyphersystem.impaired");
					break;
				case "Debilitated":
					limit = sGet("cyphersystem.debilitated");
					break;
			}
			return Math.min(result, limit);
		} else if (actor.system.pools?.health) {
			let hp = actor.system.pools.health;
			return hp.value / hp.max;
		}
	}

	get settings() {
		return {
			"cyphersystem.impaired": {
				type: Number,
				default: 0.5,
			},
			"cyphersystem.debilitated": {
				type: Number,
				default: 0.1,
			},
		};
	}

	get breakCondition() {
		return "|| ![ 'pc', 'npc', 'companion','community' ].includes(token.actor.type)";
	}
}

class dnd4eEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.organicTypes = ["Player Character", "NPC"];
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		const temphp = token.actor.system.attributes.temphp;
		let temp = 0;
		if (sGet("core.addTemp")) {
			temp = temphp.value;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return "|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0)";
	}
}

class dnd5eEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules = {
			config: true,
			vehicles: ["vehicle"],
		};
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		if (token.actor.type === "character" && sGet("core.addTemp")) {
			return Math.min(hp.pct/100, 1);
		}
		return Math.min(hp.value / hp.max, 1);
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| token.actor.type == 'group'
		|| token.actor.system.attributes.hp.max === null
		|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0)`;
	}
}

class ds4EstimationProvider extends EstimationProvider {
	fraction(token) {
		let hp = token.actor.system.combatValues.hitPoints;
		return hp.value / hp.max;
	}
}

class dsa5EstimationProvider extends EstimationProvider {
	fraction(token) {
		let hp = token.actor.system.status.wounds;
		return hp.value / hp.max;
	}
}

class dungeonworldEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		return Math.min(hp.value / hp.max, 1);
	}

	get breakCondition() {
		return "|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0)";
	}
}

class forbiddenLandsEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		switch (token.actor.type) {
			case "character":
			case "monster": {
				const hp = token.actor.system.attribute.strength;
				return Math.min(hp.value / hp.max, 1);
			}

		}
	}

	get breakCondition() {
		return `
        || token.actor.type === "party"
        || token.actor.type === "stronghold"
        || (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attribute.strength.max === 0)`;
	}
}

class reveDeDragonEstimationProvider extends EstimationProvider {
	fraction(token) {
		function ratio(node) {
			return Math.clamped(node.value / node.max, 0, 1);
		}
		function estimationBlessures(token) {
			if (token.actor.system.blessures === undefined) {
				return missing;
			}
			const nodeBlessures = token.actor.system.blessures ?? {
				legeres: { list: [] },
				graves: { list: [] },
				critiques: { list: [] },
			};
			const legeres = nodeBlessures.legeres.liste.filter((it) => it.active).length;
			const graves = nodeBlessures.graves.liste.filter((it) => it.active).length;
			const critiques = nodeBlessures.critiques.liste.filter((it) => it.active).length;

			const tableBlessure = {
				legere: [0, 10, 20, 30, 40, 50],
				grave: [0, 60, 70],
				critique: [0, 90],
				inconscient: 100,
			};
			/*
			 * Estimation of seriousness of wounds: considerinng wounds that can be taken.
			 * - 5x "legere" = light
			 * - 2x "grave" = serious
			 * - 1x "critique" = critical
			 * If one type of wounds is full, next in this category automatically goes
			 * to the next (ie: 3rd serious wound becomes critical).
			 * Using an estimation of state of health based on the worst category of wounds
			 */
			return {
				value: critiques > 0
					? tableBlessure.critique[critiques]
					: graves > 0
						? tableBlessure.grave[graves]
						: tableBlessure.legere[legeres],
				max: tableBlessure.inconscient,
			};
		}
		const missing = { value: 0, max: 1 };

		if (token.actor.type === "entite") {
			return ratio(token.actor.system.sante.endurance);
		}
		const ratioFatigue = 1 - (ratio(token.actor.system.sante?.fatigue ?? missing) / 2);
		const ratioVie = ratio(token.actor.system.sante?.vie ?? missing);
		const ratioEndurance = 0.4 + (ratio(token.actor.system.sante?.endurance ?? missing) * 0.6);
		const ratioBlessure = 1 - ratio(estimationBlessures(token));

		return Math.min(ratioBlessure, ratioEndurance, ratioFatigue, ratioVie);
	}

	get breakCondition() {
		return "||token.actor.type === \"vehicule\"";
	}
}

class lancerEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.derived.hp;
		return hp.value / hp.max;
	}

	get breakCondition() {
		return `
        || game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP')
        && (token.actor.system.mech?.hp.max === 0 || token.actor.system?.derived?.hp?.max === 0)`;
	}
}

class monsterweekEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.harm;
		return hp.value / hp.max;
	}

	get breakCondition() {
		return "||token.actor.type === \"location\"";
	}
}

class numeneraEstimationProvider extends EstimationProvider {
	fraction(token) {
		if (token.actor.type === "pc") {
			const might = token.actor.system.stats.might;
			const speed = token.actor.system.stats.speed;
			const intellect = token.actor.system.stats.intellect;
			if (sGet("numenera.countPools")) {
				let fullPools = 3;
				for (let pool of [might, speed, intellect]) {
					if (pool.pool.current === 0) {
						fullPools -= 1;
					}
				}
				return fullPools / 3;
			}
			let [total, max] = [0, 0];
			for (let pool of [might, speed, intellect]) {
				total += pool.pool.current;
				max += pool.pool.maximum;
			}
			return total / max;
		}
		const hp = token.actor.system.health;
		return hp.current / hp.max;
	}

	get settings() {
		return {
			"numenera.countPools": {
				type: Boolean,
				default: false,
			},
		};
	}
}

class od6sEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules = {
			config: true,
			vehicles: ["vehicle", "starship"],
		};
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\" || type === \"starship\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const type = token.actor.type;
		switch (type) {
			case "npc":
			case "creature":
			case "character": {
				const od6swounds = token.actor.system.wounds.value;
				return 1 - (od6swounds / 6);
			}
			case "vehicle":
			case "starship": {
				const od6sdamagestring = token.actor.system.damage.value;
				let od6sdamage;
				switch (od6sdamagestring) {
					case "OD6S.DAMAGE_NONE":
						od6sdamage = 0;
						break;
					case "OD6S.DAMAGE_VERY_LIGHT":
						od6sdamage = 1;
						break;
					case "OD6S.DAMAGE_LIGHT":
						od6sdamage = 2;
						break;
					case "OD6S.DAMAGE_HEAVY":
						od6sdamage = 3;
						break;
					case "OD6S.DAMAGE_SEVERE":
						od6sdamage = 4;
						break;
					case "OD6S.DAMAGE_DESTROYED":
						od6sdamage = 5;
				}
				return 1 - (od6sdamage / 5);
			}
		}
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| token.actor.type === "container"`;
	}
}

class oseEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.hp;
		return Math.min(hp.value / hp.max, 1);
	}
}

class pbtaEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hpPath = sGet("core.custom.FractionHP");
		const hp = foundry.utils.getProperty(token, hpPath);
		this._checkValidHP(token, hp, hpPath);
		if (hp.type === "Resource") return hp.value / hp.max;
		return (hp.max - hp.value) / hp.max;
	}

	get settings() {
		return {
			"core.custom.FractionHP": {
				type: String,
				default: ""
			},
		};
	}
}

class pf1EstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.customLogic = `
		const hp = token.actor.system.attributes.hp;
		let addTemp = 0;
		if (game.settings.get("healthEstimate", "core.addTemp")) {
			addTemp = hp.temp;
		}
		const totalHp = hp.value + addTemp;`;
		this.estimations = [
			...this.estimations,
			{
				name: game.i18n.localize("PF1.CondStaggered"),
				ignoreColor: true,
				rule: `
					game.settings.get("healthEstimate", "PF1.showExtra") &&
					(totalHp === 0 ||
						(hp.nonlethal > 0 && totalHp == hp.nonlethal) ||
						Array.from(token.actor.effects.values()).some((x) => x.label === game.i18n.localize("PF1.CondStaggered")))`,
				estimates: [{ value: 100, label: game.i18n.localize("PF1.CondStaggered") }],
			},
			{
				name: t("PF1.dyingName.name"),
				ignoreColor: true,
				rule: "game.settings.get(\"healthEstimate\", \"PF1.showExtra\") && hp.nonlethal > totalHp",
				estimates: [{ value: 100, label: t("PF1.dyingName.default") }],
			},
		];
	}

	fraction(token) {
		const { variants } = game.settings.get("pf1", "healthConfig");
		const hp = token.actor.system.attributes.hp;
		let addTemp = 0;
		let addNonlethal = 0;

		if ((token.actor.type === "character" && variants.pc.useWoundsAndVigor)
			|| (token.actor.type === "npc" && variants.npc.useWoundsAndVigor)) {
			const vigor = token.actor.system.attributes.vigor;
			const wounds = token.actor.system.attributes.wounds;
			if (sGet("core.addTemp")) {
				addTemp = vigor.temp;
			}
			return (vigor.value + wounds.value + addTemp) / (vigor.max + wounds.max);
		}
		if (sGet("core.addTemp")) {
			addTemp = hp.temp;
		}
		if (sGet("PF1.addNonlethal")) {
			addNonlethal = hp.nonlethal;
		}
		return (hp.value - addNonlethal + addTemp) / hp.max;
	}

	get settings() {
		return {
			"PF1.addNonlethal": {
				type: Boolean,
				default: true,
			},
			"PF1.showExtra": {
				name: f("PF1.showExtra.name", {
					condition1: t("PF1.disabledName.default"),
					condition2: t("PF1.dyingName.default"),
				}),
				hint: f("PF1.showExtra.hint", {
					condition1: t("PF1.disabledName.default"),
					condition2: t("PF1.dyingName.default"),
				}),
				type: Boolean,
				default: true,
			},
			"PF1.disabledName": {
				type: String,
				default: t("PF1.disabledName.default"),
				config: false,
			},
			"PF1.dyingName": {
				type: String,
				default: t("PF1.dyingName.default"),
				config: false,
			},
		};
	}

	get breakCondition() {
		return "||game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0";
	}
}

class pf2eEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles & Hazards",
				rule: "type === \"vehicle\" || type === \"hazard\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const data = foundry.utils.deepClone(token.actor.system.attributes);
		const hp = data.hp;
		if (token.actor.type === "familiar" && token.actor.system?.master) {
			const master = token.actor.system.master;
			hp.max = token.actor.hitPoints.max ?? 5 * game.actors.get(master.id).system.details.level.value;
		}
		let temp = sGet("core.addTemp") && hp.temp ? hp.temp : 0;
		let sp = game.settings.get("pf2e", "staminaVariant") && sGet("PF2E.staminaToHp") && hp.sp
			? hp.sp
			: { value: 0, max: 0 };
		return Math.min((hp.value + sp.value + temp) / (hp.max + sp.max), 1);
	}

	get settings() {
		return {
			"PF2E.staminaToHp": {
				type: Boolean,
				default: true,
			},
			"PF2E.hideHazardHP": {
				type: Boolean,
				default: true,
			},
			"PF2E.hideVehicleHP": {
				type: Boolean,
				default: false,
			},
			"PF2E.workbenchMystifier": {
				hint: f("PF2E.workbenchMystifier.hint", { setting: "core.unknownEntity.name" }),
				config: game.modules.get("xdy-pf2e-workbench")?.active ?? false,
				type: Boolean,
				default: false,
			},
		};
	}

	get breakCondition() {
		return `
        || token.actor.type === 'vehicle' && game.settings.get('healthEstimate', 'PF2E.hideVehicleHP')
        || token.actor.type === 'hazard' && game.settings.get('healthEstimate', 'PF2E.hideHazardHP')
        || token.actor.type === 'loot'
        || token.actor.type === 'party'
        || (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0)`;
	}
}

class ryuutamaEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.hp;
		return hp.value / hp.max;
	}
}

class scumAndVillainyEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.harm;
		let harmLevel = 0;
		for (let [key, value] of Object.entries(hp)) {
			for (let entry of Object.values(value)) {
				if (!isEmpty(entry)) {
					// Testing for empty or whitespace
					switch (key) {
						case "light":
							harmLevel += 1;
							break;
						case "medium":
							harmLevel += 3;
							break;
						case "heavy":
							harmLevel += 9;
							break;
						case "deadly":
							return 0;
					}
				}
			}
		}
		return 1 - (harmLevel / 18);
	}

	get breakCondition() {
		return "||token.actor.type === \"ship\"||token.actor.type === \"\uD83D\uDD5B clock\"||token.actor.type === \"universe\"";
	}
}

class sfrpgEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.organicTypes.push("npc2");
		this.vehicleRules = {
			config: true,
			vehicles: ["starship", "vehicle"],
		};
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicle Threshold",
				rule: "type === \"vehicle\" && game.settings.get(\"healthEstimate\", \"starfinder.useThreshold\")",
				estimates: [
					{ value: 0, label: t("core.estimates.thresholds.0") },
					{ value: 50, label: t("core.estimates.thresholds.1") },
					{ value: 100, label: t("core.estimates.thresholds.2") },
				],
			},
			{
				name: "Vehicles, Starships & Drones",
				rule: "[\"starship\", \"vehicle\", \"drone\"].includes(type)",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const type = token.actor.type;
		const hp = token.actor.system.attributes.hp;
		switch (type) {
			case "npc":
			case "npc2":
			case "drone": {
				const temp = sGet("core.addTemp") ? hp.temp ?? 0 : 0;
				return Math.min((hp.value + temp) / hp.max, 1);
			}
			case "character": {
				const sp = token.actor.system.attributes.sp;
				const addStamina = sGet("starfinder.addStamina") ? 1 : 0;
				const temp = sGet("core.addTemp") ? hp.temp ?? 0 : 0;
				return Math.min((hp.value + (sp.value * addStamina) + temp) / (hp.max + (sp.max * addStamina)), 1);
			}
			case "vehicle":
				if (sGet("starfinder.useThreshold")) {
					if (hp.value > hp.threshold) return 1;
					else if (hp.value > 0) return 0.5;
					return 0;
				}
			// eslint-disable-next-line no-fallthrough
			case "starship":
				return hp.value / hp.max;
		}
	}

	get settings() {
		return {
			"starfinder.addStamina": {
				type: Boolean,
				default: true,
			},
			"starfinder.useThreshold": {
				type: Boolean,
				default: false,
			},
		};
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
        || token.actor.type === 'hazard'
        || game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0`;
	}
}

class shadowrun5eEstimationProvider extends EstimationProvider {
	fraction(token) {
		switch (token.actor.type) {
			case "character":
			case "spirit": {
				const stun = token.actor.system.track.stun;
				const physical = token.actor.system.track.physical;
				return Math.min((stun.max - stun.value) / stun.max, (physical.max - physical.value) / physical.max);
			}
			case "vehicle": {
				const physical = token.actor.system.track.physical;
				return (physical.max - physical.value) / physical.max;
			}
			case "sprite": {
				const matrix = token.actor.system.matrix.condition_monitor;
				return (matrix.max - matrix.value) / matrix.max;
			}
		}
	}
}

class splittermondEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.health;
		return hp.total.value / hp.max;
	}
}

class starwarsffgEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules = {
			config: true,
			vehicles: ["vehicle"],
		};
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		let hp = token.actor.system.stats.wounds;
		if (token.actor.type === "vehicle") {
			hp = token.actor.system.stats.hullTrauma;
		}
		return Math.min((hp.max - hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
        || token.actor.type === 'hazard'
        || token.actor.type === 'vehicle' && game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') &&token.actor.system.stats.hullTrauma.max === 0
        || token.actor.type !== 'vehicle' && game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.stats.wounds.max === 0`;
	}
}

class swadeEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules.config = true;
		this.deathStateName = game.i18n.localize("SWADE.Incap");
		this.deathMarker.config = game.modules.get("condition-lab-triggler")?.active;
		this.estimations = [
			{
				name: "",
				rule: "default",
				estimates: [
					{ value: 0, label: game.i18n.localize("SWADE.Incap") },
					{ value: 25, label: t("core.estimates.states.1") },
					{ value: 50, label: t("core.estimates.states.2") },
					{ value: 99, label: t("core.estimates.states.3") },
					{ value: 100, label: t("core.estimates.states.5") },
				],
			},
			{
				name: "Vehicles",
				rule: "type === \"vehicle\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const hp = token.actor.system.wounds;
		let maxHP = Math.max(hp.max, 1);
		if (token.actor.system.wildcard) {
			const defaultWildCardMaxWounds = sGet("swade.defaultWildCardMaxWounds");
			maxHP = 1 + Math.max(hp.max || defaultWildCardMaxWounds, 1);
		}
		return (maxHP - hp.value) / maxHP;
	}

	get settings() {
		return {
			"swade.defaultWildCardMaxWounds": {
				type: Number,
				default: 3,
				range: {
					min: 1,
					max: 10,
				},
			},
		};
	}

	tokenEffects(token) {
		const incapIcon = CONFIG.statusEffects.find((effect) => effect.id === "incapacitated").img;
		return !!token.actor.effects.find((e) => e.img === incapIcon);
	}

	get breakCondition() {
		return `|| ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')`;
	}
}

class swnrEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.health;
		return Math.min(hp.value / hp.max, 1);
	}
}

class symbaroumEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.health.toughness;
		return hp.value / hp.max;
	}
}

class t2k4eEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules.config = true;
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const type = token.actor.type;
		let hp;
		if (type === "vehicle") {
			hp = token.actor.system.reliability;
		} else {
			hp = token.actor.system.health;
		}
		let temp = 0;
		if (type !== "vehicle" && sGet("core.addTemp")) {
			temp = hp.temp;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| token.actor.type == "unit"
		|| token.actor.type == "party"
		|| game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP')
			&& (
				(${this.isVehicle} && token.actor.system.reliability.max === 0)
				|| (!${this.isVehicle} && token.actor.system.health.max === 0)
			)`;
	}
}

class GenericEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
	}

	fraction(token) {
		const hpPath = sGet("core.custom.FractionHP");
		let hp;
		if (hpPath) {
			hp = foundry.utils.getProperty(token, hpPath);
		} else {
			const primaryTokenAttribute = game.system.primaryTokenAttribute;

			hp = primaryTokenAttribute
				? foundry.utils.getProperty(token, `actor.system.${primaryTokenAttribute}`)
				: token.actor.system?.attributes?.hp || token.actor.system?.hp;
		}
		let temp = 0;
		if (sGet("core.addTemp")) temp = Number(hp?.temp) || 0;

		this._checkValidHP(token, hp, hpPath);
		const FractionMath = sGet("core.custom.FractionMath");
		switch (FractionMath) {
			case 0:
				return Math.min((Number(hp.value) + temp) / Number(hp.max), 1);
			case 1:
			default:
				return (Number(hp.max) + temp - Number(hp.value)) / (Number(hp.max) + temp);
		}
	}

	get settings() {
		return {
			"core.custom.FractionHP": {
				type: String,
				default: "",
			},
			"core.custom.FractionMath": {
				type: Number,
				default: 0,
				choices: {
					0: t("core.custom.FractionMath.choices.0"),
					1: t("core.custom.FractionMath.choices.1"),
				},
			},
		};
	}
}

class tor2eEstimationProvider extends EstimationProvider {
	fraction(token) {
		switch (token.actor.type) {
			case "character": {
				const hp = token.actor.system.resources.endurance;
				return hp.value / hp.max;
			}
			case "adversary": {
				const hp = token.actor.system.endurance;
				return hp.value / hp.max;
			}
			case "npc": {
				const hp = token.actor.system.endurance;
				return hp.value / hp.max;
			}
		}
	}
}

class tormenta20EstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.attributes.pv;
		let temp = 0;
		if (token.actor.type === "character" && sGet("core.addTemp")) {
			temp = hp.temp;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return "||game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.pv.max === 0";
	}
}

class trpgEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
	}

	fraction(token) {
		const hp = token.actor.system.attributes.hp;
		let temp = 0;
		if (token.actor.type === "character" && sGet("core.addTemp")) {
			temp = hp.temp;
		}
		return Math.min((temp + hp.value) / hp.max, 1);
	}

	get breakCondition() {
		return "||game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.attributes.hp.max === 0";
	}
}

class twodsixEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules = {
			config: true,
			vehicles: ["vehicle", "ship"],
		};
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\" || type === \"ship\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		switch (token.actor.type) {
			case "traveller":
			case "robot":
			case "animal": {
				const hp = token.actor.system.hits;
				return hp.value / hp.max;
			}
			case "ship": {
				const hp = token.actor.system.shipStats.hull;
				return hp.value / hp.max;
			}
			case "space-object": {
				const hp = token.actor.system.count;
				return hp.value / hp.max;
			}
			case "vehicle": {
				let max = 0;
				let current = 0;
				const status = token.actor.system.systemStatus;
				for (let sys in status) {
					switch (status[sys]) {
						case "operational": {
							max += 2;
							current += 2;
							break;
						}
						case "damaged": {
							max += 2;
							current += 1;
							break;
						}
						case "destroyed": {
							max += 2;
							break;
						}
					}
				}
				return current / max;
			}
		}
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| token.actor.type !== "vehicle"
			&& game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP')
			&& (token.actor.system?.hits?.max === 0 || token.actor.system?.shipStats?.hull.max === 0) || token.actor.system?.count?.max === 0`;
	}
}

class uesrpgEstimationProvider extends EstimationProvider {
	fraction(token) {
		const hp = token.actor.system.hp;
		return hp.value / hp.max;
	}
}

class weirdwizardEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.deathStateName = game.i18n.localize("WW.Health.Estimation.Dead");
		this.estimations = [
			{
				name: "",
				rule: "default",
				estimates: [
					{ value: 0, label: game.i18n.localize("WW.Health.Estimation.100") },
					{ value: 25, label: game.i18n.localize("WW.Health.Estimation.75") },
					{ value: 50, label: game.i18n.localize("WW.Health.Estimation.50") },
					{ value: 75, label: game.i18n.localize("WW.Health.Estimation.25") },
					{ value: 99.99, label: game.i18n.localize("WW.Health.Estimation.1") },
					{ value: 100, label: game.i18n.localize("WW.Health.Estimation.0") }
				],
			},
		];
	}

	fraction(token) {
		const hp = token.actor.system.stats.damage;
		return (hp.max - hp.value) / hp.max;
	}
}

class wfrp4eEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.vehicleRules.config = true;
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Vehicles",
				rule: "type === \"vehicle\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const hp = token.actor.system.status.wounds;
		return hp.value / hp.max;
	}

	get breakCondition() {
		return `
        || ${this.isVehicle} && game.settings.get('healthEstimate', 'core.hideVehicleHP')
		|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.status.wounds === 0)`;
	}
}

class worldbuildingEstimationProvider extends EstimationProvider {
	fraction(token) {
		/* Can't think of a different way to do it that doesn't involve FS manipulation, which is its own can of worms */
		const setting = sGet("worldbuilding.simpleRule");
		// eslint-disable-next-line no-new-func
		return Function("token", setting)(token);
	}

	get settings() {
		return {
			"worldbuilding.simpleRule": {
				type: String,
				default: "const hp = token.actor.system.health; return hp.value / hp.max",
			},
		};
	}
}

class wrathAndGloryEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.addTemp = true;
		this.breakOnZeroMaxHP = true;
		this.organicTypes = ["agent", "threat"];
	}

	fraction(token) {
		const hp = token.actor.system.combat.wounds;
		let temp = 0;
		if (sGet("core.addTemp")) temp = Number(hp.bonus);
		return (Number(hp.max) + temp - Number(hp.value)) / (Number(hp.max) + temp);
	}

	get breakCondition() {
		return "|| (game.settings.get('healthEstimate', 'core.breakOnZeroMaxHP') && token.actor.system.combat.wounds.max === 0)";
	}
}

class yzecoriolisEstimationProvider extends EstimationProvider {
	constructor() {
		super();
		this.breakOnZeroMaxHP = true;
		this.estimations = [
			...this.estimations,
			{
				name: "Ships",
				rule: "type === \"ship\"",
				estimates: [
					{ value: 0, label: t("core.estimates.vehicles.0") },
					{ value: 20, label: t("core.estimates.vehicles.1") },
					{ value: 40, label: t("core.estimates.vehicles.2") },
					{ value: 60, label: t("core.estimates.vehicles.3") },
					{ value: 80, label: t("core.estimates.vehicles.4") },
					{ value: 100, label: t("core.estimates.vehicles.5") },
				],
			},
		];
	}

	fraction(token) {
		const type = token.actor.type;
		let hp;
		if (type === "ship") {
			hp = token.actor.system.hullPoints;
		} else hp = token.actor.system.hitPoints;
		return hp.value / hp.max;
	}
}

var providers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	CoC7EstimationProvider: CoC7EstimationProvider,
	D35EEstimationProvider: D35EEstimationProvider,
	a5eSystemEstimationProvider: a5eEstimationProvider,
	ageSystemEstimationProvider: ageSystemEstimationProvider,
	alienrpgEstimationProvider: alienrpgEstimationProvider,
	archmageEstimationProvider: archmageEstimationProvider,
	bandOfBladesEstimationProvider: bandOfBladesEstimationProvider,
	bladeRunnerEstimationProvider: bladeRunnerEstimationProvider,
	bladesInTheDarkEstimationProvider: bladesInTheDarkEstimationProvider,
	CustomSystemBuilderEstimationProvider: CustomSystemBuilderEstimationProvider,
	cyberpunkRedCoreEstimationProvider: cyberpunkRedCoreEstimationProvider,
	cyphersystemEstimationProvider: cyphersystemEstimationProvider,
	dnd4eEstimationProvider: dnd4eEstimationProvider,
	dnd5eEstimationProvider: dnd5eEstimationProvider,
	ds4EstimationProvider: ds4EstimationProvider,
	dsa5EstimationProvider: dsa5EstimationProvider,
	dungeonworldEstimationProvider: dungeonworldEstimationProvider,
	forbiddenLandsEstimationProvider: forbiddenLandsEstimationProvider,
	reveDeDragonEstimationProvider: reveDeDragonEstimationProvider,
	lancerEstimationProvider: lancerEstimationProvider,
	monsterweekEstimationProvider: monsterweekEstimationProvider,
	numeneraEstimationProvider: numeneraEstimationProvider,
	od6sEstimationProvider: od6sEstimationProvider,
	oseEstimationProvider: oseEstimationProvider,
	pbtaEstimationProvider: pbtaEstimationProvider,
	pf1EstimationProvider: pf1EstimationProvider,
	pf2eEstimationProvider: pf2eEstimationProvider,
	ryuutamaEstimationProvider: ryuutamaEstimationProvider,
	scumAndVillainyEstimationProvider: scumAndVillainyEstimationProvider,
	sfrpgEstimationProvider: sfrpgEstimationProvider,
	shadowrun5eEstimationProvider: shadowrun5eEstimationProvider,
	splittermondEstimationProvider: splittermondEstimationProvider,
	starwarsffgEstimationProvider: starwarsffgEstimationProvider,
	swadeEstimationProvider: swadeEstimationProvider,
	swnrEstimationProvider: swnrEstimationProvider,
	symbaroumEstimationProvider: symbaroumEstimationProvider,
	t2k4eEstimationProvider: t2k4eEstimationProvider,
	GenericEstimationProvider: GenericEstimationProvider,
	tor2eEstimationProvider: tor2eEstimationProvider,
	tormenta20EstimationProvider: tormenta20EstimationProvider,
	trpgEstimationProvider: trpgEstimationProvider,
	twodsixEstimationProvider: twodsixEstimationProvider,
	uesrpgEstimationProvider: uesrpgEstimationProvider,
	weirdwizardEstimationProvider: weirdwizardEstimationProvider,
	wfrp4eEstimationProvider: wfrp4eEstimationProvider,
	worldbuildingEstimationProvider: worldbuildingEstimationProvider,
	wrathAndGloryEstimationProvider: wrathAndGloryEstimationProvider,
	yzecoriolisEstimationProvider: yzecoriolisEstimationProvider
});

/** Providers whose systems use "-" in their names */
const providerKeys = {
	"age-system": "ageSystem",
	"band-of-blades": "bandOfBlades",
	"blade-runner": "bladeRunner",
	"blades-in-the-dark": "bladesInTheDark",
	"custom-system-builder": "CustomSystemBuilder",
	"cyberpunk-red-core": "cyberpunkRedCore",
	"forbidden-lands": "forbiddenLands",
	"foundryvtt-reve-de-dragon": "reveDeDragon",
	"scum-and-villainy": "scumAndVillainy",
	"uesrpg-d100": "uesrpg",
	"wrath-and-glory": "wrathAndGlory",
};

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class HealthEstimateSettingsV2 extends HandlebarsApplicationMixin(ApplicationV2) {
	path = "core";

	static DEFAULT_OPTIONS = {
		classes: ["form", "healthEstimate"],
		position: {
			width: 640,
			height: "auto",
		},
		form: {
			handler: HealthEstimateSettingsV2.#onSubmit,
			closeOnSubmit: true,
		},
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
		},
	};

	static PARTS = {
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	_getButtons() {
		return [
			{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
			{ type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
		];
	}

	get title() {
		return `Health Estimate: ${game.i18n.localize(this.options.window.title)}`;
	}

	prepSelection(key) {
		const path = `${this.path}.${key}`;
		const data = settingData(path);
		const { name, hint } = data;
		const selected = sGet(path);
		const select = Object.entries(data.choices).map(([key, value]) => ({ key, value }));
		return { select, name, hint, selected };
	}

	prepSetting(key) {
		const path = `${this.path}.${key}`;
		const { name, hint } = settingData(path);
		return {
			value: sGet(path),
			name,
			hint,
		};
	}

	async resetToDefault(key) {
		const path = `core.${key}`;
		const defaultValue = game.settings.settings.get(`healthEstimate.${path}`).default;
		await game.settings.set("healthEstimate", path, defaultValue);
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}

	/**
	 * Executes on form submission
	 * @param {Event} event - the form submission event
	 * @param {Object} formData - the form data
	 */
	static async #onSubmit(event, form, formData) {
		const settings = foundry.utils.expandObject(formData.object);
		await Promise.all(Object.entries(settings).map(([key, value]) => sSet(`core.${key}`, value)));
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}
}

class HealthEstimateBehaviorSettings extends HealthEstimateSettingsV2 {
	static DEFAULT_OPTIONS = {
		id: "health-estimate-behavior-form",
		actions: {
			reset: HealthEstimateBehaviorSettings.reset,
		},
		window: {
			icon: "fas fa-gear",
			title: "healthEstimate.core.menuSettings.behaviorSettings.plural",
		},
	};

	static PARTS = {
		form: {
			id: "health-estimate-behavior-form",
			template: "./modules/healthEstimate/templates/behaviorSettings.hbs",
		},
		...HealthEstimateSettingsV2.PARTS,
	};

	_prepareContext(options) {
		return {
			alwaysShow: this.prepSetting("alwaysShow"),
			combatOnly: this.prepSetting("combatOnly"),
			showDescription: this.prepSelection("showDescription"),
			showDescriptionTokenType: this.prepSelection("showDescriptionTokenType"),

			deathState: this.prepSetting("deathState"),
			deathStateName: this.prepSetting("deathStateName"),
			NPCsJustDie: this.prepSetting("NPCsJustDie"),
			deathMarkerEnabled: game.healthEstimate.estimationProvider.deathMarker.config,
			deathMarker: this.prepSetting("deathMarker"),
			buttons: this._getButtons(),
		};
	}

	static async reset(event, form, formData) {
		const paths = [
			"alwaysShow",
			"combatOnly",
			"showDescription",
			"showDescriptionTokenType",
			"deathState",
			"deathStateName",
			"NPCsJustDie",
			"deathMarker",
		];

		await Promise.all(paths.map(this.resetToDefault));
		canvas.scene?.tokens.forEach((token) => token.object.refresh());
		this.close();
	}
}

class HealthEstimateSettings extends FormApplication {
	constructor(object, options = {}) {
		super(object, options);
		/** Set path property */
		this.path = "core";
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["form", "healthEstimate"],
			width: 640,
			height: "fit-content",
			closeOnSubmit: true,
		});
	}

	prepSelection(key) {
		const path = `${this.path}.${key}`;
		const data = settingData(path);
		const { name, hint } = data;
		const selected = sGet(path);
		const select = Object.entries(data.choices).map(([key, value]) => ({ key, value }));
		return { select, name, hint, selected };
	}

	prepSetting(key) {
		const path = `${this.path}.${key}`;
		const { name, hint } = settingData(path);
		return {
			value: sGet(path),
			name,
			hint,
		};
	}

	async resetToDefault(key) {
		const path = `core.${key}`;
		const defaultValue = game.settings.settings.get(`healthEstimate.${path}`).default;
		await game.settings.set("healthEstimate", path, defaultValue);
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}

	/**
	 * Executes on form submission
	 * @param {Event} event - the form submission event
	 * @param {Object} formData - the form data
	 */
	async _updateObject(event, formData) {
		await Promise.all(
			Object.entries(formData).map(async ([key, value]) => {
				let current = game.settings.get("healthEstimate", `core.${key}`);
				// eslint-disable-next-line eqeqeq
				if (value != current) await sSet(`core.${key}`, value);
			})
		);
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}
}

class HealthEstimateEstimationSettings extends HealthEstimateSettings {
	constructor(object, options = {}) {
		super(object, options);
		this.estimations = foundry.utils.deepClone(sGet("core.estimations"));
		this.changeTabs = null;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "health-estimate-estimation-form",
			title: `Health Estimate: ${t("core.estimationSettings.title")}`,
			template: "./modules/healthEstimate/templates/EstimationSettings.hbs",
			classes: ["form", "healthEstimate", "estimationSettings"],
			height: "auto",
			tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "behavior" }],
		});
	}

	getData(options) {
		return {
			estimations: this.estimations,
		};
	}

	/**
	 * This is the earliest method called after render() where changing tabs can be called
	 * @param {*} html
	 */
	_activateCoreListeners(html) {
		super._activateCoreListeners(html);
		if (this.changeTabs !== null) {
			const tabName = this.changeTabs.toString();
			if (tabName !== this._tabs[0].active) this._tabs[0].activate(tabName);
			this.changeTabs = null;
		}
	}

	async activateListeners(html) {
		super.activateListeners(html);
		html.find("button[name=reset]").on("click", async (event) => {
			await this.resetToDefault("estimations");
			this.estimations = sGet("core.estimations");
			canvas.scene?.tokens.forEach((token) => token.object.refresh());
			this.close();
		});

		// Handle all changes to tables
		html.find("a[data-action=add-table]").on("click", (event) => {
			this.changeTabs = this.estimations.length;
			this.estimations.push({
				name: "",
				rule: "",
				estimates: [
					{
						label: t("core.estimates.worst"),
						value: 0,
					},
					{
						label: t("core.estimates.best"),
						value: 100,
					},
				],
			});
			this.render();
		});
		html.find("button[data-action=table-delete]").on("click", (event) => {
			const { idx } = event.target.dataset ?? {};
			this.estimations.splice(Number(idx), 1);
			this.changeTabs = Number(idx) - 1;
			this.render();
		});
		html.find("button[data-action=change-prio]").on("click", (event) => {
			const prio = event.target?.dataset.prio === "increase" ? -1 : 1;
			const idx = Number(event.target?.dataset.idx);

			const arraymove = (arr, fromIndex, toIndex) => {
				const element = arr[fromIndex];
				arr.splice(fromIndex, 1);
				arr.splice(toIndex, 0, element);
			};

			arraymove(this.estimations, idx, idx + prio);
			this.changeTabs = idx + prio;
			this.render();
		});
		for (const input of html[0].querySelectorAll(".form-group input, .form-group textarea")) {
			input.addEventListener("change", (event) => {
				// eslint-disable-next-line no-unused-vars
				const [_, tableIndex, property] = event.target.name.split(".");
				this.estimations[tableIndex][property] = event.target.value;
				event.preventDefault();
			});
		}

		// Handle all changes for estimations
		html.find("[data-action=estimation-add]").on("click", (event) => {
			// Fix for clicking either the A or I tag
			const idx = Number(event.target?.dataset.idx ?? event.target?.children[0]?.dataset.idx);
			this.estimations[idx].estimates.push({ label: "Custom", value: 100 });
			this.render();
		});
		for (const element of html[0].querySelectorAll("[data-action=estimation-delete]")) {
			element.addEventListener("click", async (event) => {
				const { table, idx } = event.target?.dataset ?? {};
				if (idx) this.estimations[table].estimates.splice(Number(idx), 1);
				this.render();
			});
		}
		for (const element of html[0].querySelectorAll(".estimation-types input")) {
			element.addEventListener("change", async (event) => {
				// eslint-disable-next-line no-unused-vars
				const [_, table, tableIndex, estimateIndex, rule] = event.target?.name.split(".") ?? [];
				if (this.estimations[table]?.estimates?.[estimateIndex]?.[rule]) {
					this.estimations[table].estimates[estimateIndex][rule] = event.target?.value;
				}
				event.preventDefault();
			});
		}
	}

	_getSubmitData(updateData) {
		const original = super._getSubmitData(updateData);
		const data = expandObject(original);
		const estimations = [];
		for (const key in data.estimations) {
			const { name, rule, ignoreColor, estimates } = data.estimations[key];
			const sortedEstimates = Object.keys(estimates)
				.sort((a, b) => estimates[a].value - estimates[b].value)
				.map((innerKey) => estimates[innerKey]);
			estimations.push({ name, rule, ignoreColor, estimates: sortedEstimates });
		}
		return { estimations };
	}
}

class HealthEstimateStyleSettings extends HealthEstimateSettingsV2 {
	gradColors = [];

	path = "core.menuSettings";

	static DEFAULT_OPTIONS = {
		id: "health-estimate-style-form",
		actions: {
			reset: HealthEstimateStyleSettings.reset,
		},
		form: {
			handler: HealthEstimateStyleSettings.#onSubmit,
		},
		window: {
			icon: "fas fa-palette",
			title: "healthEstimate.core.menuSettings.styleSettings.plural",
		},
	};

	static PARTS = {
		form: {
			id: "health-estimate-style-form",
			template: "./modules/healthEstimate/templates/styleSettings.hbs",
		},
		...HealthEstimateSettingsV2.PARTS,
	};

	_prepareContext(options) {
		return {
			fontFamily: this.prepSelection("fontFamily"),
			useColor: this.prepSetting("useColor"),
			smoothGradient: this.prepSetting("smoothGradient"),
			deadColor: this.prepSetting("deadColor"),
			fontSize: this.prepSetting("fontSize"),
			position: this.prepSetting("position"),
			position2: this.prepSelection("position2"),
			mode: this.prepSelection("mode"),
			outline: this.prepSelection("outline"),
			outlineIntensity: this.prepSetting("outlineIntensity"),
			scaleToGridSize: this.prepSetting("scaleToGridSize"),
			scaleToZoom: this.prepSetting("scaleToZoom"),
			deadText: game.settings.get("healthEstimate", "core.deathStateName"),
			buttons: this._getButtons(),
		};
	}

	_onRender(context, options) {
		const gradientPositions = game.settings.get("healthEstimate", "core.menuSettings.gradient");
		const mode = this.element.querySelector("#mode");
		const useColorCheckbox = this.element.querySelector('input[name="useColor"]');

		this.fontFamily = this.element.querySelector("#fontFamily");
		this.useColor = sGet("core.menuSettings.useColor");

		this.deadColor = this.element.querySelector("color-picker[name=deadColor]");
		this.deadOutline = sGet("core.variables.deadOutline");

		this.outlineMode = this.element.querySelector("#outlineMode");
		this.outlineIntensity = this.element.querySelector("input[name=outlineIntensity]");
		this.fontSize = this.element.querySelector("input[name=fontSize]");
		this.textPosition = this.element.querySelector("input[name=position]");
		this.smoothGradient = this.element.querySelector("#smoothGradient");
		this.gradEx = this.element.querySelector("#gradientExampleHE");

		this.fontSize.value = Number.isNumeric(this.fontSize.value) ? this.fontSize.value : 24;
		this.textPosition.value = Number.isNumeric(this.textPosition.value) ? this.textPosition.value : 0;

		const gradientForm = this.element.querySelector('div[class="form-group gradient"]');

		this.hideForm(this.smoothGradient.parentElement, this.useColor);
		this.hideForm(gradientForm, this.useColor);
		this.hideForm(this.deadColor.parentElement, this.useColor);
		this.hideForm(this.outlineMode.parentElement, this.useColor);

		this.gp = new Grapick({
			el: "#gradientControlsHE",
			colorEl: '<input id="colorpicker"/>',
		});
		this.gp.setColorPicker((handler) => {
			const el = handler.getEl().querySelector("#colorpicker");

			$(el).spectrum({
				color: handler.getColor(),
				showAlpha: false,
				change(color) {
					handler.setColor(color.toRgbString());
				},
				move(color) {
					handler.setColor(color.toRgbString(), 0);
				},
			});
		});
		this.setHandlers(gradientPositions).then(() => {
			this.updateGradientFunction();
		});

		this.deadColor.addEventListener("change", (ev) => {
			this.deadOutline = this.outlFn(ev.target.value);
			// this.deadColor.value = ev.target.value;
			this.updateSample();
		});
		useColorCheckbox.addEventListener("change", (ev) => {
			this.useColor = !this.useColor;
			this.updateSample();
			this.hideForm(this.smoothGradient.parentElement, ev.target.checked);
			this.hideForm(gradientForm, ev.target.checked);
			this.hideForm(this.deadColor.parentElement, ev.target.checked);
			this.hideForm(this.outlineMode.parentElement, ev.target.checked);
		});

		for (const range of this.element.querySelectorAll("input[type=range]")) {
			range.addEventListener("change", (event) => {
				range.nextElementSibling.innerHTML = event.target.value;
			});
		}
		this.gp.on("change", (complete) => {
			this.updateGradient();
		});
		for (let el of [this.outlineIntensity, this.outlineMode, mode]) {
			el.addEventListener("change", () => {
				this.updateGradientFunction();
				this.updateSample();
			});
		}
		this.smoothGradient.addEventListener("change", () => {
			this.updateGradient();
		});
		for (let el of [this.fontFamily, this.fontSize, this.textPosition]) {
			el.addEventListener("change", () => {
				this.updateSample();
			});
		}
	}

	hideForm(form, boolean) {
		form.style.display = !boolean ? "none" : "flex";
	}

	async setHandlers(positions) {
		for (let [i, v] of positions.colors.entries()) {
			this.gp.addHandler(positions.positions[i] * 100, v);
		}
	}

	updateGradientFunction() {
		const mode = this.element.querySelector("#mode").value;
		/**
		 *
		 * @param {Number} amount
		 * @param {[String]} colors
		 * @param {[Number]} colorPositions
		 * @returns {[String]}
		 */
		this.gradFn = (amount, colors, colorPositions) => {
			if (mode === "bez") return chroma.bezier(colors).scale().domain(colorPositions).colors(amount);
			return chroma.scale(colors).mode(mode).domain(colorPositions).colors(amount);
		};

		this.updateOutlineFunction();
		this.updateGradient();
	}

	updateOutlineFunction() {
		const outlineHandler = this.outlineMode.value;
		const outlineAmount = this.outlineIntensity.value;

		/**
		 * @param {Boolean} color
		 * @returns {[String]}
		 */
		this.outlFn = (color = false) => {
			if (color) return chroma(color)[outlineHandler](outlineAmount).hex();
			return this.gradColors.map((c) => chroma(c)[outlineHandler](outlineAmount).hex());
		};
	}

	updateGradient() {
		this.gradLength = this.smoothGradient.checked ? 100 : sGet("core.estimations")[0].estimates.length;
		const width = 100 / this.gradLength;
		const colors = this.gp.handlers.map((a) => a.color);
		const colorPositions = this.gp.handlers.map((a) => Math.round(a.position) / 100);
		this.gradColors = this.gradFn(this.gradLength, colors, colorPositions);
		this.outlColors = this.outlFn();
		let gradString = "";

		for (let i = 0; i < this.gradLength; i++) {
			gradString += `<span style="
					display:inline-block;
					height:30px;
					width:${width}%;
					background-color:${this.gradColors[i]};
				"></span>`;
		}
		this.gradEx.innerHTML = gradString;
		this.updateSample();
	}

	updateSample() {
		const sample = this.element.querySelector("#healthEstimateSample");
		const sampleAnimation = this.element.querySelector("#SampleAnimation");
		const deadSample = this.element.querySelector("#healthEstimateSample").children[0];
		const deadColor = this.useColor ? this.deadColor.value : "#FFF";
		const deadOutline = this.useColor ? this.deadOutline : "#000";
		sample.style.fontFamily = this.fontFamily.value;
		sample.style.fontSize = `${this.fontSize.value}px`;

		deadSample.style.color = deadColor;
		deadSample.style.textShadow = `-1px -1px 1px ${deadOutline}, 0 -1px 1px ${deadOutline}, 1px -1px 1px ${deadOutline},
			1px 0 1px ${deadOutline}, 1px 1px 1px ${deadOutline}, 0 1px 1px ${deadOutline},
			-1px 1px 1px ${deadOutline}, -1px 0 1px ${deadOutline}`;

		if (this.useColor) {
			sampleAnimation.classList.add("healthEstimateAnimate");
			for (let i = 1; i <= 6; i++) {
				const index = Math.round(this.gradLength * ((i - 1) / 5));
				const position = Math.max(index - 1, 0);
				const keyframe = `--healthEstimate-keyframe-${index}`;
				const outlineKeyframe = `${keyframe}-outline`;
				const gradColor = this.gradColors[position];
				const outlColor = this.outlColors[position];

				document.documentElement.style.setProperty(keyframe, gradColor);
				document.documentElement.style.setProperty(outlineKeyframe, outlColor);
			}
		} else {
			sampleAnimation.classList.remove("healthEstimateAnimate");
			this.clearKeyframes();
		}
	}

	clearKeyframes() {
		try {
			for (let i = 0; i <= 6; i++) {
				const index = Math.round(this.gradLength * ((i - 1) / 5));
				document.documentElement.style.setProperty(`--healthEstimate-keyframe-${index}`, null);
				document.documentElement.style.setProperty(`--healthEstimate-keyframe-${index}-outline`, null);
			}
		} catch(err) {
			console.error("Health Estimate | Error clearing document styles", err);
		}
	}

	static async reset() {
		const paths = [
			"menuSettings.useColor",
			"menuSettings.smoothGradient",
			"menuSettings.deadColor",
			"menuSettings.fontSize",
			"menuSettings.position",
			"menuSettings.position2",
			"menuSettings.mode",
			"menuSettings.outline",
			"menuSettings.outlineIntensity",
			"menuSettings.scaleToGridSize",
			"menuSettings.scaleToZoom",
			"variables.colors",
			"variables.outline",
			"variables.deadColor",
			"variables.deadOutline",
		];
		await Promise.all(paths.map(this.resetToDefault));
		this.close();
	}

	async close(options = {}) {
		this.clearKeyframes();
		// delete this.gp;
		super.close(options);
	}

	static async #onSubmit(event, form, formData) {
		const settings = foundry.utils.expandObject(formData.object);
		const menuSettingsKeys = Object.keys(settings).filter((key) => key.indexOf("outline") === -1);
		const updates = menuSettingsKeys.map((key) => sSet(`core.menuSettings.${key}`, settings[key]));
		await Promise.all(updates);

		if (!settings.useColor) {
			this.gradColors = ["#FFF"];
			this.outlColors = ["#000"];
			this.deadOutline = "#000";
			settings.deadColor = "#FFF";
		}
		const variableUpdates = [
			sSet("core.menuSettings.gradient", {
				colors: this.gp.handlers.map((a) => a.color),
				positions: this.gp.handlers.map((a) => Math.round(a.position) / 100),
			}),
			sSet("core.menuSettings.outline", settings.outlineMode),
			sSet("core.menuSettings.outlineIntensity", settings.outlineIntensity),
			sSet("core.variables.colors", this.gradColors),
			sSet("core.variables.outline", this.outlColors),
			sSet("core.variables.deadColor", settings.deadColor),
			sSet("core.variables.deadOutline", this.deadOutline),
		];
		await Promise.all(variableUpdates);

		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}
}

const registerSettings = function () {
	game.settings.registerMenu("healthEstimate", "behaviorSettings", {
		name: t("core.menuSettings.behaviorSettings.plural"),
		label: t("core.menuSettings.behaviorSettings.plural"),
		icon: "fas fa-gear",
		type: HealthEstimateBehaviorSettings,
		restricted: true,
	});
	game.settings.registerMenu("healthEstimate", "estimationSettings", {
		name: t("core.estimationSettings.title"),
		label: t("core.estimationSettings.title"),
		icon: "fas fa-scale-balanced",
		type: HealthEstimateEstimationSettings,
		restricted: true,
	});
	game.settings.registerMenu("healthEstimate", "styleSettings", {
		name: t("core.menuSettings.styleSettings.plural"),
		label: t("core.menuSettings.styleSettings.plural"),
		icon: "fas fa-palette",
		type: HealthEstimateStyleSettings,
		restricted: true,
	});

	/* Settings for the main settings menu */

	addSetting("core.stateNames", {
		type: String,
		default: "",
		config: false,
	});
	addMenuSetting("core.estimations", {
		type: Array,
		default: game.healthEstimate.estimationProvider.estimations,
		onChange: (value) => {
			game.healthEstimate.estimations = value;
			canvas.scene?.tokens.forEach((token) => token.object.refresh());
		},
	});
	addSetting("core.tooltipPosition", {
		config: !game.modules.get("elevation-module")?.active,
		type: String,
		default: "default",
		choices: {
			left: "healthEstimate.core.tooltipPosition.options.left",
			default: "healthEstimate.core.tooltipPosition.options.default",
			right: "healthEstimate.core.tooltipPosition.options.right",
		},
		onChange: (value) => {
			game.healthEstimate.tooltipPosition = value;
			canvas.tokens?.placeables.forEach((token) => repositionTooltip(token, true));
		},
	});

	addSetting("core.outputChat", {
		hint: f("core.outputChat.hint", { setting: t("core.unknownEntity.name") }),
		type: Boolean,
		default: false,
		onChange: (value) => {
			game.healthEstimate.outputChat = value;
		},
	});
	let warning = " ";
	if (game.modules.get("combat-utility-belt")?.active) warning += t("core.unknownEntity.warningCUB");
	else if (game.modules.get("xdy-pf2e-workbench")?.active) warning += t("core.unknownEntity.warningPF2eWorkbench");
	addSetting("core.unknownEntity", {
		type: String,
		hint: f("core.unknownEntity.hint", { warning }),
		default: game.i18n.localize("healthEstimate.core.unknownEntity.default"),
	});
	addSetting("core.addTemp", {
		config: game.healthEstimate.estimationProvider.addTemp,
		type: Boolean,
		default: false,
	});
	addSetting("core.breakOnZeroMaxHP", {
		config: game.healthEstimate.estimationProvider.breakOnZeroMaxHP,
		type: Boolean,
		default: true,
	});
	addSetting("core.hideVehicleHP", {
		name: "healthEstimate.PF2E.hideVehicleHP.name",
		hint: "healthEstimate.PF2E.hideVehicleHP.hint",
		config: game.healthEstimate.estimationProvider.vehicleRules.config,
		type: Boolean,
		default: false,
	});

	/* Settings for the behavior menu */
	addMenuSetting("core.alwaysShow", {
		type: Boolean,
		default: false,
		onChange: (value) => {
			game.healthEstimate.alwaysShow = value;
			canvas.tokens?.placeables.forEach((token) =>
				game.healthEstimate._handleOverlay(token, value || game.healthEstimate.showCondition(token.hover))
			);
		},
	});
	addMenuSetting("core.combatOnly", {
		type: Boolean,
		default: false,
		onChange: (value) => {
			game.healthEstimate.combatOnly = value;
		},
	});
	addMenuSetting("core.showDescription", {
		type: Number,
		default: 0,
		choices: {
			0: t("core.showDescription.choices.all"),
			1: t("core.showDescription.choices.GM"),
			2: t("core.showDescription.choices.Players"),
		},
		onChange: () => {
			game.healthEstimate.updateBreakConditions();
		},
	});
	addMenuSetting("core.showDescriptionTokenType", {
		type: Number,
		default: 0,
		choices: {
			0: t("core.showDescription.choices.all"),
			1: t("core.showDescription.choices.PC"),
			2: t("core.showDescription.choices.NPC"),
		},
		onChange: () => {
			game.healthEstimate.updateBreakConditions();
		},
	});

	/* Settings for the death menu */
	addMenuSetting("core.deathState", {
		hint: game.healthEstimate.estimationProvider.deathMarker.config
			? f("core.deathState.hint1", {
				setting: t("core.deathStateName.name"),
				setting2: t("core.deathMarker.name"),
			})
			: f("core.deathState.hint2", { setting: t("core.deathStateName.name") }),
		type: Boolean,
		default: game.healthEstimate.estimationProvider.deathState,
		onChange: (value) => {
			game.healthEstimate.showDead = value;
		},
	});
	addMenuSetting("core.deathStateName", {
		type: String,
		default: game.healthEstimate.estimationProvider.deathStateName,
		onChange: (value) => {
			game.healthEstimate.deathStateName = value;
		},
	});
	addMenuSetting("core.NPCsJustDie", {
		type: Boolean,
		hint: f("core.NPCsJustDie.hint", { setting: t("core.deathStateName.name") }),
		default: true,
		onChange: (value) => {
			game.healthEstimate.NPCsJustDie = value;
		},
	});
	addMenuSetting("core.deathMarker", {
		type: String,
		default: game.healthEstimate.estimationProvider.deathMarker.default,
		onChange: (value) => {
			game.healthEstimate.deathMarker = value;
		},
	});

	/* Settings for the custom menu */
	addMenuSetting("core.menuSettings.useColor", {
		type: Boolean,
		default: true,
	});
	addMenuSetting("core.menuSettings.scaleToGridSize", {
		type: Boolean,
		default: false,
		onChange: (value) => {
			game.healthEstimate.scaleToGridSize = value;
		},
	});
	addMenuSetting("core.menuSettings.scaleToZoom", {
		type: Boolean,
		default: false,
		onChange: (value) => {
			game.healthEstimate.scaleToZoom = value;
			if (value) Hooks.on("canvasPan", HealthEstimateHooks.onCanvasPan);
			else Hooks.off("canvasPan", HealthEstimateHooks.onCanvasPan);
		},
	});
	addMenuSetting("core.menuSettings.smoothGradient", {
		type: Boolean,
		default: true,
		onChange: (value) => {
			game.healthEstimate.smoothGradient = value;
		},
	});
	addMenuSetting("core.menuSettings.gradient", {
		type: Object,
		default: {
			colors: ["#FF0000", "#00FF00"],
			positions: [0, 1],
		},
	});
	addMenuSetting("core.menuSettings.mode", {
		type: String,
		default: "hsl",
		choices: {
			bez: "Bezier",
			rgb: "RGB",
			hsl: "HSL",
			lch: "LCH",
		},
	});
	addMenuSetting("core.menuSettings.deadColor", {
		type: String,
		default: "#990000",
	});
	addMenuSetting("core.menuSettings.outline", {
		type: String,
		default: "darken",
		choices: {
			darken: t("core.menuSettings.outline.darken"),
			brighten: t("core.menuSettings.outline.brighten"),
		},
		onChange: (s) => {
			const color = s === "darken" ? "black" : "white";
			canvas.tokens?.placeables
				.filter((token) => token.healthEstimate)
				.forEach((token) => (token.healthEstimate.style.dropShadowColor = color));
		},
	});
	addMenuSetting("core.menuSettings.outlineIntensity", {
		type: Number,
		default: 3,
	});
	addMenuSetting("core.menuSettings.position2", {
		type: String,
		default: "a",
		choices: {
			a: t("core.menuSettings.position.top"),
			b: t("core.menuSettings.position.middle"),
			c: t("core.menuSettings.position.bottom"),
		},
		onChange: (value) => {
			game.healthEstimate.position = value;
		},
	});
	addMenuSetting("core.menuSettings.position", {
		type: Number,
		default: 0,
		onChange: (value) => {
			game.healthEstimate.height = value;
		},
	});

	const getFonts = () => {
		const obj = {};
		Object.keys(CONFIG.fontDefinitions).forEach((f) => {
			obj[f] = f;
		});
		if (!(CONFIG.canvasTextStyle.fontFamily in obj)) {
			obj[CONFIG.canvasTextStyle.fontFamily] = CONFIG.canvasTextStyle.fontFamily;
		}
		return obj;
	};
	addMenuSetting("core.menuSettings.fontFamily", {
		name: game.i18n.localize("EDITOR.Font"),
		type: String,
		default: CONFIG.canvasTextStyle.fontFamily,
		choices: getFonts(),
		onChange: (value) => {
			game.healthEstimate.fontFamily = value;
			canvas.scene?.tokens.forEach((token) => {
				if (token.object.healthEstimate) {
					token.object.healthEstimate.style.fontFamily = value;
				}
			});
		},
	});
	addMenuSetting("core.menuSettings.fontSize", {
		type: Number,
		default: 24,
		onChange: (value) => {
			game.healthEstimate.fontSize = value;
			canvas.scene?.tokens.forEach((token) => {
				if (token.object.healthEstimate) {
					token.object.healthEstimate.style.fontSize = game.healthEstimate.scaledFontSize;
				}
			});
		},
	});

	/* Storage for important variables. All following settings are set and read programmatically and do not have associated UI */
	/* Default for variables.colors are pre-calculated with chroma.scale(['#F00','#0F0']).mode('hsl').colors(100)                 */
	/* Default for variables.outline are pre-calculated by running chroma(color).darken(3) on each color in variables.colors   */
	addMenuSetting("core.variables.colors", {
		type: Array,
		default: [
			"#ff0000",
			"#ff0500",
			"#ff0a00",
			"#ff0f00",
			"#ff1500",
			"#ff1a00",
			"#ff1f00",
			"#ff2400",
			"#ff2900",
			"#ff2e00",
			"#ff3400",
			"#ff3900",
			"#ff3e00",
			"#ff4300",
			"#ff4800",
			"#ff4d00",
			"#ff5200",
			"#ff5800",
			"#ff5d00",
			"#ff6200",
			"#ff6700",
			"#ff6c00",
			"#ff7100",
			"#ff7600",
			"#ff7c00",
			"#ff8100",
			"#ff8600",
			"#ff8b00",
			"#ff9000",
			"#ff9500",
			"#ff9b00",
			"#ffa000",
			"#ffa500",
			"#ffaa00",
			"#ffaf00",
			"#ffb400",
			"#ffb900",
			"#ffbf00",
			"#ffc400",
			"#ffc900",
			"#ffce00",
			"#ffd300",
			"#ffd800",
			"#ffde00",
			"#ffe300",
			"#ffe800",
			"#ffed00",
			"#fff200",
			"#fff700",
			"#fffc00",
			"#fcff00",
			"#f7ff00",
			"#f2ff00",
			"#edff00",
			"#e8ff00",
			"#e3ff00",
			"#deff00",
			"#d8ff00",
			"#d3ff00",
			"#ceff00",
			"#c9ff00",
			"#c4ff00",
			"#bfff00",
			"#b9ff00",
			"#b4ff00",
			"#afff00",
			"#aaff00",
			"#a5ff00",
			"#a0ff00",
			"#9bff00",
			"#95ff00",
			"#90ff00",
			"#8bff00",
			"#86ff00",
			"#81ff00",
			"#7cff00",
			"#76ff00",
			"#71ff00",
			"#6cff00",
			"#67ff00",
			"#62ff00",
			"#5dff00",
			"#58ff00",
			"#52ff00",
			"#4dff00",
			"#48ff00",
			"#43ff00",
			"#3eff00",
			"#39ff00",
			"#34ff00",
			"#2eff00",
			"#29ff00",
			"#24ff00",
			"#1fff00",
			"#1aff00",
			"#15ff00",
			"#0fff00",
			"#0aff00",
			"#05ff00",
			"#00ff00",
		],
		onChange: (value) => {
			game.healthEstimate.colors = value;
		},
	});
	addMenuSetting("core.variables.outline", {
		type: Array,
		default: [
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5a0000",
			"#5b0000",
			"#5b0000",
			"#5b0000",
			"#5b0000",
			"#5c0000",
			"#5c0000",
			"#5c0000",
			"#5d0000",
			"#5d0000",
			"#5e0000",
			"#5e0000",
			"#5e0000",
			"#5f0100",
			"#5f0a00",
			"#5f1400",
			"#601a00",
			"#601f00",
			"#602500",
			"#602900",
			"#612e00",
			"#613300",
			"#613800",
			"#613c00",
			"#614000",
			"#614500",
			"#614900",
			"#614d00",
			"#615200",
			"#615600",
			"#615a00",
			"#615e00",
			"#616300",
			"#606700",
			"#606b00",
			"#5d6d00",
			"#596d00",
			"#556d00",
			"#506d00",
			"#4c6d00",
			"#476d00",
			"#426c00",
			"#3c6c00",
			"#376c00",
			"#326c00",
			"#2c6c00",
			"#256b00",
			"#1e6b00",
			"#136b00",
			"#056b00",
			"#006a00",
			"#006a00",
			"#006a00",
			"#006a00",
			"#006a00",
			"#006900",
			"#006900",
			"#006900",
			"#006900",
			"#006800",
			"#006800",
			"#006800",
			"#006800",
			"#006800",
			"#006700",
			"#006700",
			"#006700",
			"#006700",
			"#006700",
			"#006700",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
			"#006600",
		],
		onChange: (value) => {
			game.healthEstimate.outline = value;
		},
	});
	addMenuSetting("core.variables.deadColor", {
		type: String,
		default: "#990000",
		onChange: (value) => {
			game.healthEstimate.deadColor = value;
		},
	});
	addMenuSetting("core.variables.deadOutline", {
		type: String,
		default: "#340000",
		onChange: (value) => {
			game.healthEstimate.deadOutline = value;
		},
	});
};

class HealthEstimate {
	constructor() {
		/** Changes which users get to see the overlay. */
		this.breakConditions = {
			default: "false",
		};
		this.actorsCurrentHP = {};
		this.lastZoom = null;
	}

	/**
	 * @type {Number}
	 */
	get gridScale() {
		return this.scaleToGridSize ? canvas.scene.dimensions.size / 100 : 1;
	}

	/**
	 * The module's Estimate Provider.
	 * @type {EstimationProvider}
	 */
	get provider() {
		return this.estimationProvider;
	}

	/**
	 * The Font Size scaled to the current grid scale and zoom level.
	 * Multiplies by 4 to increase the resolution.
	 * @type {Number}
	 */
	get scaledFontSize() {
		return ((this.fontSize * this.gridScale) / this.zoomLevel) * 4;
	}

	/**
	 * The current zoom level. If the Scale to Zoom setting is disabled, always returns 1.
	 * @type {Number}
	 */
	get zoomLevel() {
		return this.scaleToZoom ? Math.min(1, canvas.stage.scale.x) : 1;
	}

	// Hooks

	/**
	 * Sets the module's estimation provider, registers settings and updates break conditions.
	 */
	setup() {
		// Set the module's provider.
		const providerArray = Object.keys(providers);
		const supportedSystems = providerArray.join("|").replace(/EstimationProvider/g, "");
		const systemsRegex = new RegExp(supportedSystems);
		let providerString = "Generic";
		if (game.system.id in providerKeys) {
			providerString = providerKeys[game.system.id] || "Generic";
		} else if (systemsRegex.test(game.system.id)) {
			providerString = game.system.id;
		}

		/** @type {EstimateProvider} */
		this.estimationProvider = new providers[`${providerString}EstimationProvider`](`native.${providerString}`);

		if (this.estimationProvider.breakCondition !== undefined) {
			this.breakConditions.system = this.estimationProvider.breakCondition;
		}
		if (this.estimationProvider.tokenEffects !== undefined) {
			this.tokenEffectsPath = this.estimationProvider.tokenEffects;
		}
		registerSettings();
		for (let [key, data] of Object.entries(this.estimationProvider.settings)) {
			addSetting(key, data);
		}
		this.updateBreakConditions();
		this.updateSettings();
	}

	ready() {
		// Setting change handling
		if (!Number.isNumeric(this.fontSize)) {
			if (!isNaN(this.fontSize) && this.fontSize.match(/[0-9]*\.?[0-9]+(px|%)+/i)) {
				this.fontSize = Number(this.fontSize.replace(/(px|%)+/i, ""));
			} else {
				console.warn(
					`Health Estimate | ${game.i18n.format("healthEstimate.notifications.invalidFontSize", {
						fontSize: this.fontSize,
					})}`
				);
				this.fontSize = 24;
			}
			sSet("core.menuSettings.fontSize", this.fontSize || 24);
		}
		if (!Number.isNumeric(this.height)) {
			const heights = {
				top: "a",
				center: "b",
				end: "c",
			};
			this.position = heights[this.height];
			this.height = 0;
			sSet("core.menuSettings.position", 0);
			sSet("core.menuSettings.position2", this.position);
		}
	}

	/**
	 * @param {Token} token
	 * @param {Boolean} hovered
	 */
	_handleOverlay(token, hovered) {
		if (
			!token?.actor
			|| this.breakOverlayRender(token)
			|| (!game.user.isGM && this.hideEstimate(token))
			|| (!token.isVisible && !this.alwaysShow)
		) return;

		// Create PIXI
		try {
			if (hovered) {
				const { desc, color, stroke } = this.getEstimation(token);
				if (desc !== undefined && color && stroke) {
					const { width } = token.getSize();
					const y = -2 + this.height;
					const position = { a: 0, b: 1, c: 2 }[this.position];
					const x = (width / 2) * position;
					const config = { desc, color, stroke, width, x, y };
					if (!token.healthEstimate?._texture) {
						this._createHealthEstimate(token, config);
					} else this._updateHealthEstimate(token, config);
					if (game.Levels3DPreview?._active) {
						this._update3DHealthEstimate(token, config);
					}
				}
			} else if (token.healthEstimate) {
				token.healthEstimate.visible = false;
				if (game.Levels3DPreview?._active) {
					const { tokens } = game.Levels3DPreview;
					const token3d = tokens[token.id];
					if (token3d.healthEstimate) token3d.healthEstimate.visible = false;
				}
			}
		} catch(err) {
			console.error(
				`Health Estimate | Error on function _handleOverlay(). Token Name: "${token.name}". ID: "${token.id}". Type: "${token.document.actor.type}".`,
				err
			);
		}
	}

	/**
	 * @typedef {Object} TextStyle
	 * @property {Number} fontSize
	 * @property {String} fontFamily
	 * @property {String} fill
	 * @property {String} stroke
	 * @property {Number} strokeThickness
	 * @property {Number} padding
	 * @property {Boolean} dropShadow
	 * @property {String} dropShadowColor
	 * @property {String} lineJoin
	 */

	/**
	 * @typedef {Object} EstimateConfig
	 * @property {String} desc	The text to be displayed.
	 * @property {TextStyle} style	The styling rules to be drawn by PIXI.Text.
	 * @property {Number} x	The estimate's x position, based on the token's tooltip position and the module's setting.
	 * @property {Number} y The estimate's y position, based on the token's tooltip position and the module's setting.
	 */

	/**
	 * Creates an estimate as a PIXI.Text object and adds it to the token.
	 * @param {Token} token
	 * @param {EstimateConfig} config
	 */
	_createHealthEstimate(token, config = {}) {
		const { desc, color, stroke, width, x, y } = config;
		const style = this._getUserTextStyle(color, stroke);
		token.healthEstimate = token.addChild(new PIXI.Text(desc, style));
		token.healthEstimate.scale.set(0.25);
		token.healthEstimate.anchor.set(0.5, 1);
		token.healthEstimate.position.set(width / 2, x + y);
	}

	/**
	 * Updates an estimate's properties.
	 * @param {Token} token
	 * @param {EstimateConfig} config
	 */
	_updateHealthEstimate(token, config = {}) {
		const { desc, color, stroke, width, x, y } = config;
		token.healthEstimate.style.fontSize = this.scaledFontSize;
		token.healthEstimate.text = desc;
		token.healthEstimate.style.fill = color;
		token.healthEstimate.style.stroke = stroke;
		token.healthEstimate.visible = true;
		token.healthEstimate.position.set(width / 2, x + y);
	}

	/**
	 * Caches estimates for the 3D Canvas modules.
	 * @type {{SpriteMaterial}}
	 */
	_3DCache = {};

	/**
	 * Creates an estimate as a 3D object and adds it to the token3d.
	 * @param {Token} token
	 * @param {Object} config
	 */
	async _update3DHealthEstimate(token, config = {}) {
		const { tokens, THREE } = game.Levels3DPreview;
		const token3d = tokens[token.id];

		const spriteMaterial = await this._getThreeSpriteMaterial(config);
		const sprite = new THREE.Sprite(spriteMaterial);
		sprite.center.set(0.5, 0.5);

		token3d.mesh.remove(token3d.healthEstimate);
		token3d.healthEstimate = sprite;
		token3d.healthEstimate.userData.ignoreIntersect = true;
		token3d.healthEstimate.userData.ignoreHover = true;
		const width = spriteMaterial.pixiText.width / token3d.factor;
		const height = spriteMaterial.pixiText.height / token3d.factor;
		token3d.healthEstimate.scale.set(width, height, 1);
		token3d.healthEstimate.position.set(0, token3d.d + (height / 2) + 0.042, 0);
		token3d.mesh.add(token3d.healthEstimate);
	}

	/**
	 * Creates a Sprite based on a PIXI.Text.
	 * @param {Object} config
	 * @returns {SpriteMaterial}
	 */
	async _getThreeSpriteMaterial(config) {
		const { desc, color, stroke } = config;
		if (this._3DCache[desc + color + stroke]) return this._3DCache[desc + color + stroke];
		const { THREE } = game.Levels3DPreview;
		const style = this._getUserTextStyle(color, stroke);
		const text = new PIXI.Text(desc, style);
		const container = new PIXI.Container();
		container.addChild(text);
		const base64 = await canvas.app.renderer.extract.base64(container);
		const spriteMaterial = new THREE.SpriteMaterial({
			map: await new THREE.TextureLoader().loadAsync(base64),
			transparent: true,
			alphaTest: 0.1,
		});
		spriteMaterial.pixiText = text;
		this._3DCache[desc + color + stroke] = spriteMaterial;
		return spriteMaterial;
	}

	/**
	 * Creates a PIXI.TextStyle object.
	 * @param {String} color
	 * @param {String} stroke
	 * @returns {TextStyle}
	 */
	_getUserTextStyle(color, stroke) {
		const dropShadowColor = sGet("core.menuSettings.outline") === "brighten" ? "white" : "black";
		return {
			// Multiply font size to increase resolution quality
			fontSize: this.scaledFontSize,
			fontFamily: this.fontFamily,
			fill: color,
			stroke,
			strokeThickness: 12,
			padding: 5,
			dropShadow: true,
			dropShadowColor,
			lineJoin: "round",
		};
	}

	/**
	 * Returns an array of estimates related to the token.
	 * deepClone is used here because changes will reflect locally on the estimations setting (see {@link getEstimation})
	 * @param {TokenDocument} token
	 */
	getTokenEstimate(token) {
		let special;
		const validateEstimation = (iteration, token, estimation) => {
			const rule = estimation.rule;
			try {
				const customLogic = this.estimationProvider.customLogic;
				const actor = token?.actor;
				const type = token.actor.type;
				const logic = `${customLogic}\nreturn ${rule}`;
				// eslint-disable-next-line no-new-func
				return new Function("actor", "token", "type", logic)(actor, token, type);
			} catch(err) {
				const name = estimation.name || iteration;
				console.warn(
					`Health Estimate | Estimation Table "${name}" has an invalid JS Rule and has been skipped. ${err.name}: ${err.message}`
				);
				return false;
			}
		};

		for (const [iteration, estimation] of this.estimations.entries()) {
			if (estimation.rule === "default" || estimation.rule === "") continue;
			if (validateEstimation(iteration, token, estimation)) {
				if (estimation.ignoreColor) {
					special = estimation;
				} else {
					return {
						estimation: foundry.utils.deepClone(estimation),
						special: foundry.utils.deepClone(special)
					};
				}
			}
		}
		return { estimation: foundry.utils.deepClone(this.estimations[0]), special: foundry.utils.deepClone(special) };
	}

	/**
	 * Returns the token's estimate's description, color and stroke outline.
	 * @param {TokenDocument} token
	 * @returns {{desc: String, color: String, stroke: String}}
	 */
	getEstimation(token) {
		let desc = "";
		let color = "";
		let stroke = "";
		try {
			const fraction = Number(this.getFraction(token));
			const { estimate, index } = this.getStage(token, fraction);
			const isDead = this.isDead(token, estimate.value);

			const colorIndex = this.smoothGradient
				? Math.max(0, Math.ceil((this.colors.length - 1) * fraction))
				: index;
			estimate.label = isDead ? this.deathStateName : estimate.label;
			color = isDead ? this.deadColor : this.colors[colorIndex];
			stroke = isDead ? this.deadOutline : this.outline[colorIndex];
			desc = this.hideEstimate(token) ? `${estimate.label}*` : estimate.label;
			return { desc, color, stroke };
		} catch(err) {
			console.error(
				`Health Estimate | Error on getEstimation(). Token Name: "${token.name}". Type: "${token.document.actor.type}".`,
				err
			);
			return { desc, color, stroke };
		}
	}

	/**
	 * Returns the current health fraction of the token.
	 * @param {TokenDocument} token
	 * @returns {Number}
	 */
	getFraction(token) {
		const fraction = Math.max(0, Math.min(this.estimationProvider.fraction(token), 1));
		if (!Number.isNumeric(fraction)) {
			throw Error("Token's fraction is not valid, it probably doesn't have a numerical HP or Max HP value.");
		}
		return fraction;
	}

	/**
	 * @typedef {Object} Estimate
	 * @property {string} label
	 * @property {number} value
	 */

	/**
	 * Returns the estimate and its index.
	 * @param {TokenDocument} token
	 * @param {Number} fraction
	 * @returns {{estimate: Estimate, index: number}}
	 */
	getStage(token, fraction) {
		try {
			const { estimation, special } = this.getTokenEstimate(token);
			fraction *= 100;
			// for cases where 1% > fraction > 0%
			if (fraction !== 0 && Math.floor(fraction) === 0) fraction = 0.1;
			else fraction = Math.trunc(fraction);
			const logic = (e) => e.value >= fraction;
			const estimate = special
				? special.estimates.find(logic)
				: estimation.estimates.find(logic) ?? { value: fraction, label: "" };
			const index = estimation.estimates.findIndex(logic);
			return { estimate, index };
		} catch(err) {
			console.error(
				`Health Estimate | Error on getStage(). Token Name: "${token.name}". Type: "${token.document.actor.type}".`,
				err
			);
		}
	}

	// Utils

	/**
	 * Checks if a Token's or TokenDocument's estimate should be hidden.
	 * @param {Token|TokenDocument} token
	 * @returns {Boolean}
	 */
	hideEstimate(token) {
		return Boolean(
			token.document.getFlag("healthEstimate", "hideHealthEstimate")
				|| token.actor.getFlag("healthEstimate", "hideHealthEstimate")
		);
	}

	/**
	 * Checks if any combat, linked to the current scene or unlinked, is active.
	 * @returns {Boolean}
	 */
	isCombatRunning() {
		return [...game.combats].some(
			(combat) => combat.started && (combat._source.scene === canvas.scene._id || combat._source.scene == null)
		);
	}

	/**
	 * Returns if a token is dead.
	 * A token is dead if:
	 * (a) is a NPC at 0 HP and the NPCsJustDie setting is enabled
	 * (b) has been set as dead in combat (e.g. it has the skull icon, icon may vary from system to system) and the showDead setting is enabled
	 * (c) has the healthEstimate.dead flag, which is set by a macro.
	 * @param {Token} token
	 * @param {Integer} stage
	 * @returns {Boolean}
	 */
	isDead(token, stage) {
		const isOrganicType = this.estimationProvider.organicTypes.includes(token.actor.type);
		const isNPCJustDie =
			this.NPCsJustDie
			&& !token.actor.hasPlayerOwner
			&& stage === 0
			&& !token.document.getFlag("healthEstimate", "dontMarkDead");
		const isShowDead = this.showDead && this.tokenEffectsPath(token);
		const isDefeated = this.showDead && token.combatant?.defeated;
		const isFlaggedDead = token.document.getFlag("healthEstimate", "dead") || false;

		return isOrganicType && (isNPCJustDie || isShowDead || isDefeated || isFlaggedDead);
	}

	/**
	 * Checks if the estimate should be displayed based on the current conditions.
	 * @param {Boolean} hovered
	 * @returns {Boolean}
	 */
	showCondition(hovered) {
		const combatTrigger = this.combatOnly && this.combatRunning;
		return (
			(this.alwaysShow && (combatTrigger || !this.combatOnly)) || (hovered && (combatTrigger || !this.combatOnly))
		);
	}

	/**
	 * Path of the token's effects. Useful for systems that change how it is handled (e.g. PF2e, DSA5, SWADE).
	 * @returns {Boolean}
	 */
	tokenEffectsPath(token) {
		const deadIcon = this.estimationProvider.deathMarker.config
			? this.deathMarker
			: CONFIG.statusEffects.find((x) => x.id === "dead")?.img ?? this.deathMarker;
		return Array.from(token.actor.effects.values()).some((x) => x.img === deadIcon);
	}

	/**
	 * Updates the Break Conditions and the Overlay Render's Break Condition method.
	 * @returns {Boolean}
	 */
	updateBreakConditions() {
		this.breakConditions.onlyGM = sGet("core.showDescription") === 1 ? "|| !game.user.isGM" : "";
		this.breakConditions.onlyNotGM = sGet("core.showDescription") === 2 ? "|| game.user.isGM" : "";
		this.breakConditions.onlyPCs =
			sGet("core.showDescriptionTokenType") === 1 ? "|| !token.actor?.hasPlayerOwner" : "";
		this.breakConditions.onlyNPCs =
			sGet("core.showDescriptionTokenType") === 2 ? "|| token.actor?.hasPlayerOwner" : "";

		const prep = (key) => (isEmpty(this.breakConditions[key]) ? "" : this.breakConditions[key]);

		this.breakOverlayRender = (token) => {
			try {
				// eslint-disable-next-line no-new-func
				return new Function(
					"token",
					`return (
						${prep("default")}
						${prep("onlyGM")}
						${prep("onlyNotGM")}
						${prep("onlyNPCs")}
						${prep("onlyPCs")}
						${prep("system")}
					)`
				)(token);
			} catch(err) {
				if (err.name === "TypeError") {
					console.warn(
						`Health Estimate | Error on breakOverlayRender(), skipping. Token Name: "${token.name}". Type: "${token.document.actor.type}".`,
						err
					);
					return true;
				}
				console.error(err);
			}
		};
	}

	/**
	 * Variables for settings to avoid multiple system calls for them, since the estimate can be called really often.
	 * Updates the variables if any setting was changed.
	 */
	updateSettings() {
		this.descriptions = sGet("core.stateNames").split(/[,;]\s*/);
		this.estimations = sGet("core.estimations");
		this.deathStateName = sGet("core.deathStateName");
		this.showDead = sGet("core.deathState");
		this.NPCsJustDie = sGet("core.NPCsJustDie");
		this.deathMarker = sGet("core.deathMarker");
		this.scaleToGridSize = sGet("core.menuSettings.scaleToGridSize");
		this.scaleToZoom = sGet("core.menuSettings.scaleToZoom");
		this.outputChat = sGet("core.outputChat");

		this.smoothGradient = sGet("core.menuSettings.smoothGradient");

		this.height = sGet("core.menuSettings.position");
		this.position = sGet("core.menuSettings.position2");
		this.fontFamily = sGet("core.menuSettings.fontFamily");
		this.fontSize = sGet("core.menuSettings.fontSize");

		this.colors = sGet("core.variables.colors");
		this.outline = sGet("core.variables.outline");
		this.deadColor = sGet("core.variables.deadColor");
		this.deadOutline = sGet("core.variables.deadOutline");

		this.tooltipPosition = game.modules.get("elevation-module")?.active ? null : sGet("core.tooltipPosition");
	}
}

Hooks.once("i18nInit", function () {
	setKeybinds();
	game.healthEstimate = new HealthEstimate();
});

Hooks.once("setup", () => game.healthEstimate.setup());
Hooks.once("ready", () => game.healthEstimate.ready());

// Canvas
Hooks.once("canvasReady", HealthEstimateHooks.onceCanvasReady);
Hooks.on("combatStart", HealthEstimateHooks.onCombatStart);
Hooks.on("updateCombat", HealthEstimateHooks.onUpdateCombat);
Hooks.on("deleteCombat", HealthEstimateHooks.onUpdateCombat);
Hooks.on("canvasReady", HealthEstimateHooks.onCanvasReady);
Hooks.on("3DCanvasSceneReady", () => setTimeout(HealthEstimateHooks.onCanvasReady, 10));
Hooks.on("createToken", HealthEstimateHooks.onCreateToken);

// Actor
Hooks.on("updateActor", HealthEstimateHooks.onUpdateActor);
Hooks.on("deleteActor", HealthEstimateHooks.deleteActor);
Hooks.on("deleteActiveEffect", HealthEstimateHooks.deleteActiveEffect);

// Rendering
Hooks.on("renderChatMessage", HealthEstimateHooks.onRenderChatMessage);
Hooks.on("renderSettingsConfig", HealthEstimateHooks.renderSettingsConfigHandler);
Hooks.on("renderTokenConfig", HealthEstimateHooks.renderTokenConfigHandler);

function setKeybinds() {
	game.keybindings.register("healthEstimate", "markDead", {
		name: "healthEstimate.core.keybinds.markDead.name",
		hint: "healthEstimate.core.keybinds.markDead.hint",
		onDown: () => {
			if (!canvas.tokens?.controlled) return;
			for (let e of canvas.tokens.controlled) {
				let hasAlive = !e.document.getFlag("healthEstimate", "dead");
				e.document.setFlag("healthEstimate", "dead", hasAlive);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "dontMarkDead", {
		name: "healthEstimate.core.keybinds.dontMarkDead.name",
		hint: f("core.keybinds.dontMarkDead.hint", { setting: t("core.NPCsJustDie.name") }),
		onDown: () => {
			if (!canvas.tokens?.controlled) return;
			for (let e of canvas.tokens.controlled) {
				let hasAlive = !e.document.getFlag("healthEstimate", "dontMarkDead");
				e.document.setFlag("healthEstimate", "dontMarkDead", hasAlive);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideEstimates", {
		name: "healthEstimate.core.keybinds.hideEstimates.name",
		hint: "healthEstimate.core.keybinds.hideEstimates.hint",
		onDown: () => {
			if (!canvas.tokens?.controlled) return;
			for (let e of canvas.tokens.controlled) {
				let hidden = !e.document.getFlag("healthEstimate", "hideHealthEstimate");
				e.document.setFlag("healthEstimate", "hideHealthEstimate", hidden);

				const term = hidden
					? game.i18n.localize("healthEstimate.notifications.hidden.singular")
					: game.i18n.localize("healthEstimate.notifications.shown.singular");
				const notification = game.i18n.format("healthEstimate.notifications.toggleEstimate", {
					tokenName: e.actor.name,
					term,
				});
				ui.notifications.info(notification, { console: false });
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideNames", {
		name: "healthEstimate.core.keybinds.hideNames.name",
		hint: f("core.keybinds.hideNames.hint", { setting: t("core.outputChat.name") }),
		onDown: () => {
			if (!canvas.tokens?.controlled) return;
			for (let e of canvas.tokens.controlled) {
				let hidden = !e.document.getFlag("healthEstimate", "hideName");
				e.document.setFlag("healthEstimate", "hideName", hidden);

				const term = hidden
					? game.i18n.localize("healthEstimate.notifications.hidden.singular")
					: game.i18n.localize("healthEstimate.notifications.shown.singular");
				const notification = game.i18n.format("healthEstimate.notifications.toggleName", {
					tokenName: e.actor.name,
					term,
				});
				ui.notifications.info(notification, { console: false });
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideEstimatesAndNames", {
		name: "healthEstimate.core.keybinds.hideEstimatesAndNames.name",
		hint: "healthEstimate.core.keybinds.hideEstimatesAndNames.hint",
		onDown: () => {
			if (!canvas.tokens?.controlled) return;
			for (let e of canvas.tokens.controlled) {
				let hidden =
					!e.document.getFlag("healthEstimate", "hideHealthEstimate")
					&& !e.document.getFlag("healthEstimate", "hideName");
				e.document.setFlag("healthEstimate", "hideHealthEstimate", hidden);
				e.document.setFlag("healthEstimate", "hideName", hidden);

				const term = hidden
					? game.i18n.localize("healthEstimate.notifications.hidden.plural")
					: game.i18n.localize("healthEstimate.notifications.shown.plural");
				const notification = game.i18n.format("healthEstimate.notifications.toggleEstimateName", {
					tokenName: e.actor.name,
					term,
				});
				ui.notifications.info(notification, { console: false });
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
}
//# sourceMappingURL=healthEstimate.js.map
