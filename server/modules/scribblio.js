/*
 * Nom : Scribblio
 * Description : Une partie de dessin multijoueur
 * Auteur(s) : Nathan COTO & Antoine RIGOT
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	init:init,
	addClient: addClient
}

var _io;
var sockets = {};

setInterval(onEnterFrameScribblio, 10);

/**
 * Initialisation du module
 */
function init(io)
{
	_io = io;
}

/**
 * Connexion d'un client : gestion des événements liés au module Scribblio
 */
function addClient(socket)
{
	sockets[socket.id] = socket;
	socket.color = getRandomColorScribblio();
	
	// événement envoyé par chaque client 30 fois par secondes
	socket.on('mouseInteraction', function(userParams)
	{
		socket.userParams = userParams;
	});

	// actualisation de la liste des utilisateurs
	refreshUsers();

	// événement envoyé lorsqu'un client se déconnecte
	socket.on('disconnect', function()
	{
		removeClient(socket);
	});
}

/**
 * Déconnexion d'un client
 */
function removeClient(socket)
{
	delete sockets[socket.id];
	
	// actualisation de la liste des utilisateurs
	refreshUsers();
}

/**
 * Actualisation de la liste des utilisateurs
 */
function refreshUsers()
{
	// stockage de la liste des utilisateurs
	var userList = [];
	
	for (var i in sockets)
	{
		var socket = sockets[i];
		
		userList.push({
			id:socket.id,
			name:socket.name,
			color:socket.color
		});
	}
	
	// transmission à chaque client
	for (var i in sockets)
	{
		var socket = sockets[i];
		
		socket.emit('scribblio_refresh_users', 
		{
			users:userList		// paramètres des autres utilisateurs
		});
	}
}

/**
 * Fonction appelée 30 fois par secondes :
 *	- transmission en broadcast de la position des autres utilisateurs
 */
function onEnterFrameScribblio()
{
	// stockage des positions de chaque utilisateur
	var othersUserParams = [];
	
	for (var i in sockets)
	{
		var socket = sockets[i];
		
		if (socket.userParams)
		{
			othersUserParams.push({
				id:socket.id,
				color:socket.color,
				userParams:socket.userParams
			});
		}
	}
	
	// transmission à chaque client
	for (var i in sockets)
	{
		var socket = sockets[i];
		
		socket.emit('scribblio_move', 
		{
			othersUserParams:othersUserParams		// position des autres utilisateurs
		});
	}
}

/**
 * Renvoie une couleur aléatoire
 */
function getRandomColorScribblio()
{
	var letters = '0123456789ABCDEF';
	var color = '#';
	
	for (var i = 0; i < 6; i++)
	{
		color += letters[Math.floor(Math.random() * 16)];
	}
	
	return color;
}