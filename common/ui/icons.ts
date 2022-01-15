import { WeyaElementFunction } from '../../lib/weya/weya'
import { numberOrDefault, numberWithLetter, valueOrDefault } from '../utils'

interface TweetOptions {
    count: number
    isColored?: boolean
}

export class TweetCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fab.fa-twitter.brand-icon.tweet-icon${
                    this.isColored ? '.twitter-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class ReTweetCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-retweet.retweet-icon${
                    this.isColored ? '.retweet-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class FavouriteCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-heart.favourite-icon${
                    this.isColored ? '.favourite-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class AnnotatedCodeCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-file-code.annotated-code-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class VideosCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-video.video-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class SourceCodeCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-code.source-code-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class HighlightedPaperCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-highlighter.highlight-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class BlogCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-link.blog-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class ForumCount {
    count: number
    isColored: boolean

    constructor(opt: TweetOptions) {
        this.isColored = opt.isColored
        this.count = opt.count
    }

    render($: WeyaElementFunction) {
        $('div', '.icon-container.tweet-tag', ($) => {
            $(
                'span',
                `.icon.fas.fa-comments.forum-icon${
                    this.isColored ? '.nn-color' : ''
                }`,
                ''
            )
            $('span', `${numberWithLetter(this.count)}`)
        })
    }
}

export class Bookmark {
    constructor() {}

    render($: WeyaElementFunction) {
        $('span', '.icon.fas.fa-bookmark.bookmark-icon')
    }
}

interface LabelOptions {
    text: string
    color?: string
    isItalic?: boolean
}

export class Label {
    text: string
    color: string
    isItalic: boolean

    constructor(opt: LabelOptions) {
        this.text = opt.text
        this.color = opt.color ? opt.color : `#0dcaf0`
        this.isItalic = opt.isItalic ? opt.isItalic : false
    }

    render($: WeyaElementFunction) {
        $(
            'span',
            '.label-text.text-uppercase',
            { style: { color: this.color } },
            ($) => {
                if (this.isItalic) {
                    $('i', this.text)
                } else {
                    $('span', this.text)
                }
            }
        )
    }
}

interface ConferenceLabelOptions {
    text: string
    decision: string
    score?: number
}

export class ConferenceDecision {
    text: string
    decision: string
    score?: number

    constructor(opt: ConferenceLabelOptions) {
        this.text = opt.text
        this.decision = opt.decision
        if (opt.score != null && opt.score > 0) {
            this.score = opt.score
        }
    }

    render($: WeyaElementFunction) {
        let text = `${valueOrDefault(this.text, 'submitted')} ${numberOrDefault(
            this.score,
            ''
        )}`.trim()
        if (this.decision == 'accepted') {
            new Label({ text: text, color: `#5cb85c` }).render($)
        } else if (this.decision == 'rejected') {
            new Label({ text: text, color: `#d9534f` }).render($)
        } else {
            new Label({ text: text, color: `#ffaf01` }).render($)
        }
    }
}
