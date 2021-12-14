/*
 * Nom : Like
 * Description : Ce module permet de liker et dislike un message
 * Auteur(s) : LANDEAU-COULAND
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	aimGame: aimGame, // permet d'appeler cette méthode dans server.js -> like.aimGame(...)
}

/**
 * Action lorsqu'on like un message
 */
 function aimGame(io, compteur, name)
 {	
    // Si oui, envoie la réponse de Daffy...
	io.sockets.emit('new_message',
	{
			name: name,
			message:'<span class="score">Mon score est de <span class="color-score">' + compteur + '</span> à AimGame</span>'
	});
	
 }