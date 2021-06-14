
import WFRP_Utility from "../system/utility-wfrp4e.js";


/** Class for the WFRP4e Item Browser that collects all items in the world and compendia and
 *  offers functionality to filter through them to search easily. By default, you can filter
 *  through the name and description, as well as item type. If an item type is selected, more
 *  filters are shown that only apply to those types (mostly). If you select Weapon - you can
 *  then select which weapon group, reach, etc. 
*/
export default class BrowserWfrp4e extends Application {
  constructor(app) {
    super(app)

    // Initializes filters to false
    this.filters = {
      type: {
        "ammunition": { display: "Ammunition", value: false },
        "armour": { display: "Armour", value: false },
        "career": { display: "Career", value: false },
        "container": { display: "Container", value: false },
        "critical": { display: "Critical", value: false },
        "disease": { display: "Disease", value: false },
        "injury": { display: "Injury", value: false },
        "money": { display: "Money", value: false },
        "mutation": { display: "Mutation", value: false },
        "prayer": { display: "Prayer", value: false },
        "psychology": { display: "Psychology", value: false },
        "talent": { display: "Talent", value: false },
        "trapping": { display: "Trapping", value: false },
        "skill": { display: "Skill", value: false },
        "spell": { display: "Spell", value: false },
        "trait": { display: "Trait", value: false },
        "weapon": { display: "Weapon", value: false }
      },
      attribute: {
        name: "",
        description: "",
        worldItems: true,
      },
      // Various type specific filters that are shown based on type selected. 
      dynamic: {
        careergroup: { value: "", exactMatch: true, type: ["career"], show: false },
        class: { value: "", type: ["career"], show: false },
        level: { value: "", type: ["career"], show: false },
        statusTier: { value: "", type: ["career"], show: false },
        statusStanding: { value: "", relation: "", type: ["career"], show: false },
        characteristics: { value: [], type: ["career"], show: false },
        ammunitionType: { value: "", exactMatch: true, type: ["ammunition"], show: false },
        skills: { value: [], type: ["career"], show: false },
        talents: { value: [], type: ["career"], show: false },
        encumbrance: { value: "", relation: "", type: ["ammunition", "armour", "weapon", "container", "trapping"], show: false },
        availability: { value: "", type: ["ammunition", "armour", "weapon", "container", "trapping"], show: false },
        modifiesDamage: { value: false, type: ["ammunition"], show: false },
        modifiesRange: { value: false, type: ["ammunition"], show: false },
        qualitiesFlaws: { value: [], type: ["ammunition", "armour", "weapon"], show: false },
        armorType: { value: "", type: ["armour"], show: false },
        protects: { value: { head: true, body: true, arms: true, legs: true }, type: ["armour"], show: false },
        carries: { value: "", relation: "", type: ["container"], show: false },
        location: { value: "", type: ["critical", "injury"], show: false },
        wounds: { value: "", relation: "", type: ["critical"], show: false },
        symptoms: { value: [], type: ["disease"], show: false },
        mutationType: { value: "", type: ["mutation"], show: false },
        god: { value: "", type: ["prayer"], show: false },
        prayerType: { value: "", type: ["prayer"], show: false },
        range: { value: "", type: ["prayer", "spell"], show: false },
        duration: { value: "", type: ["prayer", "spell"], show: false },
        target: { value: "", type: ["prayer", "spell"], show: false },
        cn: { value: "", relation: "", type: ["spell"], show: false },
        magicMissile: { value: false, type: ["spell"], show: false },
        aoe: { value: false, type: ["spell"], show: false },
        lore: { value: "", type: ["spell"], show: false },
        extendable: { value: "", type: ["spell"], show: false },
        max: { value: "", type: ["talent"], show: false },
        tests: { value: "", type: ["talent"], show: false },
        trappingType: { value: "", type: ["trapping"], show: false },
        characteristic: { value: "", type: ["skill"], show: false },
        grouped: { value: "", type: ["skill"], show: false },
        advanced: { value: "", type: ["skill"], show: false },
        rollable: { value: false, type: ["trait"], show: false },
        weaponGroup: { value: "", type: ["weapon"], show: false },
        reach: { value: "", type: ["weapon"], show: false },
        weaponRange: { value: "", relation: "", type: ["weapon"], show: false },
        melee: { value: false, type: ["weapon"], show: false },
        ranged: { value: false, type: ["weapon"], show: false },
        twohanded: { value: false, type: ["weapon"], show: false },
        ammunitionGroup: { value: "", type: ["weapon"], show: false },
      }
    }

    // Different values used to filter. As items are read, different aspects are accumulated, such as lores, which are then selectable to filter by.
    this.careerGroups = [];
    this.careerClasses = [];
    this.gods = [];
    this.careerTiers = [1, 2, 3, 4]
    this.statusTiers = ["Gold", "Silver", "Brass"]
    this.lores = [];

  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "wfrp4e-browser";
    options.template = "systems/wfrp4e/templates/browser/browser.html"
    options.classes.push("wfrp4e", "wfrp-browser");
    options.resizable = true;
    options.height = 900;
    options.width = 600;
    options.minimizable = true;
    options.title = "WFRP Browser"
    return options;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Add "Post to chat" button
    if (game.user.isGM) {
      buttons.push(
        {
          class: "import",
          icon: "fas fa-import",
          onclick: async ev => this.importResults()
        })
    }
    return buttons
  }

