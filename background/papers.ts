import {Paper, PaperModel} from '../common/models'
import {DB} from './db'
import {loadPaper} from '../common/utils'

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

function shouldProcessLink(link: string) {
    if (paperLinks[link] == null) {
        return true
    }
    if (paperDetails[paperLinks[link]] == null) {
        return true
    }
    return paperDetails[paperLinks[link]].data == null

}

export async function loadPaperDetails(links: string[], referer: string) {
    let linksToProcess = []
    links.forEach(link => {
        if (shouldProcessLink(link)) {
            linksToProcess.push(link)
        }
    })
    if (linksToProcess.length > 0) {
        let data = await loadPaper(links, referer)
        for (let link of linksToProcess) {
            let paper = new Paper()
            if (data[link] != null) {
                paper.loadFrom(data[link])
            }
            let id = paper.paperId == null ? link : paper.paperId
            paperDetails[id] = paper
            paperLinks[link] = id
            if (paper.paperId != null) {
                await DB.upsertRecord('papers', paper.toJSON())
            }
        }
    }
}
