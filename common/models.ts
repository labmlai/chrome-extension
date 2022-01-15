import { EnumDictionary } from './types'
import { PostType } from './posts'
import { LOGGER } from './logger'

export interface HTMLText {
    text: string
    html: string
}

export interface ConferenceModel {
    conference: string
    decision: string
}

export interface PaperModel {
    paperId?: string
    data: PaperDetailsModel
}

export interface PaperDetailsModel {
    paper_key: string
    num_tweets: number
    retweet_count: number
    favorite_count: number
    summary: HTMLText
    title: HTMLText
    pdf: string
    tags: string[]
    primary_category: string
    published: number
    updated?: number
    authors: string[]
    meta_summary: HTMLText
    excerpt?: string
    is_our_pick: boolean
    has_similar: boolean
    num_references: number
    num_citations: number
    conference: ConferenceModel
    conference_score?: number
    post_counts: EnumDictionary<PostType, number>
}

export class PaperDetails {
    paper_key: string
    num_tweets: number
    retweet_count: number
    favorite_count: number
    summary: HTMLText
    title: HTMLText
    pdf: string
    tags: string[]
    primary_category: string
    published: number
    authors: string[]
    meta_summary: HTMLText
    excerpt?: string
    is_our_pick: boolean
    has_similar: boolean
    num_references: number
    num_citations: number
    conference: ConferenceModel
    conference_score?: number
    post_counts: EnumDictionary<PostType, number>

    constructor(paper: PaperDetailsModel) {
        this.paper_key = paper.paper_key
        this.num_tweets = paper.num_tweets
        this.retweet_count = paper.retweet_count
        this.favorite_count = paper.favorite_count
        this.summary = paper.summary
        this.title = paper.title
        this.pdf = paper.pdf
        this.tags = paper.tags
        this.primary_category = paper.primary_category
        this.published = paper.published
        this.authors = paper.authors
        this.meta_summary = paper.meta_summary
        this.excerpt = paper.excerpt
        this.is_our_pick = paper.is_our_pick
        this.has_similar = paper.has_similar
        this.num_citations = paper.num_citations
        this.num_references = paper.num_references
        this.conference_score = paper.conference_score

        if (paper.conference !== undefined) {
            this.conference = paper.conference
        }

        if (paper.post_counts !== undefined) {
            this.post_counts = paper.post_counts
        }
    }

    get metaAbstract() {
        if (this.excerpt != null && this.excerpt.length > 0) {
            return this.excerpt
        }
        return this.meta_summary.html
            ? this.meta_summary.html
            : this.meta_summary.text
    }

    get abstract() {
        return this.summary.html ? this.summary.html : this.summary.text
    }

    get paperTitle() {
        return this.title.html ? this.title.html : this.title.text
    }
}

export class Paper {
    data?: PaperDetailsModel

    constructor() {
        this.data = null
    }

    get paperTitle() {
        return this.data.title.html
            ? this.data.title.html
            : this.data.title.text
    }

    get paperId(): string {
        if (this.data != null) {
            return this.data.paper_key
        }
        return null
    }

    loadFrom(model: PaperModel) {
        LOGGER.assert(this.paperId == null || this.paperId === model.paperId)
        this.data = model.data
    }

    toJSON(): PaperModel {
        return {
            data: this.data,
            paperId: this.paperId,
        }
    }
}
