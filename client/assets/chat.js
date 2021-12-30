// Connexion au socket
var socket = io.connect(':8080');

// Défini les sons aléatoires du Wizz
const audio = new Audio("/modules/wizz/sounds/souffle.mp3");
const audio2 = new Audio("/modules/wizz/sounds/wizz-sound.mp3");
const audio3 = new Audio("/modules/wizz/sounds/toctoc.mp3");
const wizzSounds = [audio, audio2, audio3];

// Défini les variables pour le module répondre à
var userReplyTo, textReplyTo;

// Demande un pseudo et envoie l'info au serveur
var name = prompt('Quel est votre pseudo ?');
socket.emit('user_enter', name);
$('#userName').html(name);

// Gestion des événements diffusés par le serveur
socket.on('new_message', receiveMessage);
socket.on('wizz', receiveWizz);
socket.on('update', updateMessage);
socket.on('tagged', receiveTagged);
socket.on('count', updateMessage);


// Action quand on clique sur le bouton "Mode sombre"
$('#dark-toggle').click(darkModeToggle);

// Action quand on clique sur le bouton "Envoyer"
$('#send-message').click(sendMessage);

// Action quand on clique sur le bouton "Coeur"
$(document).on('click', '.like-button', likeMessage);
$(document).on('click', '.btn-answer-to', showUserReplyingTo);

// Action quand on clique sur la reponse
$(document).on('click', '.hide', displayBlague);

// Action quand on clique sur le bouton start aim game
$(document).on('click', '.start-aim-game', displayAimGame);

// Action quand on clique sur start game
$(document).on('click', '.start-game', startAimGame);

// Action quand on clique sur la première cible
$(document).on('click', '.first-cible', addCible);

// Action quand on clique sur une cible
$(document).on('click', '#cible', addCible);

// Action quand on clique sur fermer
$(document).on('click', '.fermer-aim-game', removeAimeGame);

// Action quand on appuye sur la touche [Entrée] dans le champ de message (= comme Envoyer)
$(document).on('keyup', '#message-input', function(evt)
{
	if (evt.keyCode == 13) // 13 = touche Entrée
		sendMessage();
});

// Action quand on clique sur le bouton "Wizz"
$('.send-wizz').click(sendWizz);

function darkModeToggle()
{
	document.getElementById('body').classList.toggle('dark')
}

/**
 * Envoi d'un message au serveur
 */
function sendMessage()
{
	// Récupère le message, puis vide le champ texte
	var input = $('#message-input');
	var message = input.val();
	input.val('');

	//Vide le champ de texte après avoir ajouté un emoji
	//emojisPicker[0].emojioneArea.setText('');

	// On n'envoie pas un message vide
	if (message == '')
		return;
	
	// Envoi le message au serveur pour broadcast
	socket.emit('message', message, textReplyTo);

	// Appelle dans le module replyTo la fonction pour vider les champs
	emptyReplyTo();

	// Réinitialise les valeurs locales du message auquel on répond
	textReplyTo = '';
	userReplyTo = '';
}


/**
 * Affichage d'un message reçu par le serveur
 */
