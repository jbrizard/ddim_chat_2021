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
var like = require('./modules/like.js');
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
	socket.avatar = "http://image.noelshack.com/fichiers/2021/39/6/1633185839-gi-hun2.png";
	// Ajoute le client au jeu de basket
	// basket.addClient(socket);
	socket.emit('new_message', {avatar:socket.avatar, messageId:'moi', name:'moi', message:'Salut !', isMe:false });
	// // Récupère les anciens messages de l'utilisateur
	// messagesHistory.getMessagesHistory(socket, fs);
	
	// Arrivée d'un utilisateur
	socket.on('user_enter', function(name)
	{
		console.log(name);
		// Stocke le nom de l'utilisateur dans l'objet socket
		socket.name = name;

		// Ajoute le client au scribblio
		scribblio.addClient(socket);
	});

	// Réception d'un message
	socket.on('message', function(message, textReplyTo)
	{
		console.log(message);
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
