

export default class RollDialog extends Dialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        return options;
    }



    updateValues(html)
    {
        html.find('[name="testModifier"]')[0].value = (this.userEntry.testModifier || 0) + (this.cumulativeBonuses.testModifier || 0) + (10 * this.advantage) || 0
        html.find('[name="successBonus"]')[0].value = (this.userEntry.successBonus || 0) + (this.cumulativeBonuses.successBonus || 0)
        html.find('[name="slBonus"]')[0].value = (this.userEntry.slBonus || 0) + (this.cumulativeBonuses.slBonus || 0)
        let difficultySelect = html.find('[name="testDifficulty"]')
        difficultySelect.val(game.wfrp4e.utility.alterDifficulty(this.userEntry.difficulty, this.cumulativeBonuses.difficultyStep || 0))
    }


    changeAdvantage(advantage)
    {
        this.data.actor.update({"data.status.advantage.value" : advantage})
        ui.notifications.notify(game.i18n.localize("DIALOG.AdvantageUpdate"))
        this.advantage = advantage
    }

    activateListeners(html){
        super.activateListeners(html);
        this.userEntry = {};
        this.cumulativeBonuses = {};

        this.advantage = Number(html.find('[name="advantage"]').change(ev => {
            let advantage = parseInt(ev.target.value)
            if (Number.isNumeric(advantage))
            {
                this.changeAdvantage(advantage)
                this.updateValues(html)
            }
        }).val());

        html.find('[name="charging"]').change(ev => {
            if (ev.target.checked)
                this.changeAdvantage((this.advantage || 0) + 1)
            else if (this.advantage >= 1) 
                this.changeAdvantage((this.advantage || 0) - 1)

            html.find('[name="advantage"]')[0].value = this.advantage
            this.updateValues(html)
        })

        html.find(".dialog-bonuses").change(ev => {

            this.cumulativeBonuses = {
                testModifier: 0,
                successBonus: 0,
                slBonus: 0,
                difficultyStep: 0
            };

            ev.stopPropagation();
            $(ev.currentTarget).find("option").filter((o, option) => option.selected).each((o, option) => {
            if (option.dataset.modifier)
                this.cumulativeBonuses.testModifier += Number(option.dataset.modifier)
              if (option.dataset.successbonus)
                this.cumulativeBonuses.successBonus += Number(option.dataset.successbonus)
              if (option.dataset.slbonus)
                this.cumulativeBonuses.slBonus += Number(option.dataset.slbonus)
              if (option.dataset.difficultystep)
                this.cumulativeBonuses.difficultyStep += Number(option.dataset.difficultystep)
            })
            this.updateValues(html)
        })

       this.userEntry.testModifier = Number(html.find('[name="testModifier"]').change(ev => {
           this.userEntry.testModifier = Number(ev.target.value) - (this.advantage * 10) || 0
           this.updateValues(html)
       }).val())
       this.userEntry.successBonus = Number(html.find('[name="successBonus"]').change(ev => {
           this.userEntry.successBonus = Number(ev.target.value)
           this.updateValues(html)
       }).val())
       this.userEntry.slBonus = Number(html.find('[name="slBonus"]').change(ev => {
           this.userEntry.slBonus = Number(ev.target.value)
           this.updateValues(html)
       }).val())
       this.userEntry.difficulty = html.find('[name="testDifficulty"]').change(ev => {
           this.userEntry.difficulty = ev.target.value
           this.updateValues(html)
       }).val()

       this.userEntry.testModifier -= (this.advantage * 10) || 0
    }   
}