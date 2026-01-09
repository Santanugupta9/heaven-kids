const form = document.getElementById("bookingForm");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const successMsg = document.getElementById("success-msg");

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
   const res = await fetch("https://heavenkidsmontessori.onrender.com/api/booking", {
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

/* ==========================
   📖 READ MORE TOGGLE
========================== */
window.toggleAboutFeatures = function() {
  const features = document.getElementById("expanded-features");
  const btnIcon = document.getElementById("btnIcon");
  const btnText = document.getElementById("readMoreBtn").querySelector("span");

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

  try {
    const res = await fetch("https://heavenkidsmontessori.onrender.com/api/classes");
    const classes = await res.json();

    container.innerHTML = "";
    classes.forEach(cls => {
      const card = `
        <div class="bg-white rounded-3xl p-4 shadow-soft hover:shadow-xl transition duration-300 group">
            <div class="h-56 overflow-hidden rounded-2xl relative">
                <img src="${cls.imageUrl}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-brand-primary shadow-sm">
                    ${cls.age}
                </div>
            </div>
            <div class="p-4 pt-6">
                <h3 class="text-xl font-bold text-brand-dark mb-2">${cls.title}</h3>
                <p class="text-gray-500 text-sm mb-4 line-clamp-2">${cls.description}</p>
                <div class="flex items-center justify-between border-t border-gray-100 pt-4">
                    <button onclick="document.getElementById('booking-modal').classList.remove('hidden')" class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-red-500 transition shadow-glow">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>`;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error("Error fetching classes:", err);
  }
}

// Load classes on page load
document.addEventListener("DOMContentLoaded", fetchClasses);
