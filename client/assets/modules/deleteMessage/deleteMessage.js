/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer un de ces message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */

socket.on('receiveDeleteMessage',receiveDeleteMessage);

/**
 * affiche la popup avec les actions possible (suppression du message)
 */
function showPopUp(idMessage)
{

// créer la popup
$('.btn-setting-chat#'+idMessage+'').after(
    '<span class="menuBouton">'

        // bouton de suppression
        +'<button class="deleteBouton boutonSetting" onclick="deleteMessage('+idMessage+')" >'
            + '<i class="far fa-trash-alt"></i>' 
            + 'supprimer le message'
        +'</button>'

        // bouton fermeture de la popup
        +'<button class="modifyBouton boutonSetting" onclick="closePopUp()">'
            + '<i class="far fa-times-circle"></i>' 
            + 'fermez la popup'
        +'</button>'

    +'</span>')

    //disable les boutons pour ne pas ouvrir plusieur popup
    $(".btn-setting-chat").prop("disabled",true);

}


/**
 * envoie au serveur le demande de suppression du message 
 * @param {*} idMessage 
 */
function deleteMessage(idMessage)
{
    socket.emit('deleteMessage',idMessage);
    
    closePopUp();
}

/**
 * supprime le message pour tout le monde
 * @param {*} idMessage 
 */
function receiveDeleteMessage(idMessage)
{
    $('.message[data-id='+idMessage+']').remove();
}

/**
 * ferme la popup menubouton
 */
function closePopUp()
{
    $('.menuBouton').remove();

    $(".btn-setting-chat").prop("disabled",false);
}