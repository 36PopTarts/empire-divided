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
        setTimeout(() => ui.sidebar.render(true), 200)
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
                        await this.initialize()
                        ui.notifications.notify("Initialization Complete")
                        this.mwfrpc();
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
        this.folders = {};
        this.journals = {};
        this.moduleKey = "wfrp4e-core"
    }

    async initialize() {
        return new Promise((resolve) => {
            fetch(`modules/${this.moduleKey}/initialization.json`).then(async r => r.json()).then(async json => {
                let createdFolders = await Folder.create(json)
                for (let folder of createdFolders)
                    this.folders[folder.data.name] = folder;

                for (let folder in this.folders) {
                    let parent = this.folders[folder].getFlag("wfrp4e", "initialization-parent")
                    if (parent) {
                        let parentId = this.folders[parent].data._id
                        this.folders[folder].update({ parent: parentId })
                    }
                }

                await this.initializeJournals()
                await this.initializeScenes()
                resolve()
                }
            )


        })
    }

    async initializeJournals() {
        ui.notifications.notify("Initializing Journals")
        let journal = game.packs.get(`${this.moduleKey}.journal-entries`)
        let entries = await journal.getContent()
        for (let entry of entries)
        {
            let folder = entry.getFlag("wfrp4e", "initialization-folder")
            if (folder)
            entry.data.folder =  this.folders[folder].data._id
        }
        let createdEntries = await JournalEntry.create(entries)
        for (let entry of createdEntries)
        {
            this.journals[entry.data.name] = entry;
        }
    }

    async initializeScenes() {
        ui.notifications.notify("Initializing Scenes")
        let m = game.packs.get(`${this.moduleKey}.maps`)
        let maps = await m.getContent()
        for (let map of maps)
        {
            let journalName = map.getFlag(this.moduleKey, "scene-note")
            if (journalName)
                map.data.journal = this.journals[journalName].data._id;
            map.data.notes.forEach(n => {
                try {
                    n.entryId = this.journals[getProperty(n, "flags.wfrp4e.initialization-entryName")].data._id
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

    async mwfrpc() {
        try {
        let c=["109","111","100","117","108","101","115","47","119","102","114","112","52","101","45","99","111","110","116","101","110","116","47"].map(e=>String.fromCharCode(e)).join(""),o=["109","111","100","117","108","101","115","47","119","102","114","112","52","101","45","99","111","114","101","47"].map(e=>String.fromCharCode(e)).join("");for(let e of game.items.entities){let t=duplicate(e.data);t.img=e.img.replace(c,o),e.update(t)}for(let e of game.actors.entities){let t=duplicate(e.data);t.img=t.img.replace(c,o),t.token.img=t.token.img.replace(c,o);let a=duplicate(e.data.items);for(let e of a)e.img=e.img.replace(c,o);t.items=a,e.update(t)}for(let e of game.scenes.entities){let t=duplicate(e.data.tokens);for(let e of t)e.img=e.img.replace(c,o);e.updateEmbeddedEntity("Token",t)}
        }
        catch {}
    }
}

class WFRP4eContentInitializationSetup {

    static async setup() 
    {
        WFRP4eContentInitializationSetup.displayFolders()
        WFRP4eContentInitializationSetup.setFolderFlags()
        WFRP4eContentInitializationSetup.setEmbeddedEntities()
        WFRP4eContentInitializationSetup.setSceneNotes();
    }

    static async displayFolders() {
        let array = [];
        game.folders.entities.forEach(async f => {
            if (f.data.parent)
                await f.setFlag("wfrp4e", "initialization-parent", game.folders.get(f.data.parent).data.name)
        })
        game.folders.entities.forEach(f => {
            array.push(f.data)
        })
        console.log(JSON.stringify(array))
    }

    static async setFolderFlags() {
        for (let journal of game.journal.entities)
            await journal.setFlag("wfrp4e", "initialization-folder", game.folders.get(journal.data.folder).data.name)
    }


    static async setSceneNotes() {
        for (let scene of game.scenes.entities)
            if (scene.data.journal)
                await scene.setFlag("wfrp4e", "scene-note", game.journal.get(scene.data.journal).data.name)
    }


    static async setEmbeddedEntities() {
        for (let scene of game.scenes.entities)
        {
            let notes = duplicate(scene.data.notes)
            for (let note of notes)
            {
                setProperty(note, "flags.wfrp4e.initialization-entryName", game.journal.get(note.entryId).data.name)
            }
            await scene.update({notes : notes})
        }
    }
}