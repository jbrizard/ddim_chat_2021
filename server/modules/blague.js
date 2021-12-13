/*
 * Nom : BlagueBot
 * Description : Ce module permet d'envoyer des blagues
 * Auteur(s) : LANDEAU-COULAND
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =  {
	handleBlague: handleBlague // permet d'appeler cette méthode dans server.js -> blague.handleDaffy(...)
}

// On stock nos blagues dans un tableau
let blagues = [
    {
        id: 1,
        blague : "Quelle est la fée la plus méchante ?",
        reponse : "-> La fée C",
    },
    {
        id: 2,
        blague : "Quelle est la devise des chats diaboliques ?",
        reponse : "-> Satan est par minou.",
    },
    {
        id: 3,
        blague : "Pourquoi les sorcières ne portent-elles jamais de culottes ?",
        reponse : "-> Pour avoir une meilleure adhérence avec le balai...",
    },
    {
        id: 4,
        blague : "Quel est le comble pour un porte-charge ? ",
        reponse : "-> C'est de mal se porter.",
    },
    {
        id: 5,
        blague : "Quel est le comble pour une orange ? ",
        reponse : "-> Être toujours pressée.",
    },
    {
        id: 6,
        blague : "Chuck Norris mine de la crypto-monnaie...",
        reponse : "-> avec la calculette de sa montre Casio",
    },
    {
        id: 7,
        blague : "Qu'est-ce qu'une manifestation d'aveugles ?",
        reponse : "-> Le festival de Cannes.",
    },
    {
        id: 8,
        blague : "Quelle est la capitale de l'île de Tamalou ? ",
        reponse : "-> Gébobola !",
    },
    {
        id: 9,
        blague : "Une personne appelle la police pour leur dire que deux filles se battaient pour lui. La police lui demande donc quel est le problème ?",
        reponse : "-> Le garçon répond : C'est la moche qui gagne !",
    },
    {
        id: 10,
        blague : "Pourquoi les développeurs doivent-ils suivre une formation incendie ? ",
        reponse : "-> À cause des pare-feux.",
    },
]

let blaguesLenght = blagues.length;

/**
 * Lorsqu'on appelle blague, el bot repond répond...
 */
function handleBlague(io, message)
{
	// Passe le message en minuscules (recherche insensible à la casse)
	message = message.toLowerCase();
	
	// Est-ce qu'il contient une référence au mot "blague" ?
	if (message.includes(':blague'))
	{
        // On recupere un entier entre et la longueur du tableau inclu
        function getRandomInt(max) 
        {
            return Math.floor(Math.random() * max);
        }

        // On stock une blague, récupérée aléatoirement grâce à la fonction précédente...
        let randomBlague = blagues[getRandomInt(blaguesLenght)];

		// envoie la blague...
		io.sockets.emit('new_message',
		{
			name:'BlagueBot',
			message: '<br>' + '<span class="blague">' + randomBlague.blague + '</span>' + '<br>' + '<span class="hide">' + randomBlague.reponse + '</span>'
		});
	}
}