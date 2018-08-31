const electron = require('electron')
const {ipcRenderer} = electron
const DB = require('./db.js')

window.addEventListener('load', init)

function init() {
    let logos = [
        'check',
        'done_all',
        'event_seat',
        'explore',
        'fitness_center',
        'flight',
        'class',
        'chevron_left',
        'chevron_right',
        'child_care',
        'cloud',
        'create',
        'directions_car',
        'directions_run',
        'drafts',
        'folder',
        'hotel',
        'https',
        'insert_emoticon',
        'insert_link',
        'label_outline',
        'language',
        'landscape',
        'last_page',
        'priority_high',
        'wb_incandescent',
        'weekend'
    ]

    let $$selects = document.querySelectorAll('select')
        $input = document.querySelector('input')

    let pref,
        assist,
        database
    let name,
        color,
        logo

    logos.map(v => {
        $$selects[1].innerHTML += `<option value="${v}">${v}</option>`
    })
    M.Modal.init(document.querySelectorAll('.modal'))
    M.FormSelect.init($$selects)

    document.querySelector('#modal-yes').addEventListener('click', function() {
        name = $input.value,
        color = $$selects[0].value,
        logo = $$selects[1].value

        let preferences = [
            [
                "preferences",
                {
                    name,
                    color,
                    logo
                }
            ]
        ]
        let assistance = [
            [
              "raccourcisclavier",
              {
                "title": "Raccourcis clavier",
                "content": "Ctrl + flèche du bas : minimise la fenêtre.<br>Ctrl + flèche du haut : restaure la fenêtre.",
                "logo": "help"
              }
            ],
            [
              "bbcodeversionedouard",
              {
                "title": "BBCode version Edouard",
                "content": "Le '@' se situe toujours du coté du texte. Il est précédé ou suivit par un tag.<br><br>LES TITRES<br>-> title@ mon titre @title<br><br>LES LISTES<br>-> list@ mon article 1 @list<br>-> list@ mon article 2 @list<br>-> list@ mon article 3 @list<br>-> etc...",
                "logo": "help"
              }
            ],
            [
              "fonctionnalités",
              {
                "title": "Fonctionnalités",
                "content": "Pour quitter l'application : cliquez sur le logo \"Nomo\".<br>Pour faire une recherche dans ses notes : cliquez sur le bouton de recherche.<br><br>Vous ne pouvez pas faire deux listes avec le même titre.<br>Vous ne pouvez pas publier une liste dont le titre et/ou le contenu sont vides.<br><br>Pour modifier vos préférences, rendez vous dans votre fichier \"Documents\", puis sous \"nomo\" et enfin supprimez le fichier \"preferences.json\".<br>Il est fortement déconseillé de modifier ou supprimer manuellement les fichiers \"assistance.json\" et \"database.json\".",
                "logo": "help"
              }
            ]
        ]
        
        let firstSteps = [
            [
                "premierspas",
                {
                "title": "Premiers pas",
                "content": `title@Bievenue ${name}@title\nVoici différentes choses à savoir\n\nlist@Cliquez sur le + pour afficher ou masquer le panneau de création@list\nlist@Vous devez remplir les deux cases pour créer un nouveau pense-bête.@list\nlist@En cliquant sur "Afficher l'aide", vous aurez accès à la notice d'utilisation de l'application.@list\nEt voilà, bonne chance !`,
                "logo": "group"
                }
            ]
        ]
        
        ipcRenderer.send( 'app->dirname.message' )
        ipcRenderer.on( 'app->dirname.reply', (e, arg) => {
            pref = new DB(`${arg}/nomo/preferences.json`)
            pref.init()
            pref.rewrite(preferences)
            assist = new DB(`${arg}/nomo/assistance.json`)
            assist.init()
            assist.rewrite(assistance)
            database = new DB(`${arg}/nomo/database.json`)
            database.init()
            database.rewrite(firstSteps)
            if (pref.getSave().length > 0) {
                ipcRenderer.send('preferences->set')
            }
        })
    })
}