export function sanitizeHtml(html) {
    if (typeof html !== 'string') return ''
    if (typeof DOMPurify !== 'undefined' && DOMPurify.sanitize) {
        return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
    }
    return html
}
