import { addIndicator, requestPaper, updateIndicator } from './papers'
import { DEFAULT_SETTINGS, Settings } from '../common/settings'
import { LOGGER } from '../common/logger'

const SUPPORTED_DOMAINS = [
    'arxiv.org',
    'paperswithcode.com/paper',
    'openreview.net',
    'biorxiv.org/content/',
    'biorxiv.org/cgi/content/',
    'medrxiv.org/content/',
    'medrxiv.org/cgi/content/',
    'pubmed.ncbi.nlm.nih.gov',
]
const SUPPORTED_DOMAIN_PREFIXES = [
    'https://',
    'https://www.',
    'http://',
    'http://www.',
]

function extractPaperLink(a: HTMLAnchorElement) {
    let response = validateLink(a.href)
    if (response != null) {
        return response
    }
    response = validateLink(a.text)
    return response
}

function validateLink(link: string) {
    for (let domain of SUPPORTED_DOMAINS) {
        for (let prefix of SUPPORTED_DOMAIN_PREFIXES) {
            if (link.startsWith(`${prefix}${domain}`)) {
                return link
            }
        }
    }
    return null
}

let settings: Settings

function markAllLinks(anchors: NodeListOf<HTMLAnchorElement>) {
    for (let a of anchors) {
        let link = extractPaperLink(a)
        if (link != null) {
            addIndicator(a, link, settings)
        }
    }
}

function setup() {
    if (window['labml_'] != null) {
        LOGGER.log('ignoring link parsing')
        if (window['labml_links'] != null) {
            LOGGER.log('using the old links', window['labml_links'])
            for (let link in window['labml_links']) {
                requestPaper(link)
            }
        }
        return
    }
    window['labml_'] = true

    LOGGER.log('Parsing links')
    let anchors = document.querySelectorAll('a')
    for (let a of anchors) {
        if (a.classList.contains('paper-link')) {
            a.classList.remove('paper-link')
        }
    }
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, (items) => {
        LOGGER.log('Settings', items)
        settings = items.settings
        if (validateLink(document.location.href) != null) {
            requestPaper(document.location.href)
        }
        markAllLinks(document.querySelectorAll('a'))

        document.addEventListener(
            'DOMNodeInserted',
            function (e) {
                let node = <HTMLElement>e.target
                // LOGGER.log(node)
                if (typeof node.querySelectorAll === 'function') {
                    setTimeout(() => {
                        try {
                            markAllLinks(node.querySelectorAll('a'))
                        } catch (err) {
                            LOGGER.error('Send Error 1', err)
                            chrome.runtime.sendMessage({
                                method: 'error',
                                data: {
                                    error: err.message,
                                },
                                event: err,
                                stackTrace: err.stack,
                            })
                        }
                    }, 300)
                }
            },
            false
        )

        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                try {
                    window['labml_links'] = message
                    updateIndicator(message)
                    LOGGER.log('tab message', message)
                    sendResponse('got it')
                } catch (err) {
                    LOGGER.error('Send Error 2', err)
                    chrome.runtime.sendMessage({
                        method: 'error',
                        data: {
                            error: err.message,
                        },
                        event: err,
                        stackTrace: err.stack,
                    })
                }
            }
        )
    })
}

setTimeout(setup, 300)
