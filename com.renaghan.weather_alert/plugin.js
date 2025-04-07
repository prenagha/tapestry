var lastUpdate = null;

function load() {
  let lat;
  try {
    lat = parseFloat(latitude);
  } catch (perr) {
    processError(perr);
    return;
  }
  if (lat < -90 || lat > 90) {
    processError(new Error("Latitude must in range -90 90"));
    return;
  }

  let lon;
  try {
    lon = parseFloat(longitude);
  } catch (perr) {
    processError(perr);
    return;
  }
  if (lat < -180 || lat > 180) {
    processError(new Error("Latitude must in range -180 180"));
    return;
  }

	const endpoint = "https://api.weather.gov/alerts/active"
	  + "?point=" + lat + "," + lon;
	
	console.log("Query URL " + endpoint);

	
	sendRequest(endpoint)
	.then((text) => {
		const jsonObject = JSON.parse(text);

		const features = jsonObject["features"];
		
		
		let results = [];
		for (const feature of features) {
			const properties = feature["properties"];
		  if (properties["@type"] != "wx:Alert") continue;
		  
		  const id = properties["id"]
			const date = new Date(properties["sent"]);
			const title = properties["event"];
			const body = "<p><strong>" + properties["headline"] + "</strong></p><p>" 
			  + properties["description"].replace("\n","<br>") + "</p>";
	    const itemUrl = "https://forecast.weather.gov/MapClick.php"
	      + "?lat=" + lat + "&lon=" + lon
	      + "&tapestryId=" + id;

			let item = Item.createWithUriDate(itemUrl, date);
			item.title = title;
			item.body = body;			
			results.push(item);
		}
		processResults(results);
	})
	.catch((requestError) => {
		processError(requestError);
	});
}