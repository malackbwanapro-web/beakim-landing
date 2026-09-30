const fs = require('fs');

console.log('Replacing checkAvailability with a timeout-resilient version...');

const TIMEOUT_AVAILABILITY_HELPER = `    let activeBookingDocId = null;
    let pendingWhatsAppUrl = "";

    function checkAvailability(property, checkIn, checkOut, callback) {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn("Availability check timed out. Falling back to available.");
          callback(true);
        }
      }, 1000); // 1-second timeout

      if (!db) {
        clearTimeout(timeout);
        callback(true);
        return;
      }

      db.collection("bookings")
        .where("property", "==", property)
        .get()
        .then(querySnapshot => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            let activeOverlaps = 0;
            querySnapshot.forEach(doc => {
              const b = doc.data();
              if (b.status === "Checked Out" || b.status === "Cancelled" || b.status === "Refunded") {
                return;
              }
              if (b.checkIn < checkOut && b.checkOut > checkIn) {
                activeOverlaps++;
              }
            });

            let capacity = 999;
            if (property === "Tower Cottages") {
              capacity = 3;
            } else if (property === "Diani Darling Cottages") {
              capacity = 10;
            } else if (property === "Beakim Apartments") {
              capacity = 12;
            } else if (property.includes("Standard Room")) {
              capacity = 2;
            } else if (property.includes("Deluxe Studio")) {
              capacity = 2;
            } else if (property.includes("2-Bedroom Cottage")) {
              capacity = 1;
            }

            const isAvailable = activeOverlaps < capacity;
            callback(isAvailable);
          }
        })
        .catch(err => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            console.error("Availability check failed: ", err);
            callback(true);
          }
        });
    }`;

// Define files to modify
const pages = ['index.html', 'diani-darling.html', 'tower-cottages.html'];

pages.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');

  // Let's replace the old checkAvailability declaration and activeBookingDocId / pendingWhatsAppUrl declarations
  // We match from "let activeBookingDocId = null;" to "function checkAvailability(property, checkIn, checkOut, callback) { ... }"
  c = c.replace(
    /let activeBookingDocId = null;[\s\S]*?function checkAvailability\(property, checkIn, checkOut, callback\) \{[\s\S]*?\}\s*?\}/,
    TIMEOUT_AVAILABILITY_HELPER
  );

  // In index.html and sub-pages, there might be a duplicate declaration of pendingWhatsAppUrl. Let's clean it up.
  c = c.replace('let pendingWhatsAppUrl = "";', ''); // Remove duplicate if it exists, since we define it at the top of helper
  // Re-inject "let pendingWhatsAppUrl = "";" inside TIMEOUT_AVAILABILITY_HELPER, so it is declared once globally.

  fs.writeFileSync(f, c, 'utf8');
  console.log(`Updated ${f}`);
});

console.log('Timeout helper update complete!');
