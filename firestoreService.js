class FirestoreService {

    static async getQuerySnapShot(query) {
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
        return result
    }

    // Auto documentID
    static async addDocument(collection, data) {
        return collection.add(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                alert(error);
                return false
            });
    }

    // Custom documentID, replace existing
    static async setDocument(collection, doc_id, data) {
        return await collection.doc(doc_id).set(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                alert(error);
                return false
            })
    }

    // Update existing
    static async updateDocument(collection, doc_id, data) {
        return await collection.doc(doc_id).update(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                alert(error);
                return false
            })
    }

    static async updateOrCreateDocument(collection, doc_id, data) {
        let doc = collection.doc(doc_id);
        let snapShot = await this.getSnapShot(doc);

        let result;
        let created;
        if (snapShot.exists) {
            created = false;
            result = await FirestoreService.updateDocument(collection, doc_id, data)
        } else {
            created = true;
            if (doc_id) {
                result = await FirestoreService.setDocument(collection, doc_id, data)
            } else {
                result = await FirestoreService.addDocument(collection, data)
            }
        }
        return [created, result]
    }

    static async getSnapShot(doc) {
        return doc.get()
            .then((snapShot) => {
                return snapShot
            })
            .catch((error) => {
                alert(error);
                return null
            });
    }

}

export default FirestoreService