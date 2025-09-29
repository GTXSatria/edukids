// === KONFIGURASI ===
const GAS_URL = "PASTE_URL_WEBAPP_ANDA_DI_SINI"; // ganti dengan Web App URL Google Apps Script

// === Fungsi umum ===
function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

// === TESTIMONI ===
function renderTestimonials(testimonials) {
  const container = document.querySelector(".testimonials-slider");
  if (!container) return;

  container.innerHTML = "";

  if (testimonials.length === 0) {
    container.innerHTML = "<p>Belum ada testimoni.</p>";
    return;
  }

  testimonials.forEach(t => {
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.innerHTML = `
      <p>"${escapeHtml(t.message)}"</p>
      <h4>- ${escapeHtml(t.name)}</h4>
    `;
    container.appendChild(card);
  });
}

async function fetchTestimonials(showAll = false) {
  try {
    const url = showAll ? `${GAS_URL}?all=true` : GAS_URL;
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Data testimonial:", data);
    renderTestimonials(data);
  } catch (err) {
    console.error("❌ Gagal ambil testimonial:", err);
  }
}

async function postTestimonial(name, message) {
  const data = {
    type: "testimonial",
    name: name,
    message: message
  };

  console.log("📨 Kirim testimonial:", data);

  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Testimoni berhasil dikirim!");
    setTimeout(() => fetchTestimonials(), 2000);

  } catch (err) {
    console.error("❌ Gagal kirim testimonial:", err);
    alert("Terjadi error saat mengirim testimoni.");
  }
}

function addNewTestimonial() {
  const name = prompt("Masukkan nama Anda:") || "Anonim";
  const message = prompt("Masukkan testimoni Anda:");
  if (!message) {
    alert("Pesan tidak boleh kosong!");
    return;
  }
  postTestimonial(name, message);
}

// === REGISTRASI ===
async function submitRegistrationForm(event) {
  event.preventDefault();
  const form = event.target;

  const formData = new FormData(form);
  const data = {
    type: "registration",
    kelas: formData.get("kelas"),
    program: formData.get("program"),
    Waktu: formData.get("Waktu"),
    parentName: formData.get("parentName"),
    phone: formData.get("phone")
  };

  console.log("📨 Kirim registration payload:", data);

  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Pendaftaran berhasil dikirim!");
    form.reset();

  } catch (err) {
    console.error("❌ Gagal kirim registrasi:", err);
    alert("Terjadi error saat mengirim pendaftaran.");
  }
}

// === GALERI ===
async function loadGallery() {
  try {
    const res = await fetch("gallery.json");
    const data = await res.json();
    const container = document.getElementById("gallery-grid");
    if (!container) return;

    container.innerHTML = "";

    if (!data.gallery || data.gallery.length === 0) {
      container.innerHTML = "<p>Belum ada foto galeri.</p>";
      return;
    }

    data.gallery.forEach(item => {
      const div = document.createElement("div");
      div.className = "gallery-item";
      div.innerHTML = `
        <img src="${item.url}" alt="Gallery">
        <p>${escapeHtml(item.caption)}</p>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("❌ Gagal load gallery:", err);
  }
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  fetchTestimonials();
  loadGallery();

  const regForm = document.getElementById("registration-form");
  if (regForm) {
    regForm.addEventListener("submit", submitRegistrationForm);
  }
});

// expose fungsi biar bisa dipanggil dari HTML
window.addNewTestimonial = addNewTestimonial;
window.fetchTestimonials = fetchTestimonials;
