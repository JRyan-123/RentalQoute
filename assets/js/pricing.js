export function calculateTotalPrice() {
  const start = new Date(document.getElementById("startTime").value);
  const end = new Date(document.getElementById("endTime").value);
  const errorEl = document.getElementById("timeError");

  // const category = document.getElementById("category").value;
  const vehicle = document.getElementById("vehicle").value;
  const km = parseFloat(document.getElementById("distanceInput").value || 0);

     if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      errorEl.style.display = "none"; // Hide if one or both are empty
      return;
    }

    if (end <= start) {
      errorEl.innerText = "❌ End time must be after start time.";
      errorEl.style.display = "block";

      document.getElementById("totalPrice").value = "";
      document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
      return;
    } else {
      errorEl.style.display = "none";
    }


  const hours = Math.ceil((end - start) / 3600000);
  const rates = {
    l300: { base: 1500, rate: 3000 / 24 },
    jeep: { base: 1000, rate: 2500 / 24 },
    van: { base: 2000, rate: 3500 / 24 }
  };

  const { base, rate } = rates[vehicle] || { base: 0, rate: 0 };
  let total = base + (rate * hours) + (km * 20);

  const diffMs = end - start;
const totalHours = Math.ceil(diffMs / 3600000); // round up
const diffdays = Math.floor(totalHours / 24);
const diffhours = totalHours % 24;

document.getElementById("durationDisplay").innerText = 
  `Duration: ${diffdays} d ${diffhours} h`;

  document.getElementById("totalPrice").value = total.toFixed(2);
  document.getElementById("priceDisplay").innerText = `Price: ₱${total.toFixed(2)}`;
}