  // Save scroll positions and apply current filter when rendering
  async _render(force = false, options = {}) {
    await this.loadItems();
    this._saveScrollPos(); // Save scroll positions
    await super._render(force, options);
    this._setScrollPos(); // Save scroll positions
    this.applyFilter(this._element)
  }


  // Pass filter data to template
  getData() {
    let data = super.getData();
    data.filters = this.filters;
    data.relations = ["<", "<=", "==", ">=", ">"]
    data.availability =  game.wfrp4e.config.availability;
    data.ammunitionGroups =  game.wfrp4e.config.ammunitionGroups;
    data.locations = ["Head", "Body", "Arm", "Leg"];
    data.mutationTypes =  game.wfrp4e.config.mutationTypes;
    data.armorTypes =  game.wfrp4e.config.armorTypes;
    data.gods = this.gods;
    data.weaponGroups =  game.wfrp4e.config.weaponGroups
    data.weaponReaches =  game.wfrp4e.config.weaponReaches;
    data.talentMax =  game.wfrp4e.config.talentMax;
    data.trappingTypes =  game.wfrp4e.config.trappingTypes;
    data.lores = this.lores;
    data.characteristics =  game.wfrp4e.config.characteristicsAbbrev;
    data.skillTypes =  game.wfrp4e.config.skillTypes
    data.skillGroup =  game.wfrp4e.config.skillGroup
    data.prayerTypes =  game.wfrp4e.config.prayerTypes;
    data.careerGroups = this.careerGroups;
    data.careerClasses = this.careerClasses
    data.careerTiers = this.careerTiers;
    data.statusTiers = this.statusTiers;
    data.items = this.items;

    return data;
  }


  /**
   * Goes through each compendium and if it is an Item compendium,
   * loads the items with addItems(). Then it will add all the world
   * items.
   */
  async loadItems() {
    this.items = [];
    this.filterId = 0;
    for (let p of game.packs) {
      if (p.metadata.entity == "Item" && (game.user.isGM || !p.private)) {
        await p.getContent().then(content => {
          this.addItems(content)
        })
      }
    }
    this.addItems(game.items.entities.filter(i => i.permission > 1));
    this.items = this.items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
    this.lores.push("None");
    this.careerGroups.sort((a, b) => (a > b) ? 1 : -1);
    this.careerClasses.sort((a, b) => (a > b) ? 1 : -1);
  }

  /**
   * addItems is used when loading items upon startup, it looks at each item
   * and determines if some values need to be recorded. For instance, we want 
   * to know all the career groups of all the careers being loaded, or all the 
   * lores of spells. This data is then made available to the user to filter by.
   * 
   * @param {Array} itemList List of items to be added
   */
  addItems(itemList) {
    for (let item of itemList) {
      if (item.type == "career") {
        if (!this.careerGroups.includes(item.data.data.careergroup.value))
          this.careerGroups.push(item.data.data.careergroup.value);
        if (!this.careerClasses.includes(item.data.data.class.value))
          this.careerClasses.push(item.data.data.class.value);
      }
      if (item.type == "prayer") {
        let godList = item.data.data.god.value.split(", ").map(i => {
          return i.trim();
        })
        godList.forEach(god => {
          if (!this.gods.includes(god))
            this.gods.push(god);
        })
      }
      if (item.type == "spell") {
        if (!this.lores.includes(item.data.data.lore.value))
          this.lores.push(item.data.data.lore.value);
      }
      item.filterId = this.filterId;
      this.filterId++;
    }
    this.lores = this.lores.filter(l => l).sort((a, b) => (a > b) ? 1 : -1);
    this.lores = this.lores.map(p => {
      if ( game.wfrp4e.config.magicLores[p])
        return  game.wfrp4e.config.magicLores[p];
      else
        return p;
    })
    this.items = this.items.concat(itemList)
  }

