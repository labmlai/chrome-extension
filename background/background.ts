import { getTab, removeTab } from './tab'
import { getPaperDetails, loadPaperDetails } from './papers'
import { createPopup, updatePopupPapers } from './popup'
import { submitError } from '../common/error'
import { LOGGER } from '../common/logger'

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    try {
        await removeTab(tabId)
    } catch (err) {
        submitError(
            {
                data: err.message,
                tab: tabId,
                pageDetails: removeInfo,
            },
            err,
            err.stack
        ).then()
    }
})

async function processPage(
    details: chrome.webNavigation.WebNavigationFramedCallbackDetails
) {
    try {
        let tab = await getTab(details.tabId, details.url)
        if (tab.processed) {
            LOGGER.log(
                'Ignoring page processing due to processed page',
                details
            )
            return
        }

        LOGGER.log('Processing page', tab, details)
        await removeTab(details.tabId)
        await getTab(details.tabId)
        chrome.action.setBadgeText({ text: '' }).catch((err) => {
            submitError(
                {
                    data: err.message,
                    tab: details.tabId,
                    pageDetails: details,
                },
                err,
                err.stack
            ).then()
        })
        LOGGER.log('Processing Page', details)
        if (
            details.url.match(
                /https:\/\/((papers\.labml\.ai)|((.*\.)?papers\.bar))|chrome:\/\/|about:blank/g
            ) == null
        ) {
            chrome.scripting
                .insertCSS({
                    target: {
                        tabId: details.tabId,
                        frameIds: [details.frameId],
                    },
                    files: [
                        'assets/font-awesome/fontawesome.min.css',
                        'assets/font-awesome/regular.min.css',
                        'assets/font-awesome/brands.min.css',
                        'assets/font-awesome/solid.min.css',
                        'css/content_script.css',
                    ],
                })
                .catch((err) => {
                    submitError(
                        {
                            data: err.message,
                            tab: details.tabId,
                            pageDetails: details,
                        },
                        err,
                        err.stack
                    ).then()
                })
            chrome.scripting
                .executeScript({
                    target: {
                        tabId: details.tabId,
                        frameIds: [details.frameId],
                    },
                    files: ['js/content_script.js'],
                })
                .catch((err) => {
                    submitError(
                        {
                            data: err.message,
                            tab: details.tabId,
                            pageDetails: details,
                        },
                        err,
                        err.stack
                    ).then()
                })
        }
    } catch (err) {
        submitError(
            {
                data: err.message,
                tab: details.tabId,
                pageDetails: details,
            },
            err,
            err.stack
        ).then()
    }
}

chrome.webNavigation.onCompleted.addListener(async (details) => {
    LOGGER.log('Processing New Page', details)
    if (details.frameId > 0) {
        LOGGER.log('Ignoring iframes')
        return
    }
    await processPage(details)
})
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    LOGGER.log('Processing History Page', details)
    if (details.frameId > 0) {
        LOGGER.log('Ignoring iframes')
        return
    }
    await processPage(details)
})

async function loadPaperAndUpdateData(
    tabId: number,
    link,
    referer,
    sender: chrome.runtime.MessageSender
) {
    try {
        let tab = await getTab(tabId)
        await tab.add(link)
        await loadPaperDetails(link, referer)
        updateTab(tabId).then()
    } catch (e) {
        submitError(
            { error: e.message, tab: tabId, sender: sender },
            e,
            e.stack
        ).then()
    }
}

function handleTabMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) {
    LOGGER.assert(message['method'] == 'paper' || message['method'] == 'error')
    if (message['method'] == 'error') {
        submitError(
            {
                data: message['data'],
                tabId: sender.tab.id,
                sender: sender,
            },
            message['event'],
            message['stackTrace']
        ).then()
        sendResponse(`done ${message['paperId']}`)
        return
    }
    // LOGGER.log(paperIds, message)
    let link = message['link']
    let referer = message['referer']
    let tabId = sender.tab.id
    loadPaperAndUpdateData(tabId, link, referer, sender).then((value) => {
        sendResponse(`done ${message['paperId']}`)
    })
}

async function updateTab(tabId: number) {
    try {
        let tab = await getTab(tabId)
        let papers = await getPaperDetails(tab.papers)
        updatePopupPapers(tabId, papers)
        await tab.updatePapers(papers)
        await chrome.action.setBadgeText({
            text: `${tab.count > 0 ? tab.count : ''}`,
            tabId: tabId,
        })
    } catch (e) {
        submitError({ error: e.message, tabId: tabId }, e, e.stack).then()
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
        submitError(
            {
                data: err.message,
                tab: sender.tab.id,
                sender: sender,
            },
            err,
            err.stack
        ).then()
        sendResponse(`failed ${message['paperId']}`)
    }
    return true
})

chrome.runtime.onConnect.addListener(function (port) {
    LOGGER.assert(port.name === 'popup')
    createPopup(port)
        .then((tabId) => {
            updateTab(tabId).then()
        })
        .catch((err) => {
            submitError(
                {
                    error: err.message,
                },
                err,
                err.stack
            ).then()
        })
})

self.addEventListener('error', function (ev) {
    // Triggered when it's incapable of doing all the callbacks in a single render frame. Can be safely ignored
    // Ref: https://stackoverflow.com/a/50387233
    if (ev.message.toLowerCase().includes('resizeobserver')) {
        return
    }

    // Error happened from a script that was loaded from some other origin (Ex: Google analytics, browser extensions, etc..)
    if (ev.message.toLowerCase().search('script error') != -1) {
        return
    }
    submitError(
        {
            error: ev.message,
        },
        ev,
        ev.error.stack
    ).then()
})

self.addEventListener('rejectionhandled', (ev) => {
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

self.addEventListener('unhandledrejection', (ev) => {
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
