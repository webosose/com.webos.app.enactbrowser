function blobToDataUrl(data, onready) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        onready(ev.target.result);
    };
    reader.readAsDataURL(data);
}

function fetchImage(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 &&
            xhr.status === 200 &&
            xhr.response) {
            blobToDataUrl(xhr.response, callback);
        }
        else if (xhr.readyState === 4) {
            // failed to load icon
            callback(null);
        }
    };
    xhr.responseType = "blob";
    xhr.open('GET', url, true);
    xhr.send();
}

function getBest(a, b, evaluateFns) {
    for (var i = 0; i < evaluateFns.length; i++) {
        const aEval = evaluateFns[i](a);
        const bEval = evaluateFns[i](b);
        if (aEval > bEval) {
            return a;
        }
        else if (bEval > aEval) {
            return b;
        }
    }
    return a;
}

const relIsOk = (icon) => icon.rel === 'icon' || icon.rel === 'shortcut icon';
const typeIsOk = (icon, pref) => icon.type === pref;
const sizeIsOk = (icon, pref) =>
    icon.sizes && (icon.sizes.includes(pref) || icon.sizes === 'any');

function chooseBestSuitableIcon(favicons, sizePref, typePref) {
    const evaluateFns = [
        relIsOk,
        (icon) => typeIsOk(icon, typePref),
        (icon) => sizeIsOk(icon, sizePref)
    ];
    return favicons.reduce(
        (best, current) => getBest(best, current, evaluateFns));
}

/* Chooses best suitable favicon, fetches it and converts it
   to data url. By default best suitable is png image 32x32

   favicons - array of icon description objects:
   {
        rel,
        type,
        sizes,
        href - absolute url
   }
   if favicons are empty, then try to fetch 'favicon.ico' from root url
*/
function fetchFaviconAsDataUrl(
    favicons,
    rootUrl,
    sizePref='32x32',
    typePref='image/png') {

    let faviconUrl;
    if (favicons.length !== 0) {
        faviconUrl = chooseBestSuitableIcon(favicons, sizePref, typePref).href;
    }
    else {
        faviconUrl = rootUrl + 'favicon.ico';
    }

    return new Promise((resolve) => {
        fetchImage(faviconUrl, (img) => {
            resolve(img);
        });
    });
}

export default fetchFaviconAsDataUrl;
export {fetchFaviconAsDataUrl};