  /**
   * applyFilter is called each time the filter changes to correctly hide or show
   * different items based on the filter. The most complicated part is the dynamic filters
   * which is a giant case statement for each filter type. Each dynamic filter applied
   * will filter out the items that don't meant the criteria, but does not filter 
   * out items where the filter does not apply. i.e. changing damage does not affect
   * careers if you have both weapons and careers showing.
   * 
   * @param {Object} html html of the item list
   */
  applyFilter(html) {
    let items = this.items
    let noItemFilter = true;
    let filteredItems = [];
    for (let filter in this.filters.type) {
      if (this.filters.type[filter].value) {
        filteredItems = filteredItems.concat(items.filter(i => i.type == filter))
        noItemFilter = false;
      }
    }

    if (noItemFilter)
      filteredItems = items;

    for (let filter in this.filters.attribute) {
      if (this.filters.attribute[filter] || filter == "worldItems") {
        switch (filter) {
          case "name":
            filteredItems = filteredItems.filter(i => i.name.toLowerCase().includes(this.filters.attribute.name.toLowerCase()))
            break;
          case "description":
            filteredItems = filteredItems.filter(i => i.data.data.description.value && i.data.data.description.value.toLowerCase().includes(this.filters.attribute.description.toLowerCase()))
            break;
          case "worldItems":
            filteredItems = filteredItems.filter(i => this.filters.attribute[filter] || !!i.compendium)
            break;
        }
      }
    }

    this.checkDynamicFilters(html);

    for (let filter in this.filters.dynamic) {
      if (this.filters.dynamic[filter].show && this.filters.dynamic[filter].value) {
        switch (filter) {
          case "statusTier":
            filteredItems = filteredItems.filter(i => !i.data.data.status || (i.data.data.status && i.data.data.status.tier.toLowerCase() == this.filters.dynamic[filter].value[0].toLowerCase()))
            break;
          case "statusStanding":
            filteredItems = filteredItems.filter(i => !i.data.data.status || (i.data.data.status && this.filters.dynamic[filter].relation && eval(`${i.data.data.status.standing}${this.filters.dynamic[filter].relation}${this.filters.dynamic[filter].value}`)))
            break;
          case "qualitiesFlaws":
            if (this.filters.dynamic[filter].value.length && this.filters.dynamic[filter].value.some(x => x))
              filteredItems = filteredItems.filter(i => {
                if (!i.data.data.qualities.value && !i.data.data.flaws.value)
                  return true;
                let properties = WFRP_Utility._prepareQualitiesFlaws(i.data, true)
                if (!properties.length || (properties.length == 1 && properties[0] == "Special"))
                  return;

                return this.filters.dynamic[filter].value.every(value => { return properties.find(v => v.toLowerCase().includes(value.toLowerCase())) })

              })
            break;
          case "symptoms": {
            if (this.filters.dynamic[filter].value.length && this.filters.dynamic[filter].value.some(x => x))
              filteredItems = filteredItems.filter(i => {
                if (!i.data.data.symptoms)
                  return true;
                let s = i.data.data[filter].value.split(",").map(i => {
                  return i.trim().toLowerCase();
                })
                return this.filters.dynamic[filter].value.every(f => s.find(symptom => symptom.includes(f.toLowerCase())))
              })
          }
            break;

          case "characteristics":
          case "skills":
          case "talents":
            if (this.filters.dynamic[filter].value.length && this.filters.dynamic[filter].value.some(x => x))
              filteredItems = filteredItems.filter(i => !i.data.data[filter] || (i.data.data[filter] && this.filters.dynamic[filter].value.every(value => { return i.data.data[filter].find(v => v.toLowerCase().includes(value.toLowerCase())) })))
            break;

          case "twohanded":
          case "rollable":
          case "magicMissile":
          case "wearable":
            filteredItems = filteredItems.filter(i => !i.data.data[filter] || (i.data.data[filter] && this.filters.dynamic[filter].value == (!!i.data.data[filter].value)))
            break;
          case "aoe":
            filteredItems = filteredItems.filter(i => i.type != "spell" || (i.data.data.target && this.filters.dynamic[filter].value == i.data.data.target.aoe))
            break;
          case "extendable":
            filteredItems = filteredItems.filter(i => i.type != "spell" || (i.data.data.duration && this.filters.dynamic[filter].value == i.data.data.duration.extendable))
            break;

          case "melee":
          case "ranged":
            filteredItems = filteredItems.filter(i => i.type != "weapon" || filter ==  game.wfrp4e.config.groupToType[i.data.data.weaponGroup.value])
            break;
          case "weaponRange":
            filteredItems = filteredItems.filter(i => !i.data.data.range || (i.data.data.range.value && !isNaN(i.data.data.range.value) && this.filters.dynamic[filter].relation && eval(`${i.data.data.range.value}${this.filters.dynamic[filter].relation}${this.filters.dynamic[filter].value}`)))
            break;
          case "cn":
          case "carries":
          case "encumbrance":
            filteredItems = filteredItems.filter(i => !i.data.data[filter] || (i.data.data[filter] && this.filters.dynamic[filter].relation && eval(`${i.data.data[filter].value}${this.filters.dynamic[filter].relation}${this.filters.dynamic[filter].value}`)))
            break;
          case "modifiesDamage":
            filteredItems = filteredItems.filter(i => !i.data.data.damage || (i.data.data.damage && this.filters.dynamic[filter].value == (!!i.data.data.damage.value)))
            break;
          case "modifiesRange":
            filteredItems = filteredItems.filter(i => !i.data.data.range || (i.data.data.range && this.filters.dynamic[filter].value == (!!i.data.data.range.value)) && i.data.data.range.value.toLowerCase() != "as weapon") // kinda gross but whatev
            break;
          case "protects":
            filteredItems = filteredItems.filter(i => {
              if (!i.data.data.maxAP)
                return true;
              let show
              if (this.filters.dynamic.protects.value.head && i.data.data.maxAP.head)
                show = true;
              if (this.filters.dynamic.protects.value.body && i.data.data.maxAP.body)
                show = true;
              if (this.filters.dynamic.protects.value.arms && (i.data.data.maxAP.lArm || i.data.data.maxAP.rArm))
                show = true;
              if (this.filters.dynamic.protects.value.legs && (i.data.data.maxAP.lLeg || i.data.data.maxAP.rLeg))
                show = true;
              return show;
            })
            break;
          case "prayerType":
            filteredItems = filteredItems.filter(i => !i.data.data.type || (i.data.data.type && i.data.data.type.value == this.filters.dynamic.prayerType.value))
            break;
          default:
            if (this.filters.dynamic[filter].exactMatch)
              filteredItems = filteredItems.filter(i => !i.data.data[filter] || (i.data.data[filter] && i.data.data[filter].value.toString().toLowerCase() == this.filters.dynamic[filter].value.toLowerCase()))
            else
              filteredItems = filteredItems.filter(i => !i.data.data[filter] || (i.data.data[filter] && i.data.data[filter].value.toString().toLowerCase().includes(this.filters.dynamic[filter].value.toLowerCase())))
            break;
        }
      }
    }

    // Each loaded item has a basic filterId number that is used to determine
    // if the item should be shown or not.
    this.filterIds = filteredItems.map(i => i.filterId);
    let list = html.find(".browser-item")
    for (let element of list) {
      if (this.filterIds.includes(Number(element.getAttribute('data-filter-id'))))
        $(element).show();
      else
        $(element).hide();
    }
    return filteredItems;
  }

