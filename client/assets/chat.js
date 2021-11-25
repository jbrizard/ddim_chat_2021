// Connexion au socket
var socket = io.connect('http://localhost:8080');

// Demande un pseudo et envoie l'info au serveur
var name = prompt('Quel est votre pseudo ?');
socket.emit('user_enter', name);

// Gestion des événements diffusés par le serveur
socket.on('new_message', receiveMessage);
socket.on('update', updateMessage);

// Action quand on clique sur le bouton "Envoyer"
$('#send-message').click(sendMessage);

// Action quand on clique sur le bouton "Coeur"
$(document).on('click', '.like-button', likeMessage);

// Action quand on appuye sur la touche [Entrée] dans le champ de message (= comme Envoyer)
$('#message-input').keyup(function(evt)
{
	if (evt.keyCode == 13) // 13 = touche Entrée
		sendMessage();
});

/**
 * Envoi d'un message au serveur
 */
function sendMessage()
{
	// Récupère le message, puis vide le champ texte
	var input = $('#message-input');
	var message = input.val();	
	input.val('');
	
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
	$('#chat #messages').append(
		'<div class="message" data-id="' + data.messageId + '">'
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
}

/**
 * Permet de liker un message 
 */
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