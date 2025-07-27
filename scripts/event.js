export function setupStateCityDropdowns(citiesByCountry, states) {
  document.getElementById('arrivalState').addEventListener('change', () => {
    updateCityOptions('arrivalState', 'arrivalCity', citiesByCountry, states);
  });

  document.getElementById('departState').addEventListener('change', () => {
    updateCityOptions('departState', 'departCity', citiesByCountry, states);
  });
}

export function calculatePrice(pricingTable) {
  console.log("Running calculatePrice...");
  const basePrice = getFare(pricingTable);
  const priceOutput = document.getElementById("priceOutput");
  const tripType = document.querySelector('input[name="tripType"]:checked').value;

  const numKids = parseInt(document.getElementById("numKids").value) * 0.5 || 0;
  const numAdults = parseInt(document.getElementById("numAdults").value) || 0;
  const numElderly = parseInt(document.getElementById("numElderly").value) * 0.9 || 0;

  const totalPassengers = numKids + numAdults + numElderly;

  if (basePrice !== null && totalPassengers > 0) {
      const total = basePrice * (tripType === "roundTrip" ? 2 : 1) * totalPassengers;
      priceOutput.textContent = `$${total.toFixed(2)}`;
  } else {
      priceOutput.textContent = "N/A";
  }
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

