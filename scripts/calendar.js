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

  let departPicker, returnPicker;

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
      minDate: departPicker.selectedDates[0] || "today" // fallback just in case
    });
  } else {
    // Hide return calendar
    document.getElementById("returnDateContainer").classList.add("hidden");
  }
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