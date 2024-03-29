import {ajaxCall} from './utils'
import {LOGGER} from './logger'

const EXCLUDED_ERRORS = [
    // When extension is allowed on all sites and the extension tries to run on special pages such as new tab
    'Extension manifest must request permission to access this host.',
    'Extension manifest must request permission to access the respective host.',
    'Cannot access a chrome:// URL',
    // When extension is allowed on all sites and the extension tries to run on chrome store
    'The extensions gallery cannot be scripted.',
    // When the tab is closed before the backend responds to the links
    'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received.',
]

export async function submitError(
  data: Object,
  event: any,
  stackTrace?: any,
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
    for (let errorMsg of EXCLUDED_ERRORS) {
        if (jsonData.includes(errorMsg)) {
            LOGGER.error('Ignoring excluded error', jsonData)
            return {}
        }
    }
    try {
        let res: any = await ajaxCall(
          'POST',
          `https://papers.labml.ai/api/v1/error`,
          {error: jsonData},
        )
        return res
    } catch (e) {
        return null
    }
}
