// Chargement dependances
var search = require('youtube-search');

/*
 * Nom : Youtube
 * Description : Ce module de la mort integre une recherche de video youtube
 * Auteur(s) : Interlosers (Olivier & Yanis)
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = { handleYoutube: handleYoutube }

/**
 * Lorsqu'on appelle youtube, il renvoie une liste de video...
 */
function handleYoutube(io, message)
{
    // Passe le message en minuscules (recherche insensible à la casse)
    messageMinified = message.toLowerCase();
    // Recupere le code de la video Youtube
    var youtubeSearch = message.substring("3");

    // Cle API Youtube
    const ytApiKey = 'AIzaSyB01svjOPmEwl-gwCWEqSXhGWE2JxhN20E';

    var options =
    {
        maxResults: 5,
        key: ytApiKey
    };

    if (messageMinified.startsWith('yt:'))
    {
        search(youtubeSearch, options, function(err, results)
        {
            if (err)
            {
                // et on affiche un message a glandu qui demqnde de la merde
                io.sockets.emit('new_message',
                {
                    name: 'Youtube',
                    message: 'Ta recherche et pue la défaite.'
                });

                // on console.log l'erreur
                return console.log(err);
            }

            var list = '<ul class="list-ytb">';
            results.forEach(result =>
            {
                //console.log(result);
                list +=
                    `<li class="ytb-text">
						<button class="yt-choice" data-id="` + result['id'] + `"type="button">` +
                    result['title'].substring(0, 30) +
                    `</button>
					</li>`;
                console.log(list);
            });
            list += '</ul>';

            io.sockets.emit('new_message',
            {
                name: 'Youtube',
                message: list
            });
        });
    }
}