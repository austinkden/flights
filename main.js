let settings = [
  {
    highlightUltraLegendary: true,
    highlightLegendary: true,
    highlightExotic: true,
    highlightEpic: false,
    highlightRare: false,
  }
]

let flights = [];
let totals = [0, 0, 0, 0, 0, 0, 0]
// errors, ALL RARITIES IN ORDER FROM ULTRA LEGENDARY TO RARE, total

function handles() {
  let textarea = document.querySelector("div.popup.paste textarea");
  let cancelButton = document.querySelector("div.popup.paste button.cancel");
  let saveButton = document.querySelector("div.popup.paste button.save");
  let pasteButton = document.querySelector("nav button.paste");
  let overlayEl = document.querySelector("div.overlay");
  let popupPasteEl = document.querySelector("div.popup.paste");

  pasteButton.addEventListener("click", () => {
    overlayEl.style.display = "flex";
    popupPasteEl.style.display = "flex";
    handleInput();
  })

  function handleInput() {
    textarea.focus();

    cancelButton.addEventListener("click", () => {
      overlayEl.style.display = "none";
      popupPasteEl.style.display = "none";
    })

    cancelButton.addEventListener("contextmenu", () => {
      event.preventDefault();
      overlayEl.style.display = "none";
      popupPasteEl.style.display = "none";
      textarea.value = "";
    })

    saveButton.addEventListener("click", () => {
      handleSaveButton();
    })

    textarea.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        overlayEl.style.display = "none";
        popupPasteEl.style.display = "none";
      }
    })

    textarea.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        handleSaveButton();
      }
    })

    function handleSaveButton() {
      if (textarea.value == "" || textarea.value == null) {
        textarea.focus();
      } else {
        overlayEl.style.display = "none";
        popupPasteEl.style.display = "none";
        handleData();
      }
    }
  }

  // handleData() {}
  function handleData() {
    let input = textarea.value;
    textarea.value = "";
  
    let lines = input.trim().split('\n');
    flights = [];
  
    for (let i = 0; i < lines.length; i += 4) {
      let [time, flightNumber] = lines[i].trim().split(/\s+/);
  
      const airportLine = lines[i + 1]?.trim() || "";
      const airportMatch = airportLine.match(/^(.+)\s+\((\w{3})\)$/);
      const airport = airportMatch ? airportMatch[1] : null;
      const airportCode = airportMatch ? airportMatch[2] : null;
  
      const airlineLine = lines[i + 2]?.trim() || "";
      let airline = null;
      let aircraftType = null;
      let registration = null;
  
      const aircraftMatch = airlineLine.match(/^(.*?)(?:\s+([A-Z0-9]+)(?:\s*\((.*?)\))?)?$/);
      if (aircraftMatch) {
        airline = aircraftMatch[1]?.trim() || null;
        aircraftType = aircraftMatch[2]?.trim() || null;
        registration = aircraftMatch[3]?.trim() || null;
      }
  
      const status = lines[i + 3]?.trim() || "";

      if (registration == null) {
        registration = "Unknown";
      }

      if (flightNumber == "undefined" || (!flightNumber)) {
        flightNumber = "Unknown";
      }

      if (airline == "undefined" || (!airline)) {
        airline = "Unknown";
      }
  
      flights.push({
        time,
        flightNumber,
        airport,
        airportCode,
        airline,
        aircraftType,
        registration,
        status
      });
    }
  
    displayOutput();
  }
  
}

function displayOutput() {
  let listEl = document.querySelector("section.main div.list");
  listEl.innerHTML = "";
  
  flights.forEach(flt => {
    let flightDiv = document.createElement("div");
    flightDiv.classList.add("flight");
    let flightPriority = determinePriority(flt);

    let flightPriorityCaps = flightPriority.toUpperCase();

    flightDiv.innerHTML = `
      <div class="info">
        <div class="row">
          <div class="time-container">
            <p class="time">${flt.time}</p>
          </div>
          <div class="flight-number-container">
            <p class="flight-number">${flt.flightNumber}</p>
          </div>
          <div class="aircraft-type-container">
            <p class="aircraft-type">${flt.aircraftType} <span class="registration">(${flt.registration})</span></p>
          </div>
          <div class="incoming-airport-container">
            <p class="incoming-airport">${flt.airportCode} • ${flt.airport}</p>
          </div>
        </div>
        <div class="livery">
          <p>${flt.airline}</p>
        </div>
      </div>
      <div class="priority-container">
        <p class="priority ${flightPriority}">${flightPriorityCaps}</p>
      </div>
    `

    listEl.append(flightDiv);
  });

  flights = [];
}

