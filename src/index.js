const electron = require('electron')
const {ipcRenderer} = electron
const DB = require('./db.js')
const HTML = require('./html.js')

window.addEventListener('session-end', quitApp)

let db
    = assistance
    = preferences
    = choices
    = {}
let $creationSection,
    $remindersSection
let timeout = null
let modalBox,
    assistanceModal

/**
 * @description querySelectors
 * @param {String} selector
 */
function $(selector) {return document.querySelector(selector)};function $$(selector) {return document.querySelectorAll(selector)};
/**
 * @description close the app, send an exception to the main process if specified
 * @param {Exception} exception 
 */
function quitApp(exception) {
    if (!exception) exception = false
    ipcRenderer.send( 'app->quit', exception )
}



class NHContainer {
    /**
     * @description process the title, id and content (-> if auth is set to false)
     * @param {String} title 
     * @param {String} content 
     * @param {String} logo 
     * @param {Boolean} auth 
     * @default auth false
     */
    constructor(title, content, logo, auth = false) {
        this.title = HTML.escapeSpecialChars(title)
        this.id = processIDFromTitle(this.title)
        this.content = auth ? content : processContent(content)
        if (!logo) logo = choices.logo
        this.logo = logo
    }
    /**
     * @description save the new reminder to the main database
     */
    create() {
        let title = this.title, content = this.content, logo = this.logo
        if (this.id.length == 0 || this.content.length == 0) {
            let $$inputs = $$('.nh-input')
            $$inputs[0].value = 'Pas content'
            $$inputs[1].value = HTML.BBCode.decode(HTML.toJsNextLine(this.content))
            updateModal(this.id, 'cannot_upload_error:empty')
            M.Modal.getInstance(modalBox).open()
        } else {
            db.getValues(this.id).then(arg => {
                try {
                    processIDFromTitle(arg.title)
                    let $$inputs = $$('.nh-input')
                    $$inputs[0].value = 'Pas content'
                    $$inputs[1].value = HTML.BBCode.decode(HTML.toJsNextLine(this.content))
                    updateModal(this.id, 'cannot_upload_error:id')
                    M.Modal.getInstance(modalBox).open()
                } catch (e) {
                    let datas = db.getSave()
                    datas.push([this.id, {title, content, logo}])
                    db.rewrite(datas)
                    this.append()
                }
            })
        }
    }
    /**
     * @description key = 1: append the reminder to the main page - key = 2: append the reminder to the help page
     * @param {Number} key
     * @default key 1
     */
    append(key = 1) {
        let el = document.createElement('li')
        $$('.collapsible')[key].appendChild(el)
        el.id = this.id
        if (key == 2) {
            el.innerHTML = `<div class="collapsible-header"><i class="material-icons">${this.logo}</i><span class="nh-title">${this.title}</span></div><div class="collapsible-body"> <blockquote class="color rose-- light">${this.content}</blockquote><br></div>`
        } else {
            el.innerHTML = `<div class="collapsible-header"><i class="material-icons">${this.logo}</i><span class="nh-title">${this.title}</span></div><div class="collapsible-body"> <blockquote class="color rose-- light">${this.content}</blockquote><br><a href="#modal-box" class="waves-effect waves-light btn-small modal-trigger color rose-- light"><i class="material-icons right">create</i>Modifier</a> <a href="#modal-box" class="waves-effect waves-light btn-small modal-trigger color rose-- dark"><i class="material-icons right">delete_forever</i>Supprimer</a> <a class="waves-effect waves-light btn-small color rose-- light validate hide"><i class="material-icons right">check</i>Valider</a> <a class="waves-effect waves-light btn-small color rose-- dark cancel hide"><i class="material-icons right">cancel</i>Annuler</a></div>`
        }
        let $self = $('#' + this.id)
        Array.from($$('#' + this.id + ' .modal-trigger')).map(v => {
            v.addEventListener('click', () => {
                updateModal($self.id, v.childNodes[0].innerText)
            })
        })
    }
}

/**
 * @description Must not be instantiated. Contains the methods of modification and normal mods
 */
