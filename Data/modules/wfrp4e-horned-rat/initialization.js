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



Hooks.on("setup", () => {


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
                label: game.i18n.localize("WFRP4E.Symptom.OrganFailure"),
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
                label: "Lore of Plague",
                icon: "modules/wfrp4e-horned-rat/assets/icons/plague.png",
                transfer: true,
                flags: {
                    wfrp4e: {
                        "effectApplication": "apply",
                        "effectTrigger": "prefillDialog",
                        "lore": true,
                        "script": `args.prefillModifiers.modifier -= 20`
                    }
                }
            },
            stealth: {
                label: "Lore of Stealth",
                icon: "modules/wfrp4e-horned-rat/assets/icons/stealth.png",
                transfer: true,
                flags: {
                    wfrp4e: {
                        "effectApplication": "apply",
                        "effectTrigger": "prefillDialog",
                        "lore": true,
                        "script": 
                        `
                        if (args.type == "skill" &&  args.item.name.includes("Stealth"))
                        {
                        let sl = this.actor.characteristics.ag.bonus
                        args.prefillModifiers.slBonus += sl;
                        }
                        `
                    }
                }
            },
            ruin: {
                label: "Lore of Ruin",
                icon: "modules/wfrp4e-horned-rat/assets/icons/ruin.png",
                transfer: true,
                flags: {
                    wfrp4e: {
                        "effectApplication": "apply",
                        "effectTrigger": "prefillDialog",
                        "lore": true,
                        "script": 
                        `
                        let characteristics = ["ag", "i"]
                        if ((args.type == "characteristic" && characteristics.includes(args.item)) || (args.type == "skill" && characteristics.includes(args.item.characteristic.key))) 
                        {
                            args.prefillModifiers.slBonus += 1;
                        }
                        `
                    }
                }
            }
        }
    }

    mergeObject(game.wfrp4e.config, config)
})

Hooks.on("ready", () => {
    game.wfrp4e.config.systemEffects["besmirched"] = {
        label: "Besmirched",
        icon: "icons/svg/acid.svg",
        flags: {
            wfrp4e: {
                "effectTrigger": "takeDamage",
                "effectApplication": "actor",
                "script": `
                if (args.totalWoundLoss > 0)
                {
                    args.actor.setupSkill("Endurance", {absolute : {difficulty: "average"}}).then(async test => {
                        await test.roll()
                        if (test.result.outcome == "failure")
                        {
                            let festering = await fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb")
                            args.actor.createEmbeddedDocuments("Item", [festering.toObject()])
                        }
                    })
                }

                    `
            }
        }
    }
})
