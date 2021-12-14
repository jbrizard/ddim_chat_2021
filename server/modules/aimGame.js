/*
 * Nom : AimGame
 * Description : Ce module permet de retourner le score d'une partie de AimGame
 * Auteur(s) : LANDEAU-COULAND
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	aimGame: aimGame, // permet d'appeler cette méthode dans server.js -> aimGame.aimGame(...)
}

/**
 * Action lorsqu'on receptionne un score
 */
 function aimGame(io, compteur, name)
 {	
    // On renvoie un message contenant le score
	io.sockets.emit('new_message',
	{
			name: name,
			message:'<span class="score">Mon score est de <span class="color-score">' + compteur + '</span> à AimGame</span>'
	});
	
 }