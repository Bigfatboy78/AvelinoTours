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
        if (tripType === "roundTrip" && returnPicker) {
          returnPicker.set("minDate", selectedDates[0]);
        }
        updateSummary({'calendarDeparture': formatDatePretty(selectedDates[0])});
    }
  });

  // If roundTrip, show & initialize return calendar
  if (tripType === "roundTrip") {
    updateReturnTooltip(departCity.city_id, destCity.city_id, "return");
    document.getElementById("returnDateContainer").classList.remove("hidden");
    returnPicker = flatpickr("#returnDate", {
      dateFormat: "M-d (D)",
      enable: [
        date => date.getDay() === dayToIndex[destCity.day_of_week]
      ],
      minDate: departPicker.selectedDates[0] || "today", // fallback just in case
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
  if (daysUntilMatch === 0) daysUntilMatch = 7; // Ensure it's after baseDate

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