import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
  /**
   * Adds tooltips to journal sheet buttons and adds listeners for pseudo entities
   */
  Hooks.on("renderJournalSheet", (obj, html, data) => {
    $(html).find(".close").attr("title", "Close");
    $(html).find(".entry-image").attr("title", "Image");
    $(html).find(".entry-text").attr("title", "Text");
    $(html).find(".share-image").attr("title", "Show Image");

    // ---- Listen for custom entity links -----
    html.find(".chat-roll").click(ev => {
      WFRP_Utility.handleRollClick(ev)
    })

    html.find(".symptom-tag").click(ev => {
      WFRP_Utility.handleSymptomClick(ev)
    })

    html.find(".condition-chat").click(ev => {
      WFRP_Utility.handleConditionClick(ev)
    })

    html.find('.table-click').mousedown(ev => {
      WFRP_Utility.handleTableClick(ev)
    })

    html.find('.pay-link').mousedown(ev => {
      WFRP_Utility.handlePayClick(ev)
    })

    html.on('mousedown', '.credit-link', ev => {
      WFRP_Utility.handleCreditClick(ev)
    })
    html.find('.corruption-link').mousedown(ev => {
      WFRP_Utility.handleCorruptionClick(ev)
    })
    html.on('mousedown', '.fear-link', ev => {
      WFRP_Utility.handleFearClick(ev)
    })

    html.on('mousedown', '.terror-link', ev => {
      WFRP_Utility.handleTerrorClick(ev)
    })

  })
}
