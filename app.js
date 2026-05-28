/* -------------------------------------------------------------
   LuxeHaven Hotels & Resorts - Upgraded Real-to-Real Engine
---------------------------------------------------------------- */

// 1. Initial Mock Database with stock constraints
const INITIAL_ROOMS = [
    {
        id: "room-standard",
        title: "Standard Garden Retreat",
        category: "Standard",
        price: 130,
        capacity: 2,
        rating: 4.5,
        ratingCount: 8,
        description: "A peaceful sanctuary nestled amid lush tropical gardens, featuring organic textiles, a private terrace, and modern tech comforts.",
        amenities: ["Wi-Fi", "Mini Bar"],
        image: "room_standard.jpg",
        stock: 5 // 5 rooms available of this type
    },
    {
        id: "room-deluxe",
        title: "Deluxe Oceanfront Sanctuary",
        category: "Deluxe",
        price: 290,
        capacity: 2,
        rating: 4.8,
        ratingCount: 14,
        description: "Wake up to endless vistas of azure waves. Features a king bed, panoramic floor-to-ceiling glass doors, and a private balcony overlooking the ocean.",
        amenities: ["Wi-Fi", "Ocean View", "Mini Bar"],
        image: "room_deluxe.jpg",
        stock: 3 // 3 rooms available of this type
    },
    {
        id: "room-suite",
        title: "Signature Wellness Suite",
        category: "Suite",
        price: 490,
        capacity: 4,
        rating: 4.9,
        ratingCount: 22,
        description: "Rejuvenate your senses in this expansive suite. Offers a steam bath, dedicated meditation space, deep soaking tub, and custom dietary services.",
        amenities: ["Wi-Fi", "Ocean View", "Mini Bar", "Spa Access"],
        image: "room_suite.jpg",
        stock: 2 // 2 suites available of this type
    },
    {
        id: "room-penthouse",
        title: "Grand Presidential Penthouse",
        category: "Penthouse",
        price: 1150,
        capacity: 6,
        rating: 4.95,
        ratingCount: 31,
        description: "The ultimate expression of luxury. Spans the entire top floor, including a private infinity plunge pool, full chef's kitchen, personal butler service, and helicopter terminal access.",
        amenities: ["Wi-Fi", "Ocean View", "Mini Bar", "Spa Access", "Private Pool"],
        image: "room_penthouse.jpg",
        stock: 1 // Only 1 penthouse exists!
    }
];

const INITIAL_REVIEWS = {
    "room-standard": [
        { author: "Michael C.", rating: 5, date: "May 12, 2026", content: "Absolutely lovely room. Very clean, quiet, and the garden views are incredibly peaceful." },
        { author: "Emily R.", rating: 4, date: "Apr 29, 2026", content: "Great value. The garden terrace is perfect for morning coffee. Service was outstanding." }
    ],
    "room-deluxe": [
        { author: "Alexander K.", rating: 5, date: "May 20, 2026", content: "The ocean views are breathtaking! Falling asleep to the sound of waves was magical. Worth every penny." },
        { author: "Sophia M.", rating: 4, date: "May 08, 2026", content: "Beautiful design and layout. Highly recommend booking a floor higher up." }
    ],
    "room-suite": [
        { author: "David T.", rating: 5, date: "May 25, 2026", content: "The spa access and soaking tub were heavenly. A truly restorative retreat for our family." }
    ],
    "room-penthouse": [
        { author: "Marcus V.", rating: 5, date: "May 27, 2026", content: "Indescribable luxury. The private plunge pool looking over the sunset was a highlight of my year." }
    ]
};

// 2. Application State Initialization
let rooms = JSON.parse(localStorage.getItem("luxehaven_rooms")) || INITIAL_ROOMS;
let reviews = JSON.parse(localStorage.getItem("luxehaven_reviews")) || INITIAL_REVIEWS;
let bookings = JSON.parse(localStorage.getItem("luxehaven_bookings")) || [];

// Save to LocalStorage helper
function saveState() {
    localStorage.setItem("luxehaven_rooms", JSON.stringify(rooms));
    localStorage.setItem("luxehaven_reviews", JSON.stringify(reviews));
    localStorage.setItem("luxehaven_bookings", JSON.stringify(bookings));
}

// 3. UI State Variables
let currentActiveRoom = null;
let currentBookingDays = 0;
let currentBookingTotalPrice = 0;
let currentPromoDiscount = 0;
let appliedPromoCode = "";
let currentModifyingBooking = null;

let activeFilters = {
    category: "all",
    maxPrice: 1500,
    amenities: [],
    minRating: 0,
    availableOnly: false,
    checkIn: "",
    checkOut: ""
};

// 4. Document Elements Setup
document.addEventListener("DOMContentLoaded", () => {
    // Theme setup
    const savedTheme = localStorage.getItem("luxehaven_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    // Initial setups
    initMinDates();
    renderRooms();
    renderBookings();
    setupEventListeners();
});

// Update Theme Icon representation
function updateThemeIcon(theme) {
    const sunIcon = document.querySelector(".sun-icon");
    if (!sunIcon) return;
    if (theme === "light") {
        // Moon path
        sunIcon.setAttribute("d", "M12.1 12.1c.8.8.8 2 0 2.8s-2 .8-2.8 0l-5-5c-.8-.8-.8-2 0-2.8s2-.8 2.8 0l5 5zm9.9-5.1c-.8.8-2 .8-2.8 0s-.8-2 0-2.8l2.8-2.8c.8-.8 2-.8 2.8 0s.8 2 0 2.8l-2.8 2.8zm-15-5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8l2.8-2.8c.8-.8 2-.8 2.8 0s.8 2 0 2.8l-2.8 2.8zm15 15c-.8.8-2 .8-2.8 0s-.8-2 0-2.8l2.8-2.8c.8-.8 2-.8 2.8 0s.8 2 0 2.8l-2.8 2.8zm-15 0c-.8.8-2 .8-2.8 0s-.8-2 0-2.8l2.8-2.8c.8-.8 2-.8 2.8 0s.8 2 0 2.8l-2.8 2.8z");
    } else {
        // Sun path
        sunIcon.setAttribute("d", "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.02 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z");
    }
}

// Set check-in/out limits to today
function initMinDates() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("check-in").min = today;
    document.getElementById("check-out").min = today;
    document.getElementById("booking-check-in").min = today;
    document.getElementById("booking-check-out").min = today;
    document.getElementById("modify-check-in").min = today;
    document.getElementById("modify-check-out").min = today;
}

