import {Weya as $} from '../lib/weya/weya'
import {clearChildElements} from '../common/dom_utils'
import {PapersListItemView} from '../common/paper_item'
import {submitError} from '../common/error'
import {CustomIconButton} from '../common/ui/button'
import {PaperModel} from '../common/models'

function log(message: string, data: Object) {
    if (process.env.NODE_ENV === 'development') {
        document.body.append(message + ': ' + JSON.stringify(data) + '\n')
    }
}

interface ResponseMsg {
    papers?: { [link: string]: PaperModel }
}

class Popup {
    private port: chrome.runtime.Port
    private readonly containerElement: HTMLElement
    private listContainer: HTMLDivElement

    constructor() {
        this.port = chrome.runtime.connect({name: 'popup'})
        this.containerElement = document.getElementById('papers-bar-container')
        this.port.onMessage.addListener(this.onMessage)
        $(this.containerElement, ($) => {
            this.listContainer = $('div', '.list-container', $ => {
                $('div', '.loader-container', $ => {
                    $('div', '.center-container', $ => {
                        $('div.loader', '')
                    })
                })
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
    }

    renderPapers(papers: { [link: string]: PaperModel }) {
        clearChildElements(this.listContainer)
        $(this.listContainer, ($) => {
            for (let paperId in papers) {
                if (papers[paperId] != null && papers[paperId].data != null) {
                    new PapersListItemView({
                        item: papers[paperId].data,
                        onClick: (elem) => {
                            window.open(`https://papers.labml.ai/paper/${elem.paper_key}`)
                        },
                    }).render($)
                }
            }
        })
    }

    onMessage = (msg) => {
        try {
            this.handleMessage(msg)
        } catch (err) {
            submitError({error: err.message}, err, err.stack).then()
        }

    }

    private handleMessage(msg: ResponseMsg) {
        log('port', msg)
        if (msg.papers == null) {
            log('Tab not processed', null)
        } else {
            this.renderPapers(msg.papers)
        }
    }
}

function load() {
    try {
        new Popup()
    } catch (err) {
        submitError({error: err.message}, err, err.stack).then()
    }
}

document.addEventListener('DOMContentLoaded', load)

window.addEventListener('error', function(ev) {
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
      }, ev, ev.error.stack).then()
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
      }, ev, ev.reason.stack).then()
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
      }, ev, ev.reason.stack).then()
})