function determinePriority(flight) {
  let inList = [1, 0, 0];
  // reg, type, liv
  // ultra = 6, leg = 5, exotic = 4, epic = 3, rare = 2, none = 1, error = 0
  // 6ultra: air force one, b2 spirit
  // 5leg: a380, dreamlifter, md11
  // 4exotic: special liveries, a340
  // 3epic: a350 a330, a300, a310, retro liveries, alliances
  // 2rare: 777, 787, 767

  const registrations = {
    "28000": "ultraLegendary",
    "29000": "ultraLegendary",
  }
  
  const typeWhitelist = ["B738", "B737", "A320", "A20N", "B38M", "B39M", "A21N", "E75L", "CRJ2", "CRJ7", "B739", "A319", "SW4", "PC12", "E135", "A321", "E145", "BCS3", "LJ40", "CRJ9", "B190", "BE99", "GLF4", "BCS1", "LJ45", "J328", "SF50", "E120", "BE65" ];

  const airlineWhitelist = [
    "Southwest Airlines",
    "United Airlines",
    "Air Transport International",
    "UPS",
    "FedEx",
    "United Express",
    "SkyWest Airlines",
    "Delta Connection",
    "American Airlines",
    "DHL",
    "Surf Air",
    "Key Lime Air",
    "Denver Air Connection",
    "Delta Air Lines",
    "SkyWest Charter",
    "Bemidji Aviation",
    "Flexjet",
    "Volaris",
    "Air Canada",
    "Delta Air Lines",
    "Alaska Airlines",
    "JetBlue",
    "Omni Air Transport",
    "Air Canada Express",
    "21 Air",
    "Alpine Air Express",
    "Amazon Air",
    "Icelandair",
    "Copa Airlines",
    "American Eagle",
    "Private owner",
    "Aeromexico",
    "-",
    "Air Canada Jetz",
    "Lufthansa",
    "Contour Aviation",
    "British Airways",
    "Aer Lingus",
  ]

  if (typeWhitelist.includes(flight.aircraftType)) {
    inList[1] = 1;
  } else {
    const typeList = {
      "A359": 3,
      "A35K": 3,
      "A388": 5,
      "A343": 4,
      "A346": 4,
      "B752": 2,
      "B753": 2,
      "B763": 2,
      "A306": 2,
      "B772": 2,
      "B762": 2,
      "B789": 2,
      "B78X": 3,
      "A332": 3,
    }

    if (typeList.hasOwnProperty(flight.aircraftType)) {
      inList[1] = typeList[flight.aircraftType];
    }
  }

  if (airlineWhitelist.includes(flight.airline)) {
    inList[2] = 1;
  } else {
    if ((flight.airline).startsWith("Frontier")) {
      inList[2] = 1;
    }

    const airlineList = {
      "Southwest Airlines (Triple Crown Livery)": 2,
      "Southwest Airlines (Freedom One Livery)": 4,
      "Southwest Airlines (Tennessee One Livery)": 4,
    }

    if (airlineList.hasOwnProperty(flight.airline)) {
      inList[2] = airlineList[flight.airline];
    }
  }







  let maxRarity = Math.max(...inList);

  let toReturn;

  if (maxRarity == 6) {
    toReturn = "ultraLegendary";
  } else if (maxRarity == 5) {
    toReturn = "legendary";
  } else if (maxRarity == 4) {
    toReturn = "exotic";
  } else if (maxRarity == 3) {
    toReturn = "epic";
  } else if (maxRarity == 2) {
    toReturn = "rare";
  } else if (maxRarity == 1) {
    toReturn = "";
  } else {
    toReturn = "error";
  }

  if (inList.includes(0)) {
    toReturn = "error";
  }

  return(toReturn);
}

handles();
