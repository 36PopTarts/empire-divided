
Hooks.on("init", () => {

    CONFIG.Actor.compendiumBanner = "./modules/wfrp4e-core/assets/banners/undead-fight.webp";
    CONFIG.Item.compendiumBanner = "./modules/wfrp4e-core/assets/banners/city.webp";
    CONFIG.JournalEntry.compendiumBanner = "./modules/wfrp4e-core/assets/banners/town-hill.webp";
    CONFIG.RollTable.compendiumBanner = "./modules/wfrp4e-core/assets/banners/tricksy-halflings.webp";
    CONFIG.Scene.compendiumBanner = "./modules/wfrp4e-core/assets/banners/town.webp";
    CONFIG.Macro.compendiumBanner = "./modules/wfrp4e-core/assets/banners/agitator.webp";
    CONFIG.Playlist.compendiumBanner = "./modules/wfrp4e-core/assets/banners/hut.webp";
    CONFIG.Adventure.compendiumBanner = "./modules/wfrp4e-core/assets/banners/beastmen-fight.webp";
    CONFIG.Cards.compendiumBanner = "./modules/wfrp4e-core/assets/banners/forest.webp";

    const WFRP4E = {}

    // Species
    WFRP4E.species = {
        "human": "Human",
        "dwarf": "Dwarf",
        "halfling": "Halfling",
        "helf": "High Elf",
        "welf": "Wood Elf",
    };

    WFRP4E.subspecies = {
        human: {
            reiklander: {
                name: "Reiklander",
                skills: [
                    "Animal Care",
                    "Charm",
                    "Cool",
                    "Evaluate",
                    "Gossip",
                    "Haggle",
                    "Language (Bretonnian)",
                    "Language (Wastelander)",
                    "Leadership",
                    "Lore (Reikland)",
                    "Melee (Basic)",
                    "Ranged (Bow)"
                ],
                talents: [
                    "Doomed",
                    "Savvy, Suave",
                    3
                ]
            }
        }
    }

    WFRP4E.speciesCharacteristics = {
        "human": {
            "ws": "2d10+20",
            "bs": "2d10+20",
            "s": "2d10+20",
            "t": "2d10+20",
            "i": "2d10+20",
            "ag": "2d10+20",
            "dex": "2d10+20",
            "int": "2d10+20",
            "wp": "2d10+20",
            "fel": "2d10+20"
        },
        "dwarf": {
            "ws": "2d10+30",
            "bs": "2d10+20",
            "s": "2d10+20",
            "t": "2d10+30",
            "i": "2d10+20",
            "ag": "2d10+10",
            "dex": "2d10+30",
            "int": "2d10+20",
            "wp": "2d10+40",
            "fel": "2d10+10"
        },
        "halfling": {
            "ws": "2d10+10",
            "bs": "2d10+30",
            "s": "2d10+10",
            "t": "2d10+20",
            "i": "2d10+20",
            "ag": "2d10+20",
            "dex": "2d10+30",
            "int": "2d10+20",
            "wp": "2d10+30",
            "fel": "2d10+30"
        },
        "helf": {
            "ws": "2d10+30",
            "bs": "2d10+30",
            "s": "2d10+20",
            "t": "2d10+20",
            "i": "2d10+40",
            "ag": "2d10+30",
            "dex": "2d10+30",
            "int": "2d10+30",
            "wp": "2d10+30",
            "fel": "2d10+20"
        },
        "welf": {
            "ws": "2d10+30",
            "bs": "2d10+30",
            "s": "2d10+20",
            "t": "2d10+20",
            "i": "2d10+40",
            "ag": "2d10+30",
            "dex": "2d10+30",
            "int": "2d10+30",
            "wp": "2d10+30",
            "fel": "2d10+20"
        },

    }

    WFRP4E.speciesSkills = {
        "human": [
            "Animal Care",
            "Charm",
            "Cool",
            "Evaluate",
            "Gossip",
            "Haggle",
            "Language (Bretonnian)",
            "Language (Wastelander)",
            "Leadership",
            "Lore (Reikland)",
            "Melee (Basic)",
            "Ranged (Bow)"
        ],
        "dwarf": [
            "Consume Alcohol",
            "Cool",
            "Endurance",
            "Entertain (Storytelling)",
            "Evaluate",
            "Intimidate",
            "Language (Khazalid)",
            "Lore (Dwarfs)",
            "Lore (Geology)",
            "Lore (Metallurgy)",
            "Melee (Basic)",
            "Trade (any one)"
        ],
        "halfling": [
            "Charm",
            "Consume Alcohol",
            "Dodge",
            "Gamble",
            "Haggle",
            "Intuition",
            "Language (Mootish)",
            "Lore (Reikland)",
            "Perception",
            "Sleight of Hand",
            "Stealth (Any)",
            "Trade (Cook)"
        ],
        "helf": [
            "Cool",
            "Entertain (Sing)",
            "Evaluate",
            "Language (Eltharin)",
            "Leadership",
            "Melee (Basic)",
            "Navigation",
            "Perception",
            "Play (any one)",
            "Ranged (Bow)",
            "Sail",
            "Swim"
        ],
        "welf": [
            "Athletics",
            "Climb",
            "Endurance",
            "Entertain (Sing)",
            "Intimidate",
            "Language (Eltharin)",
            "Melee (Basic)",
            "Outdoor Survival",
            "Perception",
            "Ranged (Bow)",
            "Stealth (Rural)",
            "Track"
        ],
    }

    WFRP4E.speciesTalents = {
        "human": [
            "Doomed",
            "Savvy, Suave",
            3
        ],
        "dwarf": [
            "Magic Resistance",
            "Night Vision",
            "Read/Write, Relentless",
            "Resolute, Strong-minded",
            "Sturdy",
            0
        ],
        "halfling": [
            "Acute Sense (Taste)",
            "Night Vision",
            "Resistance (Chaos)",
            "Small",
            2
        ],
        "helf": [
            "Acute Sense (Sight)",
            "Coolheaded, Savvy",
            "Night Vision",
            "Second Sight, Sixth Sense",
            "Read/Write",
            0
        ],
        "welf": [
            "Acute Sense (Sight)",
            "Hardy, Second Sight",
            "Night Vision",
            "Read/Write, Very Resilient",
            "Rover",
            0
        ]
    }

    WFRP4E.speciesMovement = {
        "human": 4,
        "dwarf": 3,
        "halfling": 3,
        "helf": 5,
        "welf": 5
    }

    WFRP4E.speciesFate = {
        "human": 2,
        "dwarf": 0,
        "halfling": 0,
        "helf": 0,
        "welf": 0
    }

    WFRP4E.speciesRes = {
        "human": 1,
        "dwarf": 2,
        "halfling": 2,
        "helf": 0,
        "welf": 0
    }

    WFRP4E.speciesExtra = {
        "human": 3,
        "dwarf": 2,
        "halfling": 3,
        "helf": 2,
        "welf": 2
    }

    WFRP4E.speciesAge = {
        "human": "15+1d10",
        "dwarf": "15+10d10",
        "halfling": "15+5d10",
        "helf": "30+10d10",
        "welf": "30+10d10"
    }

    WFRP4E.speciesHeight = {
        "human": {
            feet: 4,
            inches: 9,
            die: "2d10"
        },
        "dwarf": {
            feet: 4,
            inches: 3,
            die: "1d10"
        },
        "halfling": {
            feet: 3,
            inches: 1,
            die: "1d10"
        },
        "helf": {
            feet: 5,
            inches: 11,
            die: "1d10"
        },
        "welf": {
            feet: 5,
            inches: 11,
            die: "1d10"
        }
    }

    WFRP4E.classTrappings = {
        "Academics": "ClassTrappings.Academics",
        "Academic": "ClassTrappings.Academics",
        "Burghers": "ClassTrappings.Burghers",
        "Burgher": "ClassTrappings.Burghers",
        "Courtiers": "ClassTrappings.Courtiers",
        "Courtier": "ClassTrappings.Courtiers",
        "Peasants": "ClassTrappings.Peasants",
        "Peasant": "ClassTrappings.Peasants",
        "Rangers": "ClassTrappings.Rangers",
        "Ranger": "ClassTrappings.Rangers",
        "Riverfolk": "ClassTrappings.Riverfolk",
        "Rogues": "ClassTrappings.Rogues",
        "Rogue": "ClassTrappings.Rogues",
        "Warriors": "ClassTrappings.Warriors",
        "Warrior": "ClassTrappings.Warriors",
    }



    // Weapon Group Descriptions
    WFRP4E.weaponGroupDescriptions = {
        "basic": "Basic",
        "cavalry": "WFRP4E.GroupDescription.Cavalry",
        "fencing": "Fencing",
        "brawling": "Brawling",
        "flail": "WFRP4E.GroupDescription.Flail",
        "parry": "WFRP4E.GroupDescription.Parry",
        "polearm": "Polearm",
        "twohanded": "Two-Handed",
        "blackpowder": "WFRP4E.GroupDescription.Blackpowder",
        "bow": "Bow",
        "crossbow": "WFRP4E.GroupDescription.Crossbow",
        "entangling": "Entangling",
        "engineering": "WFRP4E.GroupDescription.Engineering",
        "explosives": "WFRP4E.GroupDescription.Explosives",
        "sling": "Sling",
        "throwing": "WFRP4E.GroupDescription.Throwing",
    };

    // Weapon reach descriptions
    WFRP4E.reachDescription = {
        "personal": "WFRP4E.Reach.PersonalDescription",
        "vshort": "WFRP4E.Reach.VShortDescription",
        "short": "WFRP4E.Reach.ShortDescription",
        "average": "WFRP4E.Reach.AverageDescription",
        "long": "WFRP4E.Reach.LongDescription",
        "vLong": "WFRP4E.Reach.VLongDescription",
        "massive": "WFRP4E.Reach.MassiveDescription",
    }

    // Weapon Quality Descriptions (Used in dropdown info)
    WFRP4E.qualityDescriptions = {
        "accurate": "WFRP4E.Properties.Accurate",
        "blackpowder": "WFRP4E.Properties.Blackpowder",
        "blast": "WFRP4E.Properties.Blast",
        "damaging": "WFRP4E.Properties.Damage",
        "defensive": "WFRP4E.Properties.Defensive",
        "distract": "WFRP4E.Properties.Distract",
        "entangle": "WFRP4E.Properties.Entangle",
        "fast": "WFRP4E.Properties.Fast",
        "hack": "WFRP4E.Properties.Hack",
        "impact": "WFRP4E.Properties.Impact",
        "impale": "WFRP4E.Properties.Impale",
        "penetrating": "WFRP4E.Properties.Penetrating",
        "pistol": "WFRP4E.Properties.Pistol",
        "precise": "WFRP4E.Properties.Precise",
        "pummel": "WFRP4E.Properties.Pummel",
        "repeater": "WFRP4E.Properties.Repeater",
        "shield": "WFRP4E.Properties.Shield",
        "trapblade": "WFRP4E.Properties.Trapblade",
        "unbreakable": "WFRP4E.Properties.Unbreakable",
        "wrap": "WFRP4E.Properties.Wrap",
        "flexible": "WFRP4E.Properties.Flexible",
        "impenetrable": "WFRP4E.Properties.Impenetrable",
        "durable": "WFRP4E.Properties.Durable",
        "fine": "WFRP4E.Properties.Fine",
        "lightweight": "WFRP4E.Properties.Lightweight",
        "practical": "WFRP4E.Properties.Practical",
    };

    // Weapon Flaw Descriptions (used in dropdown info)
    WFRP4E.flawDescriptions = {
        "dangerous": "WFRP4E.Properties.Dangerous",
        "imprecise": "WFRP4E.Properties.Imprecise",
        "reload": "WFRP4E.Properties.Reload",
        "slow": "WFRP4E.Properties.Slow",
        "tiring": "WFRP4E.Properties.Tiring",
        "undamaging": "WFRP4E.Properties.Undamaging",
        "partial": "WFRP4E.Properties.Partial",
        "weakpoints": "WFRP4E.Properties.Weakpoints",
        "ugly": "WFRP4E.Properties.Ugly",
        "shoddy": "WFRP4E.Properties.Shoddy",
        "unreliable": "WFRP4E.Properties.Unreliable",
        "bulky": "WFRP4E.Properties.Bulky"
    };

    WFRP4E.loreEffectDescriptions = {
        "petty": "None",
        "beasts": "WFRP4E.LoreDescription.Beasts",
        "death": "WFRP4E.LoreDescription.Death",
        "fire": "WFRP4E.LoreDescription.Fire",
        "heavens": "WFRP4E.LoreDescription.Heavens",
        "metal": "WFRP4E.LoreDescription.Metal",
        "life": "WFRP4E.LoreDescription.Life",
        "light": "WFRP4E.LoreDescription.Light",
        "shadow": "WFRP4E.LoreDescription.Shadow",
        "hedgecraft": "WFRP4E.LoreDescription.Hedgecraft",
        "witchcraft": "WFRP4E.LoreDescription.Witchcraft",
        "daemonology": "",
        "necromancy": "",
        "nurgle": "",
        "slaanesh": "",
        "tzeentch": "",
    };

    WFRP4E.conditionDescriptions = {
        "ablaze": "WFRP4E.Conditions.Ablaze",
        "bleeding": "WFRP4E.Conditions.Bleeding",
        "blinded": "WFRP4E.Conditions.Blinded",
        "broken": "WFRP4E.Conditions.Broken",
        "deafened": "WFRP4E.Conditions.Deafened",
        "entangled": "WFRP4E.Conditions.Entangled",
        "fatigued": "WFRP4E.Conditions.Fatigued",
        "poisoned": "WFRP4E.Conditions.Poisoned",
        "prone": "WFRP4E.Conditions.Prone",
        "stunned": "WFRP4E.Conditions.Stunned",
        "surprised": "WFRP4E.Conditions.Surprised",
        "unconscious": "WFRP4E.Conditions.Unconscious",
        "grappling": "WFRP4E.Conditions.Grappling",
        "fear": "WFRP4E.Conditions.Fear",
        "engaged": "WFRP4E.Conditions.Engaged",
    }

    WFRP4E.symptoms = {
        "blight": "WFRP4E.Symptom.Blight",
        "buboes": "WFRP4E.Symptom.Buboes",
        "convulsions": "WFRP4E.Symptom.Convulsions",
        "coughsAndSneezes": "WFRP4E.Symptom.CoughsandSneezes",
        "fever": "WFRP4E.Symptom.Fever",
        "flux": "WFRP4E.Symptom.Flux",
        "gangrene": "WFRP4E.Symptom.Gangrene",
        "lingering": "WFRP4E.Symptom.Lingering",
        "malaise": "WFRP4E.Symptom.Malaise",
        "nausea": "WFRP4E.Symptom.Nausea",
        "pox": "WFRP4E.Symptom.Pox",
        "wounded": "WFRP4E.Symptom.Wounded",
    }

    WFRP4E.symptomDescriptions = {
        "blight": "WFRP4E.SymptomDescriptions.Blight",
        "buboes": "WFRP4E.SymptomDescriptions.Buboes",
        "convulsions": "WFRP4E.SymptomDescriptions.Convulsions",
        "coughsAndSneezes": "WFRP4E.SymptomDescriptions.CoughsandSneezes",
        "fever": "WFRP4E.SymptomDescriptions.Fever",
        "flux": "WFRP4E.SymptomDescriptions.Flux",
        "gangrene": "WFRP4E.SymptomDescriptions.Gangrene",
        "lingering": "WFRP4E.SymptomDescriptions.Lingering",
        "malaise": "WFRP4E.SymptomDescriptions.Malaise",
        "nausea": "WFRP4E.SymptomDescriptions.Nausea",
        "pox": "WFRP4E.SymptomDescriptions.Pox",
        "wounded": "WFRP4E.SymptomDescriptions.Wounded",
    }

    WFRP4E.symptomTreatment = {
        "blight": "WFRP4E.SymptomTreatment.Blight",
        "buboes": "WFRP4E.SymptomTreatment.Buboes",
        "convulsions": "WFRP4E.SymptomTreatment.Convulsions",
        "coughsAndSneezes": "WFRP4E.SymptomTreatment.CoughsandSneezes",
        "fever": "WFRP4E.SymptomTreatment.Fever",
        "flux": "WFRP4E.SymptomTreatment.Flux",
        "gangrene": "WFRP4E.SymptomTreatment.Gangrene",
        "lingering": "WFRP4E.SymptomTreatment.Lingering",
        "malaise": "WFRP4E.SymptomTreatment.Malaise",
        "nausea": "WFRP4E.SymptomTreatment.Nausea",
        "pox": "WFRP4E.SymptomTreatment.Pox",
        "wounded": "WFRP4E.SymptomTreatment.Wounded",
    }

    WFRP4E.loreEffects = {
        "beasts": {
            name: "Lore of Beasts",
            icon: "modules/wfrp4e-core/icons/spells/beasts.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "document",
                        documentType : "Item"
                    },
                    scriptData: [
                        {
                            "label": "Add Fear",
                            "trigger": "rollCastTest",
                            "script": "if (args.test.result.castOutcome == \"success\")\n{\n    args.test.result.other.push(`<strong>${this.effect.name}</strong>: @Fear[1,${this.actor.prototypeToken.name}]`)\n\tif (!this.actor.has(game.i18n.localize(\"NAME.Fear\")))\n\t{\n\t\tlet item = await fromUuid(\"Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn\");\n\t\tlet data = item.toObject();\n\t\tdata.system.specification.value = 1\n\t\tthis.actor.createEmbeddedDocuments(\"Item\", [data])\n\t\tthis.script.scriptNotification(\"Fear Trait added\");\n\t}\n}"
                        }
                    ]
                }
            }
        },
        "death": {
            name: "Lore of Death",
            icon: "modules/wfrp4e-core/icons/spells/death.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "target"
                    },
                    scriptData: [
                        {
                            trigger: "immediate",
                            label : "@effect.name",
                            script : `this.actor.addCondition("fatigued")`,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                }
            }
        },
        "fire": {
            name: "Lore of Fire",
            icon: "modules/wfrp4e-core/icons/spells/fire.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "target"
                    },
                    scriptData: [
                        {
                            trigger: "immediate",
                            label : "@effect.name",
                            script : `this.actor.addCondition("ablaze")`,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                }
            }
        },
        "heavens": {
            name: "Lore of Heavens",
            icon: "modules/wfrp4e-core/icons/spells/heavens.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "document",
                        documentType : "Item"
                    },
                    scriptData: [
                        {
                            trigger: "computeApplyDamageModifiers",
                            label : "@effect.name",
                            script : `
                            if (args.applyAP && args.modifiers.ap.metal) 
                            {
                                args.modifiers.ap.ignored += args.modifiers.ap.metal
                                args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Metal (" + args.modifiers.ap.metal + ")");
                                args.modifiers.ap.metal = 0
                            }
                            `
                        }
                    ]
                },
            }
        },
        "metal": {
            name: "Lore of Metal",
            icon: "modules/wfrp4e-core/icons/spells/metal.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "document",
                        documentType : "Item"
                    },
                    scriptData: [
                        {
                            trigger: "computeApplyDamageModifiers",
                            label : "@effect.name",
                            script : `
                            if (args.applyAP && args.modifiers.ap.metal) 
                            {
                                args.modifiers.ap.ignored += args.modifiers.ap.metal
                                args.modifiers.other.push({value : args.modifiers.ap.metal, label : this.effect.name, details : "Add Metal AP to Damage" })
                                args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Metal (" + args.modifiers.ap.metal + ")");
                                args.modifiers.ap.metal = 0
                            }
                            `
                        }
                    ]
                }
            }
        },
        "life": {
            name: "Lore of Life",
            icon: "modules/wfrp4e-core/icons/spells/life.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "target"
                    },
                    scriptData: [
                        {
                            trigger: "immediate",
                            label : "@effect.name",
                            script : `
                            let caster = this.effect.sourceActor
                            if (!this.actor.has(game.i18n.localize("NAME.Daemonic")) && !this.actor.has(game.i18n.localize("NAME.Undead")))
                            {
                                await this.actor.hasCondition("bleeding")?.delete();
                                await this.actor.hasCondition("fatigued")?.delete();
                            }
                            else if (this.actor.has(game.i18n.localize("NAME.Undead")))
                            {
                                this.script.scriptMessage(await this.actor.applyBasicDamage(caster.system.characteristics.wp.bonus, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}));
                            }`,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                }
            }
        },
        "light": {
            name: "Lore of Light",
            icon: "modules/wfrp4e-core/icons/spells/light.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "target"
                    },
                    scriptData: [
                        {
                            trigger: "immediate",
                            label : "@effect.name",
                            script : `
                            let caster = this.effect.sourceActor
                            await this.actor.addCondition("blinded")
                            if (this.actor.has(game.i18n.localize("NAME.Undead")) || this.actor.has(game.i18n.localize("NAME.Daemonic")))
                            {
                                this.script.scriptMessage(await this.actor.applyBasicDamage(caster.system.characteristics.int.bonus, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}));
                            }`,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                }
            }
        },
        "shadow": {
            name: "Lore of Shadow",
            icon: "modules/wfrp4e-core/icons/spells/shadow.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "document",
                        documentType : "Item"
                    },
                    scriptData: [
                        {
                            trigger: "computeApplyDamageModifiers",
                            label : "@effect.name",
                            script : `
                            let nonmagical = args.modifiers.ap.value - args.modifiers.ap.magical
                            if (args.applyAP && nonmagical) 
                            {
                                args.modifiers.ap.ignored += nonmagical
                                args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Non-Magical AP (" + nonmagical + ")");
                            }
                            `
                        }
                    ]
                }
            }
        },
        "hedgecraft": {
            name: "Lore of Hedgecraft",
            icon: "modules/wfrp4e-core/icons/spells/hedgecraft.png",
            flags: {
                wfrp4e : {
                    lore: true,
                    applicationData : {
                        type : "other"
                    }
                },
            }
        },
        "witchcraft": {
            name: "Lore of Witchcraft",
            icon: "modules/wfrp4e-core/icons/spells/witchcraft.png",
            flags: {
                wfrp4e: {
                    lore: true,
                    applicationData : {
                        type : "target"
                    },
                    scriptData: [
                        {
                            trigger: "immediate",
                            label : "@effect.name",
                            script : `this.actor.addCondition("bleeding")`,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                }
            }
        }
    }

    WFRP4E.symptomEffects = {
        "blight": {
            name: "WFRP4E.Symptom.Blight",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "manual",
                            label : "@effect.name",
                            script : `
                            let difficulty = ""
                            if (this.effect.name.includes("Moderate"))
                                difficulty = "easy"
                            else if (this.effect.name.includes("Severe"))
                                difficulty = "average"
                            else
                                difficulty = "veasy"
        
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : this.actor.name + " dies from Blight"}, fields: {difficulty}, appendTitle : " - Blight"})
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("dead");
                            }
                            `,
                        }
                    ]
                }
            }
        },
        "buboes": {
            name: "WFRP4E.Symptom.Buboes",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "dialog",
                            label : "@effect.name",
                            script : `args.fields.modifier -= 10`,
                            options: {
                                dialog : {
                                    hideScript : `return !["ws", "bs", "s", "fel", "ag", "t", "dex"].includes(args.characteristic)`,
                                    activateScript : `return ["ws", "bs", "s", "fel", "ag", "t", "dex"].includes(args.characteristic)`,
                                }
                            }
                        }
                    ]
                }
            }
        },
        "convulsions": {
            name: "WFRP4E.Symptom.Convulsions",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "dialog",
                            label : "@effect.name",
                            script : `
                            let modifier = 0
                            if (this.effect.name.includes("Moderate"))
                                modifier = -20
                            else
                                modifier = -10
                            args.fields.modifier += modifier
                            `,
                            options: {
                                dialog : {
                                    hideScript : `return !["ws", "bs", "s", "ag", "t", "dex"].includes(args.characteristic)`,
                                    activateScript : `return ["ws", "bs", "s", "ag", "t", "dex"].includes(args.characteristic)`,
                                }
                            }
                        }
                    ]
                }
            }
        },
        "coughsandsneezes": {
            name: "WFRP4E.Symptom.CoughsandSneezes",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    "symptom": true
                }
            }
        },
        "fever": {
            name: "WFRP4E.Symptom.Fever",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "dialog",
                            label : "@effect.name",
                            script : `args.fields.modifier -= 10`,
                            options: {
                                dialog : {
                                    hideScript : `return !["ws", "bs", "s", "fel", "ag", "t", "dex"].includes(args.characteristic)`,
                                    activateScript : `return ["ws", "bs", "s", "fel", "ag", "t", "dex"].includes(args.characteristic)`,
                                }
                            }
                        }
                    ]
                }
            }
        },
        "flux": {
            name: "WFRP4E.Symptom.Flux",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    "symptom": true
                }
            }
        },
        "gangrene": {
            name: "WFRP4E.Symptom.Gangrene",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "dialog",
                            label : "@effect.name",
                            script : `args.fields.modifier -= 10`,
                            options: {
                                dialog : {
                                    hideScript : `return !["fel"].includes(args.characteristic)`,
                                    activateScript : `return ["fel"].includes(args.characteristic)`,
                                }
                            }
                        },
                        {
                            trigger: "manual",
                            label : "Wounded",
                            script : `
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty : "average"}, appendTitle : " - Wounded"})
                            await test.roll();
                            if (test.failed)
                            {
                                fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb").then(disease => {
                                    this.actor.createEmbeddedDocuments("Item", [disease.toObject()])
                                    this.script.scriptNotification("Gained " + disease.name)
                                })
                            }
                            `,
                        },
                        {
                            trigger: "manual",
                            label : "Blight",
                            script : `
                            let difficulty = ""
                            if (this.effect.name.includes("Moderate"))
                                difficulty = "easy"
                            else if (this.effect.name.includes("Severe"))
                                difficulty = "average"
                            else
                                difficulty = "veasy"
        
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : this.actor.name + " dies from Blight"}, fields: {difficulty}, appendTitle : " - Blight"})
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("dead");
                            }
                            `,
                        }
                    ]
                }
            }
        },
        "lingering": {
            name: "WFRP4E.Symptom.Lingering",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    "symptom": true
                }
            }
        },
        "malaise": {
            name: "WFRP4E.Symptom.Malaise",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "update",
                            label : "@effect.name",
                            script : `
                            let fatigued = this.actor.hasCondition("fatigued")
                            if (!fatigued)
                            {
                                this.actor.addCondition("fatigued")
                                ui.notifications.notify("Fatigued added to " + this.actor.name + " which cannot be removed until the Malaise symptom is gone.")
                            }`,
                        }
                    ]
                }
            }
        },
        "nausea": {
            name: "WFRP4E.Symptom.Nausea",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "rollTest",
                            label : "@effect.name",
                            script : `                 
                            if (args.test.failed)
                            {
                                let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"];
                                if (applicableCharacteristics.includes(args.test.characteristicKey))
                                {
                                    this.actor.addCondition("stunned");
                                }
                            }`,
                        }
                    ]
                }
            }
        },
        "pox": {
            name: "WFRP4E.Symptom.Pox",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "dialog",
                            label : "@effect.name",
                            script : `args.fields.modifier -= 10`,
                            options: {
                                dialog : {
                                    hideScript : `return !["fel"].includes(args.characteristic)`,
                                    activateScript : `return ["fel"].includes(args.characteristic)`,
                                }
                            }
                        }
                    ]
                }
            }
        },
        "wounded": {
            name: "WFRP4E.Symptom.Wounded",
            icon: "modules/wfrp4e-core/icons/diseases/disease.png",
            flags: {
                wfrp4e: {
                    symptom : true,
                    applicationData : {
                        type : "document"
                    },
                    scriptData: [
                        {
                            trigger: "manual",
                            label : "@effect.name",
                            script : `
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty : "average"}, appendTitle : " - Wounded"})
                            await test.roll();
                            if (test.failed)
                            {
                                fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb").then(disease => {
                                    this.actor.createEmbeddedDocuments("Item", [disease.toObject()])
                                    this.script.scriptNotification("Gained " + disease.name)
                                })
                            }
                            `,
                        }
                    ]
                }
            }
        }
    }

    mergeObject(game.wfrp4e.config, WFRP4E)

})

