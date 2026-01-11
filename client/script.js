const API_BASE_URL = "https://heaven-kids.onrender.com/api";

const form = document.getElementById("bookingForm");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const successMsg = document.getElementById("success-msg");

if (form) {
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // show spinner
  spinner.classList.remove("hidden");
  btnText.textContent = "Submitting...";

  const data = {
    parentName: form.querySelector('input[placeholder="Parent\'s Name"]').value.trim(),
    email: form.querySelector('input[type="email"]').value.trim(),
    phone: document.getElementById("phone").value.trim(),
    childName: form.querySelector('input[placeholder="Child\'s Name"]').value.trim(),
    program: form.querySelector("select").value,
    message: form.querySelector("textarea").value.trim()
  };

  /* ==========================
     ✅ FORM VALIDATION
  ========================== */

  if (!data.phone.match(/^[0-9]{10}$/)) {
    alert("❌ Enter valid 10-digit mobile number");
    spinner.classList.add("hidden");
    btnText.textContent = "Book Appointment";
    return;
  }

  if (!data.email.includes("@")) {
    alert("❌ Invalid email address");
    spinner.classList.add("hidden");
    btnText.textContent = "Book Appointment";
    return;
  }

  if (data.program === "Select Program" || data.program === "") {
    alert("❌ Please select a program");
    spinner.classList.add("hidden");
    btnText.textContent = "Book Appointment";
    return;
  }

  /* ==========================
     🚀 SEND DATA TO BACKEND
  ========================== */

  try {
   const res = await fetch(`${API_BASE_URL}/booking`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});

    if (!res.ok) {
      const text = await res.text(); // Get response as text to see if it's HTML error
      throw new Error(`Server responded with ${res.status}: ${text.substring(0, 100)}...`);
    }

    const result = await res.json();

    console.log("Backend response:", result);

    if (result.success) {
      successMsg.classList.remove("hidden");
      form.reset();
    } else {
      alert("❌ Submission failed");
    }
  } catch (error) {
    console.error("❌ Submission Error:", error);
    alert("❌ Server error. Please check the console for details.");
  }

  // hide spinner
  spinner.classList.add("hidden");
  btnText.textContent = "Book Appointment";
});
}

