'use strict';
// STORE
const STORE = {
  state: 'MAIN',
  stateNumber: 0,
  brewList: {},
  stateCodes: {
    AK: "Alaska",
    AL: "Alabama",
    AR: "Arkansas",
    AZ:	"Arizona",
    CA:	"California",
    CO:	"Colorado",
    CT:	"Connecticut",
    DC: "Washington DC",
    DE:	"Delaware",
    FL:	"Florida",
    GA:	"Georgia",
    GU:	"Guam",
    HI:	"Hawaii",
    IA:	"Iowa",
    ID:	"Idaho",
    IL:	"Illinois",
    IN:	"Indiana",
    KS:	"Kansas",
    KY:	"Kentucky",
    LA:	"Louisiana",
    MA:	"Massachusetts",
    MD:	"Maryland",
    ME:	"Maine",
    MI:	"Michigan",
    MN:	"Minnesota",
    MO:	"Missouri",
    MS:	"Mississippi",
    MT:	"Montana",
    NC:	"North Carolina",
    ND:	"North Dakota",
    NE:	"Nebraska",
    NH:	"New Hampshire",
    NJ:	"New Jersey",
    NM:	"New Mexico",
    NV:	"Nevada",
    NY:	"New York",
    OH:	"Ohio",
    OK:	"Oklahoma",
    OR:	"Oregon",
    PA:	"Pennsylvania",
    PR:	"Puerto Rico",
    RI:	"Rhode Island",
    SC:	"South Carolina",
    SD:	"South Dakota",
    TN:	"Tennessee",
    TX:	"Texas",
    UT:	"Utah",
    VA:	"Virginia",
    VI:	"Virgin Islands",
    VT:	"Vermont",
    WA:	"Washington",
    WI:	"Wisconsin",
    WV:	"West Virginia",
    WY:	"Wyoming"
  }
}

// URLs
const MAPBOX_URL = 'https://api.mapbox.com/';
// KEYS
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';

// OPEN BREWERY
function convertAbbrev(input) {
  if (input.length === 2) {
    return STORE.stateCodes[input.toUpperCase()];
  }
  else {
    return input;
  }
}

function formatQuery(parameters) {
  //takes parameter keys and makes an array out of them
  const queryItems = Object.keys(parameters)
  //loops through our array and creates a new array made up of strings (encoded for use in url) with the format "key=value"
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
  //returns the array object as a single string with & in between each
    return queryItems.join('&');
}

function getBarsFromOB(cityQ, stateQ, limitQ=10) {
  const baseURL = 'https://api.openbrewerydb.org/breweries';
  const params = {
    by_city: cityQ,
    by_state: stateQ,
    per_page: limitQ,
    sort: "city"
  };

  //sets queryString variable as the full string of every parameter joined together
  const queryString = formatQuery(params)
  const url = baseURL + '?' + queryString;

  console.log(url);

  fetch(url)
  .then(response => {
    if (response.ok) {
      STORE.state = "RESULTS";
      return response.json();
    }
    throw new Error(response.statusText)
  })
  .then(responseJson => { 
    determineView(STORE.state, responseJson)})
  .catch(err => {
    STORE.state = "BAD RESULTS";
    determineView(STORE.state, err)
  })
}

function buildMap(startBar) {
  mapboxgl.accessToken = MAPBOX_API_KEY;
  let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: startBar,
  zoom: 13,
});
  map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken
  }), 'top-left');
}

/* DON'T NEED?
function getDirections(latLon1, latLon2) {
  let coordinate1 = formatCoordinates(latLon1);
  let coordinate2 = formatCoordinates(latLon2);
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinate1}%3B${coordinate2}.json?access_token=${MAPBOX_API_KEY}`
  fetch(url)
    .then(res => res.json())
    .then(resJson =>
      console.log(resJson))
    .catch(e => console.log(e));
} 

// HELPER FUNCTION
function formatCoordinates(coordinatePair) {
  // Takes object of lat and lon { lat: lon }
  const lat = Object.keys(coordinatePair);
  const lon = coordinatePair[lat];
  return `${lat}%2C${lon}`
}*/

// EVENT LISTENERS
function watchForm() {
  $('.searchForm').on('submit', function(e){
    e.preventDefault();
    let cityInput = $(this).find('input[name="mainSearch"]').val();
    let stateInput = convertAbbrev($(this).find('input[name="stateSearch"]').val());
    let zipcodeInput = $(this).find('input[name="zipSearch"]').val();
    let limitInput = $(this).find('input[name="resultsNumber"]').val();
    let radiusInput = $(this).find('input[name="proximitySearch"]').val();
    getBarsFromOB(cityInput, stateInput, limitInput);
    $('.listSubmit').show();
    // getMapData();
  })
}

function watchModifiers() {
  $('#modifiers').on('click', function(e) {
    e.preventDefault();
  })
}

function watchADVSearch() {
  $('.searchForm').on('click', '#advSearchToggle', function(e) {
    e.preventDefault();
    $('.advSearchOptions').slideToggle('slow');
    // let coord1 = {'-73.989': 40.733};
    // let coord2 = {'-74': 40.733};
    // getDirections(coord1, coord2);
    // -73.989%2C40.733%3B-74%2C40.733
  });
}

function watchList() {
  $('.reultsForm').on('submit', function(e){
    for (i=0, i <= brewResults.length, i++) {
      brewList[$(this).find(`input[name="numberList${i}"]`).val()] = brewResults[i];
    }
  }

function submitForDirections() {
  $('.mapData').submit(function(e) {
    e.preventDefault();
  })
  // get list of breweries
  // .submit( call map.setOrigin(firstBrewery)
  // , setWaypoint(...subsequentBreweries), 
  // and setDestination(lastBrewery))
}


// VIEW HANDLERS
function determineView(state, res) {
  if (state === 'MAIN') {
    return buildMainView();
  } else if (state === 'RESULTS') {
    return buildResultsView(res);
  } else if (state === 'BAD RESULT') {
    return buildBadResults(res);
  }
}

function buildMainView() {
  $('.resultsList').html('');
  $('.map').html('');
}

function buildResultsView(res) {
  const bars = res;
  $('.resultsList').html('');
  $('.map').html('');
  let resultView = [];
  for(let i = 0; i < bars.length; i++) {
    resultView.push(`
      <input type="text" id="numberList${i}" name="numberList${i}">
      <li class="barCardItem"><h3 class="barTitle barLink">
        <a href="${bars[i].website_url}">${bars[i].name}</a>
      </h3>
      <p class="barAddress">${bars[i].street}</p>
      <p class="barAddress">${bars[i].city}, ${bars[i].state}, ${bars[i].postal_code}</p>
      <p class="barPhone">${bars[i].phone}</p>
      </li>
      `);
  }

  resultView.join('');
  $('.resultsList').html(resultView);
  $('.map').html(buildMap());
}

function buildBadResults(res) {
  $('.resultsList').html('');
  $('.map').html('');
  let view = `<h2>We've experienced an error</h2>
  <p>${res.message}</p>`;
  $('.resultList').html(view);
}

// PAGE READY LISTENER
$(function() {
  watchForm();
  watchADVSearch();
})