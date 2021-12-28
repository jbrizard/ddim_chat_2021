/*
 * Nom : UserList
 * Description : Ce petit module bonus permet d'intégrer une liste des utilisateurs connectés au chat ;))
 * Auteur(s) : Donovan Cartier, Romain Larivaud
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	handleUserList: handleUserList // permet d'appeler cette méthode dans server.js -> userList.handleUserList(...)
}

// Déclaration d'un tableau contenant les utilisateurs
var userList = [];

function handleUserList(io, socket)
{

    // Ajoute le nom à la liste des participants
	userList.push(socket);

    // Envoie la réponse de user list
    io.sockets.emit('update_user_list', {userList:userList});
}