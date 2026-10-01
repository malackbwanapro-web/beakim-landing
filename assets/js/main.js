/**
 * Beakim Hospitality Group - Main JavaScript Module
 * Clean, accessible, unified module for Lightbox, Navigation, Tabs, and Inquiry Engine.
 * Verified to resolve B01, B02, B03, B04, B05, B06, B14, B15.
 */

// ── UTILITY: NAIROBI TIMEZONE DATE HELPERS ──
function getNairobiDateString(offsetDays = 0) {
  // Get date in Africa/Nairobi timezone (UTC+3)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nairobiTime = new Date(utc + (3600000 * 3));
  nairobiTime.setDate(nairobiTime.getDate() + offsetDays);
  return nairobiTime.toISOString().split('T')[0];
}

// ── LIGHTBOX ACCESSIBILITY MODULE ──
let lastFocusedElement = null;

function openLightbox(src, title) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-title');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (modal && img) {
    lastFocusedElement = document.activeElement;
    img.src = src;
    img.alt = title || 'Property photograph';
    if (caption) caption.textContent = title || '';
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus management
    if (closeBtn) closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal && !modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }
}

// Backdrop click listener to close modals
document.addEventListener('click', function(e) {
  const lightboxModal = document.getElementById('lightbox-modal');
  if (lightboxModal && !lightboxModal.classList.contains('hidden') && e.target === lightboxModal) {
    closeLightbox();
  }
  const inquiryModal = document.getElementById('inquiry-review-modal');
  if (inquiryModal && !inquiryModal.classList.contains('hidden') && e.target === inquiryModal) {
    closeInquiryModal();
  }
});

// Keyboard event listener for Escape and Focus Trap
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
    closeMobileMenu();
    closeInquiryModal();
    return;
  }

  // Focus trapping in active modals
  const activeModal = [document.getElementById('lightbox-modal'), document.getElementById('inquiry-review-modal')]
    .find(m => m && !m.classList.contains('hidden'));

  if (activeModal && e.key === 'Tab') {
    const focusables = Array.from(activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
});

// ── MOBILE NAVIGATION MODULE ──
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  if (menu) {
    const isExpanded = !menu.classList.contains('hidden');
    if (isExpanded) {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
      menu.classList.remove('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  if (menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
}

// ── FAQ TAB SWITCHER MODULE ──
function switchFaqTab(tabId) {
  document.querySelectorAll('.faq-panel').forEach(panel => panel.classList.add('hidden'));
  document.querySelectorAll('.faq-tab-btn').forEach(btn => {
    btn.classList.remove('bg-champagne', 'text-deep-forest', 'shadow-lg');
    btn.classList.add('bg-deep-forest/60', 'text-ivory/70', 'border', 'border-champagne/20');
    btn.setAttribute('aria-selected', 'false');
  });

  const selectedPanel = document.getElementById(tabId);
  if (selectedPanel) selectedPanel.classList.remove('hidden');

  const selectedBtn = document.getElementById('btn-' + tabId);
  if (selectedBtn) {
    selectedBtn.classList.remove('bg-deep-forest/60', 'text-ivory/70', 'border', 'border-champagne/20');
    selectedBtn.classList.add('bg-champagne', 'text-deep-forest', 'shadow-lg');
    selectedBtn.setAttribute('aria-selected', 'true');
  }
}

// ── COMPARISON ENGINE TAB SWITCHER (INDEX.HTML) ──
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-deep-forest', 'text-champagne', 'border-champagne/30');
    btn.classList.add('bg-deep-forest/40', 'text-ivory/60', 'border-transparent');
    btn.setAttribute('aria-selected', 'false');
  });

  const activeBtn = document.getElementById('btn-' + tabId);
  if (activeBtn) {
    activeBtn.classList.remove('bg-deep-forest/40', 'text-ivory/60', 'border-transparent');
    activeBtn.classList.add('bg-deep-forest', 'text-champagne', 'border-champagne/30');
    activeBtn.setAttribute('aria-selected', 'true');
  }
  // NOTE: B03 fix: We do NOT overwrite the user's selected dropdown unit on tab switch!
}

