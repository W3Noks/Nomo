const fs = require( 'fs' )

class DB {
    /**
     * 
     * @param {String} path 
     */
    constructor( path ) {
        this.path = path
    }

    /**
     * @description check if the path leads somewhere
     * @param {String} path
     * @returns {Promise} Promise
     */
    static async isset( path ) {
        return await fs.readFileSync( path )
    }
    /**
     * @description if path is not set, creates it - calls the callback function
     * @param {Function} callback 
     * @param {Boolean} isMainDb 
     */
    init( callback, isMainDb = false ) {
        DB.isset( this.path ).then( 
            (  ) => {
                if ( typeof callback !== 'undefined' ) {
                    if ( isMainDb ) {
                        window.addEventListener( 'load', callback )
                    } else {
                        callback(  )
                    }
                }
            }
        ).catch( 
            e => {
                fs.writeFileSync( this.path, '[]' )
                if ( typeof callback !== undefined ) {
                    if ( isMainDb ) {
                        window.addEventListener( 'load', callback )
                    } else {
                        callback(  )
                    }
                }
            }
        )
    }
    /**
     * @description returns the database save
     * @return {String} datas
     */
    getSave(  ) {
        let data = fs.readFileSync( this.path )
        return JSON.parse( data )
    }
    /**
     * @description rewrite the database with data
     * @param {String} data 
     */
    rewrite( data ) {
        data = JSON.stringify( data, null, 2 )
        fs.writeFileSync( this.path, data )
    }
    /**
     * @description returns the wanted object from the database
     * @param {String} key 
     * @returns {Prmose} Promise - Or false if not found
     */
    async getValues(key) {
        let datas = this.getSave()
        for ( let data of datas ) {
            if ( data[0] == key ) {
                return await data[1]
            }
        }
        return false
    }
    /**
     * @description modify a value in the database and save it
     * @param {String} key 
     * @param {Object} newValues 
     * @param {String} newID 
     */
    modifyValue( key, newValues, newID ) {
        let datas = this.getSave()
        for ( let data of datas ) {
            if ( data[0] == key ) {
                data[0] = typeof newID === undefined || typeof newID === 'undefined' ? key : newID
                data[1].title = newValues.title
                data[1].content = newValues.content
                data[1].logo = newValues.logo
            }
        }
        this.rewrite(datas)
    }
    /**
     * @description remove a value from the database and save it
     * @param {String} key 
     */
    deleteValue( key ) {
        let datas = this.getSave()
        for ( let data of datas ) {
            if ( data[0] == key ) {
                datas.splice( datas.indexOf( data ), 1 )
            }
        }
        this.rewrite(datas)
    }
}

module.exports = DB