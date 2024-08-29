import ModuleSettings from './settings.mjs';
import ResourceForm from './apps/resource_form.mjs'

export default class ResourcesStatusBar {
  static getData() {
    return {
      ...window.pr.api.resources(),
      ...{
        is_gm: game.user.isGM,
        status_bar: ModuleSettings.get('toggle_status_bar')
      }
    }
  }

  static async render() {
    const data = this.getData()

    const template = 'modules/fvtt-party-resources/src/views/status_bar.html'
    const status_bar = await renderTemplate(template, data)

    $('#fvtt-party-resources-status-bar').remove()

    if(ModuleSettings.get('status_bar_location') == 'on_top') {
      $('header#ui-top').prepend(status_bar)
    }

    if(ModuleSettings.get('status_bar_location') == 'at_bottom') {
      $('footer#ui-bottom').append(status_bar)
    }

    $('#fvtt-party-resources-status-bar').click(() => {
      window.pr.dashboard.render(true, {focus: true})
    })

    $('.fvtt-party-resources-resource').on('click', event => {
      if (!game.user.isGM || (!event.ctrlKey && !event.metaKey)) {
        return
      }

      event.stopPropagation()

      const id = $(event.target).data('id')

      if (!id) {
        console.error('Party Resources: Clicked resource does not have an ID!')
        return
      }

      const resource = window.pr.dashboard.resource_data(id)

      new ResourceForm(
        resource,
        {
          id: 'edit-resource-form',
          title: game.i18n.localize('FvttPartyResources.ResourceForm.EditFormTitle')
        }
      ).render(true, {focus: true})
    })
  }
}
