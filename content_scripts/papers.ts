import { Paper, PaperModel } from '../common/models'
import { DetailView } from './details_view'
import { LinkType, Settings } from '../common/settings'
import { LOGGER } from '../common/logger'

let links: Btn[] = []

class Btn {
    paper: Paper
    link: string
    private elem: HTMLElement
    private readonly emoji: string
    private container: HTMLElement
    private linkType: LinkType
    private addedIndicator: boolean

    constructor(
        paper: Paper,
        link: string,
        container: HTMLElement,
        linkType: LinkType,
        emoji: string
    ) {
        this.paper = paper
        this.link = link
        this.emoji = emoji
        this.elem = null
        this.container = container
        this.linkType = linkType
        this.addedIndicator = false
        this.container.classList.add('paper-link')
        if (this.paper.data != null) {
            this.addedIndicator = true
            if (linkType === LinkType.button) {
                this.renderButton()
            } else if (linkType === LinkType.emoji) {
                this.renderEmoji()
            } else if (linkType === LinkType.override) {
                this.renderOverride()
            } else {
            }
        }
    }

    onBtnClick = (e: PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()

        DetailView.instance().show(this.paper, e)
    }

    update() {
        if (this.paper.data != null && !this.addedIndicator) {
            this.addedIndicator = true
            if (this.linkType === LinkType.button) {
                this.renderButton()
            } else if (this.linkType === LinkType.emoji) {
                this.renderEmoji()
            } else if (this.linkType === LinkType.override) {
                this.renderOverride()
            } else {
            }
        }
    }

    private renderButton() {
        let btn = document.createElement('div')
        btn.classList.add('paper-link-btn')
        LOGGER.log(
            getComputedStyle(this.container).getPropertyValue('line-height')
        )
        let height =
            parseFloat(
                getComputedStyle(this.container).getPropertyValue('font-size')
            ) - 2
        btn.style.height = `${height}px`
        btn.style.width = `${height}px`
        btn.style.borderRadius = `${height / 2}px`
        btn.style.margin = `0 ${height / 4}px`
        this.elem = btn
        this.elem.addEventListener('click', this.onBtnClick)
        this.addIndicator(this.container)
    }

    private renderEmoji() {
        let btn = document.createElement('div')
        btn.classList.add('paper-link-emoji')
        btn.textContent = `${this.emoji}`
        this.elem = btn
        this.elem.addEventListener('click', this.onBtnClick)
        this.addIndicator(this.container)
    }

    private renderOverride() {
        this.elem = this.container
        this.elem.addEventListener('click', this.onBtnClick)
    }

    private addIndicator(parent: Node) {
        if (parent.firstChild.nodeName === 'BR') {
            if (
                parent.firstChild.nextSibling != null &&
                parent.firstChild.nextSibling.nodeName.match(/H[1-6]/) != null
            ) {
                this.addIndicator(parent.firstChild.nextSibling)
                return
            }
            parent.insertBefore(this.elem, parent.firstChild.nextSibling)
            return
        }
        parent.insertBefore(this.elem, parent.firstChild)
    }
}

export function requestPaper(link: string) {
    chrome.runtime.sendMessage(
        { method: 'paper', link: link, referer: document.location.href },
        (res) => {
            let err = chrome.runtime.lastError
            if (err != null) {
                LOGGER.error('Send Error 3', link, err)
                chrome.runtime.sendMessage({
                    method: 'error',
                    data: {
                        error: err.message,
                    },
                    event: err,
                    stackTrace: 'err.stack',
                })
            }
            LOGGER.log(res)
        }
    )
}

export function addIndicator(
    a: HTMLAnchorElement,
    link: string,
    settings: Settings
) {
    try {
        if (a.classList.contains('paper-link')) {
            return
        }

        if (getComputedStyle(a).getPropertyValue('display') === 'inline') {
            a.style.display = 'inline-block'
        }
        requestPaper(link)

        let btn = new Btn(
            new Paper(),
            link,
            a,
            settings.linkType,
            settings.emoji
        )

        links.push(btn)
    } catch (err) {
        LOGGER.error('Send Error 4', err)
        chrome.runtime.sendMessage({
            method: 'error',
            data: {
                error: err.message,
                paperId: link,
            },
            event: err,
            stackTrace: err.stack,
        })
    }
}

export function updateIndicator(papers: { [link: string]: PaperModel }) {
    for (let link of links) {
        if (papers[link.link] == null) {
            continue
        }

        link.paper.loadFrom(papers[link.link])
        link.update()
    }
}
