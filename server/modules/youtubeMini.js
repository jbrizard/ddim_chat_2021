/*
 * Nom : YoutubeMini
 * Description : Ce putain de module de la mort integre une video youtube
 * Auteur(s) : Interlosers (Olivier & Yanis)
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = 
{
	handleYoutubeMini: handleYoutubeMini // permet d'appeler cette méthode dans server.js -> youtube.handleYoutube(...)
}

/**
 * Lorsqu'on appelle youtube, il renvoie la video demandee...
 */
function handleYoutubeMini(io, message)
{
	// Passe le message en minuscules (recherche insensible à la casse)
	messageMinified = message.toLowerCase();
	// Recupere le code de la video Youtube
	var youtubeCode = message.substring(8);
	
	// Est-ce qu'il contient une référence à Daffy ?
	if (messageMinified.startsWith('youtube:'))
	{
		// Si oui, envoie la réponse de Daffy...
		io.sockets.emit('new_message',
		{
			name:'YoutubeMini',
			message:'<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + youtubeCode + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
		});
	}
}