// ── UNIT SELECTION HELPERS ──
function selectUnit(unitValue) {
  const selectEl = document.getElementById('booking-property');
  if (selectEl) {
    selectEl.value = unitValue;
    updatePriceCalculation();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function selectProperty(propertyName) {
  const selectEl = document.getElementById('booking-property');
  if (!selectEl) return;

  // Find first matching option in the catalog
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].text.includes(propertyName) || selectEl.options[i].value.includes(propertyName)) {
      selectEl.selectedIndex = i;
      break;
    }
  }

  // Switch comparison tab for visual preview without breaking selection
  if (propertyName.includes('Tower')) switchTab('tab-tower');
  else if (propertyName.includes('Darad')) switchTab('tab-darad');
  else if (propertyName.includes('Darling')) switchTab('tab-darling');
  else if (propertyName.includes('Apartment')) switchTab('tab-beakim');

  updatePriceCalculation();
  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function handlePropertyChange() {
  const propertyEl = document.getElementById('booking-property');
  if (!propertyEl) return;
  const propertyVal = propertyEl.value;

  if (propertyVal.includes('Tower')) switchTab('tab-tower');
  else if (propertyVal.includes('Darad')) switchTab('tab-darad');
  else if (propertyVal.includes('Darling')) switchTab('tab-darling');
  else if (propertyVal.includes('Apartment')) switchTab('tab-beakim');

  updatePriceCalculation();
}

// ── PRICING CALCULATOR MODULE (RESOLVING B15) ──
function updatePriceCalculation() {
  const propertyEl = document.getElementById('booking-property');
  const checkInEl = document.getElementById('check-in');
  const checkOutEl = document.getElementById('check-out');
  const summaryUnit = document.getElementById('summary-unit-name');
  const summaryRate = document.getElementById('summary-rate');
  const summaryNights = document.getElementById('summary-nights');
  const summaryTotal = document.getElementById('summary-total');

  if (!propertyEl) return;
  const propertyVal = propertyEl.value;

  // Retrieve offering from catalog helper or lookup
  let offering = null;
  if (typeof getOfferingById === 'function') {
    offering = getOfferingById(propertyVal);
  }

  // Fallback rate extraction if catalog helper is pending
  let rate = 2500;
  let isMonthly = false;
  let unitDisplayName = propertyVal;

  if (offering) {
    rate = offering.rate;
    isMonthly = (offering.stayType === 'monthly');
    unitDisplayName = offering.name;
  } else {
    if (propertyVal.includes('Without AC')) rate = 2000;
    else if (propertyVal.includes('Deluxe Studio') && propertyVal.includes('Darad')) rate = 3000;
    else if (propertyVal.includes('1-Bedroom Cottage') && propertyVal.includes('Darad')) rate = 4000;
    else if (propertyVal.includes('Standard Studio') && propertyVal.includes('Darad')) rate = 2500;
    else if (propertyVal.includes('Tower Cottages')) rate = 2500;
    else if (propertyVal.includes('Diani Darling')) rate = 5000;
    else if (propertyVal.includes('1-Bedroom') && propertyVal.includes('Apartment')) { rate = 15000; isMonthly = true; }
    else if (propertyVal.includes('2-Bedroom') && propertyVal.includes('Apartment')) { rate = 25000; isMonthly = true; }
  }

  if (summaryUnit) summaryUnit.textContent = unitDisplayName;
  if (summaryRate) summaryRate.textContent = isMonthly ? `KSh ${rate.toLocaleString()} / mo` : `KSh ${rate.toLocaleString()} / night`;

  // Date and duration computation
  if (checkInEl && checkOutEl && checkInEl.value && checkOutEl.value) {
    const d1 = new Date(checkInEl.value);
    const d2 = new Date(checkOutEl.value);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      if (summaryNights) summaryNights.textContent = 'Invalid Dates';
      if (summaryTotal) summaryTotal.textContent = 'Check-out must be after check-in';
      return;
    }

    if (isMonthly) {
      // Long-term monthly residency calculation
      const months = Math.max(1, Math.round(diffDays / 30));
      const total = rate * months;
      if (summaryNights) summaryNights.textContent = `${diffDays} Days (~${months} Mo)`;
      if (summaryTotal) summaryTotal.textContent = `KSh ${total.toLocaleString()}`;
    } else {
      const total = rate * diffDays;
      if (summaryNights) summaryNights.textContent = `${diffDays} ${diffDays === 1 ? 'Night' : 'Nights'}`;
      if (summaryTotal) summaryTotal.textContent = `KSh ${total.toLocaleString()}`;
    }
  } else {
    if (summaryNights) summaryNights.textContent = isMonthly ? '1 Month (Min)' : '1 Night';
    if (summaryTotal) summaryTotal.textContent = `KSh ${rate.toLocaleString()}`;
  }
}

