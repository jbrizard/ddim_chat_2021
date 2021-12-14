/*
 * Nom : Poll !
 * Description : Ce module permet de créer des sondages
 * Auteur(s) : lucas-johann
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports = {
    handlePoll: handlePoll // permet d'appeler cette méthode dans server.js -> daffy.handlePoll(...)
}


function handlePoll(io, message) {
    
    // Si le message commence par "?poll" on execute la commande.
    if (message.startsWith('?poll')) {
        
        // On récupère le texte après le 6eme caractère 
        const args = message.slice(6);

        // Si la commande ne contient pas d'argument alors on renvoit un message d'erreur
        if (!args) 
        {
            io.sockets.emit('new_message', 
            {
                name: 'Poll',
                message: `<span style="color: red; font-weight: bold;">Aucune question n'a été posé.</span>`
            });
        } 
        else 
        {
            io.sockets.emit('new_message', 
            {
                name: 'Poll',
                message: `
                <div class="poll">
                    <div class="question">` + args + `</div>
                    <div class="answers">
                        <div onclick="vote(0)" class="answer" id="1">Oui</div>
                        <div onclick="vote(1)" class="answer" id="2">Non</div>
                    </div>
                    <hr/>
                    <div class="answers">
                        <div class="flex-box">
                            <span id="counter-label-yes">Aucun Vote</span>
                            <span id="counter-label-no">Aucun Vote</span>
                        </div>
                    </div>
                </div>`
            });
        }
    }
}