/*
 * Nom : Like
 * Description : Ce module permet de liker et dislike un message
 * Auteur(s) : LANDEAU-COULAND
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	likeMessage: likeMessage, // permet d'appeler cette méthode dans server.js -> like.likeMessage(...)
    unLikeMessage: unLikeMessage, // permet d'appeler cette méthode dans server.js -> like.unLikeMessage(...)
}

/**
 * Action lorsqu'on like un message
 */
function likeMessage(io, messageId, nbLike)
{
    nbLike[messageId] ++ ;
	io.sockets.emit('update', {nbLike:nbLike[messageId], messageId});
}

/**
 * Action lorsqu'on dislike un message
 */
function unLikeMessage(io, messageId, nbLike)
{
    nbLike[messageId] -- ;
	io.sockets.emit('update', {nbLike:nbLike[messageId], messageId});
}