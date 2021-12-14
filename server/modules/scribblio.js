/*
 * Nom : Scribblio
 * Description : Une partie de dessin multijoueur
 * Auteur(s) : Nathan COTO & Antoine RIGOT
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	init:init,
	addClient: addClient,
	scribblioCommands: scribblioCommands
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
 * Fonction appelée 100 fois par secondes :
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
			othersUserParams.push(
			{
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

/**
 * Exécute les actions associées aux différentes commandes
 */
function scribblioCommands(io, message, socket)
{
    let params = message.split(' ');

    // Si la commande commence par /draw
    if (params[0] == '/draw')
    {
		let html = '';
		// Initialise la partie
		if (params[1] == 'start')
		{
			startGame(io, html);
		}
		// Rejoindre une équipe
		else if(params[1] == 'team1' || params[1] == 'team2')
		{
			joinTeam(io, html, params[1], socket);
		}
		// Définir le mot à trouver
		else if(params[1] == 'word')
		{
			setWord(io, html, params[2], socket);
		}
		// Démarrer la partie
		else if(params[1] == 'play')
		{
			playGame(io, html, socket);
		}
		// Trouver le mot
		else if(params[1] == 'find')
		{
			findWord(io, html, params[2], socket);
		}
		// Redémarrer la partie
		else if(params[1] == 'restart')
		{
			restartGame(io, html, socket);
		}
		// Aide sur l'utilisation du module
		else if(params[1] == 'help')
		{
			returnHelpInformations(io, html);
		}
		// Aide sur l'utilisation du module
		else
		{
			returnHelpInformations(io, html);
		}
	}
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie les informations sur la commande /draw
 */
function returnHelpInformations(io, html)
{
	// Génération du code à renvoyer
	html = '<span class="infos">';
	html += 'Bienvenue sur le jeu Draw !<br>';
	html += 'Le jeu se déroule avec deux équipes de minimum deux joueurs. <br>';
	html += 'Pour débuter une partie : /draw start<br>';
	html += 'Le reste des informations vous sera alors indiqué';
	html += '</span>';

	// Envoi du message
	io.sockets.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});
}

/**
 * Lorsqu'on appelle la fonction, elle initialise la partie
 */
function startGame(io, html)
{
	// Génération du code à renvoyer
	html = '<span class="infos">';
	html += 'Bienvenue sur le jeu Draw !<br>';
	html += 'Le jeu se déroule avec deux équipes de minimum deux joueurs. <br>';
	html += 'Pour débuter une partie : /draw start<br>';
	html += 'Il vous faut ensuite choisir votre équipe <br>';
	html += '&nbsp;&nbsp;Pour rejoindre l\'équipe n°1 : /draw team1<br>';
	html += '&nbsp;&nbsp;Pour rejoindre l\'équipe n°2 : /draw team2<br>';
	html += 'L\'Equipe n°1 doit choisi le mot qu\'elle souhaite faire deviner : /draw word <mot choisi><br>';
	html += 'Au démarrage de la partie,<br>';
	html += 'L\'Equipe n°2 devra trouver le mot : /draw find <mot choisi><br>';
	html += 'Pour lancer la partie : /draw play';
	html += '</span>';

	// Envoi du message
	io.sockets.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});
}

/**
 * Lorsqu'on appelle la fonction, elle fait rejoindre une équipe
 */
let team1Members = [];
let team2Members = [];

function joinTeam(io, html, team, socket)
{
	if(team == 'team1')
	{
		// Ajoute le joueur à l'équipe 1
		if(team1Members.length < 2)
		{
			if(team2Members.includes(socket.name))
			{
				// Si le joueur faisait déjà parti d'une équipe, alors on le retire de cette équipe
				team2Members.splice(team2Members.indexOf(socket.name), 1);
			}
			team1Members.push(socket.name);
			
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Vous avez rejoint l\'équipe n°1<br>';
			html += 'Votre équipe doit choisir le mot qu\'elle souhaite faire deviner : /draw word <mot choisi>';
			html += '</span>';
		}
		else
		{
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Erreur !<br>';
			html += 'L\'équipe 1 est déjà complète.';
			html += '</span>';
		}
	}
	else if(team == 'team2')
	{
		// Ajoute le joueur à l'équipe 2
		if(team2Members.length < 2)
		{
			if(team1Members.includes(socket.name))
			{
				// Si le joueur faisait déjà parti d'une équipe, alors on le retire de cette équipe
				team1Members.splice(team1Members.indexOf(socket.name), 1);
			}
			team2Members.push(socket.name);
			
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Vous avez rejoint l\'équipe n°2<br>';
			html += 'Votre équipe devra trouver le mot avec la commande : /draw find <mot>';
			html += '</span>';
		}
		else
		{
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Erreur !<br>';
			html += 'L\'équipe 2 est déjà complète.';
			html += '</span>';
		}
	}

	// Envoi du message
	socket.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});
}

