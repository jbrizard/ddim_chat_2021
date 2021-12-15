/*
 * Nom : tagUser
 * Description : Ce module permet de tager un utilisateur grâce au '@' 
 *              il verra le message avec un fond jaunâtre et de proposé 
 *              une autocomplétion des pseudos
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
    
	var sockets = io.of('/').sockets;
	
	//On parcours tous les client pour récupérer leur nom
	for (let [socketId, socket] of sockets)
	{   
        if(message.includes('@'+socket.name))
        {
            socket.emit('tagged',true);
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
		
		var sockets = io.of('/').sockets;
		
        //On parcours tous les client pour récupérer leur nom
		for (let [socketId, socket] of sockets)
        {   
            name = socket.name;
			console.log('name', name);
            //On test si le nom du client contient le message après le @.
            if (name != undefined)
                if (name.includes(messageBehindTag))
                    lstUsername.push(name);
        };
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
		console.log('autocomplete');
        // On envoie la liste des clients Tag 
		socket.emit('autocomplete',getAllUserName(io,message));
	});

}

