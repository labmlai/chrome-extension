import {ajaxCall} from './utils'
import {LOGGER} from "./logger";

export async function submitError(
    data: Object,
    event: any,
    stackTrace?: any
): Promise<any> {
    LOGGER.error(data, event, stackTrace)
    let e = event.hasOwnProperty('reason') ? event.reason : event
    if (stackTrace == null) {
        let e = new Error()
        stackTrace = e.stack
    }
    let msg = {
        ...data,
        device: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            appName: navigator.appName,
            appCodeName: navigator.appCodeName,
            engine: navigator.product,
            appVersion: navigator.appVersion,
            extensionVersion: chrome.runtime.getManifest().version,
        },
        source: 'extension',
        stackTrace: stackTrace,
    }
    try {
        msg['rawData'] = JSON.stringify(e)
    } catch (e) {
    }
    let jsonData = JSON.stringify(msg, null, '\t')
    if (
        jsonData.includes(
            'Extension manifest must request permission to access this host.'
        ) ||
        jsonData.includes('The extensions gallery cannot be scripted.')
    ) {
        return {}
    }
    try {
        let res: any = await ajaxCall(
            'POST',
            `https://papers.labml.ai/api/v1/error`,
            {error: jsonData}
        )
        return res
    } catch (e) {
        return null
    }
}
