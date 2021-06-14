export class SnowstormWeatherEffect extends SpecialEffect {
	static get label() {
		return "Snowstorm";
	}

	static get icon() {
		return "modules/fxmaster/icons/weather/snow.png";
	}

	/* -------------------------------------------- */

	static get effectOptions() {
		const options = super.effectOptions;
		options.density.min = 0.5;
		options.density.value = 0.6;
		options.density.max = 0.9;
		options.density.step = 0.1;
		return options;
	}

	getParticleEmitters() {
		return [
			this._getRainEmitter(this.parent)
		];
	}

	/* -------------------------------------------- */

	_getRainEmitter(parent) {
		const d = canvas.dimensions;
		const p = (d.width / d.size) * (d.height / d.size) * this.options.density.value;
		const config = mergeObject(this.constructor.RAIN_CONFIG, {
			spawnRect: {
			  x: d.paddingX,
			  y: d.paddingY,
			  w: d.sceneWidth,
			  h: d.sceneHeight
			},
			maxParticles: p,
			frequency: 1 / p
		}, { inplace: false });
		const art = [
		  "./modules/fxmaster/effects/assets/snow_01.png",
		  "./modules/fxmaster/effects/assets/snow_02.png"
		];
		var emitter = new PIXI.particles.Emitter(parent, art, config);
		emitter.particleConstructor = PIXI.particles.PathParticle;
		return emitter;
	}
}

// Configure the Snow particle
SnowstormWeatherEffect.RAIN_CONFIG = mergeObject(SpecialEffect.DEFAULT_CONFIG, {
	alpha: {
		start: 1.0,
		end: 1.0
	},
	scale: {
		start: 0.2,
		end: 0.08,
		minimumScaleMultiplier: 0.8
	},
	speed: {
		start: 400,
		end: 350,
		minimumSpeedMultiplier: 0.2
	},
	startRotation: {
		min: 86,
		max: 94
	},
	rotation: 0,
	rotationSpeed: {
		min: -60.0,
		max: 60.0
	},
	lifetime: {
		min: 2.5,
		max: 6
	},
    extraData: {
      path: "sin(x/150)*25"
    }
}, { inplace: false });