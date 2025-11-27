let settings = [
  {
    highlightUltra: true,
    highlightLegendary: true,
    highlightExotic: true,
    highlightEpic: false,
    highlightRare: false,
  }
]

document.addEventListener("keydown", (ev) => {
  if (ev.key == "k" && ev.ctrlKey) {
    ev.preventDefault();
    document.querySelector("div.search input").focus();
  }
});


document.addEventListener("keypress", (ev) => {
  if (ev.key == "=") {
    let now = new Date();

    const tryFindTime = () => {
      let hour = String(now.getHours()).padStart(2, "0");
      let min = String(now.getMinutes()).padStart(2, "0");
      let timeText = `${hour}:${min}`;

      console.log("trying:", timeText);

      let timeEl = [...document.querySelectorAll("p.time")].find(el => el.textContent.trim() === timeText);

      if (timeEl) {
        timeEl.closest(".flight").scrollIntoView({ behavior: "smooth", block: "center" });
        console.log("found!", timeEl);
      } else {
        now.setMinutes(now.getMinutes() + 1); // add 1 minute
        setTimeout(tryFindTime, 100); // wait 100ms and try again
      }
    };

    tryFindTime();
  }
});




function workData() {
  let flights = [];
  let lclFlightsSaved = localStorage.getItem("flightsSaved");
  let dateSaved = new Date(parseInt(lclFlightsSaved));
  let today = new Date();

  let totals = {
    total: 0,
    errors: 0,
    ultra: 0,
    legendary: 0,
    exotic: 0,
    epic: 0,
    rare: 0,
  }

  if (lclFlightsSaved && dateSaved.toDateString() === today.toDateString()) {
    let lclFlights = localStorage.getItem("flights");
    if (lclFlights) {
      flights = JSON.parse(lclFlights);
      displayOutput();
    } else {
      flights = [];
    }
  }
  // errors, ALL RARITIES IN ORDER FROM ULTRA TO RARE, total

  function handles() {
    let textarea = document.querySelector("div.popup.paste textarea");
    let overlayEl = document.querySelector("div.overlay");

    let pasteCancelButton = document.querySelector("div.popup.paste button.cancel");
    let pasteSaveButton = document.querySelector("div.popup.paste button.save");
    let pasteButton = document.querySelector("nav button.paste");
    let popupPasteEl = document.querySelector("div.popup.paste");

    let filtersButton = document.querySelector("nav button.filters");
    let popupFiltersEl = document.querySelector("div.popup.filters");

    let statsButton = document.querySelector("nav button.stats");
    let popupStatsEl = document.querySelector("div.popup.stats");

    pasteButton.addEventListener("click", () => {
      overlayEl.style.display = "flex";
      popupPasteEl.style.display = "flex";
      handleInput();
    })

    statsButton.addEventListener("click", () => {
      overlayEl.style.display = "flex";
      popupStatsEl.style.display = "flex";
      handleStats();
    })

    function handleInput() {
      textarea.focus();

      pasteCancelButton.addEventListener("click", () => {
        overlayEl.style.display = "none";
        popupPasteEl.style.display = "none";
      })

      pasteCancelButton.addEventListener("contextmenu", () => {
        event.preventDefault();
        overlayEl.style.display = "none";
        popupPasteEl.style.display = "none";
        textarea.value = "";
      })

      pasteSaveButton.addEventListener("click", () => {
        handlepasteSaveButton();
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
          handlepasteSaveButton();
        }
      })

      function handlepasteSaveButton() {
        if (textarea.value == "" || textarea.value == null) {
          textarea.focus();
        } else {
          overlayEl.style.display = "none";
          popupPasteEl.style.display = "none";
          handleData();
        }
      }
    }

    function handleSearch() {
      const searchInput = document.querySelector(".search input");
      searchInput.addEventListener("keydown", (ev) => {
        if (ev.key == "Enter") {
          const query = searchInput.value.toLowerCase();
          const allFlights = document.querySelectorAll(".flight");
      
          allFlights.forEach(flight => {
            const text = flight.innerText.toLowerCase();
            if (text.includes(query)) {
              flight.style.display = "flex";
            } else {
              flight.style.display = "none";
            }
          });
        } else if (ev.key == "Escape") {
          searchInput.blur();
        }
      });
    }

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

        if (airline == "undefined" || (!airline) || airline == "-") {
          airline = "Unknown";
        }

        if (aircraftType == "undefined" || (!aircraftType) || aircraftType == "" || aircraftType == null) {
          aircraftType = "Unknown";
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

    handleSearch();
  }

  function displayOutput() {
    let listEl = document.querySelector("section.main div.list");
    listEl.innerHTML = "";
    
    flights.forEach(flt => {
      let flightDiv = document.createElement("div");
      flightDiv.classList.add("flight");
      let flightPriority = determinePriority(flt);
      totals["total"]++;
      if (flightPriority == "error") {
        totals["errors"]++;
      } else if (!flightPriority == "") {
        totals[flightPriority]++;
      }

      let flightPriorityCaps = flightPriority.toUpperCase();
      if (flightPriority == "ultra") {
        flightPriorityCaps = "ULTRA-LEGENDARY";
      }

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

    localStorage.setItem("flights", JSON.stringify(flights));
    localStorage.setItem("flightsSaved", Date.now());
    flights = [];
    handleStats();
  }

  function handleStats() {
    let statsCloseButton = document.querySelector("div.popup.stats button.close");
    let statsErrorsCount = document.querySelector("div.popup.stats p.errors span.count");
    let statsTotalCount = document.querySelector("div.popup.stats p.total span.count");
    let statsUltraCount = document.querySelector("div.popup.stats p.ultra span.count");
    let statsLegendaryCount = document.querySelector("div.popup.stats p.legendary span.count");
    let statsExoticCount = document.querySelector("div.popup.stats p.exotic span.count");
    let statsEpicCount = document.querySelector("div.popup.stats p.epic span.count");
    let statsRareCount = document.querySelector("div.popup.stats p.rare span.count");

    statsErrorsCount.innerText = totals["errors"];
    statsTotalCount.innerText = totals["total"];
    statsUltraCount.innerText = totals["ultra"];
    statsLegendaryCount.innerText = totals["legendary"];
    statsExoticCount.innerText = totals["exotic"];
    statsEpicCount.innerText = totals["epic"];
    statsRareCount.innerText = totals["rare"];

    let statsErrorsPercentage = document.querySelector("div.popup.stats p.errors span.percentage");
    let statsUltraPercentage = document.querySelector("div.popup.stats p.ultra span.percentage");
    let statsLegendaryPercentage = document.querySelector("div.popup.stats p.legendary span.percentage");
    let statsExoticPercentage = document.querySelector("div.popup.stats p.exotic span.percentage");
    let statsEpicPercentage = document.querySelector("div.popup.stats p.epic span.percentage");
    let statsRarePercentage = document.querySelector("div.popup.stats p.rare span.percentage");
  
    statsErrorsPercentage.innerText = "(" + (totals["errors"] / totals["total"] * 100).toFixed(2) + "%)";
    statsUltraPercentage.innerText = "(" + (totals["ultra"] / totals["total"] * 100).toFixed(2) + "%)";
    statsLegendaryPercentage.innerText = "(" + (totals["legendary"] / totals["total"] * 100).toFixed(2) + "%)";
    statsExoticPercentage.innerText = "(" + (totals["exotic"] / totals["total"] * 100).toFixed(2) + "%)";
    statsEpicPercentage.innerText = "(" + (totals["epic"] / totals["total"] * 100).toFixed(2) + "%)";
    statsRarePercentage.innerText = "(" + (totals["rare"] / totals["total"] * 100).toFixed(2) + "%)";
    
    statsCloseButton.addEventListener("click", () => {
      let overlayEl = document.querySelector("div.overlay");
      let popupStatsEl = document.querySelector("div.popup.stats");
      overlayEl.style.display = "none";
      popupStatsEl.style.display = "none";
    })
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
      "28000": "ultra",
      "29000": "ultra",
    }
    
    const typeWhitelist = ["B738", "B737", "A320", "A20N", "B38M", "B39M", "A21N", "E75L", "CRJ2", "CRJ7", "B739", "A319", "SW4", "PC12", "E135", "A321", "E145", "BCS3", "LJ40", "CRJ9", "B190", "BE99", "GLF4", "BCS1", "LJ45", "J328", "SF50", "E120", "BE65", "E45X", "C560", "C68A", "CL60", "E55P", "BE40", "SWM", "ER4", "FRJ", "E170", "PL2", "CL30", "BE20",
      "E545", "LJ35", "CL35", "CR2", "7M9", "75V", "763", "73W", "E75S", "Unknown",
    ];

    const airlineWhitelist = [
      // "Southwest Airlines",
      "Southern Airways Express",
      "United Airlines",
      "Air Transport International",
      "UPS",
      "Suburban Air Freight",
      "FedEx",
      "United Express",
      "SkyWest Airlines",
      "Edelweiss Air",
      "Air France",
      "PlaneSense",
      "WestJet",
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
      "Aeroméxico",
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
      "Air Canada Jetz",
      "Lufthansa",
      "Contour Aviation",
      "United Express (SkyWest Livery)",
      "British Airways",
      "Aer Lingus",
      "Allegiant Air",
      "Sun Country Airlines",
      "Silverhawk Aviation",
      "NetJets",
      "Cayman Airways",
      "Viva",
      "Turkish Airlines",
      "Delta Connection",
      "Alaska SkyWest",
      "Unknown",
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
        "B763": 3,
        "A306": 2,
        "B772": 2,
        "B762": 3,
        "B764": 3,
        "B789": 2,
        "B78X": 3,
        "A332": 3,
        "A333": 3,
        "MD11": 4,
        "M11": 4,
      }

      if (typeList.hasOwnProperty(flight.aircraftType)) {
        inList[1] = typeList[flight.aircraftType];
      }
    }

    console.log(flight.airline);
    if (flight.airline.includes("	-")) {
      console.info("TRUE");
      flight.airline = flight.airline.replace("	-", "");
    }

    if (airlineWhitelist.includes(flight.airline)) {
      inList[2] = 1;
    } else {
      if ((flight.airline).startsWith("Frontier")) {
        inList[2] = 1;
      }

      const airlineList = {
        "Southwest Airlines (Triple Crown Livery)": 2,
        "Alaska Airlines (West Coast Wonders Livery)": 4,
        "Southwest Airlines (Freedom One Livery)": 4,
        "Southwest Airlines (Tennessee One Livery)": 3,
        "Southwest Airlines (Arizona One Livery)": 3,
        "Southwest Airlines (Maryland One Livery)": 3,
        "Southwest Airlines (Nevada One Livery)": 3,
        "Southwest Airlines (Missouri One Livery)": 3,
        "United Airlines (Retro Livery)": 2,
        "Southwest Airlines (Lone Star One Livery)": 3,
        "United Airlines (Together Sticker)": 2,
        "Southwest Airlines (Florida One Livery)": 3,
        "Southwest Airlines (California One Livery)": 3,
        "Air Canada (Vince Carter Livery)": 3,
        "American Airlines (Retro Livery)": 4,
        "United Airlines (Sustainable Aviation Fuel Livery)": 2,
        "Delta Air Lines (100 Years Livery)": 4,
        "United Airlines (Star Alliance Livery)": 3,
        "Southwest Airlines (Canyon Blue Retro Livery)": 2,
        "Southwest Airlines (Desert Gold Retro Livery)": 3,
        "Aeroméxico (Kukulcán Livery)": 4,
        "American Airlines (US Airways Retro Livery)": 2,
        "American Airlines (Flagship Valor Livery)": 2,
        "Icelandair (Aurora Borealis Livery)": 4,
        "National Airlines": 3,
        "Southwest Airlines (Imua One Livery)": 4,
        "JetBlue (JetBlue Vacations Livery)": 2,
        "Alaska Airlines (Disneyland - Pixar Pier Livery)": 4,
        "American Airlines (Stand up to Cancer Livery)": 2,
        "Southwest Airlines (Louisiana One Livery)": 3,
        "Copa Airlines (Star Alliance Livery)": 3,
      }

      if (airlineList.hasOwnProperty(flight.airline)) {
        inList[2] = airlineList[flight.airline];
      }
    }
    
    let maxRarity = Math.max(...inList);

    let toReturn;

    if (maxRarity == 6) {
      toReturn = "ultra";
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
      console.warn(flight.time, flight.flightNumber, inList);
    }

    return(toReturn);
  }

  handles();
}

workData();