Hooks.on("init", () => {
    game.settings.register("wfrp4e-horned-rat", "initialized", {
        name: "Initialization",
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.registerMenu("wfrp4e-horned-rat", "init-dialog", {
        name: "WFRP4e The Horned Rat Setup",
        label: "Setup",
        hint: "Import or update the content from the WFRP4e The Horned Rat Module",
        type: WFRP4eHornedRatInitWrapper,
        restricted: true
    })
})

Hooks.on("ready", () => {
    if (!game.settings.get("wfrp4e-horned-rat", "initialized") && game.user.isGM) {
        new WFRP4eHornedRatInitWrapper().render(true)
    }
})

class WFRP4eHornedRatInitWrapper extends FormApplication {
    render() {
        let html = `<p class="notes">Initialize WFRP4e The Horned Rat Module?<br><br>Import or update all Actors, Items, Journals, and Scenes into your world, sort them into folders, and place map pins</p>
        <ul>
        <li>126 Actors</li>
        <li>149 Journal Entries</li>
        <li>125 Items</li>
        <li>14 Scenes</li>
        <li>91 Folders organizing the above</li>
        </ul> <p class="notes">
        Warhammer Fantasy Roleplay 4th Edition The Horned Rat Module.<br><br>

        No part of this publication may be reproduced, distributed, stored in a retrieval system, or transmitted in any form by any means, electronic, mechanical, photocopying, recording or otherwise without the prior permission of the publishers.<br><br>
        
        Warhammer Fantasy Roleplay 4th Edition © Copyright Games Workshop Limited 2020. Warhammer Fantasy Roleplay 4th Edition, the Warhammer Fantasy Roleplay 4th Edition logo, GW, Games Workshop, Warhammer, The Game of Fantasy Battles, the twin-tailed comet logo, and all associated logos, illustrations, images, names, creatures, races, vehicles, locations, weapons, characters, and the distinctive likeness thereof, are either ® or TM, and/or © Games Workshop Limited, variably registered around the world, and used under licence. Cubicle 7 Entertainment and the Cubicle 7 Entertainment logo are trademarks of Cubicle 7 Entertainment Limited. All rights reserved.<br><br>
        
        <img src="modules/wfrp4e-horned-rat/c7.png" height=50 width=50/>   <img src="modules/wfrp4e-horned-rat/warhammer.png" height=50 width=50/>
        <br>
        Published by: <b>Cubicle 7 Entertainment Ltd</b><br>
        Foundry Edition by <b>Russell Thurman (Moo Man)</b><br>
        Special thanks to: <b>Games Workshop, Fatshark</b><br><br>
        
        <a href="mailto: info@cubicle7games.com">info@cubicle7games.com</a>
        `
        new game.wfrp4e.apps.ModuleInitializer("wfrp4e-horned-rat", "WFRP4e The Horned Rat Initialization",html).render(true);
    }
}



Hooks.on("init", () => {


    let config = {
        weaponQualities: {
            zzap : game.i18n.localize("PROPERTY.Zzap"),
            warpstone : game.i18n.localize("PROPERTY.Warpstone")
        },


        qualityDescriptions: {
            "zzap": game.i18n.localize("WFRP4E.Properties.Zzap"),
            "warpstone": game.i18n.localize("WFRP4E.Properties.Warpstone")
        },

        // Condition Types
        magicLores: {
            "ruin": game.i18n.localize("WFRP4E.MagicLores.Ruin"),
            "plague": game.i18n.localize("WFRP4E.MagicLores.Plague"),
            "stealth": game.i18n.localize("WFRP4E.MagicLores.Stealth")
        },

        // Given a Lore, what is the Wind
        magicWind: {
            "ruin": game.i18n.localize("WFRP4E.MagicLores.Ruin"),
            "plague": game.i18n.localize("WFRP4E.MagicLores.Plague"),
            "stealth": game.i18n.localize("WFRP4E.MagicLores.Stealth")
        },

        loreEffectDescriptions: {
            "ruin": game.i18n.localize("WFRP4E.LoreDescription.Ruin"),
            "plague": game.i18n.localize("WFRP4E.LoreDescription.Plague"),
            "stealth": game.i18n.localize("WFRP4E.LoreDescription.Stealth")
        },

        symptoms : {
            organFailure :game.i18n.localize("WFRP4E.Symptom.OrganFailure"),
        },

        
        symptomDescriptions : {
            organFailure: game.i18n.localize("WFRP4E.SymptomDescriptions.OrganFailure"),
        },

        symptomTreatment : {
            organFailure : game.i18n.localize("WFRP4E.SymptomTreatment.OrganFailure"),
        },

        symptomEffects : {
            "organFailure": {
                name: game.i18n.localize("WFRP4E.Symptom.OrganFailure"),
                icon: "modules/wfrp4e-core/icons/diseases/disease.png",
                transfer: true,
                flags: {
                    wfrp4e: {
                        "symptom": true,
                        "effectApplication": "actor",
                        "effectTrigger": "dialogChoice",
                        "effectData" : {
                            description: "Using the affected Organ",
                            slBonus : -3
                        }
                    }
                }
            }
        },

        loreEffects: {
            plague: {
                name: "Lore of Plague",
                icon: "modules/wfrp4e-horned-rat/assets/icons/plague.png",
                transfer: true,
                flags : {
                    wfrp4e: {
                        applicationData : {
                            documentType : "Item"
                        },
                        scriptData : [
                            {
                                trigger : "rollCastTest",
                                label : "Apply Lore Effect",
                                script : `
                                if (args.test.result.castOutcome == "success" && !this.actor.statuses.has("plague"))
                                {
                                    let roll = await new Roll("1d10").roll();
                                    roll.toMessage(this.script.getChatData());
                                    this.script.scriptNotification("Lore effect added for " + roll.total + " rounds.");
                                    this.actor.applyEffect({
                                        effectData : [
                                            {
                                                name : "Lore of Plague",
                                                duration : {
                                                    rounds : roll.total
                                                },
                                                icon: this.item.img,
                                                statuses : ["plague"],
                                                flags : {
                                                    wfrp4e : {
                                                        scriptData : [
                                                            {
                                                                trigger : "addItems",
                                                                label : "Add Distracting",
                                                                script : 'let item = await fromUuid("Compendium.wfrp4e-core.items.Item.MVI0lXcg6vvtooAF"); this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})',
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        ]
                                    })
                                }
                                `
                            }
                        ]
                    }
                }
            },
            stealth: {
                name: "Lore of Stealth",
                icon: "modules/wfrp4e-horned-rat/assets/icons/stealth.png",
                flags : {
                    wfrp4e: {
                        applicationData : {
                            documentType : "Item"
                        },
                        scriptData : [
                            {
                                trigger : "rollCastTest",
                                label : "Apply Lore Effect",
                                script : `
                                if (args.test.result.castOutcome == "success" && !this.actor.statuses.has("stealth"))
                                {
                                    let roll = await new Roll("1d10").roll();
                                    roll.toMessage(this.script.getChatData());
                                    this.script.scriptNotification("Lore effect added for " + roll.total + " rounds.");
                                    this.actor.applyEffect({
                                        effectData : [
                                            {
                                                name : "Lore of Stealth",
                                                duration : {
                                                    rounds : roll.total
                                                },
                                                icon: this.item.img,
                                                statuses : ["stealth"],
                                                flags : {
                                                    wfrp4e : {
                                                        scriptData : [
                                                            {
                                                                trigger : "addItems",
                                                                label : "Add Stealthy",
                                                                script : 'let item = await fromUuid("Compendium.wfrp4e-core.items.Item.OzwDT6kzoLYeeR2d"); this.actor.createEmbeddedDocuments("Item", [item], {fromEffect : this.effect.id})',
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        ]
                                    })
                                }
                                `
                            }
                        ]
                    }
                }
            },
            ruin: {
                name: "Lore of Ruin",
                icon: "modules/wfrp4e-horned-rat/assets/icons/ruin.png",
                flags: {
                    wfrp4e: {
                        applicationData : {
                            documentType : "Item"
                        },
                        scriptData : [
                            {
                                trigger : "rollCastTest",
                                label : "Apply Lore Effect",
                                script : `
                                if (args.test.result.castOutcome == "success" && !this.actor.statuses.has("ruin"))
                                {
                                    let roll = await new Roll("1d10").roll();
                                    roll.toMessage(this.script.getChatData());
                                    this.script.scriptNotification("Lore effect added for " + roll.total + " rounds.");
                                    this.actor.applyEffect({
                                        effectData : [
                                            {
                                                name : "Lore of Ruin",
                                                duration : {
                                                    rounds : roll.total
                                                },
                                                icon: this.item.img,
                                                statuses : ["ruin"],
                                                flags : {
                                                    wfrp4e : {
                                                        scriptData : [
                                                            {
                                                                trigger : "dialog",
                                                                label : "Initiative or Agility based Tests",
                                                                script : "args.fields.slBonus++;",
                                                                options : {
                                                                    dialog : {
                                                                        hideScript : 'return !["ag", "i"].includes(args.characteristic)',
                                                                        activateScript : 'return ["ag", "i"].includes(args.characteristic)'
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        ]
                                    })
                                }
                                `
                            }
                        ]
                    }
                }
            }
        }
    }

    mergeObject(game.wfrp4e.config, config)
})

Hooks.on("ready", () => {
    game.wfrp4e.config.systemEffects["besmirched"] = {
        name: "Besmirched",
        icon: "icons/svg/acid.svg",
        flags: {
            wfrp4e: {
                scriptData : [
                    {
                        trigger : "takeDamage",
                        label : "Take Damage",
                        script : `
                        if (args.totalWoundLoss > 0)
                            {
                                let test = await this.actor.setupSkill("Endurance", {fields : {difficulty: "average"}, appendTitle : " - " + this.effect.name})
                                await test.roll()
                                if (test.failed)
                                {
                                    let festering = await fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb")
                                    this.actor.createEmbeddedDocuments("Item", [festering.toObject()])
                                }
                            })
                        }`
                    },
                    {
                        trigger : "dialog",
                        label : "Fellowship Tests",
                        script : `args.fields.slBonus -= 2`,
                        options : {
                            dialog : {
                                hideScript : `return args.characteristic != "fel"`,
                                activateScript : `return args.characteristic == "fel"`
                            }
                        }
                    },
                    {
                        trigger : "prePrepareData",
                        label : "Brass 1",
                        script : `this.actor.system.details.status.modifier = -999`,
                    }
                ]
            }
        }
    }
})