// 5. Render Rooms Catalog Grid
function renderRooms() {
    const grid = document.getElementById("rooms-grid");
    const noRoomsMessage = document.getElementById("no-rooms-message");
    
    grid.innerHTML = "";
    
    const filtered = rooms.filter(room => {
        // Category filter
        if (activeFilters.category !== "all" && room.category !== activeFilters.category) return false;
        
        // Price filter
        if (room.price > activeFilters.maxPrice) return false;
        
        // Rating filter
        if (room.rating < activeFilters.minRating) return false;
        
        // Amenities filter
        for (const am of activeFilters.amenities) {
            if (!room.amenities.includes(am)) return false;
        }
        
        // Date range availability filter
        const stockLeft = getAvailableStockInDates(room.id, activeFilters.checkIn, activeFilters.checkOut);
        if (activeFilters.availableOnly && stockLeft <= 0) return false;
        
        return true;
    });

    if (filtered.length === 0) {
        grid.classList.add("hidden");
        noRoomsMessage.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    noRoomsMessage.classList.add("hidden");

    filtered.forEach(room => {
        const stockLeft = getAvailableStockInDates(room.id, activeFilters.checkIn, activeFilters.checkOut);
        const isSoldOut = stockLeft <= 0;
        
        let statusText = "Available";
        let statusClass = "available";
        if (isSoldOut) {
            statusText = "Sold Out";
            statusClass = "reserved";
        } else if (stockLeft <= 2) {
            statusText = `Only ${stockLeft} Left!`;
            statusClass = "reserved"; // Glows amber/red to indicate low stock
        }
        
        const card = document.createElement("div");
        card.className = "room-card glass";
        card.innerHTML = `
            <div class="room-img-wrapper">
                <img src="${room.image}" alt="${room.title}" class="room-img">
                <span class="room-status-badge ${statusClass}">${statusText}</span>
                <span class="room-rating-badge">★ ${room.rating.toFixed(1)}</span>
            </div>
            <div class="room-card-content">
                <div class="room-card-header">
                    <h3 class="room-title">${room.title}</h3>
                    <div class="room-price-info">
                        <span class="price-num">$${room.price}</span>
                        <span class="price-text">per night</span>
                    </div>
                </div>
                <p class="room-description">${room.description}</p>
                <div class="room-specs">
                    <div class="room-spec-item">
                        <span class="spec-icon">👥</span>
                        <span>Up to ${room.capacity} Guests</span>
                    </div>
                    <div class="room-spec-item">
                        <span class="spec-icon">🏠</span>
                        <span>${room.category} Class</span>
                    </div>
                </div>
                <div class="room-amenities-mini">
                    ${room.amenities.map(am => `<span class="amenity-tag">${am}</span>`).join("")}
                </div>
                <div class="room-card-actions">
                    <button class="btn btn-outline" onclick="openDetailsModal('${room.id}')">View Details</button>
                    <button class="btn btn-primary" onclick="initiateBooking('${room.id}')" ${isSoldOut ? "disabled" : ""}>Book Now</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    const indicatorText = document.getElementById("filter-indicator-text");
    if (activeFilters.checkIn && activeFilters.checkOut) {
        indicatorText.innerHTML = `Stays between <strong class="text-gold">${activeFilters.checkIn}</strong> and <strong class="text-gold">${activeFilters.checkOut}</strong>`;
    } else {
        indicatorText.innerHTML = `Showing all available rooms`;
    }
}

// 6. Detailed Inventory Availability Calculations
function getAvailableStockInDates(roomId, checkInStr, checkOutStr, ignoreBookingRefId = null) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    
    // If no dates are checked, count current occupied stock
    if (!checkInStr || !checkOutStr) {
        const activeNow = bookings.filter(b => b.roomId === roomId && b.status === "Reserved" && ignoreBookingRefId !== b.refId).length;
        return Math.max(0, room.stock - activeNow);
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    let maxBookedOnAnyNight = 0;
    let current = new Date(checkIn);

    // Scan every night of the range
    while (current < checkOut) {
        const nightDateStr = current.toISOString().split("T")[0];
        let activeBookingsOnNight = 0;
        
        bookings.forEach(b => {
            if (b.roomId !== roomId || b.status !== "Reserved" || b.refId === ignoreBookingRefId) return;
            const bIn = new Date(b.checkIn);
            const bOut = new Date(b.checkOut);
            const nightTime = new Date(nightDateStr);
            if (nightTime >= bIn && nightTime < bOut) {
                activeBookingsOnNight++;
            }
        });

        if (activeBookingsOnNight > maxBookedOnAnyNight) {
            maxBookedOnAnyNight = activeBookingsOnNight;
        }
        
        current.setDate(current.getDate() + 1);
    }

    return Math.max(0, room.stock - maxBookedOnAnyNight);
}

// 7. Setup Event Listeners
function setupEventListeners() {
    // Theme Switch
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("luxehaven_theme", newTheme);
        updateThemeIcon(newTheme);
        showToast(`Switched to ${newTheme} theme`, "info");
    });

    // Navigation links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Search bar submit
    document.getElementById("search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const cIn = document.getElementById("check-in").value;
        const cOut = document.getElementById("check-out").value;
        const guests = parseInt(document.getElementById("guests").value);
        const type = document.getElementById("room-type").value;
        
        if (cIn && cOut && new Date(cIn) >= new Date(cOut)) {
            showToast("Check-out date must be after check-in date", "error");
            return;
        }

        activeFilters.checkIn = cIn;
        activeFilters.checkOut = cOut;
        activeFilters.category = type;
        
        renderRooms();
        document.getElementById("rooms-section").scrollIntoView({ behavior: "smooth" });
        showToast("Search filters applied successfully", "success");
    });

    // Sidebar Price range slider
    document.getElementById("price-range").addEventListener("input", (e) => {
        const val = e.target.value;
        document.getElementById("price-limit-val").innerText = `$${val}`;
        activeFilters.maxPrice = parseInt(val);
        renderRooms();
    });

    // Amenities filters checkboxes
    const amenityCheckboxes = document.querySelectorAll(".amenity-filter");
    amenityCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            activeFilters.amenities = Array.from(amenityCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            renderRooms();
        });
    });

    // Rating buttons
    const ratingBtns = document.querySelectorAll(".rating-btn");
    ratingBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const val = parseFloat(btn.getAttribute("data-rating"));
            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
                activeFilters.minRating = 0;
            } else {
                ratingBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeFilters.minRating = val;
            }
            renderRooms();
        });
    });

    // Available checkbox
    document.getElementById("available-only").addEventListener("change", (e) => {
        activeFilters.availableOnly = e.target.checked;
        renderRooms();
    });

    // Reset Filters
    const resetFilters = () => {
        activeFilters = {
            category: "all",
            maxPrice: 1500,
            amenities: [],
            minRating: 0,
            availableOnly: false,
            checkIn: "",
            checkOut: ""
        };
        document.getElementById("search-form").reset();
        document.getElementById("price-range").value = 1500;
        document.getElementById("price-limit-val").innerText = "$1500";
        document.getElementById("available-only").checked = false;
        amenityCheckboxes.forEach(cb => cb.checked = false);
        ratingBtns.forEach(b => b.classList.remove("active"));
        
        renderRooms();
        showToast("All filters reset", "info");
    };
    document.getElementById("reset-filters").addEventListener("click", resetFilters);
    document.getElementById("clear-all-filters-btn").addEventListener("click", resetFilters);

    // Modal dates change recalculations
    const bIn = document.getElementById("booking-check-in");
    const bOut = document.getElementById("booking-check-out");
    const bGuests = document.getElementById("booking-guests");
    [bIn, bOut, bGuests].forEach(el => {
        el.addEventListener("change", () => {
            calculateModalEstimate();
        });
    });

    // Packages and meal plans changes
    const mealPlanRadios = document.querySelectorAll('input[name="meal-plan"]');
    mealPlanRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            calculateModalEstimate();
        });
    });

    // Services Add-ons check events
    const addons = ["add-on-pickup", "add-on-checkout", "add-on-champagne"];
    addons.forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
            calculateModalEstimate();
        });
    });

    // Apply Promo Code
    document.getElementById("btn-apply-promo").addEventListener("click", applyPromoCode);

    // Modal buttons navigation
    document.getElementById("btn-close-booking-modal").addEventListener("click", closeBookingModal);
    document.getElementById("btn-close-details-modal").addEventListener("click", closeDetailsModal);
    
    document.getElementById("btn-goto-step-2").addEventListener("click", () => {
        const checkInVal = bIn.value;
        const checkOutVal = bOut.value;
        if (!checkInVal || !checkOutVal) {
            showToast("Please enter valid check-in and check-out dates", "error");
            return;
        }
        if (new Date(checkInVal) >= new Date(checkOutVal)) {
            showToast("Check-out date must be after check-in date", "error");
            return;
        }

        // Verify stock is still available
        const stockLeft = getAvailableStockInDates(currentActiveRoom.id, checkInVal, checkOutVal);
        if (stockLeft <= 0) {
            showToast("Sorry, this room class was just sold out for your selected dates.", "error");
            return;
        }

        showStep(2);
    });

    document.getElementById("btn-back-to-step-1").addEventListener("click", () => {
        showStep(1);
    });

    // Payment card masking
    const cardNum = document.getElementById("card-number");
    cardNum.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        let formatted = "";
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += val[i];
        }
        e.target.value = formatted;
    });

    const cardExpiry = document.getElementById("card-expiry");
    cardExpiry.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\//g, "").replace(/[^0-9]/gi, "");
        if (val.length >= 2) {
            e.target.value = val.slice(0, 2) + "/" + val.slice(2, 4);
        } else {
            e.target.value = val;
        }
    });

    // Submit checkout booking
    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const cNum = cardNum.value.replace(/\s/g, "");
        const cExp = cardExpiry.value;
        const cCvv = document.getElementById("card-cvv").value;
        
        if (cNum.length !== 16) {
            showToast("Card number must be 16 digits", "error");
            return;
        }
        if (!cExp.includes("/") || cExp.length !== 5) {
            showToast("Expiry date format must be MM/YY", "error");
            return;
        }
        if (cCvv.length < 3) {
            showToast("Invalid CVV code", "error");
            return;
        }

        completeBooking();
    });

    // Done booking
    document.getElementById("btn-finish-booking").addEventListener("click", () => {
        closeBookingModal();
        document.getElementById("dashboard-section").scrollIntoView({ behavior: "smooth" });
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        document.getElementById("nav-bookings-link").classList.add("active");
    });

    // Details Modal Book trigger
    document.getElementById("btn-details-book-now").addEventListener("click", () => {
        const rId = currentActiveRoom.id;
        closeDetailsModal();
        initiateBooking(rId);
    });

    // Rating Star buttons in Form reviews
    const starBtns = document.querySelectorAll(".rating-star-btn");
    starBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const val = parseInt(btn.getAttribute("data-star"));
            starBtns.forEach((b, idx) => {
                if (idx < val) b.classList.add("active");
                else b.classList.remove("active");
            });
            btn.parentNode.setAttribute("data-selected-rating", val);
        });
    });

    // Write review submit
    document.getElementById("review-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const ratingVal = parseInt(document.querySelector(".rating-input-stars").getAttribute("data-selected-rating") || "5");
        const author = document.getElementById("review-author").value;
        const comments = document.getElementById("review-content").value;
        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        
        if (!author.trim() || !comments.trim()) return;

        const newReview = { author, rating: ratingVal, date: today, content: comments };
        reviews[currentActiveRoom.id].push(newReview);

        const roomReviews = reviews[currentActiveRoom.id];
        const avg = roomReviews.reduce((sum, rev) => sum + rev.rating, 0) / roomReviews.length;
        
        const roomObj = rooms.find(r => r.id === currentActiveRoom.id);
        roomObj.rating = avg;
        roomObj.ratingCount = roomReviews.length;

        saveState();
        renderRoomReviews(currentActiveRoom.id);
        renderRooms(); 
        
        document.getElementById("review-form").reset();
        starBtns.forEach(b => b.classList.add("active")); 
        document.querySelector(".rating-input-stars").removeAttribute("data-selected-rating");
        
        showToast("Review submitted! Thank you.", "success");
    });

    // -------------------------------------------------------------
    // Chatbot Panel Interaction
    // -------------------------------------------------------------
    const chatWidget = document.getElementById("chatbot-widget");
    const chatTrigger = document.getElementById("chatbot-trigger");
    const chatPanel = document.getElementById("chatbot-panel");
    const closeChatBtn = document.getElementById("btn-close-chat");
    const chatForm = document.getElementById("chatbot-input-form");
    const chatInput = document.getElementById("chatbot-input");
    const chatBadge = document.getElementById("chat-badge");

    // Toggle Chat Panel
    chatTrigger.addEventListener("click", () => {
        chatPanel.classList.toggle("hidden");
        chatBadge.classList.add("hidden"); // Clear badge notifications
        if (!chatPanel.classList.contains("hidden")) {
            chatInput.focus();
        }
    });

    closeChatBtn.addEventListener("click", () => {
        chatPanel.classList.add("hidden");
    });

    // Suggested quick FAQs buttons click
    const suggestBtns = document.querySelectorAll(".chat-suggest-btn");
    suggestBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const q = btn.innerText;
            const qKey = btn.getAttribute("data-q");
            sendUserMessage(q);
            triggerBotResponse(qKey);
        });
    });

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        sendUserMessage(text);
        chatInput.value = "";
        
        // Analyze query keywords for butler response
        let queryKey = "default";
        const clean = text.toLowerCase();
        if (clean.includes("wifi") || clean.includes("wi-fi") || clean.includes("internet")) queryKey = "wifi";
        else if (clean.includes("checkin") || clean.includes("check-in") || clean.includes("checkout") || clean.includes("check-out") || clean.includes("hours")) queryKey = "checkin";
        else if (clean.includes("promo") || clean.includes("code") || clean.includes("discount") || clean.includes("coupon")) queryKey = "promo";
        else if (clean.includes("cancel") || clean.includes("refund") || clean.includes("cancellation")) queryKey = "cancel";
        else if (clean.includes("meal") || clean.includes("food") || clean.includes("breakfast") || clean.includes("inclusive") || clean.includes("dining")) queryKey = "dining";
        else if (clean.includes("spa") || clean.includes("pool") || clean.includes("massage")) queryKey = "spa";

        triggerBotResponse(queryKey);
    });

    function sendUserMessage(text) {
        const msgs = document.getElementById("chatbot-messages");
        const msg = document.createElement("div");
        msg.className = "chat-msg user";
        msg.innerHTML = `<p>${text}</p>`;
        msgs.appendChild(msg);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function triggerBotResponse(key) {
        const msgs = document.getElementById("chatbot-messages");
        
        // Show typing butler bubble
        const typingBubble = document.createElement("div");
        typingBubble.className = "chat-msg bot typing-indicator-bubble";
        typingBubble.innerHTML = `<p><em>Virtual butler typing...</em></p>`;
        msgs.appendChild(typingBubble);
        msgs.scrollTop = msgs.scrollHeight;

        setTimeout(() => {
            typingBubble.remove();
            
            let replyText = "";
            switch (key) {
                case "wifi":
                    replyText = "Yes, high-speed fiber Wi-Fi is complimentary for all guests across the entire resort. No login codes are needed—simply connect to 'LuxeHaven-Guest'.";
                    break;
                case "checkin":
                    replyText = "Standard check-in starts at 3:00 PM, and check-out is before 11:00 AM. We offer early check-in and late check-out options during booking (+$30.00 flat fee each).";
                    break;
                case "promo":
                    replyText = "Certainly! You can apply **WELCOME10** for 10% off your stay. Additionally, bookings of 4 nights or more qualify for **SUMMER25** (25% off base stay). Enter them on checkout!";
                    break;
                case "cancel":
                    replyText = "Reservations can be modified or cancelled free of charge up to 24 hours prior to check-in directly from your dashboard panel. Cancellations within 24 hours incur a 1-night rate fee.";
                    break;
                case "dining":
                    replyText = "We offer Room Only, Half Board (includes breakfast buffet, +$30/guest/night), or All-Inclusive (includes all meals, premium open bar, and spa access, +$150/guest/night).";
                    break;
                case "spa":
                    replyText = "LuxeHaven Spa is open daily from 8:00 AM to 10:00 PM. Suites and Penthouse bookings include free spa access. Standard and deluxe guests can purchase spa passes for $50/day.";
                    break;
                default:
                    replyText = "I'm happy to help you with booking arrangements! For reservations, room stock queries, dining options, or modifications, please select one of the suggested FAQs below or adjust your filters on the dashboard.";
            }

            const botMsg = document.createElement("div");
            botMsg.className = "chat-msg bot";
            botMsg.innerHTML = `<p>${replyText}</p>`;
            msgs.appendChild(botMsg);
            msgs.scrollTop = msgs.scrollHeight;
        }, 600);
    }

    // -------------------------------------------------------------
    // Modify Reservation Event Listeners
    // -------------------------------------------------------------
    document.getElementById("btn-close-modify-modal").addEventListener("click", closeModifyModal);
    document.getElementById("btn-cancel-modify").addEventListener("click", closeModifyModal);
    
    const mIn = document.getElementById("modify-check-in");
    const mOut = document.getElementById("modify-check-out");
    const mGuests = document.getElementById("modify-guests");
    const mPlan = document.getElementById("modify-meal-plan");
    const mPickup = document.getElementById("modify-addon-pickup");
    const mCheckout = document.getElementById("modify-addon-checkout");
    const mChampagne = document.getElementById("modify-addon-champagne");

    [mIn, mOut, mGuests, mPlan, mPickup, mCheckout, mChampagne].forEach(el => {
        el.addEventListener("change", calculateModifyEstimate);
    });

    document.getElementById("modify-booking-form").addEventListener("submit", (e) => {
        e.preventDefault();
        saveModifiedBooking();
    });
}

// 8. Initiate Booking Modal flow
function initiateBooking(roomId) {
    currentActiveRoom = rooms.find(r => r.id === roomId);
    if (!currentActiveRoom) return;

    // Load room details
    document.getElementById("modal-room-image").src = currentActiveRoom.image;
    document.getElementById("modal-room-title").innerText = currentActiveRoom.title;
    document.getElementById("modal-room-desc").innerText = currentActiveRoom.description;
    document.getElementById("modal-room-cap").innerText = `Capacity: Up to ${currentActiveRoom.capacity} Guests`;
    document.getElementById("modal-room-price-rate").innerText = `$${currentActiveRoom.price} / night`;

    // Prefill search queries if active
    document.getElementById("booking-check-in").value = activeFilters.checkIn;
    document.getElementById("booking-check-out").value = activeFilters.checkOut;

    // Reset Package options and promo code states
    document.querySelector('input[name="meal-plan"][value="room-only"]').checked = true;
    document.getElementById("add-on-pickup").checked = false;
    document.getElementById("add-on-checkout").checked = false;
    document.getElementById("add-on-champagne").checked = false;
    document.getElementById("promo-code-input").value = "";
    document.getElementById("promo-status-msg").innerText = "";
    appliedPromoCode = "";
    currentPromoDiscount = 0;

    // Max capacity guests match dropdown
    const guestSelect = document.getElementById("booking-guests");
    guestSelect.innerHTML = "";
    for (let i = 1; i <= currentActiveRoom.capacity; i++) {
        guestSelect.innerHTML += `<option value="${i}">${i} Guest${i > 1 ? "s" : ""}</option>`;
    }
    
    document.getElementById("checkout-form").reset();
    showStep(1);
    calculateModalEstimate();
    
    document.getElementById("booking-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

// Apply Promo Code discounts
function applyPromoCode() {
    const input = document.getElementById("promo-code-input").value.trim().toUpperCase();
    const msg = document.getElementById("promo-status-msg");
    
    if (!input) {
        showToast("Please enter a promo code", "error");
        return;
    }
    
    if (!currentActiveRoom || currentBookingDays === 0) {
        showToast("Please select dates first", "error");
        return;
    }

    let baseRateSubtotal = currentActiveRoom.price * currentBookingDays;
    let discount = 0;
    
    if (input === "WELCOME10") {
        discount = baseRateSubtotal * 0.10;
        msg.className = "promo-status-msg mt-1 text-gold";
        msg.innerText = "WELCOME10 applied (10% off stay)";
        appliedPromoCode = "WELCOME10";
    } else if (input === "SUMMER25") {
        if (currentBookingDays >= 4) {
            discount = baseRateSubtotal * 0.25;
            msg.className = "promo-status-msg mt-1 text-gold";
            msg.innerText = "SUMMER25 applied (25% off stay)";
            appliedPromoCode = "SUMMER25";
        } else {
            msg.className = "promo-status-msg mt-1 text-red";
            msg.innerText = "SUMMER25 requires a minimum of 4 nights.";
            discount = 0;
            appliedPromoCode = "";
        }
    } else if (input === "RETREAT100") {
        if (currentActiveRoom.category === "Suite" || currentActiveRoom.category === "Penthouse") {
            discount = 100;
            msg.className = "promo-status-msg mt-1 text-gold";
            msg.innerText = "RETREAT100 applied ($100.00 off Suite/Penthouse)";
            appliedPromoCode = "RETREAT100";
        } else {
            msg.className = "promo-status-msg mt-1 text-red";
            msg.innerText = "RETREAT100 only applicable for Suite or Penthouse categories.";
            discount = 0;
            appliedPromoCode = "";
        }
    } else {
        msg.className = "promo-status-msg mt-1 text-red";
        msg.innerText = "Invalid Promo Code.";
        discount = 0;
        appliedPromoCode = "";
    }
    
    currentPromoDiscount = discount;
    calculateModalEstimate();
    if (discount > 0) {
        showToast("Promo code applied successfully", "success");
    }
}

// Calculate price estimates
function calculateModalEstimate() {
    const cIn = document.getElementById("booking-check-in").value;
    const cOut = document.getElementById("booking-check-out").value;
    const guests = parseInt(document.getElementById("booking-guests").value) || 1;
    const nextBtn = document.getElementById("btn-goto-step-2");
    
    if (!cIn || !cOut) {
        resetEstimates();
        nextBtn.disabled = true;
        return;
    }

    const checkInDate = new Date(cIn);
    const checkOutDate = new Date(cOut);

    if (checkInDate >= checkOutDate) {
        resetEstimates();
        nextBtn.disabled = true;
        return;
    }

    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    currentBookingDays = diffDays;
    
    // 1. Base cost
    const base = currentActiveRoom.price * diffDays;
    
    // 2. Meal Package cost
    let packageRate = 0;
    const mealPlanActive = document.querySelector('input[name="meal-plan"]:checked').value;
    if (mealPlanActive === "half-board") packageRate = 30;
    else if (mealPlanActive === "all-inclusive") packageRate = 150;
    const packageCost = packageRate * guests * diffDays;
    
    // 3. Add-ons services cost
    let addonCost = 0;
    if (document.getElementById("add-on-pickup").checked) addonCost += 50;
    if (document.getElementById("add-on-checkout").checked) addonCost += 30;
    if (document.getElementById("add-on-champagne").checked) addonCost += 45;
    
    // 4. Discounts applied to Base Stay
    let discount = 0;
    if (appliedPromoCode === "WELCOME10") discount = base * 0.10;
    else if (appliedPromoCode === "SUMMER25") {
        if (diffDays >= 4) discount = base * 0.25;
        else {
            discount = 0;
            appliedPromoCode = "";
            document.getElementById("promo-status-msg").innerText = "";
            document.getElementById("promo-code-input").value = "";
        }
    } else if (appliedPromoCode === "RETREAT100") discount = 100;
    currentPromoDiscount = discount;
    
    // Taxes & Fees: 12% Occupancy Tax, 10% Amenity Fee
    const taxableSubtotal = base + packageCost + addonCost - discount;
    const tax = Math.max(0, taxableSubtotal * 0.12);
    const resortFee = Math.max(0, taxableSubtotal * 0.10);
    const total = taxableSubtotal + tax + resortFee;
    
    currentBookingTotalPrice = total;

    // Render detailed invoicing estimates
    document.getElementById("bill-days-label").innerText = `$${currentActiveRoom.price} x ${diffDays} night${diffDays > 1 ? 's' : ''}`;
    document.getElementById("bill-base-price").innerText = `$${base.toFixed(2)}`;
    document.getElementById("bill-packages-price").innerText = `$${packageCost.toFixed(2)}`;
    document.getElementById("bill-addons-price").innerText = `$${addonCost.toFixed(2)}`;
    
    if (discount > 0) {
        document.getElementById("bill-discount-row").style.display = "flex";
        document.getElementById("bill-discount-price").innerText = `-$${discount.toFixed(2)}`;
    } else {
        document.getElementById("bill-discount-row").style.display = "none";
    }
    
    document.getElementById("bill-tax-fee").innerText = `$${tax.toFixed(2)}`;
    document.getElementById("bill-service-fee").innerText = `$${resortFee.toFixed(2)}`;
    document.getElementById("bill-total-price").innerText = `$${total.toFixed(2)}`;
    
    nextBtn.disabled = false;
}

function resetEstimates() {
    document.getElementById("bill-days-label").innerText = `$0 x 0 nights`;
    document.getElementById("bill-base-price").innerText = `$0.00`;
    document.getElementById("bill-packages-price").innerText = `$0.00`;
    document.getElementById("bill-addons-price").innerText = `$0.00`;
    document.getElementById("bill-discount-row").style.display = "none";
    document.getElementById("bill-tax-fee").innerText = `$0.00`;
    document.getElementById("bill-service-fee").innerText = `$0.00`;
    document.getElementById("bill-total-price").innerText = `$0.00`;
    currentBookingDays = 0;
    currentBookingTotalPrice = 0;
}

function showStep(stepNum) {
    document.querySelectorAll(".step-pane").forEach(p => p.classList.add("hidden"));
    document.getElementById(`step-pane-${stepNum}`).classList.remove("hidden");

    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (i < stepNum) dot.className = "step completed";
        else if (i === stepNum) dot.className = "step active";
        else dot.className = "step";
    }
}

function completeBooking() {
    const cIn = document.getElementById("booking-check-in").value;
    const cOut = document.getElementById("booking-check-out").value;
    const guests = parseInt(document.getElementById("booking-guests").value);
    const guestName = document.getElementById("guest-name").value;
    const guestEmail = document.getElementById("guest-email").value;
    const notes = document.getElementById("booking-notes").value;

    const bookingRef = "LH-" + Math.floor(10000 + Math.random() * 90000);

    // Get current package meal plan label
    const mealActive = document.querySelector('input[name="meal-plan"]:checked').value;
    let mealLabel = "Room Only";
    if (mealActive === "half-board") mealLabel = "Half Board";
    else if (mealActive === "all-inclusive") mealLabel = "All-Inclusive";

    // Get add-ons labels
    let addonLabels = [];
    if (document.getElementById("add-on-pickup").checked) addonLabels.push("VIP Pickup");
    if (document.getElementById("add-on-checkout").checked) addonLabels.push("Early check-in/out");
    if (document.getElementById("add-on-champagne").checked) addonLabels.push("Welcome Champagne");
    const addonsStr = addonLabels.length > 0 ? addonLabels.join(", ") : "None";

    const newBooking = {
        refId: bookingRef,
        roomId: currentActiveRoom.id,
        roomTitle: currentActiveRoom.title,
        roomImage: currentActiveRoom.image,
        checkIn: cIn,
        checkOut: cOut,
        guests: guests,
        mealPlan: mealActive,
        mealPlanLabel: mealLabel,
        addons: {
            pickup: document.getElementById("add-on-pickup").checked,
            checkout: document.getElementById("add-on-checkout").checked,
            champagne: document.getElementById("add-on-champagne").checked
        },
        addonsStr: addonsStr,
        promoCode: appliedPromoCode,
        discount: currentPromoDiscount,
        totalPrice: currentBookingTotalPrice,
        guestName: guestName,
        guestEmail: guestEmail,
        notes: notes,
        status: "Reserved",
        bookedDate: new Date().toLocaleDateString()
    };

    bookings.push(newBooking);
    saveState();

    // Render detailed final receipt modal elements
    document.getElementById("receipt-ref-id").innerText = `#${bookingRef}`;
    document.getElementById("receipt-room-name").innerText = currentActiveRoom.title;
    document.getElementById("receipt-dates").innerText = `${formatDateShort(cIn)} - ${formatDateShort(cOut)}`;
    document.getElementById("receipt-package").innerText = mealLabel;
    document.getElementById("receipt-addons").innerText = addonsStr;
    
    const receiptDiscLine = document.getElementById("receipt-discount-line");
    if (currentPromoDiscount > 0) {
        receiptDiscLine.style.display = "flex";
        document.getElementById("receipt-discount").innerText = `-$${currentPromoDiscount.toFixed(2)}`;
    } else {
        receiptDiscLine.style.display = "none";
    }

    document.getElementById("receipt-total").innerText = `$${currentBookingTotalPrice.toFixed(2)}`;

    showStep(3);
    renderRooms();
    renderBookings();
    showToast("Reservation verified and successfully processed!", "success");
}

function closeBookingModal() {
    document.getElementById("booking-modal").classList.add("hidden");
    document.body.style.overflow = "auto";
}

// 9. Details Modal & Subscores Ratings
function openDetailsModal(roomId) {
    currentActiveRoom = rooms.find(r => r.id === roomId);
    if (!currentActiveRoom) return;

    document.getElementById("details-room-image").src = currentActiveRoom.image;
    document.getElementById("details-room-title").innerText = currentActiveRoom.title;
    document.getElementById("details-room-description").innerText = currentActiveRoom.description;
    document.getElementById("details-room-price").innerText = `$${currentActiveRoom.price}`;
    
    document.getElementById("details-room-stars").innerText = "★".repeat(Math.round(currentActiveRoom.rating)) + "☆".repeat(5 - Math.round(currentActiveRoom.rating));
    document.getElementById("details-room-rating-score").innerText = `${currentActiveRoom.rating.toFixed(1)} (${currentActiveRoom.ratingCount} reviews)`;
    
    // Set custom room scores based on room type
    let clean = 4.8, comfort = 4.7, service = 4.8, location = 4.9;
    if (roomId === "room-standard") {
        clean = 4.4; comfort = 4.5; service = 4.6; location = 4.5;
    } else if (roomId === "room-deluxe") {
        clean = 4.7; comfort = 4.8; service = 4.8; location = 4.9;
    } else if (roomId === "room-suite") {
        clean = 4.9; comfort = 4.9; service = 4.9; location = 4.9;
    } else if (roomId === "room-penthouse") {
        clean = 4.95; comfort = 4.95; service = 4.95; location = 4.95;
    }

    document.getElementById("score-clean").innerText = clean.toFixed(1);
    document.getElementById("bar-clean").style.width = `${(clean/5)*100}%`;
    document.getElementById("score-comfort").innerText = comfort.toFixed(1);
    document.getElementById("bar-comfort").style.width = `${(comfort/5)*100}%`;
    document.getElementById("score-service").innerText = service.toFixed(1);
    document.getElementById("bar-service").style.width = `${(service/5)*100}%`;
    document.getElementById("score-location").innerText = location.toFixed(1);
    document.getElementById("bar-location").style.width = `${(location/5)*100}%`;

    // Available count checker
    const stockLeft = getAvailableStockInDates(currentActiveRoom.id, activeFilters.checkIn, activeFilters.checkOut);
    const statusText = document.getElementById("details-room-status");
    if (stockLeft <= 0) {
        statusText.innerText = "Sold Out";
        statusText.className = "details-meta-pill text-gold reserved-pill";
        document.getElementById("btn-details-book-now").disabled = true;
        document.getElementById("btn-details-book-now").innerText = "Sold out for selected dates";
    } else {
        statusText.innerText = stockLeft <= 2 ? `Only ${stockLeft} left!` : "Available";
        statusText.className = "details-meta-pill available-pill";
        document.getElementById("btn-details-book-now").disabled = false;
        document.getElementById("btn-details-book-now").innerText = "Initiate Booking Flow";
    }

    document.getElementById("details-room-amenities").innerHTML = currentActiveRoom.amenities.map(am => `<span class="amenity-tag">${am}</span>`).join("");
    renderRoomReviews(roomId);

    document.getElementById("details-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function renderRoomReviews(roomId) {
    const list = document.getElementById("details-reviews-list");
    list.innerHTML = "";
    
    const roomReviews = reviews[roomId] || [];
    
    if (roomReviews.length === 0) {
        list.innerHTML = `<p class="text-secondary text-center py-4">No reviews yet. Be the first to share your experience!</p>`;
        document.getElementById("reviews-avg-header").innerText = "No Ratings";
        return;
    }

    const avg = roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length;
    document.getElementById("reviews-avg-header").innerText = `★ ${avg.toFixed(1)} Average Star Rating`;

    roomReviews.slice().reverse().forEach(rev => {
        const bubble = document.createElement("div");
        bubble.className = "review-bubble";
        bubble.innerHTML = `
            <div class="review-meta">
                <span class="review-author">${rev.author}</span>
                <span class="stars-gold">${"★".repeat(rev.rating)}</span>
                <span class="text-secondary">${rev.date}</span>
            </div>
            <p class="review-content">${rev.content}</p>
        `;
        list.appendChild(bubble);
    });
}

function closeDetailsModal() {
    document.getElementById("details-modal").classList.add("hidden");
    document.body.style.overflow = "auto";
}

// 10. Dashboard Reservations Render list
function renderBookings() {
    const list = document.getElementById("bookings-list");
    const emptyView = document.getElementById("empty-bookings-view");
    const badge = document.getElementById("bookings-count");
    
    list.innerHTML = "";
    
    const activeBookings = bookings.filter(b => b.status === "Reserved");
    badge.innerText = activeBookings.length;
    document.getElementById("bookings-count").className = activeBookings.length > 0 ? "badge" : "badge hidden";

    const spent = bookings.reduce((sum, b) => b.status === "Reserved" ? sum + b.totalPrice : sum, 0);
    document.getElementById("stat-active-count").innerText = activeBookings.length;
    document.getElementById("stat-total-spent").innerText = `$${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (activeBookings.length === 0) {
        list.classList.add("hidden");
        emptyView.classList.remove("hidden");
        return;
    }

    list.classList.remove("hidden");
    emptyView.classList.add("hidden");

    activeBookings.forEach(booking => {
        const card = document.createElement("div");
        card.className = "booking-item-card glass";
        card.innerHTML = `
            <img src="${booking.roomImage}" alt="${booking.roomTitle}" class="booking-card-thumb">
            <div class="booking-card-info">
                <span class="booking-ref">Ref: ${booking.refId} (Meal: ${booking.mealPlanLabel})</span>
                <h4>${booking.roomTitle}</h4>
                <div class="booking-dates">
                    <span class="booking-dates-icon">📅</span>
                    <span>${formatDateFull(booking.checkIn)} — ${formatDateFull(booking.checkOut)}</span>
                </div>
            </div>
            <div class="booking-price-badge">
                <div class="booking-price">$${booking.totalPrice.toFixed(2)}</div>
                <div class="booking-days">Nights: ${getDaysDiff(booking.checkIn, booking.checkOut)} | Extras: ${booking.addonsStr !== "None" ? "Yes" : "No"}</div>
            </div>
            <div class="booking-actions">
                <button class="btn btn-outline" style="margin-right: 8px;" onclick="openModifyModal('${booking.refId}')">Modify Stay</button>
                <button class="btn btn-outline" onclick="cancelBooking('${booking.refId}')">Cancel</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function cancelBooking(refId) {
    if (confirm("Are you sure you want to cancel this reservation? All cancellations are fully refundable prior to check-in.")) {
        const booking = bookings.find(b => b.refId === refId);
        if (booking) {
            booking.status = "Cancelled";
            saveState();
            renderRooms();
            renderBookings();
            showToast("Reservation successfully cancelled. Refund processed.", "success");
        }
    }
}

// -------------------------------------------------------------
// Modify Stay Dialog Handlers
// -------------------------------------------------------------
function openModifyModal(refId) {
    currentModifyingBooking = bookings.find(b => b.refId === refId);
    if (!currentModifyingBooking) return;

    const room = rooms.find(r => r.id === currentModifyingBooking.roomId);
    if (!room) return;

    // Fill modify modal inputs
    document.getElementById("modify-ref-id").value = refId;
    document.getElementById("modify-room-name").value = currentModifyingBooking.roomTitle;
    document.getElementById("modify-check-in").value = currentModifyingBooking.checkIn;
    document.getElementById("modify-check-out").value = currentModifyingBooking.checkOut;
    document.getElementById("modify-meal-plan").value = currentModifyingBooking.mealPlan;
    
    // Set guest dropdown max capacity matching
    const guestSelect = document.getElementById("modify-guests");
    guestSelect.innerHTML = "";
    for (let i = 1; i <= room.capacity; i++) {
        guestSelect.innerHTML += `<option value="${i}">${i} Guest${i > 1 ? "s" : ""}</option>`;
    }
    guestSelect.value = currentModifyingBooking.guests;

    // Checkbox add-ons
    document.getElementById("modify-addon-pickup").checked = currentModifyingBooking.addons.pickup;
    document.getElementById("modify-addon-checkout").checked = currentModifyingBooking.addons.checkout;
    document.getElementById("modify-addon-champagne").checked = currentModifyingBooking.addons.champagne;

    calculateModifyEstimate();

    document.getElementById("modify-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function calculateModifyEstimate() {
    if (!currentModifyingBooking) return;
    const room = rooms.find(r => r.id === currentModifyingBooking.roomId);
    if (!room) return;

    const cIn = document.getElementById("modify-check-in").value;
    const cOut = document.getElementById("modify-check-out").value;
    const guests = parseInt(document.getElementById("modify-guests").value) || 1;
    const applyBtn = document.getElementById("btn-save-modify");
    
    if (!cIn || !cOut) {
        document.getElementById("modify-bill-total").innerText = "$0.00";
        document.getElementById("modify-diff-message").innerText = "";
        applyBtn.disabled = true;
        return;
    }

    const checkInDate = new Date(cIn);
    const checkOutDate = new Date(cOut);

    if (checkInDate >= checkOutDate) {
        document.getElementById("modify-bill-total").innerText = "$0.00";
        document.getElementById("modify-diff-message").innerText = "Check-out must be after check-in.";
        document.getElementById("modify-diff-message").className = "text-red";
        applyBtn.disabled = true;
        return;
    }

    const diffDays = getDaysDiff(cIn, cOut);
    
    // 1. Base Stay
    const base = room.price * diffDays;
    
    // 2. Meal packages
    let packageRate = 0;
    const mealActive = document.getElementById("modify-meal-plan").value;
    if (mealActive === "half-board") packageRate = 30;
    else if (mealActive === "all-inclusive") packageRate = 150;
    const packageCost = packageRate * guests * diffDays;
    
    // 3. Add-on services
    let addonCost = 0;
    if (document.getElementById("modify-addon-pickup").checked) addonCost += 50;
    if (document.getElementById("modify-addon-checkout").checked) addonCost += 30;
    if (document.getElementById("modify-addon-champagne").checked) addonCost += 45;

    // Apply old discount if promo was validated
    let discount = 0;
    if (currentModifyingBooking.promoCode) {
        const promo = currentModifyingBooking.promoCode;
        if (promo === "WELCOME10") discount = base * 0.10;
        else if (promo === "SUMMER25") {
            if (diffDays >= 4) discount = base * 0.25;
        } else if (promo === "RETREAT100") discount = 100;
    }

    // Taxes Occupancy (12%) & Amenity (10%)
    const taxableSubtotal = base + packageCost + addonCost - discount;
    const tax = Math.max(0, taxableSubtotal * 0.12);
    const resortFee = Math.max(0, taxableSubtotal * 0.10);
    const total = taxableSubtotal + tax + resortFee;

    // Render price comparisons
    document.getElementById("modify-bill-total").innerText = `$${total.toFixed(2)}`;
    
    const difference = total - currentModifyingBooking.totalPrice;
    const diffMsg = document.getElementById("modify-diff-message");
    if (difference > 0) {
        diffMsg.className = "text-gold";
        diffMsg.innerText = `Outstanding Balance: +$${difference.toFixed(2)} due at check-in.`;
    } else if (difference < 0) {
        diffMsg.className = "text-gold";
        diffMsg.innerText = `Refund Due: -$${Math.abs(difference).toFixed(2)} will be credited back.`;
    } else {
        diffMsg.className = "text-secondary";
        diffMsg.innerText = "No price modifications required.";
    }

    applyBtn.disabled = false;
}

function saveModifiedBooking() {
    if (!currentModifyingBooking) return;

    const cIn = document.getElementById("modify-check-in").value;
    const cOut = document.getElementById("modify-check-out").value;
    const guests = parseInt(document.getElementById("modify-guests").value);
    
    // Check inventory availability (ignoring current booking reference itself!)
    const stockLeft = getAvailableStockInDates(currentModifyingBooking.roomId, cIn, cOut, currentModifyingBooking.refId);
    if (stockLeft <= 0) {
        showToast("Sanctuary is sold out for these modified dates. Try other dates.", "error");
        return;
    }

    // Capture values
    const mealActive = document.getElementById("modify-meal-plan").value;
    let mealLabel = "Room Only";
    if (mealActive === "half-board") mealLabel = "Half Board";
    else if (mealActive === "all-inclusive") mealLabel = "All-Inclusive";

    let addonLabels = [];
    const pickup = document.getElementById("modify-addon-pickup").checked;
    const checkout = document.getElementById("modify-addon-checkout").checked;
    const champagne = document.getElementById("modify-addon-champagne").checked;
    if (pickup) addonLabels.push("VIP Pickup");
    if (checkout) addonLabels.push("Early check-in/out");
    if (champagne) addonLabels.push("Welcome Champagne");
    const addonsStr = addonLabels.length > 0 ? addonLabels.join(", ") : "None";

    const room = rooms.find(r => r.id === currentModifyingBooking.roomId);
    const diffDays = getDaysDiff(cIn, cOut);
    const base = room.price * diffDays;

    let packageRate = 0;
    if (mealActive === "half-board") packageRate = 30;
    else if (mealActive === "all-inclusive") packageRate = 150;
    const packageCost = packageRate * guests * diffDays;
    
    let addonCost = 0;
    if (pickup) addonCost += 50;
    if (checkout) addonCost += 30;
    if (champagne) addonCost += 45;

    let discount = 0;
    if (currentModifyingBooking.promoCode) {
        const promo = currentModifyingBooking.promoCode;
        if (promo === "WELCOME10") discount = base * 0.10;
        else if (promo === "SUMMER25" && diffDays >= 4) discount = base * 0.25;
        else if (promo === "RETREAT100") discount = 100;
    }

    const taxableSubtotal = base + packageCost + addonCost - discount;
    const tax = Math.max(0, taxableSubtotal * 0.12);
    const resortFee = Math.max(0, taxableSubtotal * 0.10);
    const total = taxableSubtotal + tax + resortFee;

    // Apply edits
    currentModifyingBooking.checkIn = cIn;
    currentModifyingBooking.checkOut = cOut;
    currentModifyingBooking.guests = guests;
    currentModifyingBooking.mealPlan = mealActive;
    currentModifyingBooking.mealPlanLabel = mealLabel;
    currentModifyingBooking.addons = { pickup, checkout, champagne };
    currentModifyingBooking.addonsStr = addonsStr;
    currentModifyingBooking.discount = discount;
    currentModifyingBooking.totalPrice = total;

    saveState();
    closeModifyModal();
    renderRooms();
    renderBookings();
    showToast("Sanctuary booking modified successfully!", "success");
}

function closeModifyModal() {
    document.getElementById("modify-modal").classList.add("hidden");
    document.body.style.overflow = "auto";
    currentModifyingBooking = null;
}

// 11. Toast notifications
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✓";
    if (type === "error") icon = "✗";
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("toast-fade-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

// 12. Formatting utilities
function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysDiff(inStr, outStr) {
    const diffTime = Math.abs(new Date(outStr) - new Date(inStr));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
