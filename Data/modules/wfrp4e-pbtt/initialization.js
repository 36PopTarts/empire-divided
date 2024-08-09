Hooks.on("init", () => {
    game.settings.register("wfrp4e-pbtt", "initialized", {
        name: "Initialization",
        scope: "world",
        config: false,
        default: false,
        type: Boolean
    });

    game.settings.registerMenu("wfrp4e-pbtt", "init-dialog", {
        name: "WFRP4e Power Behind the Throne Setup",
        label: "Setup",
        hint: "Import or update the content from the WFRP4e Power Behind the Throne Module",
        type: WFRP4ePBTTInitWrapper,
        restricted: true
    })
})

Hooks.on("ready", () => {
    if (!game.settings.get("wfrp4e-pbtt", "initialized") && game.user.isGM) {
        new WFRP4ePBTTInitWrapper().render(true)
    }
})

Hooks.on("init", () => {
  game.wfrp4e.trade.addGazzetteerFile("modules/wfrp4e-pbtt/trade/gazetteer.json", "river")
})

class WFRP4ePBTTInitWrapper extends FormApplication {
    render() {
        let html = `<p class="notes">Initialize WFRP4e Power Behind the Throne Module?<br><br>Import or update all Actors, Items, Journals, and Scenes into your world, sort them into folders, and place map pins</p>
        <ul>
        <li>94 Actors</li>
        <li>144 Journal Entries</li>
        <li>53 Items</li>
        <li>12 Scenes</li>
        <li>41 Folders organizing the above</li>
        </ul> <p class="notes">
        Warhammer Fantasy Roleplay 4th Edition Power Behind the Throne Module.<br><br>

        No part of this publication may be reproduced, distributed, stored in a retrieval system, or transmitted in any form by any means, electronic, mechanical, photocopying, recording or otherwise without the prior permission of the publishers.<br><br>
        
        Warhammer Fantasy Roleplay 4th Edition © Copyright Games Workshop Limited 2020. Warhammer Fantasy Roleplay 4th Edition, the Warhammer Fantasy Roleplay 4th Edition logo, GW, Games Workshop, Warhammer, The Game of Fantasy Battles, the twin-tailed comet logo, and all associated logos, illustrations, images, names, creatures, races, vehicles, locations, weapons, characters, and the distinctive likeness thereof, are either ® or TM, and/or © Games Workshop Limited, variably registered around the world, and used under licence. Cubicle 7 Entertainment and the Cubicle 7 Entertainment logo are trademarks of Cubicle 7 Entertainment Limited. All rights reserved.<br><br>
        
        <img src="modules/wfrp4e-pbtt/c7.png" height=50 width=50/>   <img src="modules/wfrp4e-pbtt/warhammer.png" height=50 width=50/>
        <br>
        Published by: <b>Cubicle 7 Entertainment Ltd</b><br>
        Foundry Edition by <b>Russell Thurman (Moo Man)</b><br>
        Special thanks to: <b>Games Workshop, Fatshark</b><br><br>
        
        <a href="mailto: info@cubicle7games.com">info@cubicle7games.com</a>
        `
        new game.wfrp4e.apps.ModuleInitializer("wfrp4e-pbtt", "WFRP4e Power Behind the Throne Initialization",html).render(true);
    }
}

