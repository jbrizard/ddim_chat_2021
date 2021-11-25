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

// Action quand on clique sur le bouton "Envoyer"
$('#send-message').click(sendMessage);

// Action quand on appuye sur la touche [Entrée] dans le champ de message (= comme Envoyer)
$('#message-input').keyup(function(evt)
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
	emojisPicker[0].emojioneArea.setText('');

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
	data.message = replaceEmoji(data.message);

	$('#chat #messages').append(
		'<div class="message">'
			+ '<span class="user">' + data.name  + '</span> ' 
			+ data.message 
	     + '</div>'
	)
	.scrollTop(function(){ return this.scrollHeight });  // scrolle en bas du conteneur
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