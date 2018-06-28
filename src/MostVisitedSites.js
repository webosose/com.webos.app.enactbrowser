function resizeImg(dataUrl, minWidth = 300, minHeight = 215) {
    return new Promise((resolve) => {
        // We create an image to receive the Data URI
        const img = document.createElement('img');
        img.onload = () => {
            resolve([img, dataUrl]);
        };
        img.src = dataUrl;
    }).then(([img, dataUrl]) => {
        const
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            sWidth = img.naturalWidth,
            sHeight = img.naturalHeight;

        let fWidth = minWidth, fHeight = minHeight;
        if (sWidth / sHeight > minWidth / minHeight) {
            fWidth = sWidth / sHeight * fHeight;
        }
        else {
            fHeight = sHeight / sWidth * fWidth;
        }

        canvas.width = sWidth / 2;
        canvas.height = sHeight / 2;

        // draw source image into the off-screen canvas:
        // Step 1 downscale
        ctx.drawImage(img, 0, 0, sWidth / 2, sHeight / 2);
        // Step 2 downscale
        ctx.drawImage(canvas,
            0, 0, sWidth / 2, sHeight / 2,
            0, 0, sWidth / 4, sHeight / 4);

        //Final downscale
        const
            finalCanvas = document.createElement('canvas'),
            fctx = finalCanvas.getContext('2d');
        finalCanvas.width = fWidth;
        finalCanvas.height = fHeight;
        fctx.drawImage(
            canvas,
            0, 0, sWidth / 4, sHeight / 4,
            0, 0, fWidth, fHeight);

        // encode image to data-uri with base64 version of compressed image
        let resizedDataUrl = finalCanvas.toDataURL();
        return resizedDataUrl;
    });
}

class MostVisitedSites {
    constructor(storage, tabs, thumbnails, webviews) {
        this.storage = storage;
        this.tabs = tabs;
        this.thumbnails = thumbnails;
        this.webviews = webviews;
        this.limit = 15;
        tabs.addEventListener('update', this.handleTabUpdate);
    }

    get(number) {
        return this.storage.get(number);
    }

    // pattern - part of url, not necesary from the begining
    getSuggestions(pattern, number) {
        return this.storage.getSuggestions(pattern, number);
    }

    remove(url) {
        const thumbnails = this.thumbnails;
        return this.storage.remove(url).then(() => {
            return thumbnails ? thumbnails.remove(url) : url;
        });
    }

    removeAll() {
        const thumbnails = this.thumbnails;
        return this.storage.removeAll().then(() => {
            return thumbnails ? thumbnails.removeAll() : undefined;
        });
    }

    tryAddThumbnail(tab, addedEntry, nth) {
        const
            thumbnails = this.thumbnails,
            mostVisited = this.storage,
            tabs = this.tabs,
            webviews = this.webviews;

        return Promise.all([
            thumbnails.exists(addedEntry.url),
            mostVisited.getNth(this.limit, addedEntry.url)
        ]).then(([thumbnailExists, nth]) => {
            const thumbnailOutOfLimit = nth && nth.hitCount > addedEntry.hitCount;
            if (thumbnailExists || thumbnailOutOfLimit) {
                return;
            }

            const maxThumbnailsReached = nth && nth.hitCount <= addedEntry.hitCount;
            if (maxThumbnailsReached) {
                thumbnails.remove(nth.url);
            }

            if (tab.id === tabs.getSelectedId() && webviews[tab.id]) {
                webviews[tab.id].captureVisibleRegion({
                        format: 'png',
                        quality: 100
                }).then(
                    resizeImg
                ).then((thumbnailUrl) => {
                    thumbnails.add({
                        url: addedEntry.url,
                        thumbnail: thumbnailUrl
                    });
                });
            }
        });
    }

    handleTabUpdate = (ev) => {
        if (ev.diff.navState && ev.diff.navState.isLoading === false) {
            const mostVisited = this;
            this.storage.add({
                    url:  ev.state.navState.url,
                    title:  ev.state.title
            }).then((entry) => {
                if (mostVisited.thumbnails) {
                    mostVisited.tryAddThumbnail(ev.state, entry);
                }
            });
        }
        else if (ev.diff.title) {
            this.storage.update({
                url:  ev.state.navState.url,
                title:  ev.state.title
            });
        }
    }
}

export default MostVisitedSites;
export {MostVisitedSites};