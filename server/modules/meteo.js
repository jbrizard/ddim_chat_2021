const axios = require('axios');

/*
 * Nom : Meteo
 * Description : Ce module qui sent le fromage pas fais donne la meteo a Dijon
 * Auteur(s) : Interlosers (Olivier & Yanis)
 */

// Définit les méthodes "publiques" (utilisation à l'extérieur du module)
module.exports =
{
	handleMeteo: handleMeteo
}

/**
 * Lorsqu'on appelle meteo, il renvoie une la meteo de Dijon...
 */
function handleMeteo(io, message)
{
	// Passe le message en minuscules (recherche insensible à la casse)
	messageMinified = message.toLowerCase();
	// Recupere le code de la video weatherstack.com
	var meteoSearch = message.substring("6");

	// Cle API weatherstack.com
	const meteoApiKey = '43f4a040328e73b419e3c0df6a317b49';


	// Current Weather API Endpoint
	//http://api.weatherstack.com/current
	//?access_key=meteoApiKey
	//&query=New York

	// optional parameters:
	//&units=m
	//&language=en
	//&callback=MY_CALLBACK

	if (messageMinified.startsWith('meteo:'))
	{
		axios.get('http://api.weatherstack.com/current?access_key=' + meteoApiKey + '&query=' + meteoSearch.toLowerCase())
		.then(response =>
		{
			var weather_descriptions = '';
			console.log(response.data.location.name);
			console.log(response.data.location.region);
			console.log(response.data.location.country);
			console.log(response.data.location.localtime);
			console.log(response.data.current.weather_icons[0]);
			console.log(response.data.current.weather_descriptions[0]);
			console.log(response.data.current.temperature + '°C');
			console.log(response.data.current.humidity + '% d\'humidité');
			console.log('----------------');

			switch (response.data.current.weather_descriptions[0].toLowerCase())
			{
				case 'sunny':
					weather_descriptions = 'Ensoleilé';
					break;
				case 'overcast':
					weather_descriptions = 'Couvert ';
					break;
				case 'fog':
					weather_descriptions = 'Brouillard';
					break;
				case 'cloudy':
					weather_descriptions = 'Nuageux';
					break;

				default:
					weather_descriptions = response.data.current.weather_descriptions[0];
					break;
			}

			var meteoReply = '';
			meteoReply +=
			`<div class="meteo-affichage">
				<div class="meteo-info">
					<p>`+ response.data.location.name +`, `+ response.data.location.region +`, `+ response.data.location.country +`</p>
					<p>Date et heure :  `+ response.data.location.localtime +`</p>
				</div>
				<div class="meteo-affichage-data">
					<p><img class="img-meteo" src="`+ response.data.current.weather_icons[0] +`" alt="icône metéo">&nbsp;&nbsp;&nbsp;`+ weather_descriptions +` </p>
					<p>`+ response.data.current.temperature +` °C </p>
					<p>`+ response.data.current.humidity +` % d\'humidité </p>
				</div>
			</div>`;
			console.log(meteoReply);

			io.sockets.emit('new_message',
			{
				name: 'Meteo',
				message: meteoReply
			});


		}).catch(error =>
		{
			console.log(error);
		});
	}

}