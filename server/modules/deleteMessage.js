/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer un de ces message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */

module.exports =  {
    deleteMessage: deleteMessage,
    modifyMessage: modifyMessage, 
}
/**
 * supprime le message 
 * @param {*} io 
 * @param {*} message 
 */
function deleteMessage(socket,io)
{
    // envoie la demande de suppréssion demandé par l'utilisateur
    socket.on('deleteMessage', function(idMessage)
    {
       io.sockets.emit('receiveDeleteMessage', idMessage);
    });

}

/**
 * modifie le message
 * @param {*} socket 
 * @param {*} io 
 */
function modifyMessage(socket,io)
{
    // on recoit la modification demander par l'utilisateur
    socket.on('modifyMessage', function(data)
    {
       // envoie la modification a tout les client 
       io.sockets.emit('receiveModifyMessage',{idMessage : data.idMessage, inputText :data.inputText});

    });

}
