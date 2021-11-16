/*
 * Nom : Youtube
 * Description : Ce module de la mort integre une recherche de video youtube
 * Auteur(s) : Interlosers (Olivier & Yanis)
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = 
{
	handleYoutube: handleYoutube // permet d'appeler cette méthode dans server.js -> youtube.handleYoutube(...)
}

/**
 * Lorsqu'on appelle youtube, il renvoie une liste de video...
 */
function handleYoutube(io, message)
{
	// Passe le message en minuscules (recherche insensible à la casse)
	messageMinified = message.toLowerCase();
	// Recupere le code de la video Youtube
	var youtubeCode = message.substring(8);
	
	// Est-ce qu'il contient une référence à Daffy ?
	if (messageMinified.startsWith('yt:'))
	{
		// Si oui, envoie la réponse de Daffy...
		io.sockets.emit('new_message',
		{
			name:'Youtube',
			message:''
		});
	}
}