class StorageService {
    static async getImageUrl(storage, imageRef) {
        return storage.child(imageRef).getDownloadURL().then(function (url) {
            // `url` is the download URL for 'images/stars.jpg'

            // This can be downloaded directly:
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function (event) {
                // var blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();

            return url;
        }).catch(function (error) {
            return ''
        })
    }
}

export default StorageService