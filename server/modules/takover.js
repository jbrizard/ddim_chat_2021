/*
 * Nom : Takover
 * Description : Suspense
 * Auteur(s) : Interlosers (Olivier & Yanis)
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = { handleTakover: handleTakover }

/**
 * .......
 */
function handleTakover(io, message)
{
    // Passe le message en minuscules (recherche insensible à la casse)
    messageMinified = message.toLowerCase();

    if (messageMinified.startsWith('@jbrizard'))
    {
        console.log(messageMinified);
        // Salut c'est moi Jeremie !
        io.sockets.emit('new_message',
        {
            name: 'White Rabbit',
            message: '<img style="width: 355px;" src="https://atelier-pangram.fr/wp-content/uploads/2021/09/j.png">'
        });
    }
}