const API_URL = "https://heaven-kids.onrender.com/api";

// Auth Check
if (!localStorage.getItem("admin")) {
    window.location.href = "admin-login.html";
}

function logout() {
    localStorage.removeItem("admin");
    window.location.href = "admin-login.html";
}

function getAuthHeaders() {
    return { "Authorization": `Bearer ${localStorage.getItem("admin")}` };
}

// =======================
// 1. ADMISSIONS LOGIC
// =======================
async function fetchBookings() {
  const tbody = document.getElementById("admissions-list");
  tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">Loading data...</td></tr>`;

  try {
    const res = await fetch(`${API_URL}/booking`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();

    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">No admissions found.</td></tr>`;
      return;
    }

    data.forEach(b => {
      const date = new Date(b.createdAt).toLocaleDateString();
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50 transition";
      row.innerHTML = `
        <td class="p-4 text-gray-500">${date}</td>
        <td class="p-4 font-bold text-gray-800">${b.childName}</td>
        <td class="p-4">${b.parentName}</td>
        <td class="p-4">
            <div class="text-xs text-gray-500">${b.email}</div>
            <div class="text-sm font-semibold">${b.phone}</div>
        </td>
        <td class="p-4"><span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">${b.program}</span></td>
        <td class="p-4 text-gray-500 text-xs max-w-xs truncate" title="${b.message}">${b.message || '-'}</td>
        <td class="p-4 text-center">
            <button onclick="deleteBooking('${b._id}')" class="text-red-400 hover:text-red-600 transition"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-400">Error loading data.</td></tr>`;
  }
}

async function deleteBooking(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;
  try {
    await fetch(`${API_URL}/booking/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
    });
    fetchBookings(); // Refresh list
  } catch (err) {
    alert("Failed to delete");
  }
}

// =======================
// 2. GALLERY LOGIC
// =======================
async function fetchGallery() {
  const grid = document.getElementById("gallery-grid");
  const filter = document.getElementById("filterGallery") ? document.getElementById("filterGallery").value : "All";
  
  grid.innerHTML = `<div class="col-span-full text-center text-gray-400">Loading images...</div>`;

  try {
    const res = await fetch(`${API_URL}/gallery`);
    let images = await res.json();

    // Filter images based on dropdown selection
    if (filter !== "All") {
        images = images.filter(img => img.category === filter);
    }
    
    // Sort by newest first
    images.sort((a, b) => b._id.localeCompare(a._id));

    grid.innerHTML = "";
    if (images.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-gray-400">No images found for category: ${filter}</div>`;
        return;
    }

    images.forEach(img => {
      const card = document.createElement("div");
      card.className = "relative group rounded-xl overflow-hidden shadow-sm bg-white";
      card.innerHTML = `
        <img src="${img.imageUrl}" class="w-full h-48 object-cover" onerror="this.parentElement.style.display='none'">
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button onclick="deleteImage('${img._id}')" class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="absolute bottom-2 left-2 bg-white/80 px-2 py-1 rounded text-xs font-bold">${img.category}</div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteImage(id) {
  if (!confirm("Delete this photo permanently?")) return;
  try {
    await fetch(`${API_URL}/gallery/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
    });
    fetchGallery();
  } catch (err) {
    alert("Failed to delete image");
  }
}

// Handle Upload
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("uploadBtn");
  const status = document.getElementById("uploadStatus");
  const formData = new FormData();
  formData.append("image", document.getElementById("photoInput").files[0]);
  formData.append("category", document.getElementById("photoCategory").value);

  btn.textContent = "Uploading...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/gallery/upload`, { 
        method: "POST", 
        body: formData,
        headers: getAuthHeaders() // Do NOT set Content-Type for FormData
    });
    const result = await res.json();
    if (result.success) {
      status.textContent = "✅ Upload Successful!";
      status.className = "mt-2 text-sm font-bold text-green-600 block";
      document.getElementById("uploadForm").reset();
      fetchGallery();
    } else {
      throw new Error("Upload failed");
    }
  } catch (err) {
    status.textContent = "❌ Upload Failed";
    status.className = "mt-2 text-sm font-bold text-red-600 block";
  } finally {
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Upload`;
    btn.disabled = false;
  }
});

// Initial Load
fetchBookings();

// =======================
// 3. CLASSES LOGIC
// =======================
async function fetchAdminClasses() {
  const list = document.getElementById("classes-list");
  list.innerHTML = `<div class="col-span-full text-center text-gray-400">Loading classes...</div>`;

  try {
    const res = await fetch(`${API_URL}/classes`);
    const classes = await res.json();

    list.innerHTML = "";
    classes.forEach(cls => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";
      card.innerHTML = `
        <img src="${cls.imageUrl}" class="w-full h-40 object-cover">
        <div class="p-4 flex-1">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-800">${cls.title}</h4>
                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">${cls.age}</span>
            </div>
            <p class="text-sm text-gray-500 line-clamp-2">${cls.description}</p>
        </div>
        <div class="p-4 border-t bg-gray-50 flex justify-end">
            <button onclick="deleteClass('${cls._id}')" class="text-red-500 hover:text-red-700 text-sm font-bold"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteClass(id) {
  if (!confirm("Delete this class?")) return;
  try {
    await fetch(`${API_URL}/classes/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
    });
    fetchAdminClasses();
  } catch (err) {
    alert("Failed to delete class");
  }
}

document.getElementById("classForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("addClassBtn");
  const status = document.getElementById("classStatus");
  const formData = new FormData();
  
  formData.append("title", document.getElementById("classTitle").value);
  formData.append("age", document.getElementById("classAge").value);
  formData.append("description", document.getElementById("classDesc").value);
  formData.append("image", document.getElementById("classImage").files[0]);

  btn.textContent = "Adding...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/classes`, { 
        method: "POST", 
        body: formData,
        headers: getAuthHeaders()
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById("classForm").reset();
      fetchAdminClasses();
    }
  } catch (err) {
    alert("Failed to add class");
  } finally {
    btn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Class`;
    btn.disabled = false;
  }
});

// =======================
// 5. EVENTS LOGIC
// =======================
async function fetchAdminEvents() {
  const list = document.getElementById("events-list");
  list.innerHTML = `<div class="text-center text-gray-400">Loading events...</div>`;

  try {
    const res = await fetch(`${API_URL}/events`);
    const events = await res.json();

    list.innerHTML = "";
    events.forEach(evt => {
      const date = new Date(evt.date).toLocaleDateString();
      const card = document.createElement("div");
      card.className = "bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4";
      card.innerHTML = `
        <div class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            ${evt.imageUrl ? `<img src="${evt.imageUrl}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-calendar text-gray-400"></i>`}
        </div>
        <div class="flex-1">
            <h4 class="font-bold text-gray-800">${evt.title}</h4>
            <div class="text-sm text-gray-500"><i class="fa-regular fa-clock"></i> ${date} &bull; <i class="fa-solid fa-location-dot"></i> ${evt.location || 'N/A'}</div>
            <p class="text-sm text-gray-600 mt-1 line-clamp-1">${evt.description || ''}</p>
        </div>
        <button onclick="deleteEvent('${evt._id}')" class="text-red-500 hover:text-red-700 p-2"><i class="fa-solid fa-trash"></i></button>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;
  try {
    await fetch(`${API_URL}/events/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    fetchAdminEvents();
  } catch (err) {
    alert("Failed to delete event");
  }
}

document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("addEventBtn");
  const formData = new FormData();
  
  formData.append("title", document.getElementById("eventTitle").value);
  formData.append("date", document.getElementById("eventDate").value);
  formData.append("location", document.getElementById("eventLocation").value);
  formData.append("description", document.getElementById("eventDesc").value);
  if(document.getElementById("eventImage").files[0]) {
      formData.append("image", document.getElementById("eventImage").files[0]);
  }

  btn.textContent = "Adding...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/events`, { method: "POST", body: formData, headers: getAuthHeaders() });
    if (res.ok) {
      document.getElementById("eventForm").reset();
      fetchAdminEvents();
    }
  } catch (err) {
    alert("Failed to add event");
  } finally {
    btn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Event`;
    btn.disabled = false;
  }
});

// =======================
// 4. CLEANUP INVALID IMAGES
// =======================
async function cleanupFacebookCDN() {
  const statusDiv = document.getElementById("cleanup-status");
  statusDiv.className = "p-4 rounded-lg bg-yellow-100 text-yellow-700 block";
  statusDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Scanning for blocked images...`;
  statusDiv.classList.remove("hidden");

  try {
    // Clean gallery images
    const galleryRes = await fetch(`${API_URL}/gallery/cleanup/facebook-cdn`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    
    if (!galleryRes.ok) {
      throw new Error(`Gallery cleanup failed: ${galleryRes.statusText}`);
    }
    const galleryResult = await galleryRes.json();

    // Clean class images
    const classRes = await fetch(`${API_URL}/classes/cleanup/facebook-cdn`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    
    if (!classRes.ok) {
      throw new Error(`Classes cleanup failed: ${classRes.statusText}`);
    }
    const classResult = await classRes.json();

    const totalDeleted = (galleryResult.deletedCount || 0) + (classResult.deletedCount || 0);

    if (totalDeleted > 0) {
      statusDiv.className = "p-4 rounded-lg bg-green-100 text-green-700 block";
      statusDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> Successfully removed ${totalDeleted} blocked images (Facebook CDN). Please upload new images for these items.`;
    } else {
      statusDiv.className = "p-4 rounded-lg bg-blue-100 text-blue-700 block";
      statusDiv.innerHTML = `<i class="fa-solid fa-info-circle"></i> No blocked images (Facebook CDN) found.`;
    }

    // Refresh gallery and classes
    fetchGallery();
    fetchAdminClasses();

  } catch (err) {
    console.error(err);
    statusDiv.className = "p-4 rounded-lg bg-red-100 text-red-700 block";
    statusDiv.innerHTML = `<i class="fa-solid fa-exclamation-circle"></i> ${err.message}`;
  }
}
