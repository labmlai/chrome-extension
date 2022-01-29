import {getTab, removeTab} from './tab'
import {getPaperDetails, loadPaperDetails} from './papers'
import {createPopup, updatePopupPapers} from './popup'
import {submitError} from '../common/error'
import {LOGGER} from '../common/logger'
import {isString} from '../common/utils'

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    try {
        await removeTab(tabId)
    } catch (err) {
        submitError({
            data: err.message,
            tab: tabId,
            pageDetails: removeInfo,
        }, err, err.stack).then()
    }
})

const IGNORE_URL_REGEX = /https:\/\/((papers\.labml\.ai)|((.*\.)?papers\.bar))|chrome:\/\/|about:blank/

function isIgnoreUrl(url: string) {
    let m = url.match(IGNORE_URL_REGEX)

    return m != null
}

class PageProcessor {
    private tabId: number
    private url: string
    private frameIds: number[]

    constructor(tabId: number, url: string, frameIds: number[]) {
        this.tabId = tabId
        this.url = url
        this.frameIds = frameIds
    }

    async process() {
        try {
            let tab = await getTab(this.tabId, this.url)
            if (tab.processed) {
                LOGGER.log('Ignoring page processing due to processed page', this.tabId, this.url)
                return
            }

            LOGGER.log('Processing page', tab, this.url)
            await removeTab(this.tabId)
            await getTab(this.tabId)
            chrome.action.setBadgeText({text: ''}).catch(this.handleError)
            LOGGER.log('Processing Page', this.url)
            if (this.url == '') {
                this.addContentScripts()
            } else if (!isIgnoreUrl(this.url)) {
                // TODO: Test this
                chrome.permissions.contains({origins: [this.url], permissions: ['scripting']},
                  (res) => {
                      console.log('Permissions', this.url, res)
                      if (!res) {
                          return
                      }
                      this.addContentScripts()
                  })
                // chrome.permissions.getAll((p) => {
                //     console.log('All Perms', p)
                // })
            }
        } catch (err) {
            this.handleError(err)
        }
    }

    addContentScripts() {
        chrome.scripting
          .insertCSS({
              target: {
                  tabId: this.tabId,
                  frameIds: this.frameIds,
              },
              files: [
                  'assets/font-awesome/fontawesome.min.css',
                  'assets/font-awesome/regular.min.css',
                  'assets/font-awesome/brands.min.css',
                  'assets/font-awesome/solid.min.css',
                  'css/content_script.css',
              ],
          }).catch(this.handleError)
        chrome.scripting
          .executeScript({
              target: {
                  tabId: this.tabId,
                  frameIds: this.frameIds,
              },
              files: ['js/content_script.js'],
          }).catch(this.handleError)
    }

    handleError = (err) => {
        submitError({
            data: err.message,
            tab: this.tabId,
            url: this.url,
        }, err, err.stack).then()
    }
}

chrome.webNavigation.onCompleted.addListener(async (details) => {
    LOGGER.log('Processing New Page', details)
    if (details.frameId > 0) {
        LOGGER.log('Ignoring iframes')
        return
    }
    let p = new PageProcessor(details.tabId, details.url, [details.frameId])
    await p.process()
})

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    LOGGER.log('Processing History Page', details)
    if (details.frameId > 0) {
        LOGGER.log('Ignoring iframes')
        return
    }
    let p = new PageProcessor(details.tabId, details.url, [details.frameId])
    await p.process()
})

async function loadPaperAndUpdateData(tabId: number, links: string[], referer, sender: chrome.runtime.MessageSender) {
    try {
        let tab = await getTab(tabId)
        await tab.add(links)
        await loadPaperDetails(links, referer)
        updateTab(tabId).then()
    } catch (e) {
        submitError({
            error: e.message,
            tab: tabId,
            sender: sender,
        }, e, e.stack).then()
    }
}

function handleTabMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    LOGGER.assert(message['method'] == 'paper' || message['method'] == 'error')
    if (message['method'] == 'error') {
        submitError({
            data: message['data'],
            tabId: sender.tab.id,
            sender: sender,
        }, message['event'], message['stackTrace']).then()
        sendResponse(`done ${message['paperId']}`)
        return
    }
    // LOGGER.log(paperIds, message)
    let links = message['links']
    let referer = message['referer']
    let tabId = sender.tab.id
    loadPaperAndUpdateData(tabId, links, referer, sender).then((value) => {
        sendResponse(`done ${message['paperId']}`)
    })
}

async function updateTab(tabId: number) {
    try {
        let tab = await getTab(tabId)
        let papers
        if (!tab.processed) {
            papers = null
        } else {
            papers = await getPaperDetails(tab.papers)
        }
        updatePopupPapers(tabId, papers)
        await tab.updatePapers(papers)
        await chrome.action.setBadgeText({
            text: `${tab.count > 0 ? tab.count : ''}`,
            tabId: tabId,
        })
    } catch (e) {
        if (e != null && isString(e.message) && e.message.includes('No tab with id')) {
            return // Ignore tab closing while it's being processed
        }
        submitError({error: e.message, tabId: tabId}, e, e.stack).then()
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        LOGGER.log('Received Message', sender, message)
        if (sender.origin.startsWith('chrome-extension://')) {
            // handlePopupMessage(message, sender, sendResponse)
            sendResponse(`done ${message['paperId']}`)
        } else {
            handleTabMessage(message, sender, sendResponse)
        }
    } catch (err) {
        submitError({
            data: err.message,
            tab: sender.tab.id,
            sender: sender,
        }, err, err.stack).then()
        sendResponse(`failed ${message['paperId']}`)
    }
    return true
})

chrome.runtime.onConnect.addListener(function(port) {
    LOGGER.assert(port.name === 'popup')
    createPopup(port)
      .then(async (tabId) => {
          let tab = await getTab(tabId)
          if (!tab.processed) {
              let p = new PageProcessor(tabId, '', [0])
              await p.process()
          }
          updateTab(tabId).then()
      })
      .catch((err) => {
          submitError({
              error: err.message,
          }, err, err.stack).then()
      })
})

self.addEventListener('error', function(ev) {
    // Triggered when it's incapable of doing all the callbacks in a single render frame. Can be safely ignored
    // Ref: https://stackoverflow.com/a/50387233
    if (ev.message.toLowerCase().includes('resizeobserver')) {
        return
    }

    // Error happened from a script that was loaded from some other origin (Ex: Google analytics, browser extensions, etc..)
    if (ev.message.toLowerCase().search('script error') != -1) {
        return
    }
    submitError({
        error: ev.message,
    }, ev, ev.error.stack).then()
})

self.addEventListener('rejectionhandled', (ev) => {
    submitError({
        error: {
            type: ev.reason.constructor.name,
            name: ev.reason.name,
            message: ev.reason.message,
        },
    }, ev, ev.reason.stack).then()
})

self.addEventListener('unhandledrejection', (ev) => {
    submitError({
        error: {
            type: ev.reason.constructor.name,
            name: ev.reason.name,
            message: ev.reason.message,
        },
    }, ev, ev.reason.stack).then()
})
