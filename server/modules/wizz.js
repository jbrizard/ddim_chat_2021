/*
 * Nom : Wizz
 * Description : Ce module permet d'intégrer un bouton wizz pour spammer les utilisateurs
 * Auteur(s) : Donovan Cartier, Romain Larivaud
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	handleWizz: handleWizz // permet d'appeler cette méthode dans server.js -> wizz.handleWizz(...)
}

// Réponse lorsqu'on appelle le Wizz
function handleWizz(io, socket)
{
    socket.on('wizz_message', function()
	{
        // Envoie la réponse du Wizz
        io.sockets.emit('wizz');
	});
}