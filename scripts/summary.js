import { getNextMatchingDate } from "./calendar.js";

export function updateSummary(data = null){
  const dataStore = document.getElementById('dataStore');
  
  if (data && typeof data === "object") {
    for (const [key, val] of Object.entries(data)) {
      dataStore.dataset[key] = val;
    }
  }

  console.log(dataStore);
  return dataStore;
}

function buildSummary(){
    const dataStore = document.getElementById('dataStore').dataset;
    const contentDiv = document.getElementById("summaryContent");
    
    const deptCity = document.getElementById('departCity').selectedOptions[0]?.textContent || '';
    const destCity = document.getElementById('arrivalCity').selectedOptions[0]?.textContent || '';


    contentDiv.innerText = `Departing ${deptCity}: ${dataStore.calendarDeparture} -> Arriving in ${destCity}: ${getNextMatchingDate(dataStore.calendarDeparture, dataStore.arrivalDow)}`;

    if (dataStore.tripType === "roundTrip"){
        contentDiv.innerText += `\nDeparting ${destCity}: ${dataStore.calendarReturn} -> Returning to ${deptCity}: ${getNextMatchingDate(dataStore.calendarReturn, dataStore.returnArrivalDow)}`;
    }
}

export function showTripSummary() {
    const summaryDiv = document.getElementById("tripSummary");

    buildSummary();
    
    summaryDiv.classList.remove("hidden");
}