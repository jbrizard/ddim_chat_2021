/*
 * Nom : Infos Classe !
 * Description : Ce module permet de recevoir des informations sur les étudiants de la classe !
 * Auteur(s) : Nathan Coto & Antoine Rigot
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = {
    getInfosClasse: getInfosClasse // permet d'appeler cette méthode dans server.js -> infosClasse.getInfosClasse(...)
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie les informations demandées sur la personne
 */
function getInfosClasse(io, message) {
    const fs = require('fs');
    let params = message.split(' ');
    if (params[0] == '/infos') {
        fs.readFile('./modules/data.json', (err, data) => {
            let html = '';
            let student = JSON.parse(data);
            if (params[1]) {
                let surname = params[1].charAt(0).toUpperCase() + params[1].slice(1).toLowerCase();

                if (params[2]) {
                    html = '';
                    student.student.forEach((el) => {
                        if (el.firstName == surname) {
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

                    io.sockets.emit('new_message', {
                        name: 'Bot CIA',
                        message: html
                    });
                } else { // Afficher toutes les infos (aucun paramètre précisé)
                    html = '';

                    student.student.forEach((el) => {
                        if (el.firstName == surname) {
                            html += '<span class="infos">' + el.firstName + ' ' + el.lastName + '</span>';
                        }
                    });

                    html == '' ? html = '<span>Aucune personne n\'a été trouvée...</span>' : null;

                    io.sockets.emit('new_message', {
                        name: 'Bot CIA',
                        message: html
                    });
                }
            } else {
                io.sockets.emit('new_message', {
                    name: 'Bot CIA',
                    message: '<span class="infos">Erreur de syntaxe ! Veuillez respecter la forme : /infos prenom -param</span>'
                });
            }
        });
    }

    const http = require("https");
    let versionPokemonId = 'BS';
    let pokemonId = '4';

    const options = {
        "method": "GET",
        "hostname": "french-pokemon-cards-api.p.rapidapi.com",
        "port": null,
        "path": "/pokemon/version/" + versionPokemonId + "/id/" + pokemonId,
        "headers": {
            "x-rapidapi-host": "french-pokemon-cards-api.p.rapidapi.com",
            "x-rapidapi-key": "15186d8c6fmshc6534105e9daef0p13e1efjsn8ab748c7679e",
            "useQueryString": true
        }
    };

    const req = http.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });

    req.end();
}