  // Determines if dynamic filter options should be shown or not.
  // ie. Reach should only be shown if filtering by weapons.
  checkDynamicFilters(html) {
    for (let dynamicFilter in this.filters.dynamic) {
      this.filters.dynamic[dynamicFilter].show = false;
      for (let typeFilter of this.filters.dynamic[dynamicFilter].type) {
        if (this.filters.type[typeFilter].value)
          this.filters.dynamic[dynamicFilter].show = true;
      }

      let filter = html.find(`.${dynamicFilter}`)
      if (this.filters.dynamic[dynamicFilter].show) {
        $(filter).show();
      }
      else {
        $(filter).hide();
      }
    }
  }

  async importResults() {
    let filteredItems = this.applyFilter(this._element).filter(i => i.compendium);
    new Dialog({
      title: "Import Results",
      content: `<p>Are you sure you want to import your query result?<br>(${filteredItems.length} items)`,
      buttons: {
        yes:
        {
          label: "Yes",
          callback: async html => {
            for (let i of filteredItems)
              await Item.create(i.data, { renderSheet: false });
          }
        },
        cancel:
        {
          label: "Cancel",
          callback: html => { return }
        }
      }
    }).render(true)
  }


  // All the filter responses as well as dragging and dropping items.
  activateListeners(html) {

    html.find(".browser-item").each((i, li) => {
      let item = this.items.find(i => i._id == $(li).attr("data-item-id"))

      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", JSON.stringify({
          type: item.options.compendium.metadata.entity,
          pack: `${item.options.compendium.metadata.package}.${item.options.compendium.metadata.name}`,
          id: item._id
        }))

      })
    })

    html.on("click", ".item-name", ev => {
      let itemId = $(ev.currentTarget).parents(".browser-item").attr("data-item-id")
      this.items.find(i => i._id == itemId).sheet.render(true);

    })

    html.on("click", ".filter", ev => {
      this.filters.type[$(ev.currentTarget).attr("data-filter")].value = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    })

    html.on("keyup", ".name-filter", ev => {
      this.filters.attribute.name = $(ev.currentTarget).val();
      this.applyFilter(html);
    })
    html.on("keyup", ".description-filter", ev => {
      this.filters.attribute.description = $(ev.currentTarget).val();
      this.applyFilter(html);
    })
    html.on("click", ".world-filter", ev => {
      this.filters.attribute.worldItems = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    })
    html.on("keyup change", ".dynamic-filter", ev => {
      this.filters.dynamic[$(ev.currentTarget).attr("data-filter")].value = $(ev.currentTarget).val();
      this.applyFilter(html);
    })
    html.on("change", ".dynamic-filter-comparator", ev => {
      this.filters.dynamic[$(ev.currentTarget).attr("data-filter")].relation = $(ev.currentTarget).val();
      this.applyFilter(html);
    })
    html.on("change", ".csv-filter", ev => {
      this.filters.dynamic[$(ev.currentTarget).attr("data-filter")].value = $(ev.currentTarget).val().split(",").map(i => {
        return i.trim();
      })
      this.applyFilter(html);
    })
    html.on("change", ".boolean-filter", ev => {
      if ($(ev.currentTarget).hasClass("exactMatch"))
        this.filters.dynamic[$(ev.currentTarget).attr("data-filter")].exactMatch = $(ev.currentTarget).is(":checked");

      else if ($(ev.currentTarget).attr("data-filter"))
        this.filters.dynamic[$(ev.currentTarget).attr("data-filter")].value = $(ev.currentTarget).is(":checked");

      this.applyFilter(html);
    })
    html.on("click", ".protects-filter", ev => {
      this.filters.dynamic.protects.value[$(ev.currentTarget).attr("data-filter")] = $(ev.currentTarget).is(":checked");
      this.applyFilter(html);
    })
  }


  _saveScrollPos() {
    if (this.form === null)
      return;

    const html = this._element;
    if (!html) return
    this.scrollPos = [];
    let lists = $(html.find(".save-scroll"));
    for (let list of lists) {
      this.scrollPos.push($(list).scrollTop());
    }
  }
  _setScrollPos() {
    if (this.scrollPos) {
      const html = this._element;
      let lists = $(html.find(".save-scroll"));
      for (let i = 0; i < lists.length; i++) {
        $(lists[i]).scrollTop(this.scrollPos[i]);
      }
    }
  }

}

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
  if (game.user.isGM || game.settings.get("wfrp4e", "playerBrowser")) {
    const button = $(`<button class="browser-btn">Browser</button>`);
    html.find(".directory-footer").append(button);

    button.click(ev => {
      game.wfrpbrowser.render(true)
    })
  }
})

Hooks.on('init', () => {
  if (!game.wfrpbrowser)
    game.wfrpbrowser = new BrowserWfrp4e();
})