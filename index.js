var http = require("http");
var allMakesURL = "http://www.carqueryapi.com/api/0.3/?&cmd=getMakes";

// ---------------------
// Request data from the URL
// (working in Node, so using http.get)
// ---------------------
function makeRequest(url) {
  return new Promise(function (resolve, reject) {
    http.get(url, function(response) {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed to load, status code: " + response.statusCode));
      }
      var body = "";
      response.on("data", function(data) {
        body += data;
      });
      response.on("end", function() {
        resolve(JSON.parse(body));
      });
    })
    .on("error", function(error) {
      reject(error);
    });
  });
}

makeRequest(allMakesURL)
.then(function(response) {
  collateMakes(response["Makes"]);
}, function(err) {
  console.log(err);
});

// ---------------------
// Method to collate the data set
// into Country objects
// ---------------------
function collateMakes(data) {
  // Create array for collated data
  var sortedData = [];
  // Create array of countries
  var countries = [];
  // Loop through the array of objects
  for (var i = 0; i < data.length; i++) {
    // Create new country object
    var countryObj = {
      "country": "",
      "uncommon_makes": 0,
      "common_makes": 0
    };
    // Loop through each element's properties
    for (var key in data[i]) {
      // Check the country
      if (key === "make_country") {
        // If the country is in our array, update the com/uncom props
        if (checkDuplicate(countries, data[i][key])) {
          var idx = countries.indexOf(data[i][key]);
          if (data[i]["make_is_common"] === "1") {
            sortedData[idx]["common_makes"] += 1;
          }
          if (data[i]["make_is_common"] === "0") {
            sortedData[idx]["uncommon_makes"] += 1;
          }
        } else {
          // If it is a new country, push it to our countries array and make a new country object with values
          countries.push(data[i][key]);
          countryObj["country"] = data[i][key];
          if (data[i]["make_is_common"] === "1") {
            countryObj["common_makes"] += 1;
          }
          if (data[i]["make_is_common"] === "0") {
            countryObj["uncommon_makes"] += 1;
          }
          sortedData.push(countryObj);
        }
      }
    }
  }
  return sortedData;
}

// Pass in array and string and return true or false
// if the string is in the array or not
function checkDuplicate(arr, str) {
  var isInArray = false;
  if (arr.length > 0) {
    for (var i = 0; i < arr.length; i++) {
      if (str === arr[i]) {
        isInArray = true;
        break;
      }
    }
  }
  return isInArray;
}

// ------------------------
// Test the collate method using 
// sample data.
// ------------------------
var testMakes = {"Makes": [
  {
    "make_id": "armstrong-siddeley",
    "make_display": "Armstrong Siddeley",
    "make_is_common": "0",
    "make_country": "UK"
  },
  {
    "make_id": "ascari",
    "make_display": "Ascari",
    "make_is_common": "0",
    "make_country": "UK"
  },
  {"make_id": "aston-martin",
    "make_display": "Aston Martin",
    "make_is_common": "1",
    "make_country": "UK"
  },
  {
    "make_id": "austin",
    "make_display": "Austin",
    "make_is_common": "0",
    "make_country": "UK"
  },
  {
    "make_id": "austin-healey",
    "make_display": "Austin-Healey",
    "make_is_common": "0",
    "make_country": "UK"
  }
]};

var testCollate = [
  {
    "country": "UK",
    "uncommon_makes": 4,
    "common_makes": 1
  }
];

function testCollateMakes(data1, data2) {
  var theSame = false;
  var collated = collateMakes(data1);
  var toTest = data2;

  // Loop through the data objects array
  // Compare the objects as strings to determine equality
  if (collated.length === toTest.length) {
    for (var i = 0; i < collated.length; i++) {
      if (JSON.stringify(collated[i]) === JSON.stringify(toTest[i])) {
        theSame = true;
      }
    }
  }
  return theSame;
}

testCollateMakes(testMakes["Makes"], testCollate);
