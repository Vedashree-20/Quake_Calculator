function createMap(id) {
  let mapDiv = document.getElementById("map_" + id);
  let lat = parseFloat(mapDiv.dataset.lat);
  let long = parseFloat(mapDiv.dataset.long);
  let map = L.map("map_" + id).setView([lat, long], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add a marker at the given latitude and longitude
  L.marker([lat, long]).addTo(map);
}

function popupFn(id) {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popupModule").style.display = "block";
  let popUpModule = document.querySelector("#popupModule");
  let moreDetails = "";

  for (let i = 0; i < MORE_DETAILS.length; i++) {
    if (id === MORE_DETAILS[i].id) {
      moreDetails = `<div class="additional-details">
      <div id="map_${id}" data-lat= ${MORE_DETAILS[i].coordinates.Latitude}  data-long="${MORE_DETAILS[i].coordinates.Longitude}" style="height: 200px; width:100%;"></div><svg class="cancel-icon" onclick="closePopupFn()" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#454545" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 5L5 19M5 5l14 14" color="#454545"/></svg><h3>${MORE_DETAILS[i].title} </h3><p><span class="keywords">Place: </span>${MORE_DETAILS[i].place}</p><p> <span class="keywords">Magnitude: </span>${MORE_DETAILS[i].agnitude}</p>
                                <p> <span class="keywords">Magnitude: </span>${MORE_DETAILS[i].magnitude}</p>
                                <p> <span class="keywords">Coordinates:</span>${MORE_DETAILS[i].coordinates.Latitude}, ${MORE_DETAILS[i].coordinates.Longitude}</p>
                                 <p> <span class="keywords">Number of Stations: </span>${MORE_DETAILS[i].stations}</p>
                                 </div>`;
    }
  }
  popUpModule.innerHTML = moreDetails;
  createMap(id);
}

function closePopupFn() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popupModule").style.display = "none";
}

function changeColor(magnitude) {
  let color = "";
  if (magnitude < 3.0) {
    color = "green";
  } else if (magnitude >= 3.0 && magnitude < 6.0) {
    color = "orange"; // 3 and 6; yellow
    //<3 green
  } else if (magnitude >= 6.0) {
    color = "red"; // 3 and 6; yellow
    //<3 green
  }
  return color;
}

function formatTime(time) {
  let DateFormat = new Date(time);
  let day = DateFormat.getDate();
  let month = DateFormat.toLocaleString("en-US", { month: "long" }); // September
  let year = DateFormat.getFullYear();
  let newDateFormat = `${month} ${day}, ${year}`;
  let timeWithTimeZone = DateFormat.toLocaleTimeString("en-US", {
    timeZoneName: "short", // Abbreviated time zone
  });
  return [newDateFormat, timeWithTimeZone];
}

function displayEarthquakeData(startDate, endDate, limit) {
  fetchEarthquakeData(startDate, endDate, limit).then((response) => {
    let earthquakeInfo = response.data.features;
    let resultElement = document.querySelector("#results");
    let detail = "";
    //let moreDetails = "";
    console.log(earthquakeInfo);
    if (earthquakeInfo.length === 0) {
      detail = `
    <div class="result-list"> 
        <h2>No results found </h2>
    </div> `;
    } else {
      for (let i = 0; i < earthquakeInfo.length; i++) {
        let id = i + 1;
        let place = earthquakeInfo[i].properties.place;
        let time = earthquakeInfo[i].properties.time;
        let magnitude = earthquakeInfo[i].properties.mag;
        let coordinaties = earthquakeInfo[i].geometry.coordinates;
        let lat = coordinaties[1];
        let long = coordinaties[0];
        magnitude = magnitude.toFixed(2);
        let formatedTime = formatTime(time);
        let colorClass = changeColor(magnitude);
        let earthquakeTitle = earthquakeInfo[i].properties.title;
        let numberOfStations = earthquakeInfo[i].properties.nst;

        let detailsObj = {
          id: id,
          coordinates: { Latitude: lat, Longitude: long },
          title: earthquakeTitle,
          place: place,
          magnitude: magnitude,
          stations: numberOfStations,
        };
        MORE_DETAILS.push(detailsObj);
        detail += `<div class="result-list"> 
                     <div class="magnitude">
                     <h2 class="${colorClass}">${magnitude} </h2><span>Magnitude</span>
                     </div> 
                     <div class="details"><p><span class="keywords">Place: </span>${place} </p><p><span class="keywords">Date: </span>${formatedTime[0]}</p><p> <span class="keywords">Time: </span>${formatedTime[1]}</p>
                    <p> <a class="learn-more" onclick="popupFn(${id})">View details</a>
                    </div>
                 </div>`;
      }
    }
    resultElement.innerHTML = detail;
  });
}

function fetchEarthquakeData(startDate, endDate, limit) {
  let apiUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&limit=${limit}`;
  return axios.get(apiUrl).then(function (response) {
    return response;
  });
}

//
function formatDate(event) {
  event.preventDefault();
  let startDateElement = document.querySelector("#start-date").value;
  console.log(startDateElement);
  let endDateElement = document.querySelector("#end-date").value;
  console.log(endDateElement);
  let numberListElement = document.querySelector("#list-size").value;
  let numberList = +numberListElement;
  console.log(numberList);
  if (
    (!startDateElement && !endDateElement) ||
    !startDateElement ||
    !endDateElement
  ) {
    alert("Please enter start date and end date!");
  } else {
    displayEarthquakeData(startDateElement, endDateElement, numberList);
  }
}

let formElement = document.querySelector("#date-form");
formElement.addEventListener("submit", formatDate);
let MORE_DETAILS = [];

let currentDate = new Date();
let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
let endDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
);

function sortTopEqarthquakes(data) {
  let dataList = [];
  let widgetElement = document.querySelector(".widget-list");
  let top5list = "";
  let loading = document.querySelector("#widget-list-loading");
  for (let i = 0; i < data.features.length; i++) {
    let properties = {
      magnitude: data.features[i].properties.mag,
      place: data.features[i].properties.title,
      time: data.features[i].properties.time,
    };
    dataList.push(properties);
  }
  let result = dataList.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
  for (let i = 0; i < result.length; i++) {
    let magnitude_1 = result[i].magnitude;
    let colormagnitude = changeColor(magnitude_1);
    let place_1 = result[i].place;
    let time_1 = formatTime(result[i].time);
    top5list += `<div class="top5list"> 
                     <div class="widget-magnitude">
                     <h2 class="${colormagnitude} widget-magnitude">${magnitude_1} </h2><span class="widget-magnitude-keyword">Magnitude</span>
                     </div> 
                     <div class="widget-details"><p><span class="widget-place">${place_1}</span></p><span class="time-widget">${time_1[0]}</span> <span class="time-widget">${time_1[1]} </span>
                    </div>
                 </div>`;
  }

  setTimeout(() => {
    loading.classList.add("hide");
    widgetElement.innerHTML = top5list;
  }, 2000);
}

function displayTopEarthquakes() {
  let startDateStr = startDate.toLocaleDateString();
  let endDateStr = endDate.toLocaleDateString();
  console.log(startDateStr);
  console.log(endDateStr);
  fetchEarthquakeData(startDateStr, endDateStr, "").then((response) => {
    console.log(response.data);
    sortTopEqarthquakes(response.data);
  });
}

displayTopEarthquakes();
