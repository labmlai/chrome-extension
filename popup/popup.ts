import { Weya as $ } from '../lib/weya/weya'
import { clearChildElements } from '../common/dom_utils'
import { PapersListItemView } from '../common/paper_item'
import { submitError } from '../common/error'
import { CustomIconButton } from '../common/ui/button'

function log(message: string, data: Object) {
    if (process.env.NODE_ENV === 'development') {
        document.body.append(message + ': ' + JSON.stringify(data) + '\n')
    }
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        log('popup loaded', new Date())
        let port = chrome.runtime.connect({ name: 'popup' })
        let containerElement = document.getElementById('papers-bar-container')
        port.onMessage.addListener(function (msg) {
            try {
                log('port', msg)
                clearChildElements(containerElement)
                $(containerElement, ($) => {
                    $('div', '.list-container', ($) => {
                        for (let paperId in msg) {
                            if (
                                msg[paperId] != null &&
                                msg[paperId].data != null
                            ) {
                                new PapersListItemView({
                                    item: msg[paperId].data,
                                    onClick: (elem) => {
                                        window.open(
                                            `https://papers.labml.ai/paper/${elem.paper_key}`
                                        )
                                    },
                                }).render($)
                            }
                        }
                    })
                    $('div', '.footer', ($) => {
                        new CustomIconButton({
                            icon: '.fas.fa-sliders-h',
                            text: 'Settings',
                            onButtonClick: () => {
                                chrome.runtime.openOptionsPage()
                            },
                        }).render($)
                    })
                })
            } catch (err) {
                submitError({ error: err.message }, err, err.stack).then()
            }
        })
    } catch (err) {
        submitError({ error: err.message }, err, err.stack).then()
    }
})

window.addEventListener('error', function (ev) {
    // Triggered when it's incapable of doing all the callbacks in a single render frame. Can be safely ignored
    // Ref: https://stackoverflow.com/a/50387233
    if (ev.message.toLowerCase().includes('resizeobserver')) {
        return
    }

    // Error happened from a script that was loaded from some other origin (Ex: Google analytics, browser extensions, etc..)
    if (ev.message.toLowerCase().search('script error') != -1) {
        return
    }
    log('Error', ev)
    submitError(
        {
            error: ev.message,
        },
        ev,
        ev.error.stack
    ).then()
})

window.addEventListener('rejectionhandled', (ev) => {
    log('HandledRejection', ev)
    submitError(
        {
            error: {
                type: ev.reason.constructor.name,
                name: ev.reason.name,
                message: ev.reason.message,
            },
        },
        ev,
        ev.reason.stack
    ).then()
})

window.addEventListener('unhandledrejection', (ev) => {
    log('UnhandledRejection', ev)
    submitError(
        {
            error: {
                type: ev.reason.constructor.name,
                name: ev.reason.name,
                message: ev.reason.message,
            },
        },
        ev,
        ev.reason.stack
    ).then()
})
