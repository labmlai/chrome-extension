import { DEFAULT_SETTINGS, LinkType, Settings } from '../common/settings'
import { Weya as $ } from '../lib/weya/weya'
import { clearChildElements } from '../common/dom_utils'
import { NamedEditableField } from '../common/ui/editable_field'
import { CustomIconButton } from '../common/ui/button'
import { NamedSelectComponent } from '../common/ui/select'

document.addEventListener('DOMContentLoaded', function () {
    let baseElem = document.getElementById('papers-bar-container')
    clearChildElements(baseElem)
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, (items) => {
        let settings: Settings = items.settings
        let emojiField: NamedEditableField
        let linkTypeField: NamedSelectComponent
        let saveSettings = async () => {
            let updatedSettings: Settings = {
                ...settings,
                linkType: LinkType[linkTypeField.selected],
                emoji: emojiField.getInput(),
            }

            await chrome.storage.sync.set({ settings: updatedSettings })
        }

        let elem = $('div', ($) => {
            $('h5', '.page-title', 'Options')
            linkTypeField = new NamedSelectComponent({
                name: 'Link Type',
                items: [
                    { item: LinkType.emoji, title: 'Emoji' },
                    {
                        item: LinkType.override,
                        title: 'Override link behaviour',
                    },
                    { item: LinkType.none, title: 'No indicator on page' },
                ],
                selected: settings.linkType,
            })
            linkTypeField.render($)
            emojiField = new NamedEditableField({
                name: 'Emoji to display',
                value: settings.emoji,
                isEditable: true,
                required: true,
            })
            emojiField.render($)
            new CustomIconButton({
                icon: '.fas.fa-save',
                text: 'Save',
                onButtonClick: saveSettings,
            }).render($)
        })

        baseElem.append(elem)
    })
})
