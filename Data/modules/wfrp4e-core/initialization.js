Hooks.on("init", () => {
    // Register Advantage cap
    game.settings.register("wfrp4e-core", "initialized", {
    name: "Initialization",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
    });

    game.settings.registerMenu("wfrp4e-core", "init-dialog", {
        name: "WFRP4e Content Initialization",
        label : "Initialize",
        hint : "This will import the content from the WFRP4e Core Module",
        type : WFRP4eCoreInitWrapper,
        restricted: true
    })
})

Hooks.on("renderCompendiumDirectory", () => {
    if (game.packs.get("wfrp4e.basic"))
    {
        game.packs.delete("wfrp4e.basic")
        ui.sidebar.render(true)
    }
})


class WFRP4eCoreInitWrapper extends FormApplication {
    render() {
        new WFRP4eContentInitialization().render(true);
    }
}

class WFRP4eContentInitialization extends Dialog {
    constructor()
    {
        super({
            title: "WFRP4e Content Initialization",
            content: 
            `<p class="notes">Initialize WFRP4e Content Module?<br><br>This will import all Journals and Scenes into your world, sort them into folders, and place map pins</p>
            <ul>
            <li>131 Journal Entries (Lore and Rules)</li>
            <li>19 Folders organizing the above entries</li>
            <li>3 Scenes - Including Reikland Map with Pins</li>
            </ul>
            <p class="notes">
            Warhammer Fantasy Roleplay 4th Edition Core Module.<br><br>

            No part of this publication may be reproduced, distributed, stored in a retrieval system, or transmitted in any form by any means, electronic, mechanical, photocopying, recording or otherwise without the prior permission of the publishers.<br><br>
            
            Warhammer Fantasy Roleplay 4th Edition © Copyright Games Workshop Limited 2020. Warhammer Fantasy Roleplay 4th Edition, the Warhammer Fantasy Roleplay 4th Edition logo, GW, Games Workshop, Warhammer, The Game of Fantasy Battles, the twin-tailed comet logo, and all associated logos, illustrations, images, names, creatures, races, vehicles, locations, weapons, characters, and the distinctive likeness thereof, are either ® or TM, and/or © Games Workshop Limited, variably registered around the world, and used under licence. Cubicle 7 Entertainment and the Cubicle 7 Entertainment logo are trademarks of Cubicle 7 Entertainment Limited. All rights reserved.<br><br>
            
            <img src="modules/wfrp4e-core/c7.png" height=50 width=50/>   <img src="modules/wfrp4e-core/warhammer.png" height=50 width=50/>
            <br>
            Published by: <b>Cubicle 7 Entertainment Ltd</b><br>
            Foundry Edition by <b>Russell Thurman (Moo Man)</b><br>
            Special thanks to: <b>Games Workshop, Fatshark</b><br><br>
            
            <a href="mailto: info@cubicle7games.com">info@cubicle7games.com</a>`,
            buttons: {
	            initialize: {
	                label : "Initialize",
	                callback : async () => {
	                    game.settings.set("wfrp4e-core", "initialized", true)
	                    await new WFRP4eContentInitialization().initialize()
	                    ui.notifications.notify("Initialization Complete")
						}
	                },
	                no: {
	                    label : "No",
	                    callback : () => {
    	                    game.settings.set("wfrp4e-core", "initialized", true)
                            ui.notifications.notify("Skipped Initialization.")
                        }
                		}	
                	}
    	})

        this.folders = {
            "Scene" : {},
            "Item" : {},
            "Actor" : {},
            "JournalEntry" : {}
        }
        this.SceneFolders = {};
        this.ActorFolders = {};
        this.ItemFolders = {};
        this.JournalEntryFolders = {};
        this.journals = {};
        this.actors = {};
        this.scenes = {};
        this.moduleKey = "wfrp4e-core"
    }

    async initialize() {
        return new Promise((resolve) => {
            fetch(`modules/${this.moduleKey}/initialization.json`).then(async r => r.json()).then(async json => {
                let createdFolders = await Folder.create(json)
                for (let folder of createdFolders)
                    this.folders[folder.data.type][folder.data.name] = folder;

                for (let folderType in this.folders) {
                    for (let folder in this.folders[folderType]) {

                        let parent = this.folders[folderType][folder].getFlag(this.moduleKey, "initialization-parent")
                        if (parent) {
                            let parentId = this.folders[folderType][parent].data._id
                            await this.folders[folderType][folder].update({ parent: parentId })
                        }
                    }
                }

                await this.initializeEntities()
                await this.initializeScenes()
                resolve()
            })
        })
    }