/**
 * Lorsqu'on appelle la fonction, elle initialise le mot à trouver
 */
let wordToFind = '';
function setWord(io, html, word, socket)
{
	if(team1Members.includes(socket.name))
	{
		wordToFind = word;

		// Génération du code à renvoyer
		html = '<span class="infos">';
		html += 'Vous avez choisi le mot à faire deviner<br>';
		html += 'A vos crayons !';
		html += '</span>';
	}
	else
	{
		// Génération du code à renvoyer
		html = '<span class="infos">';
		html += 'Erreur !<br>';
		html += 'Veuillez rejoindre l\'équipe 1 pour pouvoir définir un mot';
		html += '</span>';
	}
	
	// Envoi du message
	socket.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});

	// Transmission à chaque client du début de la partie
	for (var i in sockets)
	{
		var socket = sockets[i];

		if(!(team1Members.includes(socket.name)))
		{
			socket.emit('scribblio_hide_word',
			{
				wordToFind: wordToFind		// mot à faire deviner
			});
		}
	}
}

/**
 * Lorsqu'on appelle la fonction, elle démarre la partie
 */
function playGame(io, html, socket)
{
	if(wordToFind !== '') {
		if(team1Members.length >= 1 && team2Members.length >= 1)
		{
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Début de la partie !<br>';
			html += 'Bonne chance !';
			html += '</span>';

			// Transmission à chaque client du début de la partie
			for (var i in sockets)
			{
				var socket = sockets[i];

				if(team1Members.includes(socket.name))
				{
					socket.emit('scribblio_start_draw',
					{
						wordToFind: wordToFind		// mot à faire deviner
					});
				}
				else if(team2Members.includes(socket.name))
				{
					socket.emit('scribblio_start_find');
				}
			}
		}
		else
		{
			// Génération du code à renvoyer
			html = '<span class="infos">';
			html += 'Impossible de lancer la partie.<br>';
			html += 'Une des deux équipes ne dispose pas d\'assez de joueurs !';
			html += '</span>';
		}
	}
	else
	{
		// Génération du code à renvoyer
		html = '<span class="infos">';
		html += 'Impossible de lancer la partie.<br>';
		html += 'Veuillez définir un mot à trouver avec la commande /draw word <mot choisi>';
		html += '</span>';
	}

	// Envoi du message
	socket.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});
}

/**
 * Lorsqu'on appelle la fonction, elle vérifie si le mot est trouvé
 */
function findWord(io, html, word, socket)
{
	// Si bonne réponse
	if(word == wordToFind)
	{
		// Reset de la partie
		team1Members = [];
		team2Members = [];
		wordToFind = '';

		// Génération du code à renvoyer
		html = '<span class="infos">';
		html += 'Bravo ! <br>';
		html += 'Le mot a été trouvé !<br>';
		html += 'Pour rejouer : /draw start';
		html += '</span>';

		// Envoi du message
		io.sockets.emit('new_message',
		{
			name: 'Draw Bot',
			message: html
		});

		// Transmission à chaque client du début de la partie
		for (var i in sockets)
		{
			var socket = sockets[i];
			
			socket.emit('scribblio_end_game');
		}
	}
	// Si mauvaise réponse
	else
	{
		// Génération du code à renvoyer
		html = '<span class="infos">';
		html += 'Mauvaise réponse ! Ce n\'est pas le mot recherché !';
		html += '</span>';

		// Envoi du message
		socket.emit('new_message',
		{
			name: 'Draw Bot',
			message: html
		});
	}
}

/**
 * Lorsqu'on appelle la fonction, elle relance la partie
 */
function restartGame(io, html, socket)
{
	// Reset de la partie
	team1Members = [];
	team2Members = [];
	wordToFind = '';

	// Génération du code à renvoyer
	html = '<span class="infos">';
	html += 'Restart de la partie en cours...<br>';
	html += 'La partie est relancée !<br>';
	html += 'Pour rejouer : /draw start';
	html += '</span>';

	// Envoi du message
	io.sockets.emit('new_message',
	{
		name: 'Draw Bot',
		message: html
	});

	// Transmission à chaque client du début de la partie
	for (var i in sockets)
	{
		var socket = sockets[i];
		
		socket.emit('scribblio_end_game');
	}
}