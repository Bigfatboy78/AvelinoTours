export function setupStateCityDropdowns(citiesByCountry, states) {
  document.getElementById('arrivalState').addEventListener('change', () => {
    updateCityOptions('arrivalState', 'arrivalCity', citiesByCountry, states);
  });

  document.getElementById('departState').addEventListener('change', () => {
    updateCityOptions('departState', 'departCity', citiesByCountry, states);
  });
}

export function calculatePrice(pricingTable, pricingInfo) {
  console.log("Running calculatePrice...");
  const basePrice = getFare(pricingTable);
  const priceOutput = document.getElementById("priceOutput");
  const tripType = document.querySelector('input[name="tripType"]:checked').value;

  let oneWayCost = 0;
  let elementName;
  pricingInfo.forEach(ageRange => {
    switch(ageRange.ticket_id){
      case "child":
        elementName = "numKids";
        break;
      case "elderly":
        elementName = "numElderly";
        break;
      default:
        elementName = "numAdults";
    }
    oneWayCost += parseInt(document.getElementById(elementName).value) * (100 - ageRange.price_reduction_percentage)/100 || 0;
  });


  if (basePrice !== null && oneWayCost > 0) {
      const total = basePrice * (tripType === "roundTrip" ? 2 : 1) * oneWayCost;
      priceOutput.textContent = `$${total.toFixed(2)}`;
  } else {
      priceOutput.textContent = "N/A";
  }
}

export function setupCityChangeHandlers(schedule, onCitiesSelected) {
  const departCitySelect = document.getElementById('departCity');
  const arrivalCitySelect = document.getElementById('arrivalCity');

  function tryFilterSchedule() {
    const departureCity = departCitySelect.value;
    const destinationCity = arrivalCitySelect.value;

    if (departureCity && destinationCity) {
      const [matchingDept, matchingDest] = filterSchedule(schedule, departureCity, destinationCity);

      const [returnFromDest, returnToDepart] = filterSchedule(schedule, destinationCity, departureCity);

      // Call the callback with day_of_week values
      if (matchingDept && returnFromDest) {
        onCitiesSelected(matchingDept.day_of_week, returnFromDest.day_of_week);
      }
    }
  }

  departCitySelect.addEventListener('change', tryFilterSchedule);
  arrivalCitySelect.addEventListener('change', tryFilterSchedule);
}

/**
 * 
 * @param {*} stateId 
 * @param {*} cityId 
 * @param {Object.<string, string[]} citiesByCountry - a dictionary with countries visited as the keys and an array list of city names as the values 
 * @param {Object} states - a States object pulled from the db
 * @returns 
 */
function updateCityOptions(stateId, cityId, citiesByCountry, states) {
    const stateSelect = document.getElementById(stateId);
    const citySelect = document.getElementById(cityId);
    const selectedStateName = stateSelect.value;  // e.g. "California"

    // Find the state object that matches the selected full state name
    const matchingState = states.find(state => state.state_name === selectedStateName);

    // Exit early if no matching state is found
    if (!matchingState) {
        citySelect.innerHTML = '<option value="">Select a city</option>';
        return;
    }

    const selectedStateId = matchingState.state_id;  // e.g. "CA" or "CHU"
    const selectedCountry = matchingState.country;   // e.g. "USA" or "MX"

    console.log(selectedStateId)

    citySelect.innerHTML = '<option value="">Select a city</option>';

    // Use both country and state_id to find the city list
    if (
        citiesByCountry[selectedCountry] &&
        citiesByCountry[selectedCountry][selectedStateId]
    ) {
        citiesByCountry[selectedCountry][selectedStateId].forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

/**
 * Get fare price regardless of order (USA → Mexico or Mexico → USA)
 * @returns {number|null} - Price or null if not found
 */
function getFare(pricingTable) {
  // Guard clause: prevent Mexico → Mexico travel
  const departureCity = document.getElementById("departCity").value;
  const departureState = document.getElementById("departState").value;
  const destinationCity = document.getElementById("arrivalCity").value;
  const destinationState = document.getElementById("arrivalState").value;
  const departureCountry = pricingTable[departureCity]?.Country;
  const destinationCountry = pricingTable[destinationCity]?.Country;

  if (departureCountry === "MX" && destinationCountry === "MX") {
    return null; // No Mexico-to-Mexico travel allowed
  }

  // Normal USA → Mexico travel
  if (departureCountry === "USA") {
    const statePrices = pricingTable[departureCity];
    if (statePrices && statePrices[destinationState] !== undefined) {
      return statePrices[destinationState];
    }
  }

  // Reverse Mexico → USA travel (check USA city for that Mexican state price)
  if (departureCountry === "MX" && destinationCountry === "USA") {
    const statePrices = pricingTable[destinationCity];
    if (statePrices && statePrices[departureState] !== undefined) {
      return statePrices[departureState];
    }
  }

  // Default fallback if no valid route found
  return null;
}

/**
 * 
 * @param {*} schedule 
 * @param {string} departureCity 
 * @param {string} destinationCity 
 */
function filterSchedule(schedule, departureCity, destinationCity){
  const deptCitiesOptions = schedule.filter(
    stop => stop.city_id === departureCity
  );
  const destCityOptions = schedule.filter(
    stop => stop.city_id === destinationCity
  );

  let matchedDept = null;
  let matchedDest = null;

  for (const dept of deptCitiesOptions) {
    const destOption = destCityOptions.find(dest =>
      dest.direction === dept.direction &&
      dest.stop_id > dept.stop_id
    );

    if (destOption) {
      matchedDept = dept;
      matchedDest = destOption;
      break; // ✅ Found a match, exit the loop
    }
  }

  console.log("Matched departure:", matchedDept);
  console.log("Matched destination:", matchedDest);

  return [ matchedDept, matchedDest ];
}