import { submitError } from '../common/error'
import { LOGGER } from '../common/logger'

class Db {
    private database: IDBDatabase

    async initDatabases() {
        LOGGER.log('Initializing DB')
        return new Promise<void>((resolve, reject) => {
            LOGGER.log('DB Inside promise')
            let tabsRequest = indexedDB.open('Data', 2)
            tabsRequest.onerror = (ev) => {
                LOGGER.log('Problem opening DB')
                submitError(
                    {
                        type: 'Problem opening DB',
                        name: ev.type,
                    },
                    ev
                )
                reject(ev)
            }

            tabsRequest.onupgradeneeded = (ev: any) => {
                LOGGER.log('DB Needs upgrading')
                this.database = ev.target.result
                try {
                    this.database.deleteObjectStore('tabs')
                } catch (e) {
                    LOGGER.log('Failed to delete tabs store for upgrade', e)
                }
                let tabStore = this.database.createObjectStore('tabs', {
                    keyPath: 'tabId',
                })
                tabStore.transaction.oncomplete = (ev1) => {
                    LOGGER.log('DB Created tabs store', ev1)
                }
                try {
                    this.database.deleteObjectStore('papers')
                } catch (e) {
                    LOGGER.log('Failed to delete tabs store for upgrade', e)
                }
                let paperStore = this.database.createObjectStore('papers', {
                    keyPath: 'paperId',
                })
                paperStore.transaction.oncomplete = (ev1) => {
                    LOGGER.log('DB Created papers store', ev1)
                }
                resolve()
            }

            tabsRequest.onsuccess = (e: any) => {
                this.database = e.target.result
                LOGGER.log('Opened DB connection')
                this.database.onerror = (ev) => {
                    LOGGER.log('Error on DB', ev)
                    submitError(
                        {
                            type: 'Error on DB',
                            name: ev.type,
                        },
                        ev
                    )
                }
                resolve()
            }
        })
    }

    async upsertRecord(collection: string, data: any) {
        if (this.database == null) {
            await this.initDatabases()
        }
        let transaction = this.database.transaction(collection, 'readwrite')
        let objectStore = transaction.objectStore(collection)

        return new Promise<boolean>((resolve, reject) => {
            transaction.oncomplete = (ev) => {
                LOGGER.log('DB Upsert Completed', collection, ev)
                resolve(true)
            }
            transaction.onerror = (ev) => {
                LOGGER.log('DB Error on upsert', collection, ev)
                reject(ev)
            }

            let request = objectStore.put(data)
            request.onsuccess = (ev) => {
                LOGGER.log('Successfully Added to DB', collection, data)
            }
        })
    }

    async getRecord(collection: string, key: string | number) {
        if (this.database == null) {
            await this.initDatabases()
        }
        let transaction = this.database.transaction(collection, 'readonly')
        let objectStore = transaction.objectStore(collection)

        return new Promise((resolve, reject) => {
            transaction.oncomplete = (ev) => {
                LOGGER.log('DB Get Completed', collection, ev)
            }
            transaction.onerror = (ev) => {
                LOGGER.log('Problem getting data from DB', collection, ev)
                reject(ev)
            }

            let request = objectStore.get(key)
            request.onsuccess = (ev: any) => {
                LOGGER.log('Successfully got data from DB', collection, ev)
                resolve(ev.target.result)
            }
        })
    }

    async deleteRecord(collection: string, key: number) {
        if (this.database == null) {
            await this.initDatabases()
        }
        let transaction = this.database.transaction(collection, 'readwrite')
        let objectStore = transaction.objectStore(collection)

        return new Promise<boolean>((resolve, reject) => {
            transaction.oncomplete = (ev) => {
                LOGGER.log('DB DELETE Completed', collection, ev)
                resolve(true)
            }
            transaction.onerror = (ev) => {
                LOGGER.log('Problem deleting data from DB', collection, ev)
                reject(ev)
            }

            objectStore.delete(key)
        })
    }
}

export let DB = new Db()
DB.initDatabases()
    .then((value) => {
        LOGGER.log('DB initializing succeeded')
    })
    .catch((reason) => LOGGER.error('DB initializing failed', reason))
