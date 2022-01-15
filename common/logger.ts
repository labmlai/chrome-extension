class Logger {
    log(message?: any, ...optionalParams: any[]) {
        if (process.env.NODE_ENV === 'development') {
            console.log(message, ...optionalParams)
        }
    }
    error(message?: any, ...optionalParams: any[]) {
        if (process.env.NODE_ENV === 'development') {
            console.error(message, ...optionalParams)
        }
    }

    assert(value: any, message?: string, ...optionalParams: any[]) {
        if (process.env.NODE_ENV === 'development') {
            console.assert(value, message, ...optionalParams)
        }
    }
}

export let LOGGER = new Logger()
