// ========== Testimonials ==========

// URL Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwzN-NQzZwR3xYjiIYYwAevtvPkUoykuzsCKDpv9HW6bl56k0t2lcIK5dbnfN0G5KhsFg/exec';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTestimonials(list) {
  const container = document.querySelector('.testimonials-slider');
  if (!container) {
    console.warn("⚠️ .testimonials-slider tidak ditemukan di DOM");
    return;
  }
  console.log(`🎨 Render ${list.length} testimonial ke DOM`);

  container.innerHTML = '';
  if (!list || !list.length) {
    container.innerHTML = '<p>Belum ada ulasan publik.</p>';
    return;
  }

  list.forEach((t, i) => {
    console.log(`➡️ [${i + 1}] ${t.name}: ${t.message}`);
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <p class="testimonial-text">"${escapeHtml(t.message)}"</p>
      <div class="testimonial-author">
        <img src="https://picsum.photos/seed/${encodeURIComponent(t.name)}/60/60.jpg" 
             alt="${escapeHtml(t.name)}" class="author-avatar">
        <div class="author-info">
          <h4>${escapeHtml(t.name)}</h4>
          <small>${new Date(t.timestamp).toLocaleString()}</small>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function fetchTestimonials() {
  console.log("📡 Fetching testimonials dari Google Sheets...");
  try {
    const res = await fetch(GAS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("✅ Data berhasil diambil:", data);
    renderTestimonials(data);
  } catch (err) {
    console.error("❌ Gagal fetch testimonials:", err);
  }
}

async function postTestimonial(name, message) {
  console.log(`✍️ Mengirim testimonial baru: ${name} - ${message}`);
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    const json = await res.json();
    console.log("📨 Respon server POST:", json);
    if (json.status === 'success') {
      alert('Ulasan berhasil dikirim! (menunggu persetujuan admin)');
      fetchTestimonials(); // refresh daftar
    } else {
      alert('Gagal mengirim ulasan.');
    }
  } catch (err) {
    console.error("❌ Error postTestimonial:", err);
    alert('Terjadi error saat mengirim ulasan.');
  }
}

function addNewTestimonial() {
  const name = prompt("Masukkan nama Anda:");
  const comment = prompt("Masukkan ulasan Anda:");
  if (!name || !comment) {
    alert('Nama dan ulasan wajib diisi.');
    return;
  }
  postTestimonial(name.trim(), comment.trim());
}

// Load saat halaman dibuka
window.addEventListener('DOMContentLoaded', fetchTestimonials);

// ========== Gallery ==========
async function loadGallery() {
  try {
    const res = await fetch('gallery.json');
    const data = await res.json();
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    container.innerHTML = ''; // kosongkan dulu
    if (!data.gallery || !data.gallery.length) {
      container.innerHTML = '<p>Belum ada foto galeri.</p>';
      return;
    }

    data.gallery.forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img src="${item.url}" alt="${item.caption}">
        <p class="caption">${item.caption}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Gagal memuat gallery:', err);
  }
}

// Panggil saat halaman load
window.addEventListener('DOMContentLoaded', () => {
  fetchTestimonials();
  loadGallery();
});
