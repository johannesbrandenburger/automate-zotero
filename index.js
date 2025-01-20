async function main() {

    // get zotero server from .env
    const dotenv = (await import("dotenv")).default;
    dotenv.config();
    const zoteroServer = process.env.ZOTERO_SERVER;
    if (!zoteroServer) {
        throw new Error("ZOTERO_SERVER environment variable is not set");
    }

    // get copied resource url
    const clipboardy = (await import("clipboardy")).default;
    const resourceIdentifier = clipboardy.readSync();
    const isUrl = resourceIdentifier.startsWith("http");
    console.log(`requesting resource identifier: ${resourceIdentifier}`)

    // fetch the zotero translation server to get the zotero format
    const endpoint = isUrl ? "web" : "search";
    const translationResponse = await fetch(`${zoteroServer}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: resourceIdentifier,
    });
    const zoteroFormat = await translationResponse.json();
    console.log(zoteroFormat);

    // for each item in the zotero format, fetch the bibtex format
    let bibtexItems = [];
    for (const item of zoteroFormat) {
        const exportResponse = await fetch(`${zoteroServer}/export?format=bibtex`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify([item])
        });
        let bibtexItem = (await exportResponse.text()).trim();

        // if there is a .url or a .ISBN field, set it as citation key
        const url = item.url;
        // const isbn = item.ISBN;
        const citationKey = url; // || isbn;
        if (citationKey) {
            const escapedUrl = citationKey.replace(/[^a-zA-Z0-9-]/g, "_").replace("http___", "").replace("https___", "");
            const bibtexParts = bibtexItem.split("\n");
            const typePrefix = bibtexParts[0].split("{")[0];
            bibtexParts[0] = `${typePrefix}{${escapedUrl},`;
            bibtexItem = bibtexParts.join("\n");
        }

        bibtexItems.push(bibtexItem);
    }
    console.log(bibtexItems);
    
    // copy to clipboard
    clipboardy.writeSync(bibtexItems.join("\n\n"));
}

main();