import { fetchCities, fetchStates } from './city_fetch.js';
import { setupStateCityDropdowns } from './event.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    toggleReturnDate();

    // Ensure trip type radio buttons are wired
    document.querySelectorAll('.trip-radio').forEach(radio => {
        radio.addEventListener('change', toggleReturnDate);
    });
        
    const cities = await fetchCities();
    const states = await fetchStates();

    console.log("Fetched Cities:", cities);
    console.log("Fetched States:", states);

    const arrivalSelect = document.getElementById('arrivalState');
    const departureSelect = document.getElementById('departState');

    states.forEach(state => {
        // Create separate <option> elements for each dropdown
        const arrivalOption = document.createElement('option');
        arrivalOption.value = state.state_name;
        arrivalOption.textContent = state.state_name;

        const departureOption = document.createElement('option');
        departureOption.value = state.state_name;
        departureOption.textContent = state.state_name;

        arrivalSelect.appendChild(arrivalOption);
        departureSelect.appendChild(departureOption);
        });

    const citiesByCountry = buildCitiesByCountry(states, cities);
    const pricingTable = buildPricingTable(cities);
    setupStateCityDropdowns(citiesByCountry, states);
});

function buildCitiesByCountry(states, cities) {
    const citiesByCountry = {};

    // First, group states by country
    states.forEach(state => {
      const country = state.country;
      const stateId = state.state_id;

      if (!citiesByCountry[country]) {
        citiesByCountry[country] = {};
      }

      if (!citiesByCountry[country][stateId]) {
        citiesByCountry[country][stateId] = [];
      }
    });

    // Then populate cities under the correct state and country
    cities.forEach(city => {
      const stateId = city.state_id;
      const matchingState = states.find(state => state.state_id === stateId);
      if (!matchingState) return;

      const country = matchingState.country;

      if (!citiesByCountry[country][stateId]) {
        citiesByCountry[country][stateId] = [];
      }

      citiesByCountry[country][stateId].push(city.city_id);
    });

    return citiesByCountry;
}

function buildPricingTable(cities){
    const pricingTable = {};

    cities.forEach(city => {
        pricingTable[city.city_id] = {
            "Chihuahua": city.price_to_chihuahua,
            "Durango": city.price_to_durango,
            "Zacatecas": city.price_to_zacatecas
        };
    });

    return pricingTable;
}

/**
 * Get fare price regardless of order (USA → Mexico or Mexico → USA)
 * @returns {number|null} - Price or null if not found
 */
function getFare() {
    const departureCity = document.getElementById("departCity").value;
    const departureState = document.getElementById("departState").value;
    const destinationCity = document.getElementById("arrivalCity").value;
    const destinationState = document.getElementById("arrivalState").value;

    // Try direct lookup (USA → Mexico)
    if (pricingTable[departureCity] && pricingTable[departureCity][destinationState] !== undefined) {
        return pricingTable[departureCity][destinationState];
    }

    // Try reversed lookup (Mexico → USA)
    for (const [usaCity, mexicoStates] of Object.entries(pricingTable)) {
        if (mexicoStates[departureState] !== undefined && usaCity === destinationCity) {
            return mexicoStates[departureState];
        }
    }

    return null; // Not found
}

function calculatePrice() {
    const basePrice = getFare();
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

let flatpickrInstance = null;

function toggleReturnDate() {
    const selectedTripType = document.querySelector('input[name="tripType"]:checked').value;

  if (flatpickrInstance) {
    flatpickrInstance.destroy();
  }

  flatpickrInstance = flatpickr("#datePicker", {
    mode: selectedTripType === "roundTrip" ? "range" : "single",
    dateFormat: "M-d (D)",
  });
}