class Mod {
    constructor() { throw console.error('This class my not be instatiated') }
    /**
     * @description set modification mod to the element with the matching id
     * @param {String} id 
     */
    static modification(id) {
        let content, title
        let selId = '#' + id
        let $content = $(selId + ' blockquote'),
            $title = $content.parentNode.parentNode.childNodes[0],
            $validate = $(selId + ' .validate'),
            $cancel = $validate.nextElementSibling,
            $delete = $validate.previousElementSibling,
            $modify = $delete.previousElementSibling
    
        $modify.classList.add('hide')
        $delete.classList.add('hide')
        $validate.classList.remove('hide')
        $cancel.classList.remove('hide')
        for (let data of db.getSave()) {
            if (data[0] == id) {
                title = data[1].title
                content = HTML.BBCode.decode(HTML.toJsNextLine(data[1].content))
            }
        }

        $title.innerHTML = '<input id="title-temp" class="nh-input" type="text">'
        $('#title-temp').value = title
        $content.innerHTML = `<textarea class="materialize-textarea nh-input">${content}</textarea>`

        $validate.onclick = () => {
            let currentTitle = $('#title-temp').value,
                currentContent = HTML.BBCode.decode(HTML.toJsNextLine($content.childNodes[0].value)),
                currentID = processIDFromTitle(currentTitle)
            if (currentID.length == 0 || currentID.length == 0) {
                let $$inputs = $$('.nh-input')
                $$inputs[0].value = 'Pas content'
                $$inputs[1].value = currentContent
                updateModal(this.id, 'cannot_upload_error:empty')
                M.Modal.getInstance(modalBox).open()
            } else {
                db.getValues(processIDFromTitle(currentID)).then(arg => {
                    try {
                        let newID = processIDFromTitle(arg.title)
                        let $$inputs = $$('.nh-input')
                        $$inputs[0].value = 'Pas content'
                        $$inputs[1].value = currentContent
                        if(newID == id) {
                            $$inputs[0].value = ''
                            $$inputs[1].value = ''
                            Mod.normal(id, true)
                            return false
                        }
                        updateModal(newID, 'cannot_upload_error:id')
                        M.Modal.getInstance(modalBox).open()
                    } catch (e) {
                        Mod.normal(id, true)
                    }
                })
            }
        }
        $cancel.onclick = () => {
            Mod.normal(id)
        }
    }
    /**
     * @description set normal mod to the element with the matching id - save to the main database if save == true
     * @param {String} id
     * @param {Boolean} save
     */
    static normal(id, save = false) {
        let selId = '#' + id
        let $content = $(selId + ' blockquote').childNodes[0],
            $title = $content.parentNode.parentNode.previousElementSibling.childNodes[0],
            $validate = $(selId + ' .validate'),
            $cancel = $validate.nextElementSibling,
            $delete = $validate.previousElementSibling,
            $modify = $delete.previousElementSibling
        let content = $content.value,
            title = $title.value,
            logo = choices.logo,
            newID = save ? processIDFromTitle(title) : id
    
        $modify.classList.remove('hide')
        $delete.classList.remove('hide')
        $validate.classList.add('hide')
        $cancel.classList.add('hide')
        
        if (save) db.modifyValue(id, {title, content, logo}, newID)
    
        db.getValues(newID).then(
            arg => {
                title = HTML.escapeSpecialChars(arg.title)
                $(selId).id = processIDFromTitle(title)
                $title.parentNode.innerHTML = `<i class="material-icons">${HTML.removeSpecialChars(arg.logo)}</i> <span class="nh-title">${title}</span>`
                $content.parentNode.innerHTML = processContent(arg.content)
            }
        )
    }
}


class Assistance {
    constructor() { throw console.error('This class my not be instatiated') }
    /**
     * @description get and append every help "reminders"
     */
    static prepare() {
        assistance.getSave().map( v => {
            let self = v[1]
            new NHContainer(self.title, self.content, self.logo, true).append(2)
        })
    }
    /**
     * @description open the help modal box
     */
    static require() {
        M.Modal.getInstance(assistanceModal).open()
    }
}


ipcRenderer.send( 'app->dirname.message' )
ipcRenderer.on( 'app->dirname.reply', (e, arg) => {
    db = new DB(`${arg}/nomo/database.json`)
    db.init(initMainWindow, true)
    preferences = new DB(`${arg}/nomo/preferences.json`)
    preferences.init(getPreferences)
    assistance = new DB(`${arg}/nomo/assistance.json`)
    assistance.init(Assistance.prepare)
})


/**
 * @description initialization of the window
 */
function initMainWindow() {
    $creationSection = $('#creation-section')
    $remindersSection = $('#reminders-section')

    $('#send-button').addEventListener( 'click', createNewReminder )
    $('#help-button').addEventListener('click', Assistance.require)
    $('#search-button').addEventListener( 'click', () => {
        $('#search-bar').classList.toggle('hide')
    })
    $('#search-bar').addEventListener( 'keyup', search )
    let $brandLogo = $('.brand-logo')
    $brandLogo.addEventListener('mouseover', e => {
        e.target.innerText = 'power_settings_new'
    })
    $brandLogo.addEventListener('mouseout', e => {
        e.target.innerText = 'Nomo'
    })
    $('.brand-logo').addEventListener( 'click', quitApp )

    modalBox = $('#modal-box')
    assistanceModal = $('#help-modal-box')
    M.Modal.init($$('.modal'))
    M.Collapsible.init($$('.collapsible'))
    M.Tooltip.init($$('.tooltipped'), {
        transitionMovement: 0,
        margin: 0
    })

    db.getSave().map( v => {
        let self = v[1]
        new NHContainer(self.title, self.content, self.logo).append()
    })
}


