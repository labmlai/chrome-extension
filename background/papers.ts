import { Paper, PaperModel } from '../common/models'
import { DB } from './db'
import { loadPaper } from '../common/utils'

let paperDetails: { [paperId: string]: Paper } = {}
let paperLinks: { [link: string]: string } = {}

export async function getPaperDetails(links: { [link: string]: string }) {
    let details = {}
    for (let link in links) {
        if (
            paperLinks[link] == null ||
            paperDetails[paperLinks[link]] == null
        ) {
            let paper = new Paper()
            let data
            if (links[link] != null && links[link] != '') {
                data = await DB.getRecord('papers', links[link])
            }
            if (data != null) {
                paper.loadFrom(<PaperModel>data)
            }
            if (paper.paperId != null) {
                paperDetails[paper.paperId] = paper
                paperLinks[link] = paper.paperId
            }
        }
        details[link] = paperDetails[paperLinks[link]]
    }

    return details
}

export async function loadPaperDetails(link: string, referer: string) {
    if (
        paperLinks[link] == null ||
        paperDetails[paperLinks[link]] == null ||
        paperDetails[paperLinks[link]].data == null
    ) {
        let data = await loadPaper(link, referer)
        let paper = new Paper()
        if (data != null) {
            paper.loadFrom(data)
        }
        let id = paper.paperId == null ? link : paper.paperId
        paperDetails[id] = paper
        paperLinks[link] = id
        if (paper.paperId != null) {
            await DB.upsertRecord('papers', paper.toJSON())
        }
    }
}
