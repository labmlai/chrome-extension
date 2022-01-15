import { PaperDetails, PaperDetailsModel } from './models'
import { WeyaElementFunction } from '../lib/weya/weya'
import { formatDate } from './utils'
import { ConferenceDecision, Label } from './ui/icons'
import { PaperIcons } from './ui/paper_icons'

export interface PapersListItemOptions {
    item: PaperDetailsModel
    onClick: (elem: PaperDetailsModel) => void
    onClose?: (e: Event) => void
}

export class PapersListItemView {
    item: PaperDetails
    elem: HTMLDivElement | HTMLAnchorElement
    titleElem: HTMLHeadingElement
    categoryElem: HTMLSpanElement
    onClick: (evt?: Event) => void
    private onClose?: (e: Event) => void
    private descriptionElem: HTMLHeadingElement

    constructor(opt: PapersListItemOptions) {
        // try {
        this.item = new PaperDetails(opt.item)
        this.onClose = opt.onClose
        this.onClick = (e: Event) => {
            if (e != null) {
                e.preventDefault()
            }
            opt.onClick(this.item)
        }
        // }catch (e) {
        //     document.body.append('Error')
        //     document.body.append(e)
        //     LOGGER.error(e)
        // }
    }

    remove() {
        if (this.elem == null) {
            return
        }
        this.elem.remove()
        this.elem = null
    }

    render($: WeyaElementFunction) {
        this.elem = $(
            'a',
            `.list-item.list-group-item.list-group-item-action`,
            {
                href: `https://papers.labml.ai/paper/${this.item.paper_key}`,
                on: {
                    click: this.onClick,
                },
            },
            ($) => {
                $('div', '.content', ($) => {
                    $('div', '.top-line', ($) => {
                        $('div', ($) => {
                            $('span', `${formatDate(this.item.published)}`)
                            if (this.item.is_our_pick) {
                                new Label({
                                    text: 'our pick',
                                    color: `#0275d8`,
                                }).render($)
                            }

                            if (
                                this.item.conference &&
                                this.item.conference.conference
                            ) {
                                new ConferenceDecision({
                                    text: this.item.conference.conference,
                                    decision: this.item.conference.decision,
                                    score: this.item.conference_score,
                                }).render($)
                            }
                        })
                        $('div', ($) => {
                            this.categoryElem = $(
                                'span',
                                this.item.primary_category
                            )

                            if (this.onClose != null) {
                                let asd = $('span', '.close-btn.fas.fa-times', {
                                    on: {
                                        click: this.onClose,
                                    },
                                })
                            }
                        })
                    })
                    this.titleElem = $('h5', `.not-visited`, ($) => {
                        let title = $('span', '')
                        title.innerHTML = this.item.paperTitle
                    })
                    this.descriptionElem = $('h6', ($) => {
                        let desc = $('span', '')
                        desc.innerHTML = this.item.metaAbstract
                    })

                    new PaperIcons({
                        postCounts: this.item.post_counts,
                        retweetCount: this.item.retweet_count,
                        favouriteCount: this.item.favorite_count,
                        isColored: true,
                    }).render($)
                })
            }
        )

        // this.elem.addEventListener('click', this.onClick)
        return this.elem
    }
}