/* ==========================
   MODAL FORM SUBMISSION
========================== */
const modalForm = document.getElementById("modalBookingForm");
if (modalForm) {
  modalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("modalSubmitBtn");
    const originalText = btn.textContent;
    
    btn.textContent = "Sending...";
    btn.disabled = true;

    const data = {
      childName: document.getElementById("modalChildName").value.trim(),
      phone: document.getElementById("modalPhone").value.trim(),
      program: document.getElementById("modalProgram").value,
      // Default values for fields not in modal
      parentName: "N/A (Quick Apply)",
      email: "N/A",
      message: "Quick application from popup modal"
    };

    if (!data.phone.match(/^[0-9]{10}$/)) {
      alert("❌ Enter valid 10-digit mobile number");
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Application sent successfully!");
        modalForm.reset();
        document.getElementById('booking-modal').classList.add('hidden');
      } else {
        alert("❌ Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

/* ==========================
   📖 READ MORE TOGGLE
========================== */
window.toggleAboutFeatures = function() {
  const features = document.getElementById("expanded-features");
  const btnIcon = document.getElementById("btnIcon");
  const btn = document.getElementById("readMoreBtn");
  
  if (!features || !btnIcon || !btn) return;
  
  const btnText = btn.querySelector("span");

  if (features.classList.contains("hidden")) {
    features.classList.remove("hidden");
    btnText.textContent = "Show Less";
    btnIcon.classList.remove("fa-arrow-right");
    btnIcon.classList.add("fa-arrow-up");
  } else {
    features.classList.add("hidden");
    btnText.textContent = "Read More About Us";
    btnIcon.classList.remove("fa-arrow-up");
    btnIcon.classList.add("fa-arrow-right");
  }
};

/* ==========================
   🏫 FETCH CLASSES
========================== */
async function fetchClasses() {
  const container = document.getElementById("classes-container");
  if (!container) return;

  // Placeholder image for broken images
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23aaa%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E";

  try {
    const res = await fetch(`${API_BASE_URL}/classes`);
    const classes = await res.json();

    if (classes.length === 0) {
        container.innerHTML = '<div class="col-span-3 text-center text-gray-400">No classes available yet.</div>';
        return;
    }

    let html = "";
    classes.forEach(cls => {
      // Check if image URL is from Facebook CDN (which might be blocked)
      const isFacebookCDN = cls.imageUrl && (cls.imageUrl.includes('fbcdn.net') || cls.imageUrl.includes('facebook.com'));
      const finalImageUrl = isFacebookCDN ? placeholderImage : cls.imageUrl;
      
      html += `
        <div class="bg-white rounded-3xl p-4 shadow-soft hover:shadow-xl transition duration-300 group flex flex-col h-full">
            <div class="h-56 overflow-hidden rounded-2xl relative shrink-0">
                <img src="${finalImageUrl}" 
                     class="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                     alt="${cls.title}"
                     onerror="this.onerror=null; this.src='${placeholderImage}'">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-brand-primary shadow-sm">
                    ${cls.age}
                </div>
            </div>
            <div class="p-4 pt-6 flex flex-col flex-grow">
                <h3 class="text-xl font-bold text-brand-dark mb-2">${cls.title}</h3>
                <p class="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">${cls.description}</p>
                <div class="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                    <button onclick="document.getElementById('booking-modal').classList.remove('hidden')" class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-red-500 transition shadow-glow">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error("Error fetching classes:", err);
    container.innerHTML = '<div class="col-span-3 text-center text-red-400">Failed to load classes.</div>';
  }
}

/* ==========================
   🖼️ FETCH GALLERY
========================== */
async function fetchGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  // Placeholder image for broken images
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23aaa%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E";

  try {
    const res = await fetch(`${API_BASE_URL}/gallery`);
    const images = await res.json();
    
    // Display latest 8 images
    const displayImages = images.slice(0, 8);

    if (displayImages.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400">No photos yet.</div>';
        return;
    }

    let html = "";
    displayImages.forEach((img, index) => {
        // Check if image URL is from Facebook CDN (which might be blocked)
        const isFacebookCDN = img.imageUrl && (img.imageUrl.includes('fbcdn.net') || img.imageUrl.includes('facebook.com'));
        const finalImageUrl = isFacebookCDN ? placeholderImage : img.imageUrl;
        
        // Pattern: 1st item spans 2 cols on medium screens
        const isFeatured = index === 0 || index === 5; 
        const spanClass = isFeatured ? "md:col-span-2" : "";
        
        html += `
            <div class="img-zoom-container h-72 ${spanClass} relative group cursor-pointer rounded-3xl overflow-hidden">
                <img src="${finalImageUrl}" 
                     onerror="this.onerror=null; this.src='${placeholderImage}'" 
                     alt="${img.category}" 
                     class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition"></div>
                <div class="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                    <span class="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-brand-dark shadow-sm">
                        ${img.category}
                    </span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

  } catch (err) {
    console.error("Error fetching gallery:", err);
  }
}

/* ==========================
   🖼️ FETCH ABOUT IMAGES
========================== */
async function fetchAboutImages() {
  try {
    const res = await fetch(`${API_BASE_URL}/gallery`);
    const images = await res.json();
    
    // Filter for 'About' category and take latest 4
    // Sort by _id descending to ensure newest uploads appear first
    const aboutImages = images
        .filter(img => img.category === 'About')
        .sort((a, b) => b._id.localeCompare(a._id))
        .slice(0, 4);

    if (aboutImages.length > 0) document.getElementById('about-img-1').src = aboutImages[0].imageUrl;
    if (aboutImages.length > 1) document.getElementById('about-img-2').src = aboutImages[1].imageUrl;
    if (aboutImages.length > 2) document.getElementById('about-img-3').src = aboutImages[2].imageUrl;
    if (aboutImages.length > 3) document.getElementById('about-img-4').src = aboutImages[3].imageUrl;

  } catch (err) {
    console.error("Error fetching about images:", err);
  }
}

/* ==========================
   � FETCH EVENTS
========================== */
async function fetchEvents() {
  const container = document.getElementById("events-container");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/events`);
    const events = await res.json();

    if (events.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400">No upcoming events scheduled.</div>';
        return;
    }

    let html = "";
    events.forEach(evt => {
      const date = new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const imageHtml = evt.imageUrl 
        ? `<img src="${evt.imageUrl}" class="w-24 h-24 rounded-2xl object-cover shrink-0">`
        : `<div class="w-24 h-24 rounded-2xl bg-brand-accent/20 flex flex-col items-center justify-center text-yellow-600 shrink-0"><i class="fa-solid fa-calendar-day text-4xl"></i></div>`;

      html += `
        <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-center gap-6 border border-gray-100">
            ${imageHtml}
            <div class="flex-1 text-center md:text-left">
                <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 class="font-semibold text-lg text-brand-dark">${evt.title}</h3>
                    <span class="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full font-bold w-fit mx-auto md:mx-0">${date}</span>
                </div>
                <p class="text-gray-600 text-base mt-1 leading-relaxed">${evt.description || ''}</p>
                <div class="mt-4 text-sm text-gray-500 flex items-center justify-center md:justify-start gap-2">
                    <i class="fa-solid fa-location-dot text-brand-primary"></i> ${evt.location || 'School Premises'}
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error("Error fetching events:", err);
    container.innerHTML = '<div class="text-center text-red-400">Failed to load events.</div>';
  }
}

// Mobile Menu Toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Load content on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchClasses();
    fetchGallery();
    fetchEvents();
    fetchAboutImages();
});
