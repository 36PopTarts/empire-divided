import { registerSettings, renderTokenConfigHandler } from "./module/settings.js";
import { prepareSystemSpecifics } from "./module/systemSpecifics.js";
import { HealthEstimate, getCharacters, outputChat, outputStageChange, updateSettings } from "./module/logic.js";

/**
 * Preload templates and add it template to the HUD
 */
Hooks.once("init", async function () {
	Hooks.on("renderHeadsUpDisplay", (app, html, data) => {
		html.append('<template id="healthEstimate"></template>');
	});
	game.keybindings.register("healthEstimate", "markDead", {
		name: "healthEstimate.core.keybinds.markDead.name",
		hint: "healthEstimate.core.keybinds.markDead.hint",
		onDown: () => {
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
		hint: "healthEstimate.core.keybinds.dontMarkDead.hint",
		onDown: () => {
			for (let e of canvas.tokens.controlled) {
				let hasAlive = !e.document.getFlag("healthEstimate", "treatAsPC");
				e.document.setFlag("healthEstimate", "treatAsPC", hasAlive);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideEstimates", {
		name: "healthEstimate.core.keybinds.hideEstimates.name",
		hint: "healthEstimate.core.keybinds.hideEstimates.hint",
		onDown: () => {
			for (let e of canvas.tokens.controlled) {
				let hidden = !e.document.getFlag("healthEstimate", "hideHealthEstimate");
				e.document.setFlag("healthEstimate", "hideHealthEstimate", hidden);
				if (hidden) ui.notifications.info(`${e.actor.data.name}'s health estimate is hidden from players.`);
				else ui.notifications.info(`${e.actor.data.name}'s health estimate is shown to players.`);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideNames", {
		name: "healthEstimate.core.keybinds.hideNames.name",
		hint: "healthEstimate.core.keybinds.hideNames.hint",
		onDown: () => {
			for (let e of canvas.tokens.controlled) {
				let hidden = !e.document.getFlag("healthEstimate", "hideName");
				e.document.setFlag("healthEstimate", "hideName", hidden);
				if (hidden) ui.notifications.info(`${e.actor.data.name}'s name is hidden from players.`);
				else ui.notifications.info(`${e.actor.data.name}'s name is shown to players.`);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "hideEstimatesAndNames", {
		name: "healthEstimate.core.keybinds.hideEstimatesAndNames.name",
		hint: "healthEstimate.core.keybinds.hideEstimatesAndNames.hint",
		onDown: () => {
			for (let e of canvas.tokens.controlled) {
				let hidden = !e.document.getFlag("healthEstimate", "hideHealthEstimate") && !e.document.getFlag("healthEstimate", "hideName");
				e.document.setFlag("healthEstimate", "hideHealthEstimate", hidden);
				e.document.setFlag("healthEstimate", "hideName", hidden);
				if (hidden) ui.notifications.info(`${e.actor.data.name}'s health estimate and name are hidden from players.`);
				else ui.notifications.info(`${e.actor.data.name}'s health estimate and name are shown to players.`);
			}
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	game.keybindings.register("healthEstimate", "customEstimates", {
		name: "healthEstimate.core.keybinds.customEstimates.name",
		hint: "healthEstimate.core.keybinds.customEstimates.hint",
		onDown: (rgs) => {
			if (!canvas.tokens.controlled.length) {
				ui.notifications.warn(`You haven't selected any tokens.`);
				return;
			}

			function setFlags(flag, changeActors = false) {
				for (let e of canvas.tokens.controlled) {
					if (changeActors) e.actor.setFlag("healthEstimate", "customStages", flag);
					e.document.setFlag("healthEstimate", "customStages", flag);
				}
			}
			function unsetFlags(changeActors = false) {
				for (let e of canvas.tokens.controlled) {
					if (changeActors) e.actor.unsetFlag("healthEstimate", "customStages");
					e.document.unsetFlag("healthEstimate", "customStages");
				}
			}

			const defaultSettings = game.settings.get("healthEstimate", "core.stateNames");
			const tokenSettings = canvas.tokens.controlled[0].document.getFlag("healthEstimate", "customStages");

			new Dialog({
				title: game.i18n.localize("healthEstimate.core.keybinds.customEstimates.name"),
				content: `
				Stages: <input id="defaultStages" type="text" disabled value="${defaultSettings}" />
				<p>Custom Stages: <input id="customStages" type="text" value="${tokenSettings || defaultSettings}" />
				`,
				buttons: {
					affectActors: {
						label: game.i18n.localize("healthEstimate.core.keybinds.customEstimates.options.1"),
						callback: (html) => {
							const value = html.find("input#customStages").val();
							if (value) setFlags(value, true);
							else unsetFlags(true);
						},
					},
					affectTokens: {
						label: game.i18n.localize("healthEstimate.core.keybinds.customEstimates.options.2"),
						callback: (html) => {
							const value = html.find("input#customStages").val();
							if (value) setFlags(value);
							else unsetFlags();
						},
					},
				},
				default: "affectActors",
			}).render(true);
		},
		restricted: true,
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});
	return loadTemplates([
		// Add paths to "modules/healthEstimate/templates"
		"modules/healthEstimate/templates/healthEstimate.hbs",
	]);
});

/**
 * Have to register Settings here, because doing so at init breaks i18n
 */
Hooks.once("setup", function () {
	prepareSystemSpecifics().then(registerSettings());
});

Hooks.once("ready", function () {
	// new HealthEstimate();
});

/**
 * HP storing code for canvas load or token created
 */
Hooks.on("canvasReady", function () {
	new HealthEstimate();
	let tokens = canvas.tokens.placeables.filter((e) => e.actor);
	updateSettings();
	getCharacters(tokens);
});

Hooks.on("createToken", function (tokenDocument, options, userId) {
	const customStages = tokenDocument.actor.getFlag("healthEstimate", "customStages");
	if (customStages?.length) tokenDocument.setFlag("healthEstimate", "customStages", customStages);
	let tokens = canvas.tokens.placeables.filter((e) => e.actor);
	getCharacters(tokens);
});

/**
 * spam in chat if token (NPC) is updated
 * only the USER that promoted the change will spam the message
 * start collectting all PNC hp information
 */
Hooks.on("updateToken", (scene, token, updateData, options, userId) => {
	if (game.user.isGM && outputChat) {
		let actors = canvas.tokens.placeables.filter((e) => e.actor);
		outputStageChange(actors);
	}
});

/**
 * spam in chat if the actor is updated
 * only the USER that promoted the change will spam the message
 * start collectting all PNC hp information
 */
Hooks.on("updateActor", (data, options, apps, userId) => {
	if (game.user.isGM && outputChat) {
		let actors = canvas.tokens.placeables.filter((e) => e.actor && e.actor.data.type === "character");
		outputStageChange(actors);
	}
});

/**
 * Chat Styling
 */
Hooks.on("renderChatMessage", (app, html, data) => {
	if (html.find(".hm_messageheal").length) {
		html.css("background", "#06a406");
		html.css("text-shadow", "-1px -1px 0 #000 , 1px -1px 0 #000 , -1px 1px 0 #000 , 1px 1px 0 #000");
		html.css("color", "white");
		html.css("text-align", "center");
		html.css("font-size", "12px");
		html.css("margin", "2px");
		html.css("padding", "2px");
		html.css("border", "2px solid #191813d6");
		// html.find(".message-sender").text("");
		// html.find(".message-metadata")[0].style.display = "none";
	}
	if (html.find(".hm_messagetaken").length) {
		html.css("background", "#c50d19");
		html.css("text-shadow", "-1px -1px 0 #000 , 1px -1px 0 #000 , -1px 1px 0 #000 , 1px 1px 0 #000");
		html.css("color", "white");
		html.css("text-align", "center");
		html.css("font-size", "12px");
		html.css("margin", "2px");
		html.css("padding", "2px");
		html.css("border", "2px solid #191813d6");
		// html.find(".message-sender").text("");
		// html.find(".message-metadata")[0].style.display = "none";
	}
});

Hooks.on("renderTokenConfig", renderTokenConfigHandler);
