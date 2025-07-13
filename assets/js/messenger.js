export function copyAndGoToMessenger() {
  const pickup = document.getElementById("pickupSearch").value;
  const dropoff = document.getElementById("dropoffSearch").value;
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const vehicle = document.getElementById("vehicle").value;
  const price = document.getElementById("totalPrice").value;
  const priceB = document.getElementById("totalPriceB").value;
  const distance = document.getElementById("distanceInput").value;
  const duration = document.getElementById("durationDisplay").innerText;
  const pax = document.getElementById("numberPassenger").value;
  const type = document.getElementById("serviceType").value;
  let serviceType = null; 
  if (type === "point") { serviceType = "point-to-point service" }
  else { serviceType = "hakot-gamit" }

  const message = `🚐 Van Rental Inquiry:\n⚙️ ${serviceType} \n\n📍 Pickup: ${pickup}\n📍 Drop-off: ${dropoff}\n🗓️ Start: ${start}\n🗓️ End: ${end}\n🧑‍🤝‍🧑 Passengers: ${pax}\n🚍 Vehicle: ${vehicle}\n🗺️ Distance: ${distance} km\n🕗 ${duration}\n💸 Estimated Price: ₱${priceB}/${price}\n\n📋Inclusions:\n✅Driver\n✅Gas\n✅Toll fees\n✅Dual-Aircon\n\nPlease confirm my booking.`;

  navigator.clipboard.writeText(message).then(() => {

    alert("✅ Details copied! You can now PASTE in Messenger.");

    window.open("https://m.me/TriarRental", "_blank");

  }).catch(err => {
    console.error("Copy failed:", err);
    alert("❌ Could not copy the message. Please try again.");
  });
}
