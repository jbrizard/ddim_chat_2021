/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer un de ces message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */

module.exports =  {
    deleteMessage: deleteMessage,
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
