// Ecouteur evenment dans le DOM sur tout selecteur qui correspond a '.yt-choice'
$(document).on('click', '.yt-choice', onClickYoutubeLoad);

/**
 * Envoi d'un message special au serveur pour creer une video Youtube
 */
function onClickYoutubeLoad()
{
    let youtubeId = $(this).data('id');
    console.log(youtubeId);

    socket.emit('ytChoice', youtubeId);
}