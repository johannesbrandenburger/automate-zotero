async function main() {

    const dotenv = require('dotenv');

    dotenv.config();
    const userId = process.env.ZOTERO_USER_ID;
    const apiKey = process.env.ZOTERO_API_KEY;

    // config
    const limit = 2;
    let urls = [`https://api.zotero.org/users/${userId}/items/?format=bibtex&limit=${limit}&key=${apiKey}`];
    
    // new: get url from clipboard (node!)
    const clipboardy = (await import('clipboardy')).default;
    const zoteroFrontendUrl = clipboardy.readSync(); // https://www.zotero.org/johannesbrandenburger/items/YIKFHIES,9N898HM3/library

    if (zoteroFrontendUrl.includes("https://www.zotero.org")) {

        // extract item keys
        const itemKeys = zoteroFrontendUrl.split('/items/')[1].split('/library')[0].split(',');
        console.log(itemKeys);

        // build urls
        urls = itemKeys.map(itemKey => `https://api.zotero.org/users/${userId}/items/${itemKey}?format=bibtex&key=${apiKey}`);
    }
    
    
    console.log(urls);
    let bibtex = "";
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const response = await fetch(url);
        const text = await response.text();
        bibtex += text + "\n";
    }

    // replace newlines with spaces to have it in one line and trim
    bibtex = bibtex.trim();

    // copy to clipboard
    clipboardy.writeSync(bibtex);

    console.log(bibtex);
}

main();