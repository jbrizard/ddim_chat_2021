/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer un de ces message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */

module.exports =  {

}
/**
 * supprime le message 
 * @param {*} io 
 * @param {*} message 
 */
function deleteMessage(io,message)
{
    if(message)
    {
        message.delete();
    }
}

