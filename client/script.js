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
   const res = await fetch("https://heavenkids-api.onrender.com/api/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});

    const result = await res.json();

    if (result.success) {
      successMsg.classList.remove("hidden");
      form.reset();
    } else {
      alert("❌ Submission failed");
    }
  } catch (error) {
    alert("❌ Server error");
  }

  // hide spinner
  spinner.classList.add("hidden");
  btnText.textContent = "Book Appointment";
});
