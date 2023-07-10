function blobToDataUrl(data) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            resolve(ev.target.result);
        }
        reader.onAbort = () => {
            reject();
        }
        reader.readAsDataURL(data);
    });
}

function fetchImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 &&
                xhr.status === 200 &&
                xhr.response) {
                resolve(xhr.response);
            }
            else if (xhr.readyState === 4) {
                reject(); // failed to load icon
            }
        };
        xhr.responseType = "blob";
        xhr.open('GET', imageUrl, true);
        xhr.send();
    });
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

const typeIsOk = (icon, pref) => icon.url.match(/\.(\w+)$|$/)[1] === pref;
const sizeIsOk = (icon, pref) =>
    icon.sizes && (icon.sizes.includes(pref) || icon.sizes === 'any');

function chooseBestSuitableIcon(favicons, sizePref, typePref) {
    const evaluateFns = [
        (icon) => typeIsOk(icon, typePref),
        (icon) => sizeIsOk(icon, sizePref)
    ];
    if (favicons.length > 0)
        return favicons.reduce(
            (best, current) => getBest(best, current, evaluateFns));
}

function mapUntilFirstSuccess(arr, func, index = 0) {
    return func(arr[index])
        .then((result) => {
            return result;
        }).catch(() => {
            if(index < arr.length) {
                return mapUntilFirstSuccess(arr, func, ++index);
            }
        });
}

function getImage(url) {
    return fetchImage(url)
        .then((data) => {
            return blobToDataUrl(data);
        });
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
    typePref='png') {

    let urls = [];
    const bestIcon = chooseBestSuitableIcon(favicons, sizePref, typePref);
    // favicons priority:
    // 1. best suitabe link icon
    // 2. other link icons
    // 3. root favicon
    if (bestIcon)
        urls.push(bestIcon.url);
    urls = urls.concat(favicons.map(icon => icon.url)).concat([rootUrl + 'favicon.ico']);

    urls = urls.filter((value, index, self) => { // remove duplicates
        return self.indexOf(value) === index;
    })

    return mapUntilFirstSuccess(urls, getImage);
}

export default fetchFaviconAsDataUrl;
export {fetchFaviconAsDataUrl};
