import clone from "lodash/clone";
import logger from "../../CORE/services";

class FirestoreService {

    static object2Array(values) {
        return Object.keys(values).map((key) => {
            let cloned = clone(values[key]);
            cloned.key = key;
            return cloned;
        });
    }

    // Get
    static async get(db, collectionName, documentName, onFail) {
        let fireStore
        if (documentName) {
            fireStore = db.collection(collectionName).doc(documentName)
        } else if (collectionName) {
            fireStore = db.collection(collectionName)
        } else if (db) {
            fireStore = db
        } else {
            return onFail('Specify at least one of db, collectionName, documentName !!')
        }
        return fireStore.get()
            .then((snapShot) => {
                if (snapShot && snapShot.exists) {
                    return snapShot.data()
                }
                return null
            })
            .catch((error) => {
                if (onFail) {
                    return onFail(error)
                }
                alert(error);
                return null
            });
    }

    static async getSnapShot(doc) {
        logger('getSnapShot')
        return doc.get()
            .then((snapShot) => {
                return snapShot
            })
            .catch((error) => {
                alert(error);
                return null
            });
    }

    static async getQuerySnapShot(query, simplify = false) {
        let result = [];
        await query.get()
            .then((querySnapShot) => {
                querySnapShot.forEach((snapShot) => {
                    let dict = {};
                    dict[snapShot.id] = snapShot.data();
                    result.push(dict)
                });
            })
            .catch((error) => {
                alert(error);
            });

        if (simplify) {
            result = result.map(res => {
                for (let key in res) {
                    if (res.hasOwnProperty(key)) {
                        let cloned = clone(res[key]);
                        cloned.id = key;
                        return cloned;
                    }
                }
                return null
            })
        }
        return result
    }

    // Auto documentID
    static async addDocument(collection, data) {
        return collection.add(data)
            .then((docRef) => {
                return docRef.id
            })
            .catch((error) => {
                alert(error);
                return false
            });
    }

    // Custom documentID, replace existing
    static async setDocument(collection, doc_id, data, onFail) {
        logger(`set: ${doc_id}`, data)
        return await collection.doc(doc_id).set(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                if (onFail) {
                    return onFail(error)
                }
                alert(error);
                return null
            });
    }

    // Update existing
    static async updateDocument(collection, doc_id, data, onFail) {
        return await collection.doc(doc_id).update(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                if (onFail) {
                    return onFail(error)
                }
                alert(error);
                return null
            });
    }

    // Delete existing
    static async deleteDocument(collection, doc_id, onFail) {
        return await collection.doc(doc_id).delete()
            .then(() => {
                return true
            })
            .catch((error) => {
                if (onFail) {
                    return onFail(error)
                }
                alert(error);
                return null
            });
    }

    static async deleteField(db, doc, field_name, onFail) {
        return await doc.update({
            [field_name]: db.firestore.FieldValue.delete()
        })
            .then(() => {
                return true
            })
            .catch((error) => {
                if (onFail) {
                    return onFail(error)
                }
                alert(error);
                return null
            });
    }

    // Combined
    static async updateOrCreateDocument(collection, doc_id, data, onFail) {
        let doc = collection.doc(doc_id);
        let snapShot = await this.getSnapShot(doc);

        let result;
        let created;
        if (snapShot.exists) {
            created = false;
            result = await FirestoreService.updateDocument(collection, doc_id, data, onFail)
        } else {
            created = true;
            if (doc_id) {
                result = await FirestoreService.setDocument(collection, doc_id, data, onFail)
            } else {
                result = await FirestoreService.addDocument(collection, data, onFail)
            }
        }
        return [created, result]
    }

    static async getOrCreate(db, collectionName, documentName, data, onFail) {
        let document = await this.get(db, collectionName, documentName, onFail)
        if (document) {
            return document
        } else {
            await this.setDocument(db.collection(collectionName), documentName, data, onFail)
            return data
        }
    }

    static async checkIfExisted(queries = []) {
        let existed = false
        await Promise.all(
            queries.map((query) => {
                return FirestoreService.getQuerySnapShot(query)
            })
        ).then(results => {
            existed = (results.flat().length > 0)
        }).catch(reason => {
            existed = false
        })
        return existed
    }

    // Watcher
    static documentWatcher(doc, onEvent) {
        logger(`Subscribed`)
        return doc.onSnapshot(onEvent);
    }

    static collectionWatcher(collection, onEvent) {
        logger(`Subscribed`)
        return collection.onSnapshot(onEvent);
    }

    static unsubscribe(watcher) {
        if (watcher instanceof Function) {
            logger(`Unsubscribed`)
            watcher();
        }
    }
}

export default FirestoreService
