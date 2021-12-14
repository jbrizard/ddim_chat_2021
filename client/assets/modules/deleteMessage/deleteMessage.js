/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer et de mdofié un seulement ces
 *              propre message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */

socket.on('receiveDeleteMessage',receiveDeleteMessage);
socket.on('receiveModifyMessage',receiveModifyMessage);

// fait que l'on click en dehors de la popup ferme la popup
$(document).on('click', onClickDocument);

/**
 * envoi au serveur le texte modifier et le valide
 */
$(document).on('keyup', '#modifiy-text', function(evt)
{
    if (evt.keyCode == 13) // 13 = touche Entrée
        modifyText();
});

var idMessage ;
var messageText;

/**
 * affiche la popup avec les actions possible
 */

function showPopUp(idMessage)
{
    this.idMessage = idMessage;


$('.menuBouton').remove();

$(".btn-setting-chat").prop("disabled",true);

// créer la popup
$('.btn-setting-chat#'+idMessage+'').after(
    '<span class="menuBouton">'

        //bouton suppression message
        +'<button class="deleteBouton boutonSetting" onclick="deleteMessage('+idMessage+')" >'
            + '<i class="far fa-trash-alt"></i>' 
            + 'supprimer le message'
        +'</button>'

        // bouton modification message
        +'<button class="modifyBouton boutonSetting" onclick="modifyMessage('+idMessage+')">'
            + '<i class="fas fa-edit"></i>' 
            + 'modifier le message'
        +'</button>'

    +'</span>')

}

/**
 * envoie un message au serveyr pour delete le message
 * @param {*} idMessage 
 */
function deleteMessage(idMessage)
{
    socket.emit('deleteMessage',idMessage);

    $('.menuBouton').remove();
}
/**
 * supprime le message
 * @param {*} idMessage 
 */
function receiveDeleteMessage(idMessage)
{
    $('.message[data-id='+idMessage+']').remove();
}

/**
 * remplace le span message-text par un input
 * @param {*} idMessage 
 */
function modifyMessage(idMessage)
{
    messageText = $('.message[data-id='+idMessage+'] .message-text');

    messageText.replaceWith('<input type="text" id="modifiy-text" value="' + messageText.text() + '" />');

}

/**
 * modifie le text par le texte à l'intérieur de l'input et l'envoie au serveur
 */
function modifyText()
{
    var input = $('#modifiy-text');

    var message = input.val();
    var inputText = message;

    $("#modifiy-text").replaceWith(messageText);

    socket.emit('modifyMessage',{idMessage : this.idMessage, inputText : inputText});
}

/**
 * affcihe pour tout le monde le texte modifier
 * @param {*} data 
 */
function receiveModifyMessage(data)
{
   $('.message[data-id='+data.idMessage+'] .message-text').text(data.inputText);
}

/**
 * fermez la popUp au click outside popup
 * @param {*} evt 
 */
 function onClickDocument(evt)
 {
     if (!$(evt.target).is('.menuBouton') && !$(evt.target).closest('.menuBouton').length > 0
          && $('.menuBouton').length > 0 && !$(evt.target).is('.btn-setting-chat'))
             closePopUp();
 }
/**
 * ferme la popup menubouton
 */
 function closePopUp()
 {
     $('.menuBouton').remove();
 
     $(".btn-setting-chat").prop("disabled",false);
 }
 