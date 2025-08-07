import { updateSummary } from "./summary.js";

export let departPicker = null;
export let returnPicker = null;


export function updateCalendarByDayOfWeek(departCity, destCity, tripType) {
  const dayToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };

  let dataStore = document.getElementById('dataStore');

  // Destroy existing pickers
  if (departPicker) departPicker.destroy();
  if (returnPicker) returnPicker.destroy();

  // Departure calendar
  updateReturnTooltip(departCity.city_id, destCity.city_id, "departure");
  departPicker = flatpickr("#departureDate", {
    dateFormat: "M-d (D)",
    enable: [
      date => date.getDay() === dayToIndex[departCity.day_of_week]
    ],
    minDate: "today",
    onChange: function(selectedDates) {
      const selectedDeparture = selectedDates[0];
      dataStore = updateSummary({ 'calendarDeparture': formatDatePretty(selectedDeparture) });

      if (tripType === "roundTrip" && returnPicker) {
        const departIndex = dayToIndex[departCity.day_of_week];
        const arrivalIndex = dayToIndex[destCity.day_of_week];

        // Calculate offset in days between departure and arrival
        let travelDays = (arrivalIndex - departIndex + 7) % 7 || 7;

        const arrivalDate = new Date(selectedDeparture);
        arrivalDate.setDate(arrivalDate.getDate() + travelDays);

        // Now prevent choosing a return date earlier than actual arrival
        returnPicker.set("minDate", arrivalDate);
      }
    }
  });

  // If roundTrip, show & initialize return calendar
  if (tripType === "roundTrip") {
    updateReturnTooltip(departCity.city_id, destCity.city_id, "return");
    document.getElementById("returnDateContainer").classList.remove("hidden");

    // Default arrivalDate = today
    let arrivalDate = "today";

    const selectedDeparture = departPicker.selectedDates[0];
    if (selectedDeparture) {
      const departIndex = dayToIndex[departCity.day_of_week];
      const arrivalIndex = dayToIndex[destCity.day_of_week];

      // Calculate how many days after departure the arrival happens
      let travelDays = (arrivalIndex - departIndex + 7) % 7;

      arrivalDate = new Date(selectedDeparture);
      arrivalDate.setDate(arrivalDate.getDate() + travelDays);
    }
    returnPicker = flatpickr("#returnDate", {
      dateFormat: "M-d (D)",
      enable: [
        date => date.getDay() === dayToIndex[destCity.day_of_week]
      ],
      minDate: arrivalDate,
      onChange: function(selectedDates) {
        updateSummary({'calendarReturn': formatDatePretty(selectedDates[0])});
      }
    });
  } else {
    // Hide return calendar
    document.getElementById("returnDateContainer").classList.add("hidden");
  }
}

export function resetCalendars() {
  if (departPicker) {
    departPicker.clear();
    document.getElementById("departureDate").placeholder = "Select travel date(s)";
  }

  if (returnPicker) {
    returnPicker.clear();
    document.getElementById("returnDate").placeholder = "Select return date";
  }
}

function formatDatePretty(date) {
  console.log(date);
  if (!date) {
    return "";
  }
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  const day = date.getDate();
  return `${weekday}, ${month} ${day} ${year}`;
}

/**
 * Given a base date string and a target day of week,
 * return the next date (after the base date) that matches the day.
 *
 * @param {string} baseDateStr - The base date (e.g. "Mon Aug 18")
 * @param {string} targetDOW - Target day of week (e.g. "Wednesday")
 * @returns {string} - The matching date string (e.g. "Wed Aug 20")
 */
export function getNextMatchingDate(baseDateStr, targetDOW) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetIndex = daysOfWeek.indexOf(targetDOW);

  if (targetIndex === -1) {
    console.error("Invalid targetDOW:", targetDOW);
    return null;
  }

  // Parse the base date string into a Date object
  const baseDate = new Date(baseDateStr);

  if (isNaN(baseDate)) {
    console.error("Invalid baseDateStr:", baseDateStr);
    return null;
  }

  // Find the next date with matching day of week
  const currentDOW = baseDate.getDay();
  let daysUntilMatch = (targetIndex - currentDOW + 7) % 7;

  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + daysUntilMatch);

  // Format output like "Mon Aug 25"
  return formatDatePretty(resultDate);
}

function updateReturnTooltip(departureCity, arrivalCity, direction) {
  const id = direction + "Tooltip"
  const tooltip = document.getElementById(id);
  if (!tooltip) return;

  
  switch (direction) {
    case "return":
      tooltip.textContent = `Choose a return date from ${arrivalCity} back to ${departureCity}`;
      break;
    case "departure":
      tooltip.textContent = `Choose a departure date from ${departureCity} to ${arrivalCity}`;
      break;
    default:
      tooltip.textContent = `Choose a date leaving from your selected city`;
  }
}