Hooks.on("ready", () => {


    for(let symptom in game.wfrp4e.config.symptomEffects)
    {
        game.wfrp4e.config.symptomEffects[symptom].name = game.i18n.localize(game.wfrp4e.config.symptomEffects[symptom].name);
    }

    if (!game.settings.get("wfrp4e-core", "initialized") && game.user.isGM)
        new WFRP4eCoreInitWrapper().render(true)
})

Hooks.once('diceSoNiceReady', (dice3d) => {
    dice3d.addSystem({ id: "wfrp-coin", name: "WFRP Coin" }, false);
    dice3d.addDicePreset({
        type: "dc",
        labels: [
            'modules/wfrp4e-core/art/other/coin-tails.png',
            'modules/wfrp4e-core/art/other/coin-heads.png',
        ],
        bumpMaps: [
            'modules/wfrp4e-core/art/other/coin-tails_bump.png',
            'modules/wfrp4e-core/art/other/coin-heads_bump.png',
        ],
        system: "wfrp-coin",
        colorset: "wfrp-coin"
    });
    dice3d.addColorset({
        name: 'wfrp-coin',
        description: "WFRP Coin",
        category: "WFRP",
        foreground: '#000000',
        background: "#988f86",
        texture: 'none',
        edge: '#988f86',
        material: 'metal'
    }, "no");
})