// ── UNIFIED INQUIRY CONTROLLER (RESOLVING B01, B02, B04, B05, B06) ──
function handleBookingSubmit(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  // 1. Gather form fields with resilient fallbacks
  const nameEl = document.getElementById('guest-name');
  const emailEl = document.getElementById('guest-email');
  const codeEl = document.getElementById('country-code') || document.getElementById('guest-phone-code');
  const phoneEl = document.getElementById('guest-phone-number');
  const propertyEl = document.getElementById('booking-property');
  const checkInEl = document.getElementById('check-in');
  const checkOutEl = document.getElementById('check-out');
  
  // Adults & Children
  const adultsEl = document.getElementById('guests-adults');
  const childrenEl = document.getElementById('guests-children');
  const numGuestsEl = document.getElementById('num-guests');

  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const code = codeEl ? codeEl.value.trim() : '+254';
  let phone = phoneEl ? phoneEl.value.trim() : '';
  
  let property = propertyEl ? propertyEl.value : '';
  if (!property) {
    if (window.location.pathname.includes('darad')) property = 'Beakim Darad';
    else if (window.location.pathname.includes('tower')) property = 'Tower Cottages';
    else if (window.location.pathname.includes('darling')) property = 'Diani Darling Cottages';
    else if (window.location.pathname.includes('apartment')) property = 'Beakim Apartments';
    else property = 'Beakim Hospitality';
  }

  const checkIn = checkInEl ? checkInEl.value : '';
  const checkOut = checkOutEl ? checkOutEl.value : '';

  let adults = 2;
  let children = 0;
  if (adultsEl) adults = parseInt(adultsEl.value, 10) || 2;
  else if (numGuestsEl) adults = parseInt(numGuestsEl.value, 10) || 2;
  if (childrenEl) children = parseInt(childrenEl.value, 10) || 0;

  // 2. Validation
  if (!name) {
    alert('Please enter your full name.');
    if (nameEl) nameEl.focus();
    return;
  }

  if (!phone) {
    alert('Please enter your phone number.');
    if (phoneEl) phoneEl.focus();
    return;
  }

  // Clean phone number: remove non-digits; if starting with 0 and code is +254, normalize
  phone = phone.replace(/[^\d]/g, '');
  if (code === '+254' && phone.startsWith('0')) {
    phone = phone.substring(1);
  }

  if (!checkIn || !checkOut) {
    alert('Please select both Check-In and Check-Out dates.');
    return;
  }

  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  if (d2 <= d1) {
    alert('Check-Out date must be strictly after Check-In date.');
    if (checkOutEl) checkOutEl.focus();
    return;
  }

  const todayStr = getNairobiDateString(0);
  if (checkIn < todayStr) {
    alert('Check-In date cannot be in the past.');
    if (checkInEl) checkInEl.focus();
    return;
  }

  const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  const totalEl = document.getElementById('summary-total');
  const estimatedTotal = totalEl ? totalEl.textContent : '';

  // 3. Format Structured Plain Text Inquiry
  const totalGuests = adults + children;
  const isMonthly = property.includes('Apartment') || property.includes('Monthly');

  let stayDurationText = `${diffDays} ${diffDays === 1 ? 'Night' : 'Nights'}`;
  if (isMonthly) {
    const months = Math.max(1, Math.round(diffDays / 30));
    stayDurationText = `${diffDays} Days (~${months} Month Lease)`;
  }

  const messageText = 
    `🌴 BEAKIM HOSPITALITY - STAY INQUIRY 🌴\n\n` +
    `• Guest Name: ${name}\n` +
    `• Contact: ${code} ${phone}\n` +
    (email ? `• Email: ${email}\n` : '') +
    `• Accommodation: ${property}\n` +
    `• Check-In: ${checkIn}\n` +
    `• Check-Out: ${checkOut} (${stayDurationText})\n` +
    `• Guests: ${adults} Adult(s)` + (children > 0 ? `, ${children} Child(ren)` : '') + `\n` +
    (estimatedTotal ? `• Estimated Rate: ${estimatedTotal}\n\n` : '\n') +
    `Hello! Please confirm availability and reservation procedures for these dates. Thank you!`;

  // 4. Safe URL Serialization using URLSearchParams (B04 Fix)
  const searchParams = new URLSearchParams();
  searchParams.set('text', messageText);
  const whatsappUrl = `https://wa.me/254746938529?${searchParams.toString()}`;

  // 5. Open WhatsApp directly and provide transparent confirmation modal
  showInquiryReviewModal({
    name,
    phone: `${code} ${phone}`,
    property,
    dates: `${checkIn} to ${checkOut} (${stayDurationText})`,
    guests: `${totalGuests} (${adults} Adults, ${children} Children)`,
    estimatedTotal,
    whatsappUrl,
    messageText
  });
}

