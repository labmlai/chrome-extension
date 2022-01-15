import { Paper } from '../common/models'
import { submitError } from '../common/error'
import { DB } from './db'
import { LOGGER } from '../common/logger'

let bgTabs: { [tabId: number]: BgTab } = {}

export async function getTab(
    tabId: number,
    tabUrl: string = null
): Promise<BgTab> {
    LOGGER.log('Requested tab', tabId, bgTabs, JSON.stringify(bgTabs))
    if (
        bgTabs[tabId] == null ||
        (tabUrl != null && bgTabs[tabId].tabUrl != tabUrl)
    ) {
        bgTabs[tabId] = new BgTab(tabId, tabUrl)
        let data = <BgTabModel>await DB.getRecord('tabs', tabId)
        if (data != null && (tabUrl == null || data.tabUrl == tabUrl)) {
            bgTabs[tabId].setData(data)
        }
        LOGGER.log('Created new tab', tabId, bgTabs, JSON.stringify(bgTabs))
    }

    return bgTabs[tabId]
}

export async function removeTab(tabId: number) {
    LOGGER.log('Tab remove requested', tabId, bgTabs, JSON.stringify(bgTabs))
    if (bgTabs[tabId] != null) {
        delete bgTabs[tabId]
        await DB.deleteRecord('tabs', tabId)
        LOGGER.log('Tab removed', tabId, bgTabs, JSON.stringify(bgTabs))
    }
}

interface BgTabModel {
    tabId: number
    tabUrl?: string
    papers: { [link: string]: string }
    processed: boolean
}

class BgTab {
    tabId: number
    tabUrl?: string
    processed: boolean
    papers: { [link: string]: string }
    private uniquePapers: Set<string>

    constructor(tabId: number, tabUrl: string = null) {
        this.tabId = tabId
        this.tabUrl = tabUrl
        this.processed = false
        this.papers = {}
        this.uniquePapers = new Set()
    }

    get count(): number {
        return this.uniquePapers.size
    }

    setData(res: BgTabModel) {
        LOGGER.assert(this.tabId == res.tabId)
        this.papers = res.papers
        this.tabUrl = res.tabUrl
        this.processed = res.processed
        this.uniquePapers = new Set()

        for (let link in this.papers) {
            if (this.papers[link] != null && this.papers[link] != '') {
                this.uniquePapers.add(this.papers[link])
            }
        }
    }

    async add(link: string) {
        this.processed = true
        if (this.papers[link] != null) {
            return
        }
        this.papers[link] = ''
        await DB.upsertRecord('tabs', this.toJSON())
    }

    async updatePapers(papersDetails: { [link: string]: Paper }) {
        let res = {}
        for (let link in this.papers) {
            if (
                (this.papers[link] == null || this.papers[link] == '') &&
                papersDetails[link] != null &&
                papersDetails[link].paperId != null
            ) {
                this.papers[link] = papersDetails[link].paperId
                this.uniquePapers.add(papersDetails[link].paperId)
            }
            // LOGGER.log(paperDetails[paperId].title)
            if (papersDetails[link]) {
                res[link] = papersDetails[link].toJSON()
            }
        }
        await DB.upsertRecord('tabs', this.toJSON())
        return new Promise((resolve) => {
            try {
                chrome.tabs.sendMessage(this.tabId, res, (response) => {
                    if (chrome.runtime.lastError != null) {
                        submitError(
                            {
                                error: chrome.runtime.lastError,
                                tabId: this.tabId,
                            },
                            {}
                        )
                        resolve({})
                        return
                    }
                    resolve(response)
                })
            } catch (err) {
                submitError(
                    {
                        data: err.message,
                        tab: this.tabId,
                        payload: res,
                    },
                    err,
                    err.stack
                ).then()
            }
        })
    }

    toJSON(): BgTabModel {
        return {
            tabId: this.tabId,
            papers: this.papers,
            tabUrl: this.tabUrl,
            processed: this.processed,
        }
    }
}
