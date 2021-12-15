// Chargement des dépendances
var express = require('express');	// Framework Express
var http = require('http');		// Serveur HTTP
var ioLib = require('socket.io')(http);	// WebSocket
var ent = require('ent');		// Librairie pour encoder/décoder du HTML
var path = require('path');		// Gestion des chemins d'accès aux fichiers	
var fs = require('fs');			// Accès au système de fichier

// Chargement des modules perso
var daffy = require('./modules/daffy.js');
var youtubeMini = require('./modules/youtubeMini.js');
var youtube = require('./modules/youtube.js');
var meteo = require('./modules/meteo.js');
var wizz = require('./modules/wizz.js');
var infosClasse = require('./modules/infosClasse.js');
var messagesHistory = require('./modules/messagesHistory.js');
// var basket = require('./modules/basket.js');
// var like = require('./modules/like.js');
var tagUser = require('./modules/tagUser.js');
var deleteMessage = require('./modules/deleteMessage.js');
var blague = require('./modules/blague.js');
var aimGame = require('./modules/aimGame.js');
var moderateur = require('./modules/moderateur.js');
var poll = require('./modules/poll.js');
var scribblio = require('./modules/scribblio.js');
var takover = require('./modules/takover.js');
const { StringDecoder } = require('string_decoder');

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

// Initialisation du module Basket
// basket.init(io);

// Déclaration d'un tableau vide pour les likes
var messageLikeTable = [];

const pollAnswer = 
{
	"0": {
		votes : 0,
		label : "Oui"
	},
	"1": {
		votes : 0,
		label : "Non"
	}
};

// Initialisation du module Scribblio
scribblio.init(io);

// Gestion des connexions au socket
io.sockets.on('connection', function(socket)
{
	// Avatar de base
	socket.avatar = "data:image/jpeg;base64,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";
	// Ajoute le client au jeu de basket
	// basket.addClient(socket);
	
	// // Récupère les anciens messages de l'utilisateur
	// messagesHistory.getMessagesHistory(socket, fs);
	
	// Arrivée d'un utilisateur
	socket.on('user_enter', function(name)
	{
		// Stocke le nom de l'utilisateur dans l'objet socket
		socket.name = name;

		// Ajoute le client au scribblio
		scribblio.addClient(socket);
	});

	// Réception d'un message
	socket.on('message', function(message, textReplyTo)
	{
		// À chaque envoie de message on ajoute un id unique en fonction de la date
		var messageId = Date.now();

		// Par sécurité, on encode les caractères spéciaux
		message = ent.encode(message);
		
		// Transmet le message au module Moderateur
		message = moderateur.handleModerateur(io, message);
		
		// Test si l'utilisateur est tag avant d'envoyer le message
		tagUser.userIsTagged(socket.name,message,io);

		// Transmet le message à tous les utilisateurs (broadcast)
		socket.emit('new_message', {avatar:socket.avatar, messageId:messageId, name:socket.name, message:message, isMe:true, textReplyTo:textReplyTo });
		socket.broadcast.emit('new_message', {avatar:socket.avatar, messageId:messageId,name:socket.name, message:message, isMe:false, textReplyTo:textReplyTo });
		
		// Transmet le message au module Daffy (on lui passe aussi l'objet "io" pour qu'il puisse envoyer des messages)
		daffy.handleDaffy(io, message);
		
		// Transmet le message au module YoutubeMini (on lui passe aussi l'objet "io" pour qu'il puisse envoyer des messages)
		youtubeMini.handleYoutubeMini(io, message);
		youtube.handleYoutube(io, message);
		meteo.handleMeteo(io, message);
		takover.handleTakover(io, message);
		
		// Récupère les infos de l'élève
		infosClasse.getStudentsInformations(io, message);

		// Récupère les anciens messages de l'utilisateur
		messagesHistory.addMessageToHistory(socket, fs, message);
        
		// Exécute les commandes du module Scribblio
		scribblio.scribblioCommands(io, message, socket);
		
		// Transmet le message au module Blague (on lui passe aussi l'objet "io" pour qu'il puisse envoyer des messages)
		blague.handleBlague(io, message);

		poll.handlePoll(io, message);
        
		// On initialise le compteur de like à 0 en fonction de l'id du message;
		messageLikeTable[messageId] = 0;
	});

	/* ------------- Module Picture par abjm-project ------------- */
		// Réception d'une image en base64
		socket.on('image', function(base64) 
		{
			// Envoie du message avec l'image à tous les utilisateurs
			io.sockets.emit('new_message', {name:socket.name, message:'<img src="'+base64+'" width="100%">', avatar:socket.avatar});
		})

		/* ------------- Module Avatar par abjm-project ------------- */
		// Réception d'un avatar
		socket.on('avatar', function(avatar) 
		{
			console.log("avatar");
			// Stocke l'avatar de l'utilisateur dans l'objet socket
			socket.avatar = avatar
		})
    
	// Reception de la demande d'autocompletion.
	tagUser.autoCompleteReceive(socket,io);
	
	// Réception suppression d'un message
	deleteMessage.deleteMessage(socket,io);
	// Réception modification d'un message
	deleteMessage.modifyMessage(socket,io);



	// Réception d'un ytChoice
	socket.on('ytChoice', function(message)
	{
		// Transmet le message à tous les utilisateurs (broadcast)
		let iframeYT = '<iframe width="450" height="255" src="https://www.youtube.com/embed/' + message + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
		io.sockets.emit('new_message', {name:socket.name, message:iframeYT});
	});

	// Réception du code Konami.
	socket.on("konami", function()
	{
		io.sockets.emit('all_konami');
	});
    
	// Gestion du wizz
	wizz.handleWizz(io, socket);
	
	// Réception d'un like
	socket.on('like', function(messageId) 
	{
		like.likeMessage(io, messageId, messageLikeTable)
	});

	// Réception d'un dislike
	socket.on('unlike', function(messageId) 
	{
		like.unLikeMessage(io, messageId, messageLikeTable)
	});
	
	// Réception la fin d'une partie et le score
	socket.on('aim-score', function(compteur)
	{
		aimGame.aimGame(io, compteur, socket.name);
	});

	// On receptionne le vote
	socket.on("vote", (index) => {
		
		// Si on vote pour un des résulats, on lui ajoute +1
		if (pollAnswer[index]) 
		{
			pollAnswer[index].votes += 1;
		}

		console.log(pollAnswer);
		
		// On actualise les résultats
		io.emit("update", pollAnswer);
	});
});

// Lance le serveur sur le port 8080 (http://localhost:8080)
server.listen(8080);