function receiveMessage(data)
{
	var btnModifyAndDelete ='';
	// permet que seule l'envoyer puisse modifier et supprimer son message
	if(data.isMe){
		btnModifyAndDelete =  '<button class="btn-setting-chat" id="'+data.messageId+'"  onclick="showPopUp('+data.messageId+')">'
		+ '<i class="fas fa-ellipsis-v"></i>'
	+ '</button>';
	} 
	
	// Défini et regarde si on répond à un message ou non
	var answeredMessage;

	if(data.textReplyTo != null)
		answeredMessage = '<div class="replied-text">' + data.textReplyTo + '</div>';
	else
		answeredMessage = '';
		
	//data.message = replaceEmoji(data.message);
	$('#chat #messages').append(
		answeredMessage
		+ 
		'<div class="message'+(isTagged ? ' tagged' : '')  + (data.isMe ? ' is-me' : '') + '" data-id="'  + data.messageId + '">'
				// Affichage de l'avatar
				+ '<div class="avatar-container">'
					+ '<img class="avatar" src="' + data.avatar +'">'
				+ '</div>'	
				+ btnModifyAndDelete
				+ '<div class="message-container">'
					+ '<p class="user">' + data.name  + '</p> '
					+ '<div class="les-messages">'
						+ '<span class="message-text">' + data.message  + '</span>'
					+ '</div>'     
				+ '</div>'	
			// Ajout du conteneur de like avec les unique ID
			+ '<div class="like-container">'
				+'<span id="like-count' + data.messageId + '" class="like-count"></span>'
				+'<div class="like-button">'
					+ '<img src="./images/thumbs-up.png"/>'
				+'</div>'
			+ '</div>'
			// Ajout du conteneur qui apparait au hover permettant de répondre au message
			// + (!data.isMe ?
			// 	'<div id="answer-to">'
			// 		+'<input type="button" class="btn-answer-to"><i class="fas fa-reply"></i></input>'
			// 	+'</div>'
			// 	: '')
		+ '</div>'

	)
	
	.scrollTop(function(){ return this.scrollHeight });  // scrolle en bas du conteneur

	isTagged = false;
}

/**
 * Attribue a lié à chaque client, permet de savoir s'il est tag ou non
 */
var isTagged = false;

function receiveTagged(tagged){
	isTagged = tagged;
}
/**
 * Envoi d'un wizz au serveur
 */
function sendWizz()
{
	// Envoi le wizz au serveur pour broadcast
    socket.emit('wizz_message');
};

/**
 * Application du wizz sur la fenêtre du chat
 */
function receiveWizz()
{
	// Ajout de la classe wizz contenant l'animation de tremblement
	$('#chat').addClass('wizz');

	// Joue un son aléatoire parmi le tableau wizzSounds
	var soundIndex = Math.floor(Math.random() * wizzSounds.length);
	wizzSounds[soundIndex].play();

	//Désactive le bouton pour éviter le spam
	$('.send-wizz').prop('disabled', true);
	setTimeout(function()
	{
		// Enlève la classe wizz afin de pouvoir la re-appliquer lors du prochain wizz
		$('#chat').removeClass('wizz')
		// Activation du bouton
		$('.send-wizz').prop('disabled', false);
	}, 500)
}

function likeMessage()
{
	// Changement de couleur du btn like
	$(this).toggleClass('like');
	
	// Récupération de l'id unique d'un message
	let messageId = $(this).closest(".message").data("id");
	
	// Vérifie si l'élément à la class "like" ou non
	if ($(this).hasClass('like'))
	{
		socket.emit('like', messageId);
	}
	else 
	{
		socket.emit('unlike', messageId);
	}
};

/**
 * Permet d'afficher et de mettre à jour le nombre de like'
 */
function updateMessage(data) 
{
	// Affiche le nombre de like d'un message en fonction de l'id
	$('#like-count' + data.messageId).text(data.nbLike);

	// Si le compteur est à 0, on remplace par une chaine de caractere vide
	if ($('#like-count' + data.messageId).text() == "0")
	{
		$('#like-count' + data.messageId).text('');
	}
}

/**
 * Permet d'afficher la réponse de la blague
 */
function displayBlague() 
{
	// Toggle la class permettant d'afficher la reponse
	$(this).toggleClass('display');
}

// Initialisation des variables
let compteur = 0;
let temps;
const timer = $(".timer");
/**
 * Permet d'afficher le jeu d'aim
 */
 function displayAimGame() 
 {
	$('.time-code').remove();

	// le timer ira de 15 a 0
	temps = 15;

	$('.start-game').removeClass('remove-start');

	$(".aim-game").toggleClass('display-aim-game');

	timer.append(
		'<div class="time-code">' + temps + '<div>'
	)
 }

 /**
 * Fait apparaitre le timer du jeu
*/	
function startTimer() 
{
	// Gestion du timer
	let interval = setInterval(() => {
		if(temps > -1) {
			$('.time-code').text(temps);
			temps--;
		} else {
			clearInterval(interval);
		}
	}, 1000);
}

  /**
 * Fait apparaitre le compteur du jeu
*/	
function startCompteur() 
{
	$('.compteur').append(
	'<div class="count">' + compteur + '<div>'
	)
}

 /**
 * Permet d'afficher la premiere cible
 */
 function startAimGame() 
 {
	$('.start-game').addClass('remove-start');

	$('.cibles-container').append(
		 '<div class="first-cible"><div>'
	)


	startCompteur();	
	startTimer();

	// A la fin du temps imparti, le jeu s'arrete
	setTimeout(() => {
		endGame();
	}, 17000);
}

