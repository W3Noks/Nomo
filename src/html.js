class HTML {
    constructor() { throw console.error('This class my not be instatiated') }
    /**
     * @description removes html backets
     * @param {String} string 
     * @returns {String} string
     */
    static removeSpecialChars( string ) {
        return string.replace( /[<>/]/g, '' )
    }
    /**
     * @description removes brackets
     * @param {String} string 
     * @returns {String} string
     */
    static removeEscapedSpecialChars( string ) {
        return string.replace( /[\[]/g, '').replace(/[\]]/g, '' )
    }
    /**
     * @description transforms html brackets to brackets
     * @param {String} string
     * @returns {String} string 
     */
    static escapeSpecialChars( string ) {
        return string.replace( /[<]/g, '[').replace(/[>]/g, ']' )
    }
    /**
     * @description JS line break to html line break
     * @param {String} string 
     * @returns {String} string
     */
    static fromJsNextLine( string ){
        return string.replace( /\n/g, '<br>' )
    }
    /**
     * @description Html line break to JS line break
     * @param {String} string 
     * @returns {String} string
     */
    static toJsNextLine( string ) {
        return string.replace( /<br>/g, '\n' )
    }
    /**
     * @description removes spaces
     * @param {String} string 
     * @returns {String} string
     */
    static removeSpaces( string ) {
        return string.replace( /\s/g, '' )
    }
}

HTML.BBCode = class BBCode {
    constructor() { throw console.error('This class my not be instatiated') }
    /**
     * @description encore the BBCode
     * @param {String} string 
     * @returns {String} string
     */
    static encode( string ) {
        return string.replace( /list@/g, '<li class="nh-list">' ).replace( /@list/g, '</li>' )
            .replace( /title@/g, '<p class="nh-title" style="font-weight:bold">' ).replace( /@title/g, '</p>' )
    }
    /**
     * @description decode the BBCode
     * @param {String} string 
     * @returns {String} string
     */
    static decode( string ) {
        return string.replace( /<li class="nh-list">/g, 'list@' ).replace( /<\/li>/g, '@list' )
            .replace( /<p class="nh-title" style="font-weight:bold">/g, 'title@' ).replace( /<\/p>/g, '@title' )
    }
}

module.exports = HTML