/**
 * @description filters the elements with a regexp
 * @param {String} e 
 */
function search(e) {
    clearTimeout(timeout)
    let isHiddenCreationSection = $creationSection.classList.contains('hide'),
        isHiddenRemindersSection = $remindersSection.classList.contains('hide'),
        isEmptyRemindersSection = true
    timeout = setTimeout(function() {
        if (e.target.value.length != 0) {
            if (!isHiddenCreationSection) $creationSection.classList.add('hide')
        } else {
            if (isHiddenCreationSection) $creationSection.classList.remove('hide')
        }
        let regexp = new RegExp(e.target.value)
        Array.from($$('#reminders-section li')).map(v => {
            if (!regexp.test(v.id)) {
                v.classList.add('hide')
            } else if (v.classList.contains('hide')) {
                v.classList.remove('hide')
            }
            if (!v.classList.contains('hide')) isEmptyRemindersSection = false
        })
        if (isEmptyRemindersSection) {
            if (!isHiddenRemindersSection) $remindersSection.classList.add('hide')
        } else {
            if (isHiddenRemindersSection) $remindersSection.classList.remove('hide')
        }
    }, 200)
}


/**
 * @description update the modal box header, content and buttons according to the type of the action that is required
 * @param {String} id 
 * @param {String} type 
 */
function updateModal(id, type) {
    $('#modal-header').innerHTML = id.toUpperCase()
    let $paragraph = $('#modal-paragraph')
    let $yes = $('#modal-yes'),
        $no = $yes.nextElementSibling
    $yes.innerText = 'Oui'
    if ($no.classList.contains('hide')) $no.classList.remove('hide')
    if (type == 'create') {
        $paragraph.innerHTML = `Voulez vous vraiment modifier "${id}" ?`
        $yes.onclick = () => {
            Mod.modification(id)
        }
    } else if (type == 'delete_forever') {
        $paragraph.innerHTML = `Etes vous certain de vouloir supprimer "${id}" de votre liste ?<br>Cette action est définitive.`
        $yes.onclick = () => {
            remove(id)
        }
    } else if (type == 'cannot_upload_error:id'){
        $yes.innerText = 'Ok'
        $yes.onclick = ''
        $no.classList.add('hide')
        $paragraph.innerHTML = `L'élément ne peut pas être envoyé car un autre élément avec le même id (${id}) existe déjà.`
    } else if (type == 'cannot_upload_error:empty') {
        $yes.innerText = 'Ok'
        $yes.onclick = ''
        $no.classList.add('hide')
        $paragraph.innerHTML = `L'élément ne peut pas être envoyé car le titre ou le contenu est vide.`
    } else {
        return false
    }
}


/**
 * @description instantiate NHContainer to create new reminders
 * @requires {Class} NHContainer
 */

function createNewReminder() {
    let $$inputs = $$('.nh-input')
    let title = $$inputs[0].value, content = HTML.BBCode.encode(HTML.escapeSpecialChars($$inputs[1].value))
    $$inputs[0].value = $$inputs[1].value = ''
    new NHContainer(title, content).create()
}

/**
 * @description remove an element from the DOM and from the database
 * @param {String} id 
 */
function remove(id) {
    db.deleteValue(id)
    let $elem = $('#' + id)
    $elem.parentNode.removeChild($elem)
}

/**
 * @description filter the title of a reminder to make his id
 * @param {String} string 
 */
function processIDFromTitle(string) {
    return HTML.removeSpaces(HTML.removeEscapedSpecialChars(HTML.removeSpecialChars(string.toLowerCase())))
}

/**
 * @description filter the content of a string for "safety" reasons
 * @param {String} string 
 */
function processContent(string) {
    return HTML.BBCode.encode(HTML.fromJsNextLine(string))
}


/**
 * @description get the preferences referenced in the preferences database - prompt the user if preferences are not set
 */
function getPreferences() {
    if (preferences.getSave().length == 0) {
        ipcRenderer.send('first-connection')
    } else {
        preferences.getValues('preferences').then(
            arg => {
                choices.color = arg.color
                choices.logo = arg.logo
                ipcRenderer.send('ready-to-show')
                setFavoriteColorTheme(choices.color)
            }
        )
    }
}

/**
 * @description modify the palette of the main theme (can be red/rose, green, blue)
 * @param {String} color 
 */
function setFavoriteColorTheme(color) {
    color += '--'
    console.log(color)
    Array.from($$('*')).map((v, i) => {
        if (v.classList.contains('color')) {
            let clsList = Array.from(v.classList)
            let colorPos = clsList.indexOf('color') + 1
            let previousColor = v.classList[colorPos]
            v.classList.replace(previousColor, color)
        }
    })
}