    async initializeEntities() {

        let packList= [`${this.moduleKey}.journal-entries`]

        for( let pack of packList)
        {
            let content = await game.packs.get(pack).getContent();
            for (let entity of content)
            {
                let folder = entity.getFlag(this.moduleKey, "initialization-folder")
                if (folder)
                    entity.data.folder = this.folders[entity.entity][folder].data._id;
                entity.data.sort = entity.data.flags[this.moduleKey].sort
            }
            switch(content[0].entity)
            {
                case "Actor": 
                    ui.notifications.notify("Initializing Actors")
                    let createdActors = await Actor.create(content.map(c => c.data))
                    for (let actor of createdActors)
                        this.actors[actor.data.name] = actor
                    break;
                case "Item":
                    ui.notifications.notify("Initializing Items")
                    await Item.create(content.map(c => c.data))
                    break;
                case "JournalEntry" :
                    ui.notifications.notify("Initializing Journals")
                    let createdEntries = await JournalEntry.create(content.map(c => c.data))
                    for (let entry of createdEntries)
                        this.journals[entry.data.name] = entry
                    break;
            }
        }
    }

    async initializeScenes() {
        ui.notifications.notify("Initializing Scenes")
        let m = game.packs.get(`${this.moduleKey}.maps`)
        let maps = await m.getContent()
        for (let map of maps)
        {
            let folder = map.getFlag(this.moduleKey, "initialization-folder")
            if (folder)
                map.data.folder = this.folders["Scene"][folder].data._id;
                
            let journalName = map.getFlag(this.moduleKey, "scene-note")
            if (journalName)
                map.data.journal = this.journals[journalName].data._id;
            map.data.notes.forEach(n => {
                try {
                    n.entryId = this.journals[getProperty(n, `flags.${this.moduleKey}.initialization-entryName`)].data._id
                }
                catch (e) {
                    console.log("wfrp4e | INITIALIZATION ERROR: " + e)
                }
            })
            map.data.tokens.forEach(t => {
                try {
                    t.actorId = this.actors[getProperty(t, `flags.${this.moduleKey}.initialization-actorName`)].data._id
                }
                catch (e) {
                    console.log("wfrp4e | INITIALIZATION ERROR: " + e)
                }
            })
        }
        await Scene.create(maps.map(m => m.data)).then(sceneArray => {
            sceneArray.forEach(async s => {
                let thumb = await s.createThumbnail();
                s.update({"thumb" : thumb.thumb})
            })
        })
    }
}


class WFRP4eContentInitializationSetup {

    static async setup() 
    {
        WFRP4eContentInitializationSetup.displayFolders()
        WFRP4eContentInitializationSetup.setFolderFlags()
        WFRP4eContentInitializationSetup.setSceneNotes();
        WFRP4eContentInitializationSetup.setEmbeddedEntities()
    }

    static async displayFolders() {
        let array = [];
        game.folders.entities.forEach(async f => {
            if (f.data.parent)
                await f.setFlag("wfrp4e-core", "initialization-parent", game.folders.get(f.data.parent).data.name)
        })
        game.folders.entities.forEach(f => {
            array.push(f.data)
        })
        console.log(JSON.stringify(array))
    }

    static async setFolderFlags() {
        for (let actor of game.actors.entities)
            await actor.update({"flags.wfrp4e-core" : { "initialization-folder" : game.folders.get(actor.data.folder).data.name, sort : actor.data.sort}})
        for (let item of game.items.entities)
            await item.update({"flags.wfrp4e-core" : { "initialization-folder" : game.folders.get(item.data.folder).data.name, sort : item.data.sort}})
        for (let journal of game.journal.entities)
            await journal.update({"flags.wfrp4e-core" : { "initialization-folder" : game.folders.get(journal.data.folder).data.name, sort : journal.data.sort}})
    }

    static async setSceneNotes() {
        for (let scene of game.scenes.entities)
            if (scene.data.journal)
                await scene.setFlag("wfrp4e-core", "scene-note", game.journal.get(scene.data.journal).data.name)
    }


    static async setEmbeddedEntities() {
        for (let scene of game.scenes.entities)
        {
            let notes = duplicate(scene.data.notes)
            for (let note of notes)
            {
                setProperty(note, "flags.wfrp4e-core.initialization-entryName", game.journal.get(note.entryId).data.name)
            }
            let tokens = duplicate(scene.data.tokens)
            for (let token of tokens)
            {
                setProperty(token, "flags.wfrp4e-core.initialization-actorName", game.actors.get(token.actorId).data.name)
            }
            await scene.update({notes : notes, tokens: tokens})
        }
    }
}