/**
 * Fait pop des cibles random
*/	
function addCible() 
{
	// A chaque cible cliqué, on ajoute 1 au compteur
	compteur+=1;
	$('.count').text(compteur);
	var cibleSize = $('#cible').height();

	// On calcule la taille de la fenetre de jeu - la cible
	var aimWidth = $('.cibles-container').width()  - (cibleSize);
 	var aimHeight = $('.cibles-container').height() - (cibleSize);

	// Quand une cible est cliqué on la retire
	$(this).remove();

	// Calcule de la position de la prochaine cible
    let currentWidth = (Math.floor(Math.random() * aimWidth));
    let currentHeight = (Math.floor(Math.random() * aimHeight));

	// Création de la nouvelle cible
	$('.cibles-container').append(
		'<div id="cible"><div>'
	)
	
	// Positionnement de la cible selon la position definie au prealable
	document.getElementById('cible').style.top = currentHeight + "px";
	document.getElementById('cible').style.left = currentWidth + "px";
}

/**
 * Termine le jeu et remet à 0 les compteurs
*/
function endGame()
{
	$('.aim-game').append(
		'<div class="modal-end"> Votre score est de ' + compteur + 
		'<button class="fermer-aim-game"> Fermer </button>'
		+ '<div>'
	)
	
	// Réinitialisation des parametres
	$('#cible').remove();
	$('.count').remove();
	$('.time-code').remove();

	// Envoi le score au serveur pour broadcast
	socket.emit('aim-score', compteur);
}

/**
 * Quittte la fenetre de jeu
*/
function removeAimeGame() {
	$(".aim-game").toggleClass('display-aim-game');

	$('.modal-end').remove();

	compteur = 0;
}

// Affiche au client local l'utilisateur auquel il répond, et défini les variables qui seront envoyées au serveur
function showUserReplyingTo()
{
	// Récupération de l'utilisateur auquel on répond
	userReplyTo = $(this).closest('.message').find('.message-container .user').text();

	// Récupération du message auquel on répond
	textReplyTo = $(this).closest('.message').find('.message-container').text();

	// On retire l'utilisateur du texte afin de garder seulement le message
	messageReplyTo = textReplyTo.replace(userReplyTo + ' ', '');

	// Appel de la fonction montrant au client à qui il va répondre
	displayAnsweredMessage(userReplyTo);
}

function displayAnsweredMessage(messageReplyTo)
{
    $('#replyToText').text('Répondre à ' + messageReplyTo);
}

function emptyReplyTo()
{
    $('#replyToText').text('');
}

/**
 * Redirection vers les modules
*/

$('.drawModuleButton').click(() => redirectToModule('draw'));
$('.youtubeModuleButton').click(() => redirectToModule('youtube'));
// $('#picModuleButton').click(() => redirectToModule('pic'));
$('.infosClasseModuleButton').click(() => redirectToModule('infosClasse'));
$('.blagueModuleButton').click(() => redirectToModule('blague'));
$('.meteoModuleButton').click(() => redirectToModule('meteo'));

function redirectToModule(module) {
	switch (module) {
		case 'draw':
			socket.emit('event_scribblio_start_game');
			break;
		case 'youtube':
			$('#message-input').val('yt:');
			$('#message-input').focus();
			break;
		case 'infosClasse':
			socket.emit('event_infosClasse_help');
			break;
		case 'blague':
			socket.emit('event_blague_start');
			break;
		case 'meteo':
			let input = document.getElementById('message-input');
			$(input).val('meteo:VilleARechercher');
			$(input).focus();
			input.setSelectionRange(6, input.value.length);
			break;
		default:
			break;
	}
}