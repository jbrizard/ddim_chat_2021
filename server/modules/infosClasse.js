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
 * Lorsqu'on appelle Daffy, il répond...
 */
function getInfosClasse(io, message)
{
    if(message.slice(0, 6) == '/infos') {
        message = message.slice(7);
        message = message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
        
        const fs = require('fs');
    
        fs.readFile('./modules/data.json', (err, data) => {
            if (err) throw err;
            let student = JSON.parse(data);
    
            student.student.forEach((el) => {
                if(el.firstName == message) {
                    io.sockets.emit('new_message',
                    {
                        name:'Bot CIA',
                        message:'<span class="infos">'+el.firstName+' '+el.lastName+'</span>'
                    });
                }
            });
        });
    }
}