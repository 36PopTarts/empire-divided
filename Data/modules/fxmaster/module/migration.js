
export const migrate = function() {
    const version = game.settings.get("fxmaster", "migration");
    if (version == 0) {
        const effects = game.settings.get("fxmaster", "specialEffects")[0];
        for (let i = 0; i < effects.length; ++i) {
            if (typeof effects[i].scale != Object) {
                effects[i].scale = {
                    x: effects[i].scale,
                    y: effects[i].scale
                }
            }
        }
        game.settings.set("fxmaster", "specialEffects", effects);
        game.settings.set("fxmaster", "migration", 1);
    }
}