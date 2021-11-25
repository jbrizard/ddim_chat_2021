/*
 * Nom : Infos Classe !
 * Description : Ce module permet de recevoir des informations sur les étudiants de la classe !
 * Auteur(s) : Nathan Coto & Antoine Rigot
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = {
    getStudentsInformations: getStudentsInformations // permet d'appeler cette méthode dans server.js -> infosClasse.getStudentsInformations(...)
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie soit les informations demandées sur la personne ou un message d'aide en cas d'erreur
 */
function getStudentsInformations(io, message)
{
    const fs = require('fs');
    let params = message.split(' ');

    // Si la commande commence par /infos
    if (params[0] == '/infos')
    {
        fs.readFile('./modules/data.json', (err, data) =>
        {
            // Initialisation du code html à renvoyer et des données initiales
            let html = '';
            let jsonData = JSON.parse(data);

            // Si la commande commence par /infos -help
            if (params[1] == '-help')
            {
                returnHelpInformations(io, html);
            }
            else if (params[1])
            {
                returnStudentInformations(io, html, params, jsonData);
            }
            // Si pas de paramètre après /infos
            else
            {
                returnErrorMessage(io);
            }
        }
        );
    }
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie les informations sur la commande /infos
 */
function returnHelpInformations(io, html)
{
    // Génération du code à renvoyer
    html = '<span class="infos">';
    html += 'Bienvenue dans le module CIA !<br>';
    html += 'Pour lancer une recherche : <br>';
    html += '/infos [prenom] [parametre]<br>';
    html += 'Liste des paramètres :<br>';
    html += '&nbsp;&nbsp;-all &nbsp; <span style="text-align: right;">Toutes les informations sur la cible</span><br>';
    html += '&nbsp;&nbsp;-nom &nbsp;  <span style="text-align: right;">Recuperer le nom de la cible</span><br>';
    html += '&nbsp;&nbsp;-age &nbsp;   <span style="text-align: right;">Recuperer l\'age de la cible</span><br>';
    html += '&nbsp;&nbsp;-lieu &nbsp; <span style="text-align: right;">Recuperer la localisation de la cible</span><br>';
    html += '&nbsp;&nbsp;-tel &nbsp;&nbsp; <span style="text-align: right;">Recuprer le numéro de tél. de la cible</span>';
    html += '</span>';

    // Envoi du message
    io.sockets.emit('new_message', {
        name: 'Bot CIA',
        message: html
    });
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie les informations demandées sur la personne
 */
function returnStudentInformations(io, html, params, jsonData)
{
    // Mise en place de la première lettre du prénom en majuscule
    let surname = params[1].charAt(0).toUpperCase() + params[1].slice(1).toLowerCase();

    // Si un paramètre est précisé
    if (params[2])
    {
        html = '';
        
        // Recherche de l'étudiant dans le fichier json initial
        jsonData.student.forEach((el) =>
        {
            // Si la personne cible est trouvée
            if (el.firstName == surname)
            {
                html = '<span class="infos">';
                switch (params[2])
                {
                    // Si la commande commence par /infos -all
                    case '-all':
                        html += 'Voici toutes les informations de la personne cible :<br>' + el.firstName + '<br>' + el.lastName + '<br>' + el.gender + '<br>' + el.birthday + '<br>' + el.place + '<br>' + el.latestStudies + '<br>' + el.email + '<br>' + el.phone;
                        break;
                    // Si la commande commence par /infos -nom
                    case '-nom':
                        html += el.lastName;
                        break;
                    // Si la commande commence par /infos -age
                    case '-age':
                        html += returnAge(html, el.birthday);
                        break;
                    // Si la commande commence par /infos -lieu
                    case '-lieu':
                        html += el.place;
                        break;
                    // Si la commande commence par /infos -tel
                    case '-tel':
                        html += el.phone;
                        break;
                    default:
                        html += 'Paramètre inconnu. Pour plus d\'infos : /infos -help';
                        break;
                }
                html += '</span>';
            }
        }
        );

        // Si la personne cible est inconnue par le fichier json (Génération du code à renvoyer)
        html == '' ? html = '<span>Aucune personne n\'a été trouvée...</span>' : null;

        // Envoi du message
        io.sockets.emit('new_message',
        {
            name: 'Bot CIA',
            message: html
        }
        );
    }
    // Afficher le nom / prénom de la cible (aucun paramètre précisé)
    else
    {
        html = '';

        // Recherche de l'étudiant dans le fichier json initial
        jsonData.student.forEach((el) =>
        {
            // Si la personne cible est trouvée
            if (el.firstName == surname)
            {
                // Génération du code à renvoyer
                html += '<span class="infos">' + el.firstName + ' ' + el.lastName + '</span>';
            }
        }
        );
        
        // Sinon
        // Génération du code à renvoyer
        html == '' ? html = '<span>Aucune personne n\'a été trouvée...</span>' : null;

        // Envoi du message
        io.sockets.emit('new_message',
        {
            name: 'Bot CIA',
            message: html
        }
        );
    }
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie l'age de la personne
 */
function returnAge(html, birthday)
 {
    let birthdayData = birthday.split('/');
    var today = new Date();
    var YearOldYear = today.getFullYear() - birthdayData[2];
    var yearold;

    // Si le mois d'anniversaire de la cible est supérieur au mois actuel
    if (birthdayData[1] > (today.getMonth()+1))
    {
        yearold = YearOldYear - 1;
    }
    // Si le mois d'anniversaire de la cible est égal au mois actuel
    else if(birthdayData[1] = (today.getMonth()+1))
    {
        // Si le jour d'anniversaire de la cible est supérieur au jour actuel
        if (birthdayData[0] > today.getDate())
        {
            yearold = YearOldYear - 1;
        } 
        // Sinon
        else
        {
            yearold = YearOldYear;
        }
    }
    // Sinon
    else
    {
        yearold = YearOldYear;
    }

    html += yearold + ' ans';
    return html;
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie un message d'erreur
 */
function returnErrorMessage(io)
{
    // Envoi du message
    io.sockets.emit('new_message',
    {
        name: 'Bot CIA',
        message: '<span class="infos">Erreur de syntaxe ! Pour plus d\'infos : /infos -help</span>'
    }
    );
}