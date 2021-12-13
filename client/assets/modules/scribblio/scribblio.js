// Crée le canvas et l'ajoute au body
var canvas = document.createElement('canvas');
canvas.id = 'scribblioCanvas';
$('#scribblio').append(canvas);

var resized = false;

document.body.style.margin = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';

// Events pour agrandir / réduire le module
$('#scribblioContainer').click(function()
	{
		if (!($('#scribblioContainer').hasClass('active')))
		{
			$('#scribblioContainer, .scribblioControls, .scribblioInfos').addClass('active');
			if (resized === false)
			{
				resized = true;
				setTimeout(() => {
					resize();
				}, 500);
			}
		}
	}
);

$('#scribblioClose').click(function()
	{
		$('#scribblioContainer, .scribblioControls, .scribblioInfos').removeClass('active');
		if (resized === false)
		{
			setTimeout(() => {
				resize();
			}, 500);
		}
	}
);

// Contexte du canvas + application de la bonne taille
var ctx = canvas.getContext('2d');
resize();

window.addEventListener('resize', resize);

/**
 * Méthode appelée lorsque la fenêtre est redimensionnée
 */
function resize()
{
    ctx.canvas.width = $(canvas)[0].offsetWidth;
    ctx.canvas.height = $(canvas)[0].offsetHeight;
}

// Initialisation des variables
var userParams = {x:0, y:0};

// Events liés au canvas
$('#scribblioContainer').on('mousemove', mouseMove);

// Désactivation de l'action du clic droit sur le canvas
$('#scribblioContainer').on('contextmenu', function(e) {
	return false;
});

// Gestion des événements diffusés par le serveur
socket.on('scribblio_move', onScribblioMove);
socket.on('scribblio_refresh_users', refreshUsers);

/**
 * Méthode appelée lorsque la souris bouge
 */
function mouseMove(e)
{
	if($('#scribblioContainer').hasClass('active'))
	{
		var rightClickPressed = false;
		var leftClickPressed = false;
	
		// Si clic gauche détecté
		if (e.buttons == 1)
		{
			leftClickPressed = true;
			rightClickPressed = false;
		}
		// Si clic droit détecté
		else if (e.buttons == 2)
		{
			leftClickPressed = false;
			rightClickPressed = true;
		}
	
		// Informations de l'utilisateur
		userParams = {
			x: e.offsetX,
			y: e.offsetY,
			rightClickPressed: rightClickPressed,
			leftClickPressed: leftClickPressed,
			brushSize: $('#brushSize').val()
		}
	}
}

// Lance la boucle FPS
setInterval(onEnterFrame, 10);

/**
 * Méthode FPS : appelée x fois par secondes pour envoyer la position de la souris
 */
function onEnterFrame()
{
	// envoi un événement au serveur en transmettant la position de la souris
	socket.emit('mouseInteraction', userParams);
}

/**
 * Méthode appelée lorsque le serveur met à jour la position de la souris
 */
function onScribblioMove(data)
{
	for (var i in data.othersuserParams)
	{
		var mp = data.othersuserParams[i];
		// Si un des deux clics est détecté
		if(mp.userParams.rightClickPressed == true || mp.userParams.leftClickPressed == true)
		{
			draw(mp);
		}
	}
}

/**
 * Méthode appelée lorsqu'un utilisateur dessine ou efface
 */
function draw(mp)
{
	var color;
	if(mp.userParams.leftClickPressed == true)
	{
		// Couleur de l'utilisateur
		color = mp.color;
	}
	else if(mp.userParams.rightClickPressed == true)
	{
		// Gomme le dessin
		color = '#ffffff';
	}

	// Initialisation du trait
	ctx.beginPath();
	
	// Style du trait
	ctx.lineWidth = mp.userParams.brushSize;
	ctx.lineCap = 'round';
	ctx.strokeStyle = color;

	// Coordonnées du trait
	ctx.moveTo(mp.userParams.x, mp.userParams.y);
	ctx.lineTo(mp.userParams.x, mp.userParams.y);

	// Application du trait
	ctx.stroke();
}

/**
 * Méthode appelée lorsque le serveur met à jour la liste des utilisateurs
 */
function refreshUsers(data)
{
	$('.playerList').empty();

	for (var i in data.users)
	{
		var user = data.users[i];
		$('.playerList').append('<p style="color: '+user.color+'">'+user.name+'</p>');
	}
}