export function setupStateCityDropdowns(citiesByCountry, states) {
  document.getElementById('arrivalState').addEventListener('change', () => {
    updateCityOptions('arrivalState', 'arrivalCity', citiesByCountry, states);
  });

  document.getElementById('departState').addEventListener('change', () => {
    updateCityOptions('departState', 'departCity', citiesByCountry, states);
  });
}

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
