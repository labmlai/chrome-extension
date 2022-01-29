import {submitError} from './error'
import {LOGGER} from './logger'

export async function ajaxCall(method: string, url: string, data: object = null, headers: { [key: string]: string } = null) {
    return new Promise((resolve, reject) => {
        let body
        if (data != null) {
            body = JSON.stringify(data)
        } else {
            body = null
        }
        fetch(url, {
            method: method,
            headers: {
                ...headers,
                'content-type': 'application/json',
                accept: 'application/json',
            },
            body: body,
        })
          .then((response) => {
              // LOGGER.log('response', response)
              if (response.status >= 200 && response.status < 300) {
                  resolve(response.json())
              } else {
                  reject(`${response.status}  ${url} ${response.text()}`)
              }
          })
          .catch((reason) => {
              reject(reason)
          })
    })
}

export function numberWithLetter(x: number): string {
    if (x > 1_000_000) {
        return `${Math.round(x / 100_000) / 10}M`
    }
    if (x > 1_000) {
        return `${Math.round(x / 100) / 10}K`
    }

    return `${x}`
}

export function valueOrDefault(
  x: string | null | undefined,
  defaultValue: string,
) {
    if (x == null) {
        return defaultValue
    }
    if (x.trim().length == 0) {
        return defaultValue
    }
    return x
}

export function numberOrDefault(x: number | null | undefined, defaultValue: string, minVal: number = 0) {
    if (x == null) {
        return defaultValue
    }
    if (x <= minVal) {
        return defaultValue
    }
    return `${x}`
}

export function formatDate(dateTime: number) {
    if (dateTime == null) {
        return 'Unknown'
    }
    let date = new Date(dateTime * 1000)
    return date.toDateString()
}

export async function loadPaper(links: string[], referer: string) {
    try {
        let res: any = await ajaxCall(
          'POST',
          `https://papers.labml.ai/extension/v1/papers`,
          {
              urls: links,
          },
          {
              'source-page': referer,
          },
        )
        LOGGER.log('res', res)
        let returnVal = {}
        links.forEach((link) => {
            if (res[link] != null && res[link]['paper_key'] != null) {
                returnVal[link] = {
                    data: res[link],
                    paperId: res[link]['paper_key'],
                }
            } else {
                returnVal[link] = null
            }
        })

        return returnVal
    } catch (e) {
        submitError({
            error: e.message,
        }, e, e.stack).then()
    }
    return null
}

export function isString(s) {
    if (typeof s === 'string') {
        return true
    }
    return s instanceof String
}
