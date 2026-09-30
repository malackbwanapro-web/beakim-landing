/**
 * Beakim Hospitality Group - Main JavaScript Module
 * Clean, modularized interactive functions for Lightbox, Navigation, FAQs, and Booking Engine.
 */

// ── LIGHTBOX MODAL MODULE ──
function openLightbox(src, title) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-title');
  if (modal && img) {
    img.src = src;
    if (caption) caption.innerText = title || '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

// ── MOBILE NAVIGATION MENU MODULE ──
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// ── FAQ TAB SWITCHER MODULE ──
function switchFaqTab(tabId) {
  document.querySelectorAll('.faq-panel').forEach(panel => panel.classList.add('hidden'));
  document.querySelectorAll('.faq-tab-btn').forEach(btn => {
    btn.classList.remove('bg-champagne', 'text-deep-forest', 'shadow-lg');
    btn.classList.add('bg-deep-forest/60', 'text-ivory/70', 'border', 'border-champagne/20');
  });

  const selectedPanel = document.getElementById(tabId);
  if (selectedPanel) selectedPanel.classList.remove('hidden');

  const selectedBtn = document.getElementById('btn-' + tabId);
  if (selectedBtn) {
    selectedBtn.classList.remove('bg-deep-forest/60', 'text-ivory/70', 'border', 'border-champagne/20');
    selectedBtn.classList.add('bg-champagne', 'text-deep-forest', 'shadow-lg');
  }
}

// ── BOOKING & PRICE CALCULATOR MODULE ──
function selectUnit(unitValue) {
  const selectEl = document.getElementById('booking-property');
  if (selectEl) {
    selectEl.value = unitValue;
    updatePriceCalculation();
  }
}

function updatePriceCalculation() {
  const propertyEl = document.getElementById('booking-property');
  const checkInEl = document.getElementById('check-in');
  const checkOutEl = document.getElementById('check-out');
  if (!propertyEl) return;

  const property = propertyEl.value;
  let rate = 1500;

  if (property.includes("Deluxe Studio")) rate = 2500;
  else if (property.includes("1-Bedroom Unit") && property.includes("Beakim Darad")) rate = 4000;
  else if (property.includes("1-Bedroom Unit") && property.includes("Beakim Apartments")) rate = 2500;
  else if (property.includes("2-Bedroom Unit") || property.includes("2-Bedroom Cottage")) rate = 3500;
  else if (property.includes("Diani Darling")) rate = 5000;
  else if (property.includes("Standard Room")) rate = 1500;

  let nights = 1;
  if (checkInEl && checkOutEl && checkInEl.value && checkOutEl.value) {
    const d1 = new Date(checkInEl.value);
    const d2 = new Date(checkOutEl.value);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) nights = diffDays;
  }

  const total = rate * nights;
  const summaryUnit = document.getElementById('summary-unit-name');
  const summaryRate = document.getElementById('summary-rate');
  const summaryNights = document.getElementById('summary-nights');
  const summaryTotal = document.getElementById('summary-total');

  if (summaryUnit) summaryUnit.innerText = property;
  if (summaryRate) summaryRate.innerText = 'KSh ' + rate.toLocaleString();
  if (summaryNights) summaryNights.innerText = nights + (nights === 1 ? ' Night' : ' Nights');
  if (summaryTotal) summaryTotal.innerText = 'KSh ' + total.toLocaleString();
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('guest-name') ? document.getElementById('guest-name').value : '';
  const email = document.getElementById('guest-email') ? document.getElementById('guest-email').value : '';
  const code = document.getElementById('country-code') ? document.getElementById('country-code').value : '+254';
  const phone = document.getElementById('guest-phone-number') ? document.getElementById('guest-phone-number').value : '';
  const property = document.getElementById('booking-property') ? document.getElementById('booking-property').value : '';
  const checkIn = document.getElementById('check-in') ? document.getElementById('check-in').value : '';
  const checkOut = document.getElementById('check-out') ? document.getElementById('check-out').value : '';
  const guests = document.getElementById('num-guests') ? document.getElementById('num-guests').value : '2';
  const totalEl = document.getElementById('summary-total');
  const total = totalEl ? totalEl.innerText : '';

  const message = `Hello Beakim Hospitality Group! I would like to book a stay.%0A%0A` +
    `*Guest Name:* ${name}%0A` +
    `*Email:* ${email}%0A` +
    `*Phone:* ${code}${phone}%0A` +
    `*Selected Property/Unit:* ${property}%0A` +
    `*Check-In:* ${checkIn}%0A` +
    `*Check-Out:* ${checkOut}%0A` +
    `*Guests:* ${guests}%0A` +
    (total ? `*Estimated Total:* ${total}%0A%0A` : '%0A') +
    `Please confirm availability and booking details. Thank you!`;

  const whatsappUrl = `https://wa.me/254746938529?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

// ── DOM LOAD INITIALIZER ──
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');
  if (checkInInput && checkOutInput && !checkInInput.value) {
    checkInInput.value = tomorrow.toISOString().split('T')[0];
    checkOutInput.value = dayAfter.toISOString().split('T')[0];
    updatePriceCalculation();
  }
});
