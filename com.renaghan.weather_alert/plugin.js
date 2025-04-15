
const NEWLINES = /\r\n|\r|\n/g;
const DATE_OPTS = {
  weekday: "short",
  month:   "short",
  day:     "numeric"
};
const TIME_OPTS = {
  hour:    "numeric",
  minute:  "2-digit"
};
const TIME_OPTS_ZERO_MIN = {
  hour:    "numeric"
};

function formatDate(dt) {
  return new Intl.DateTimeFormat(undefined, DATE_OPTS).format(dt);
}

function formatTime(dt) {
  const opts = dt.getMinutes() == 0 ? TIME_OPTS_ZERO_MIN : TIME_OPTS;
  return new Intl.DateTimeFormat(undefined, opts).format(dt);
}

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
  if (lon < -180 || lon > 180) {
    processError(new Error("Latitude must in range -180 180"));
    return;
  }

	const endpoint = "https://api.weather.gov/alerts/active"
	  + "?point=" + encodeURIComponent(lat) + "," + encodeURIComponent(lon);
	
	console.log("Query URL " + endpoint);
	
	sendRequest(endpoint)
	.then((text) => {
		const jsonObject = JSON.parse(text);

		const features = jsonObject["features"];
		
		
		let results = [];
		for (const feature of features) {
			const properties = feature["properties"];
		  if (properties["@type"] != "wx:Alert") continue;
		  if (properties["status"] == "Test") continue;
		  
		  const id = properties["id"]
			const start = new Date(properties["effective"]);
			const end   = new Date(properties["ends"]);
			const title = properties["event"];
			const desc = properties["description"].replace(NEWLINES, "<br>");
			
			let when = "";
      if (start.getDate() == end.getDate()
       && start.getMonth() == end.getMonth()
       && start.getFullYear() == end.getFullYear()) {
       // shorter format if same day
         when = formatDate(start)
           + "<br>"
           + formatTime(start)
           + " → "
           + formatTime(end);
      } else {
         when = formatDate(start)
           + " "
           + formatTime(start)
           + " →<br>"
           + formatDate(end)
           + " "
           + formatTime(end);
      }

			const body = "<p><strong>" + when + "</strong></p>" 
			  + "<p>" + desc + "</p>";
	    const itemUrl = "https://forecast.weather.gov/MapClick.php"
	      + "?lat=" + encodeURIComponent(lat) 
	      + "&lon=" + encodeURIComponent(lon)
	      + "&tapestryId=" + encodeURIComponent(id);

			let item = Item.createWithUriDate(itemUrl, start);
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