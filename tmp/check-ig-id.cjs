function idToShortcode(id) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let shortcode = '';
    let idBigInt = BigInt(id);
    
    while (idBigInt > 0n) {
        let remainder = idBigInt % 64n;
        shortcode = alphabet[Number(remainder)] + shortcode;
        idBigInt = idBigInt / 64n;
    }
    
    return shortcode;
}

const id = "3867455795881435915"; // Provided by user
console.log(`Media ID: ${id}`);
console.log(`Shortcode: ${idToShortcode(id)}`);

const knownShortcode = "DWr9o5CCeML";
// Reverse check not as easy but let's see.
