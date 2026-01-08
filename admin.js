fetch("https://heavenkids-api.onrender.com/api/gallery")

  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("list");
    data.forEach(b => {
      const li = document.createElement("li");
      li.textContent = `${b.parentName} | ${b.childName} | ${b.program}`;
      list.appendChild(li);
    });
  });
