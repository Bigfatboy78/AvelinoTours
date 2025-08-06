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

export function showTripSummary(pricingInfo) {
    const summaryDiv = document.getElementById("tripSummary");

    buildSummary(pricingInfo);
    
    summaryDiv.classList.remove("hidden");
}

function buildSummary(pricingInfo){
    const dataStore = document.getElementById('dataStore').dataset;
    const contentDiv = document.getElementById("summaryContent");
    
    const deptCity = document.getElementById('departCity').selectedOptions[0]?.textContent || '';
    const destCity = document.getElementById('arrivalCity').selectedOptions[0]?.textContent || '';


    contentDiv.innerText = `Departing ${deptCity}: ${dataStore.calendarDeparture} → Arriving in ${destCity}: ${getNextMatchingDate(dataStore.calendarDeparture, dataStore.arrivalDow)}`;

    if (dataStore.tripType === "roundTrip"){
        contentDiv.innerText += `\nDeparting ${destCity}: ${dataStore.calendarReturn} → Returning to ${deptCity}: ${getNextMatchingDate(dataStore.calendarReturn, dataStore.returnArrivalDow)}`;
    }

    let ticketCounterList = [];
    let elementName;
    let ticketText = "\n\nTickets: ";
    let luggageText = "\nTotal Luggage Limit: ";
    let luggageNum = 0;

    pricingInfo.forEach( ageRange => {
        switch (ageRange.ticket_id) {
            case "child":
                elementName = 'numKids';
                break;
            case "elderly":
                elementName = 'numElderly';
                break;
            default:
                elementName = 'numAdults';
        }

        const checkElement = document.getElementById(elementName).value;
        if ( checkElement !== '0' ){
            ticketCounterList.push(`${checkElement}x ${capitalizeFirstLetter(ageRange.ticket_id)}`);
            luggageNum += ageRange.luggage_limit * checkElement;
        }
    });

    ticketCounterList.forEach(entry => {
        if (entry === ticketCounterList[ticketCounterList.length - 1]) {
            ticketText += `${entry}`;
        } else {
            ticketText += `${entry}, `;
        }
    });

    luggageText += `${luggageNum} lbs`;

    contentDiv.innerText += ticketText;
    contentDiv.innerText += luggageText;
}

/**
 * 
 * @param {String} string 
 */
function capitalizeFirstLetter( string ) {
    const firstLetterCap = string.charAt(0).toUpperCase();

    const wordRemainder = string.substring(1);

    return firstLetterCap + wordRemainder;
}