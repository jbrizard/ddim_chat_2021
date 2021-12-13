/*
 * Nom : tagUser
 * Description : Ce module permet de tager un utilisateur grâce au '@' il verra le message avec un fond jaunatre
 * Auteur(s) : Mathias Genelot - Matteo Nossereau
 */


const { Console } = require("console");

module.exports =  {
    userIsTagged: userIsTagged,
    autoCompleteReceive: autoCompleteReceive,

}
/**
 * fonction qui retourne vrai si un utilisateur a été tag 
 */
function userIsTagged(name,message,io)
{
    if (!message.includes('@'))
        return false;
    
    message = message.toLowerCase();
    
    var socketIds = Object.keys(io.sockets.sockets);

    //parcourt tous les clients
    for (var i in socketIds)
    {
        socket = io.sockets.sockets[socketIds[i]];

        if(message.includes('@'+socket.name))
        {
            socket.emit('tagged',true);
            console.log(socket.name);
        }
    }
}
/**
 * Recupere tous les utilisateurs Tag
 * @param {.} io 
 * @param {*} message 
 * @returns 
 */

function getAllUserName(io,message)
{
    // On récupère le contenus après le'@'
    var messageSplit = message.split('@');
    var messageBehindTag;
    var name;

    if (messageSplit[messageSplit.length-1] != undefined)
    {
        messageBehindTag = messageSplit[messageSplit.length-1];

        var lstUsername = [];

        //On parcours tous les client pour récupérer leur nom
        Object.keys(io.sockets.sockets).forEach(function(socketid) 
        {   
            socket = io.sockets.sockets[socketid];
            name = socket.name;
            //On test si le nom du client contient le message après le @.
            if (name != undefined)
                if (name.includes(messageBehindTag))
                    lstUsername.push(name);
        });
    }
    return lstUsername;
}

/**
 * envoie la liste des clients pour l'autocomplétion
 * @param {*} socket 
 * @param {*} io 
 */
function autoCompleteReceive(socket,io)
{
    // La demande d'auto completion est demandé par un utilisateur
    socket.on('autocomplete', function(message)
	{	
        // On envoie la liste des clients Tag 
		socket.emit('autocomplete',getAllUserName(io,message));
	});

}

