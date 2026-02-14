/**
 * Normalize extracted text by cleaning whitespace and formatting.
 */
function normalizeText(text) {
    if (!text) return '';

    return text
        // Replace multiple consecutive newlines with double newline
        .replace(/\n{3,}/g, '\n\n')
        // Replace multiple spaces/tabs with single space
        .replace(/[ \t]+/g, ' ')
        // Remove leading/trailing whitespace from each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Remove lines that are only whitespace
        .replace(/\n\s*\n/g, '\n\n')
        // Final trim
        .trim();
}

module.exports = { normalizeText };
