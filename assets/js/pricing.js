export function calculateTotalPrice() {
  const startInput = document.getElementById("startTime").value;
  const endInput = document.getElementById("endTime").value;
  const start = new Date(startInput);
  const end = new Date(endInput);
  const errorEl = document.getElementById("timeError");

  const vehicle = document.getElementById("vehicle").value;
  const km = parseFloat(document.getElementById("distanceInput").value || "0");
  const service = document.getElementById("serviceType").value;

  // Handle invalid or missing time input for point-to-point
  if (service === "point") {
    if (!startInput || !endInput || isNaN(start.getTime()) || isNaN(end.getTime())) {
      errorEl.style.display = "none"; // Hide error for now
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
  }

  // Handle Hakot-Gamit pricing
  if (service === "hakot") {
    if (isNaN(km) || km <= 0) {
      document.getElementById("totalPrice").value = "";
      document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
      return;
    }

    let total = 700 + (km * 30);

    document.getElementById("totalPrice").value = total.toFixed(2);
    document.getElementById("totalPriceB").value = " ";
    document.getElementById("priceDisplay").innerText = `Price: ₱${total.toFixed(2)} + helper fee`;
    document.getElementById("durationDisplay").innerText = "Duration: N/A";
    return;
  }

  // Point-to-Point pricing
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    document.getElementById("totalPrice").value = "";
    document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
    return;
  }

  const hours = Math.ceil((end - start) / 3600000); // in hours
  const rates = {
    l300: { base: 1000, rate: 500, driver: 500  },
    jeep: { base: 1000, rate: 2500, driver: 500  },
    van: { base: 2000, rate: 3500, driver: 500  }
  };

  const { base, rate, driver} = rates[vehicle] || { base: 0, rate: 0, driver: 0};
  let L300, driverFee, kmFee, xFee = 0;
  let total = base + driver;
  let totalB = base - 500;
  
  L300 = base *  Math.max(1, Math.floor(hours / 12));
  totalB += 125 * Math.ceil(hours / 3);

  driverFee =  driver * Math.ceil( hours/ 11.5);
  totalB +=  500 * Math.floor(hours/6);

  kmFee =  rate * Math.ceil(km / 25) + (Math.round((km % 25) / 40)*100);
  totalB +=  km * 20;

  xFee = (hours % 12) * 100 ;

  if (km > 80) {
    xFee += Math.ceil(km-80) * 20;
    totalB += 10*(km-100);
  }
  if (km > 100) {
    xFee += Math.ceil(km-100) * 10;
    totalB += 5*(km-200);
  }
  if (km > 200) {
    xFee -= Math.ceil(km-100) * 10;
    totalB += 5*(km-200);
  }
  console.log( total+"+"+ L300 +"+"+driverFee  +"+"+  kmFee+"+"+ xFee);
  total += L300 + driverFee + kmFee + xFee;
  const totalHours = hours;
  const diffdays = Math.floor(totalHours / 24);
  const diffhours = totalHours % 24;
  let num = diffdays > 0 ? 2 : 1;
  if (km < 15) {
    totalB =  (km * 40) + (750 * num);
  }

  document.getElementById("durationDisplay").innerText =
    `Duration: ${diffdays} d ${diffhours} h`;
  document.getElementById("totalPrice").value = kmFee.toFixed(2);
  document.getElementById("totalPriceB").value = totalB.toFixed(2);
  document.getElementById("priceDisplay").innerText = `Price: ₱${totalB.toFixed(2)} - ${total.toFixed(2)}`;
}
