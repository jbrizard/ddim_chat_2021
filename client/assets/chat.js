// Connexion au socket
var socket = io.connect(':8080');

// Défini les sons aléatoires du Wizz
const audio = new Audio("/modules/wizz/sounds/souffle.mp3");
const audio2 = new Audio("/modules/wizz/sounds/wizz-sound.mp3");
const audio3 = new Audio("/modules/wizz/sounds/toctoc.mp3");
const wizzSounds = [audio, audio2, audio3];

// Demande un pseudo et envoie l'info au serveur
var name = prompt('Quel est votre pseudo ?');
socket.emit('user_enter', name);

// Gestion des événements diffusés par le serveur
socket.on('new_message', receiveMessage);
socket.on('wizz', receiveWizz);
socket.on('update', updateMessage);
socket.on('tagged', receiveTagged);

// Action quand on clique sur le bouton "Envoyer"
$('#send-message').click(sendMessage);

// Action quand on clique sur le bouton "Coeur"
$(document).on('click', '.like-button', likeMessage);

// Action quand on appuye sur la touche [Entrée] dans le champ de message (= comme Envoyer)
$(document).on('keyup', '#message-input', function(evt)
{
	if (evt.keyCode == 13) // 13 = touche Entrée
		sendMessage();
});

// Action quand on clique sur le bouton "Wizz"
$('#send-wizz').click(sendWizz);

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
	socket.emit('message', message);
}


/**
 * Affichage d'un message reçu par le serveur
 */
function receiveMessage(data)
{
	//data.message = replaceEmoji(data.message);

	$('#chat #messages').append(
		'<div class="message'+ (data.isMe ? ' is-me' : '') + (isTagged ? ' tagged' : '') + '" data-id="'  + data.messageId + '">'
			+ '<div class="message-container">'
				+ '<span class="user">' + data.name  + '</span> ' 
				+ data.message 
			+ '</div>'	
			// Ajout du conteneur de like avec les unique ID
			+ '<div class="like-container">'
				+'<span id="like-count' + data.messageId + '" class="like-count"></span>'
				+'<div class="like-button">'
					+ '<svg aria-hidden="true" focusable="false" id="like-icon" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>'
				+'</div>'
			+ '</div>'
	    + '</div>'

	)
	.scrollTop(function(){ return this.scrollHeight });  // scrolle en bas du conteneur
	isTagged = false;
}

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
	$('#send-wizz').prop('disabled', true);
	setTimeout(function()
	{
		// Enlève la classe wizz afin de pouvoir la re-appliquer lors du prochain wizz
		$('#chat').removeClass('wizz')
		// Activation du bouton
		$('#send-wizz').prop('disabled', false);
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
