import { EnumDictionary } from '../types'
import { PostType } from '../posts'
import { WeyaElementFunction } from '../../lib/weya/weya'
import {
    AnnotatedCodeCount,
    BlogCount,
    FavouriteCount,
    ForumCount,
    HighlightedPaperCount,
    ReTweetCount,
    SourceCodeCount,
    TweetCount,
    VideosCount,
} from './icons'

interface PaperIconsOptions {
    postCounts: EnumDictionary<PostType, number>
    retweetCount: number
    favouriteCount: number
    isColored: boolean
}

export class PaperIcons {
    private readonly postCounts: EnumDictionary<PostType, number>
    private readonly retweetCount: number
    private readonly favouriteCount: number
    private readonly isColored: boolean

    constructor(opt: PaperIconsOptions) {
        this.postCounts = opt.postCounts
        this.retweetCount = opt.retweetCount
        this.favouriteCount = opt.favouriteCount
        this.isColored = opt.isColored
    }

    render($: WeyaElementFunction) {
        $('div', '.info', ($) => {
            let tweetCount =
                this.postCounts.tweet != null ? this.postCounts.tweet : 0
            new TweetCount({
                count: tweetCount,
                isColored: this.isColored,
            }).render($)
            new ReTweetCount({
                count: this.retweetCount,
                isColored: this.isColored,
            }).render($)
            new FavouriteCount({
                count: this.favouriteCount,
                isColored: this.isColored,
            }).render($)

            if (PostType.annotatedCode in this.postCounts) {
                new AnnotatedCodeCount({
                    count: this.postCounts.annotated_code,
                    isColored: this.isColored,
                }).render($)
            }
            if (PostType.video in this.postCounts) {
                new VideosCount({
                    count: this.postCounts.video,
                    isColored: this.isColored,
                }).render($)
            }
            if (PostType.sourceCode in this.postCounts) {
                new SourceCodeCount({
                    count: this.postCounts.source_code,
                    isColored: this.isColored,
                }).render($)
            }
            if (PostType.highlightedPaper in this.postCounts) {
                new HighlightedPaperCount({
                    count: this.postCounts.highlighted_paper,
                    isColored: this.isColored,
                }).render($)
            }
            if (PostType.blog in this.postCounts) {
                new BlogCount({
                    count: this.postCounts.blog,
                    isColored: this.isColored,
                }).render($)
            }
            if (PostType.forum in this.postCounts) {
                new ForumCount({
                    count: this.postCounts.forum,
                    isColored: this.isColored,
                }).render($)
            }
        })
    }
}
