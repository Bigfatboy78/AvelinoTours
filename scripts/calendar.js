export function updateCalendarByDayOfWeek(departCityDOW, destCityDOW, tripType) {
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
  departPicker = flatpickr("#departureDate", {
    dateFormat: "M-d (D)",
    enable: [
      date => date.getDay() === dayToIndex[departCityDOW]
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
    document.getElementById("returnDateContainer").classList.remove("hidden");
    returnPicker = flatpickr("#returnDate", {
      dateFormat: "M-d (D)",
      enable: [
        date => date.getDay() === dayToIndex[destCityDOW]
      ],
      minDate: departPicker.selectedDates[0] || "today" // fallback just in case
    });
  } else {
    // Hide return calendar
    document.getElementById("returnDateContainer").classList.add("hidden");
  }
}
