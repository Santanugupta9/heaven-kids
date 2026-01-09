const API_URL = window.location.protocol === 'file:' 
  ? "https://heavenkidsmontessori.onrender.com/api" 
  : "/api";

// =======================
// 1. ADMISSIONS LOGIC
// =======================
async function fetchBookings() {
  const tbody = document.getElementById("admissions-list");
  tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400">Loading data...</td></tr>`;

  try {
    const res = await fetch(`${API_URL}/booking`);
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
    await fetch(`${API_URL}/booking/${id}`, { method: "DELETE" });
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
  grid.innerHTML = `<div class="col-span-full text-center text-gray-400">Loading images...</div>`;

  try {
    const res = await fetch(`${API_URL}/gallery`);
    const images = await res.json();

    grid.innerHTML = "";
    images.forEach(img => {
      const card = document.createElement("div");
      card.className = "relative group rounded-xl overflow-hidden shadow-sm bg-white";
      card.innerHTML = `
        <img src="${img.imageUrl}" class="w-full h-48 object-cover">
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
    await fetch(`${API_URL}/gallery/${id}`, { method: "DELETE" });
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
    const res = await fetch(`${API_URL}/gallery/upload`, { method: "POST", body: formData });
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
    await fetch(`${API_URL}/classes/${id}`, { method: "DELETE" });
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
    const res = await fetch(`${API_URL}/classes`, { method: "POST", body: formData });
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
