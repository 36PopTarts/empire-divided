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
        name: "WFRP4e Content Setup",
        label: "Setup",
        hint: "Import or update the content from the WFRP4e Core Module",
        type: WFRP4eCoreInitWrapper,
        restricted: true
    })
})

Hooks.on("renderCompendiumDirectory", async () => {
    if (game.packs.get("wfrp4e.basic")) {
        game.packs.delete("wfrp4e.basic")
        await ui.sidebar.render(true)
        ui.sidebar.element.find("[data-pack='wfrp4e.basic']").remove()
    }
})

class WFRP4eCoreInitWrapper extends FormApplication {
    render() {
        let html = `<img src="/modules/wfrp4e-core/art/ui/logo.webp" style="margin-right: auto;margin-left: auto;width: 40%;display: block;"/>
        <p class="notes">Initialize WFRP4e Content Module?<br><br>Import or update all Journals and Scenes into your world, sort them into folders, and place map pins</p>
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
        
        <a href="mailto: info@cubicle7games.com">info@cubicle7games.com</a>`

        new game.wfrp4e.apps.ModuleInitializer("wfrp4e-core", "WFRP4e Content Initialization",html).render(true);
    }
}