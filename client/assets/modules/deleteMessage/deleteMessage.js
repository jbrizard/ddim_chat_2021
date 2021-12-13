/*
 * Nom : deleteMessage
 * Description : Ce module permet de supprimer un de ces message du chat
 * Auteur(s) : Matteo Nossereau / Mathias Genelot 
 */


socket.on("popupsetting",showPopUp);

/**
 * affiche la popup avec les actions possible
 */
function showPopUp()
{

$('#btn-chat').click(function(){
$('#btn-chat').before(
    '<span class="menuBouton">'
        +'<button class="deleteBouton">'
            +'<p> une carte </p>'    
        
        //mettre les svg
        +'</button>'
        +'<button class="modifyBouton">'
            //mettre les svg
        +'</button>'
    +'</span>'
)});

}