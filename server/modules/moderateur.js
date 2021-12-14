/*
 * Nom : Modérateur
 * Description : Quand certains mots interdits sont entrés par l'utilisateur, le modérateur les censure !
 * Auteur(s) : CaMa
 */

module.exports =  {
	handleModerateur: handleModerateur // permet d'appeler cette méthode dans server.js 
}

var ent = require('ent');
var motsACensurer = require('./motsCensure.json'); // Fichier Json des mots à censurer
var motsAAvertir = require('./motsAvertissement.json'); // Fichier Json des mots à avertir

//Permet de censurer ou avertir certains mots 
function handleModerateur(io, message)
{
	var messageTest = message.toLowerCase();

	// Pour chaque élément du tableau, censurer le motCourant
	motsACensurer.forEach(function(motCourant)
	{
		// On encode le motCourant pour qu'il comprenne les accents
		motCourant = ent.encode(motCourant);

		if (	messageTest == motCourant // "con"
			|| 	messageTest.startsWith(motCourant + ' ') // "con ..."
			||	messageTest.endsWith(' ' + motCourant) // "... con"
			||	messageTest.includes(' ' + motCourant + ' ') // "... con ..."
		)
	    {
			 // Remplace le motCourant par '*****'
			message = messageTest.replace(motCourant, '******');
			
			//Permet d'afficher le gif dans un nouveau message
			io.sockets.emit('new_message',
			{
				name:'angryModerateur',
				message:'<span class="moderateur"></span>'
			});
		   
	    }
	});

	// Pour chaque élément du tableau, avertir que le motCourant ne peut pas être employé
	motsAAvertir.forEach(function(motCourant)
	{
		// On encode le motCourant pour qu'il comprenne les accents
		motCourant = ent.encode(motCourant); 
		
		if (	messageTest == motCourant // "con"
			|| 	messageTest.startsWith(motCourant + ' ') // "con ..."
			||	messageTest.endsWith(' ' + motCourant) // "... con"
			||	messageTest.includes(' ' + motCourant + ' ') // "... con ..."
		)
	    {
			// Permet d'afficher un message d'avertissement en rouge
			io.sockets.emit('new_message',
			{
				name:'moderateurColere',
				message:'<span style="color: red">Tu devrais tourner ta langue 7 fois dans ta bouche avant de dire de telles bêtises !</span>'
			});
		   
	    }
	});

	return message;

		 
}




