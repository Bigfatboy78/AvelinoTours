import { resetCalendars, updateCalendarByDayOfWeek } from "./calendar.js";
import { fetchCities, fetchStates, fetchSchedule, fetchPricing } from './fetch.js';
import { calculatePrice, setupCityChangeHandlers, setupStateCityDropdowns } from './event.js';
import { showTripSummary, updateSummary } from "./summary.js";

document.addEventListener('DOMContentLoaded', async () => {
  const [cities, states, schedule, info] = await Promise.all([
      fetchCities(),
      fetchStates(),
      fetchSchedule(),
      fetchPricing()
    ]);
  // console.log("Fetched Cities:", cities);
  // console.log("Fetched States:", states);
  // console.log("Fetched Schedule", schedule);
  // console.log("Fetched Info", info);

  const arrivalSelect = document.getElementById('arrivalState');
  const departureSelect = document.getElementById('departState');
  
  let lastDepart, lastDest;
  setupCityChangeHandlers(schedule, (depart, dest) => {
    lastDepart = depart;
    lastDest = dest;
    const tripType = document.querySelector('input[name="tripType"]:checked').value;
    updateCalendarByDayOfWeek(depart, dest, tripType);
  }, () => resetCalendars());

  document.querySelectorAll('input[name="tripType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const tripType = radio.value;
      if (lastDepart && lastDest) {
        updateCalendarByDayOfWeek(lastDepart, lastDest, tripType);
      }
      updateSummary({'tripType': tripType});
    });
  });

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
  const pricingTable = buildPricingTable(cities, states);
  // console.log("Listed pricingTable: ", pricingTable)
  setupStateCityDropdowns(citiesByCountry, states);

  const form = document.getElementById('fareForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculatePrice(pricingTable, info);
    showTripSummary(info);
  });
  
});

/**
 * Build a mapped dictionary of countries that contain each of the cities found in each
 * @param {Object} states - a States object pulled from the db
 * @param {Object} cities - a Cities object pulled from the db 
 * @returns {Object.<string, string[]>} - a dictionary with countries visited as the keys and an array list of city names as the values
 */
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

/**
 * Builds a mapped dictionary of cities with the cost associations traveling to each of the Mexican states visited.
 * @param {Object} states - a States object pulled from the db
 * @param {Object} cities - a Cities object pulled from the db 
 * @returns {Object.<string, string[]>} - a dictionary with city names as the keys and a dictionary of prices to Mexican states as well as the city's country as the values
 */
function buildPricingTable(cities, states){
    const pricingTable = {};
    
    cities.forEach(city => {
        const selectedCountry = states.find(state => state.state_id === city.state_id);
        pricingTable[city.city_id] = {
            "Chihuahua": city.price_to_chihuahua,
            "Durango": city.price_to_durango,
            "Zacatecas": city.price_to_zacatecas,
            "Country": selectedCountry.country
        };
    });

    return pricingTable;
}




