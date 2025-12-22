export function numberToWords(number) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion', 'trillion'];

    if (number === 0) return 'zero';

    const chunks = [];
    while (number > 0) {
        chunks.push(number % 1000);
        number = Math.floor(number / 1000);
    }

    let words = '';
    for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (chunk === 0) continue;

        let chunkWords = '';
        if (chunk >= 100) {
            chunkWords += ones[Math.floor(chunk / 100)] + ' hundred ';
            chunk %= 100;
        }
        if (chunk >= 20) {
            chunkWords += tens[Math.floor(chunk / 10)] + ' ';
            chunk %= 10;
        }
        if (chunk >= 10) {
            chunkWords += teens[chunk - 10] + ' ';
            chunk = 0;
        }
        if (chunk > 0) {
            chunkWords += ones[chunk] + ' ';
        }
        chunkWords = chunkWords.trim() + ' ' + scales[i];
        words = chunkWords + ' ' + words;
    }

    return words.trim().charAt(0).toUpperCase() + words.slice(1);
}