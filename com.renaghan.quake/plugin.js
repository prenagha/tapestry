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

  let rad;
  try {
    rad = parseFloat(radius);
  } catch (perr) {
    processError(perr);
    return;
  }
  if (lat < 0 || lat > 20000) {
    processError(new Error("Radius must in range 0 20,000"));
    return;
  }

  let mag;
  try {
    mag = parseFloat(magnitude);
  } catch (perr) {
    processError(perr);
    return;
  }
  if (mag < 0 || mag > 10) {
    processError(new Error("Magnitude must in range 0 10"));
    return;
  }
	
	// events in the last 5 days
	const since = new Date(Date.now() - 432000000).toISOString();
	
	const endpoint = site + "query?format=geojson"
	  + "&starttime=" + since
	  + "&latitude=" + lat
	  + "&longitude=" + lon
	  + "&maxradiuskm=" + rad
	  + "&minmagnitude=" + mag;
	
	console.log("Query URL " + endpoint);
	
	sendRequest(endpoint)
	.then((text) => {
		const jsonObject = JSON.parse(text);

		const features = jsonObject["features"];
		
		let results = [];
		for (const feature of features) {
			const properties = feature["properties"];
		  if (properties["type"] != "earthquake") continue;
		  
			const url = properties["url"];
			const date = new Date(properties["time"]);
			const text = properties["title"];
			
			const geometry = feature["geometry"];
			const coordinates = geometry["coordinates"];
			const qlat = coordinates[1];
			const qlon = coordinates[0];
						
			let item = Item.createWithUriDate(url, date);
			item.title = text;

			const mapsUrl = "https://maps.apple.com/?ll=" + qlat + "," + qlon + "&z=8";
			const content = "<p>" + text + " <a href=\"" + mapsUrl + "\">Map</a></p>"
			item.body = content;			
			results.push(item);
		}
		processResults(results);
	})
	.catch((requestError) => {
		processError(requestError);
	});
}