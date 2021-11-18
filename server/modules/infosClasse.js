/*
 * Nom : Infos Classe !
 * Description : Ce module permet de recevoir des informations sur les étudiants de la classe !
 * Auteur(s) : Nathan Coto & Antoine Rigot
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	getInfosClasse: getInfosClasse // permet d'appeler cette méthode dans server.js -> infosClasse.getInfosClasse(...)
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie les informations demandées sur la personne
 */
function getInfosClasse(io, message)
{
    const fs = require('fs');
    let params = message.split(' ');
    if(params[0] == '/infos') {
        fs.readFile('./modules/data.json', (err, data) => {
            let html = '';
            let student = JSON.parse(data);
            if(params[1]) {
                let surname = params[1].charAt(0).toUpperCase() + params[1].slice(1).toLowerCase();
                
                if(params[2]) {
                    html = '';
                    student.student.forEach((el) => {
                        if(el.firstName == surname) {
                            html = '<span class="infos">';
                            switch (params[2]) {
                                case '-all':
                                    html += el.firstName + ' ' + el.lastName + ' ' + el.gender + ' ' + el.birthday + ' ' + el.place + ' ' + el.latestStudies + ' ' + el.email + ' ' + el.phone;
                                    break;
                                case '-nom':
                                    html += el.lastName;
                                    break;
                                case '-age':
                                    html += el.birthday;
                                    break;
                                case '-lieu':
                                    html += el.place;
                                    break;
                                case '-tel':
                                    html += el.phone;
                                    break;
                                default:
                                    break;
                            }
                            html += '</span>';
                        }
                    });
                    
                    html == '' ? html = '<span>Aucune personne n\'a été trouvée...</span>' : null;
                    
                    io.sockets.emit('new_message',
                    {
                        name: 'Bot CIA',
                        message: html
                    });
                } else { // Afficher toutes les infos (aucun paramètre précisé)
                    html = '';
                
                    student.student.forEach((el) => {
                        if(el.firstName == surname) {
                            html += '<span class="infos">'+el.firstName+' '+el.lastName+'</span>';
                        }
                    });

                    html == '' ? html = '<span>Aucune personne n\'a été trouvée...</span>' : null;

                    io.sockets.emit('new_message',
                    {
                        name: 'Bot CIA',
                        message: html
                    });
                }
            } else {
                io.sockets.emit('new_message',
                {
                    name: 'Bot CIA',
                    message: '<span class="infos">Erreur de syntaxe ! Veuillez respecter la forme : /infos prenom -param</span>'
                });
            }
        });
    }
}