import {Paper} from '../common/models'
import {submitError} from '../common/error'
import {LOGGER} from '../common/logger'

let popupTabs: { [tabId: number]: BgPopup } = {}

export async function createPopup(port: chrome.runtime.Port): Promise<number> {
    let p = new BgPopup(port)
    await p.load(port.sender.tab != null ? port.sender.tab.id : null)

    return p.tabId
}

export function updatePopupPapers(tabId: number, papers?: { [link: string]: Paper }) {
    if (popupTabs[tabId] == null) {
        return
    }
    popupTabs[tabId].updatePapers(papers)
}

class BgPopup {
    tabId: number
    private port: chrome.runtime.Port

    constructor(port: chrome.runtime.Port) {
        this.port = port
        port.onDisconnect.addListener(this.onDisconnect)
    }

    async load(tabId?: number) {
        this.tabId = tabId
        try {
            LOGGER.log('From Event', tabId)
            LOGGER.log((await this.getCurrentTab()).id)
            if (this.tabId == null) {
                this.tabId = (await this.getCurrentTab()).id
            }
        } catch (e) {
            submitError({
                error: e.message,
                tabId: this.tabId,
            }, e, e.stack).then()
        }
        popupTabs[this.tabId] = this
    }

    updatePapers(papers?: { [link: string]: Paper }) {
        if (papers == null) {
            this.port.postMessage({})
            return
        }
        let res = {}
        for (let link in papers) {
            if (papers[link] != null && papers[link].paperId != null && res[papers[link].paperId] == null) {
                res[papers[link].paperId] = papers[link].toJSON()
            }
        }
        this.port.postMessage({papers: res})
    }

    private async getCurrentTab(): Promise<chrome.tabs.Tab> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                try {
                    if (tabs.length !== 1) {
                        reject(tabs)
                    } else {
                        resolve(tabs[0])
                    }
                } catch (err) {
                    submitError({
                        data: err.message,
                        tabs: tabs,
                    }, err, err.stack).then()
                }
            })
        })
    }

    private onDisconnect = (port: chrome.runtime.Port) => {
        if (this.tabId != null && popupTabs[this.tabId] != null) {
            delete popupTabs[this.tabId]
        }
    }
}
