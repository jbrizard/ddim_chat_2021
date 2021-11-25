// Chargement des dépendances
var express = require('express');	// Framework Express
var http = require('http');		// Serveur HTTP
var ioLib = require('socket.io');	// WebSocket
var ent = require('ent');		// Librairie pour encoder/décoder du HTML
var path = require('path');		// Gestion des chemins d'accès aux fichiers	
var fs = require('fs');			// Accès au système de fichier

// Chargement des modules perso
var daffy = require('./modules/daffy.js');
var like = require('./modules/like.js');

// Initialisation du serveur HTTP
var app = express();
var server = http.createServer(app);

// Initialisation du websocket
var io = ioLib.listen(server)

// Traitement des requêtes HTTP (une seule route pour l'instant = racine)
app.get('/', function(req, res)
{
	res.sendFile(path.resolve(__dirname + '/../client/chat.html'));
});
  
// Traitement des fichiers "statiques" situés dans le dossier <assets> qui contient css, js, images...
app.use(express.static(path.resolve(__dirname + '/../client/assets')));


// Déclaration d'un tableau vide pour les likes
var messageLikeTable = [];

// Gestion des connexions au socket
io.sockets.on('connection', function(socket)
{
	// Arrivée d'un utilisateur
	socket.on('user_enter', function(name)
	{
		// Stocke le nom de l'utilisateur dans l'objet socket
		socket.name = name;
	});

	// Réception d'un message
	socket.on('message', function(message)
	{
		// À chaque envoie de message on ajoute un id unique en fonction de la date
		var messageId = Date.now();

		// Par sécurité, on encode les caractères spéciaux
		message = ent.encode(message);
		
		// Transmet le message à tous les utilisateurs (broadcast)
		io.sockets.emit('new_message', {name:socket.name, message:message, messageId:messageId});
		
		// Transmet le message au module Daffy (on lui passe aussi l'objet "io" pour qu'il puisse envoyer des messages)
		daffy.handleDaffy(io, message);

		// On initialise le compteur de like à 0 en fonction de l'id du message;
		messageLikeTable[messageId] = 0;
	});

	// Réception d'un like
	socket.on('like', function(messageId) 
	{
		like.likeMessage(io, messageId, messageLikeTable)
	});

	// Réception d'un dislike
	socket.on('unlike', function(messageId) 
	{
		like.unLikeMessage(io,messageId, messageLikeTable)
	});
	
});

// Lance le serveur sur le port 8080 (http://localhost:8080)
server.listen(8080);