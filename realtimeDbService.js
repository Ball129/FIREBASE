import _ from "lodash";

class RealTimeDbService {

    static parseData(values) {
        let val = values;
        return _(val).keys().map(key => {
            let cloned = _.clone(val[key]);
            cloned.key = key;
            return cloned;
        }).value();
    }

    static listenRealtimeDb(dbRef, onDataChange) {
        dbRef.on('value', snapshot => {
            let val = snapshot.val();
            let data = this.parseData(val);
            onDataChange(data);
        });
    }

    static async getData(dbRef) {
        return await dbRef.orderByKey().once('value')
            .then((snapshot) => {
                let val = snapshot.val();
                return this.parseData(val)
            })
            .catch((error) => {
                alert(error);
                return false
            })
    }

    // Custom documentID, replace existing
    static async setData(dbRef, dbId, data) {
        return await dbRef.child(dbId).set(data)
            .then(() => {
                return true
            })
            .catch((error) => {
                alert(error);
                return false
            })
    }

    static async removeAll(dbRef) {
        return await dbRef.remove()
            .then(() => {
                return true
            })
            .catch((error) => {
                alert(error);
                return false
            })
    }
}

export default RealTimeDbService