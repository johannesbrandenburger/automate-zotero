
const dotenv = require('dotenv');

dotenv.config();
const userId = process.env.ZOTERO_USER_ID;
const apiKey = process.env.ZOTERO_API_KEY;

// config
const limit = 2;
const url = `https://api.zotero.org/users/${userId}/items/?format=bibtex&limit=${limit}&key=${apiKey}`;

async function main() {
    const response = await fetch(url);
    let bibtex = await response.text();

    // replace newlines with spaces to have it in one line and trim
    bibtex = bibtex.replace(/\n/g, ' ');
    bibtex = bibtex.trim();
    
    console.log(bibtex);
}

main();