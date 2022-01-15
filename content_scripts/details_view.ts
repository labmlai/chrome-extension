import { Paper } from '../common/models'
import { Weya as $ } from '../lib/weya/weya'
import { PapersListItemView } from '../common/paper_item'

export class DetailView {
    private static _instance: DetailView = null
    private backdropElem: HTMLDivElement
    private elem: HTMLDivElement
    private parentContentElem: HTMLDivElement
    private contentElem: HTMLDivElement

    private constructor() {
        this.render()
        document.body.appendChild(this.elem)
    }

    static instance(): DetailView {
        for (let e of <NodeListOf<HTMLDivElement>>(
            document.querySelectorAll('div.paper-link-details')
        )) {
            e.remove()
        }

        DetailView._instance = new DetailView()
        return DetailView._instance
    }

    render() {
        this.elem = $(
            'div',
            '#papers-bar-container.paper-link-container',
            ($) => {
                this.parentContentElem = $(
                    'div',
                    '.paper-link-details',
                    ($) => {
                        this.contentElem = $('div', '.paper-link-contents')
                    }
                )
                this.backdropElem = $('div', '.paper-link-backdrop', {
                    on: { click: (ev) => this.onCloseClicked(ev) },
                })
            }
        )
    }

    onCloseClicked = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        this.elem.style.display = 'none'
    }

    getPosition(elem: HTMLElement) {
        let bodyRect = document.body.getBoundingClientRect()
        let elemRect = elem.getBoundingClientRect()
        return {
            y: elemRect.bottom - bodyRect.top,
            x: elemRect.right - bodyRect.left,
        }
    }

    getPositionEvent(e: PointerEvent) {
        let pointerY = e.pageY,
            pointerX = e.pageX
        let bodyHeight = document.body.scrollHeight,
            bodyWidth = document.body.scrollWidth
        let availableY = bodyHeight - pointerY,
            availableX = bodyWidth - pointerX
        let y = pointerY + 10,
            x = pointerX
        let elemHeight = 0,
            elemWidth =
                bodyWidth <= 400 ? bodyWidth : Math.min(600, bodyWidth * 0.8)
        if (bodyWidth > 400) {
            if (availableX < elemWidth) {
                x -= elemWidth - availableX
            }
        } else {
            x = 0
        }
        return { y: y, x: x }
    }

    show(paper: Paper, e: PointerEvent) {
        let loc = this.getPositionEvent(e)
        this.elem.style.display = 'block'
        this.parentContentElem.style.top = `${loc.y}px`
        this.parentContentElem.style.left = `${loc.x}px`
        while (this.contentElem.firstChild != null) {
            this.contentElem.firstChild.remove()
        }
        if (paper.data == null) {
            this.contentElem.innerHTML = 'No Details'
            return
        }

        let view = new PapersListItemView({
            item: paper.data,
            onClick: (elem) => {
                window.open(`https://papers.labml.ai/paper/${elem.paper_key}`)
            },
            onClose: (e1) => this.onCloseClicked(e1),
        })
        $(this.contentElem, ($) => {
            view.render($)
        })
    }

    hide(elem) {
        this.elem.style.display = 'none'
    }
}