// ── INQUIRY REVIEW MODAL (HONEST INQUIRY-FIRST UX) ──
function showInquiryReviewModal(data) {
  let modal = document.getElementById('inquiry-review-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'inquiry-review-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'inquiry-modal-title');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-deep-forest border border-champagne/30 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 text-ivory shadow-2xl relative">
      <button type="button" onclick="closeInquiryModal()" 
              class="absolute top-4 right-4 text-ivory/60 hover:text-champagne text-2xl transition">&times;</button>
      
      <div class="text-center space-y-2">
        <span class="text-xs font-semibold tracking-widest text-champagne uppercase">Booking Inquiry Ready</span>
        <h3 id="inquiry-modal-title" class="font-display text-2xl font-bold text-ivory">Send Your Inquiry</h3>
        <p class="text-xs text-ivory/70">Review your stay details below. Your reservation request will open directly in WhatsApp for prompt confirmation by our management team.</p>
      </div>

      <div class="bg-canopy/60 rounded-xl p-4 border border-champagne/15 text-xs space-y-2 font-mono">
        <div class="flex justify-between"><span class="text-ivory/60">Guest:</span><span class="font-semibold text-ivory">${data.name}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Phone:</span><span class="font-semibold text-ivory">${data.phone}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Property:</span><span class="font-semibold text-champagne">${data.property}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Dates:</span><span class="text-ivory">${data.dates}</span></div>
        <div class="flex justify-between"><span class="text-ivory/60">Guests:</span><span class="text-ivory">${data.guests}</span></div>
        ${data.estimatedTotal ? `<div class="flex justify-between border-t border-champagne/15 pt-2"><span class="text-ivory/60">Est. Total:</span><span class="font-bold text-champagne text-sm">${data.estimatedTotal}</span></div>` : ''}
      </div>

      <div class="space-y-3">
        <a href="${data.whatsappUrl}" target="_blank" rel="noopener noreferrer"
           class="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-6 rounded-lg font-semibold tracking-wider uppercase transition duration-300 shadow-xl flex items-center justify-center gap-2 text-xs md:text-sm">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.384 9.86-9.768.001-2.61-1.013-5.064-2.855-6.909C16.438 2.083 13.99 1.07 11.4 1.07 5.969 1.07 1.547 5.456 1.545 10.842c-.001 1.597.424 3.156 1.233 4.544L1.78 20.58l5.228-1.378c-.138-.077-.257-.15-.361-.208z" />
          </svg>
          Continue to WhatsApp
        </a>

        <div class="flex gap-2">
          <button type="button" onclick="copyInquiryDetails('${encodeURIComponent(data.messageText)}')"
                  class="flex-1 bg-deep-forest/80 border border-champagne/20 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded text-xs transition">
            📋 Copy Details
          </button>
          <a href="tel:+254746938529"
             class="flex-1 text-center bg-deep-forest/80 border border-champagne/20 hover:border-champagne text-ivory/80 hover:text-champagne py-2.5 rounded text-xs transition">
            📞 Call Reservations
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeInquiryModal() {
  const modal = document.getElementById('inquiry-review-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function copyInquiryDetails(encodedText) {
  const text = decodeURIComponent(encodedText);
  navigator.clipboard.writeText(text).then(() => {
    alert('Inquiry details copied to clipboard!');
  }).catch(() => {
    prompt('Copy your inquiry details:', text);
  });
}

// ── DOM LOAD INITIALIZER ──
window.addEventListener('DOMContentLoaded', () => {
  const today = getNairobiDateString(0);
  const tomorrow = getNairobiDateString(1);
  const dayAfter = getNairobiDateString(2);

  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');

  if (checkInInput) {
    checkInInput.min = today;
    if (!checkInInput.value) checkInInput.value = tomorrow;
    checkInInput.addEventListener('change', () => {
      if (checkOutInput && checkOutInput.value <= checkInInput.value) {
        const nextDay = new Date(checkInInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutInput.value = nextDay.toISOString().split('T')[0];
      }
      updatePriceCalculation();
    });
  }

  if (checkOutInput) {
    checkOutInput.min = tomorrow;
    if (!checkOutInput.value) checkOutInput.value = dayAfter;
    checkOutInput.addEventListener('change', updatePriceCalculation);
  }

  const propertyInput = document.getElementById('booking-property');
  if (propertyInput) {
    propertyInput.addEventListener('change', handlePropertyChange);
  }

  const bookingForms = document.querySelectorAll('form');
  bookingForms.forEach(form => {
    if (form.id.includes('booking') || form.id.includes('cottage') || form.id.includes('property') || form.querySelector('#check-in')) {
      form.removeAttribute('onsubmit');
      form.addEventListener('submit', handleBookingSubmit);
    }
  });

  updatePriceCalculation();
});
