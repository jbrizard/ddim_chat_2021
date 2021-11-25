/*
 * Nom : Historique des messages
 * Description : Ce module permet de restituer l'historique des messages de l'utilisateur
 * Auteur(s) : Nathan Coto & Antoine Rigot
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = {
    getMessagesHistory: getMessagesHistory, // permet d'appeler cette méthode dans server.js -> messagesHistory.getMessagesHistory(...)
    addMessageToHistory: addMessageToHistory // permet d'appeler cette méthode dans server.js -> messagesHistory.addMessageToHistory(...)
}

/**
 * Lorsqu'on appelle la fonction, elle renvoie tout les précédents messages de la session de l'utilisateur
 */
function getMessagesHistory(socket, fs)
{
    if(ifFileExists(fs))
    {
        // Récupération des anciens messages
        fs.readFile('./modules/messagesHistory.json', (err, data) =>
        {
            // Initialisation des données initiales
            let jsonData = JSON.parse(data);

            // Si le fichier json est au bon format
            if(jsonData.messages !== undefined)
            {
                // Envoi de chaque ancien message
                jsonData.messages.forEach((el) =>
                {
                    socket.emit('new_message', {name:el.auteur, message:el.message});
                }
                );
            }
            // Sinon créer le fichier json
            else
            {
                createJsonFile(fs);
            }
        }
        );
    }
}

/**
 * Lorsqu'on appelle la fonction, elle ajoute le message à l'historique
 */
function addMessageToHistory(socket, fs, message)
{
    if(ifFileExists(fs, newMessage))
    {
        // Récupération des données des anciens messages et du nouveau message
        var data = fs.readFileSync('./modules/messagesHistory.json');
        var jsonData = JSON.parse(data);
        var newMessage = {
            auteur: socket.name,
            message: message
        }

        // Si le fichier json est au bon format
        if(jsonData.messages !== undefined)
        {
            // Ajout du nouveau message
            jsonData.messages.push(newMessage);
        
            // Réécriture de l'ancien fichier
            fs.writeFile("./modules/messagesHistory.json", JSON.stringify(jsonData), (err) =>
            {
                if (err)
                  console.log(err);
                else
                {
                  console.log("Les données ont bien été ajoutées\n");
                }
            }
            );
        }
        // Sinon créer le fichier json et y ajouter le nouveau message
        else
        {
            createJsonFile(fs, newMessage);
        }
    }
}

/**
 * Lorsqu'on appelle la fonction, elle vérifie si le fichier json existe ou sinon, elle le crée
 */
function ifFileExists(fs, newMessage)
{
    // Si le fichier existe
    if(fs.existsSync('./modules/messagesHistory.json'))
    {
        return true;
    }
    // Sinon créer le fichier
    else
    {
        createJsonFile(fs, newMessage);

        return false;
    }
}

/**
 * Lorsqu'on appelle la fonction, elle crée le fichier json initial et ajoute le message envoyé si il y en a un
 */
function createJsonFile(fs, newMessage)
{
    var fileTemplate = {
        "messages": []
    }

    // Si un nouveau message est envoyé
    if (newMessage)
    {
        fileTemplate.messages.push(newMessage);
    }

    // Écriture du fichier json
    fs.writeFile("./modules/messagesHistory.json", JSON.stringify(fileTemplate), (err) =>
    {
        if (err)
          console.log(err);
        else
        {
          console.log("Les données ont bien été ajoutées\n");
        }
    }
    );
}