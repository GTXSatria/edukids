// URL Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyWa85cpYDn-mMDGp2zSPWxpZHFTsZsy5WvJh3f-KmbhCbiDj1xE0-Z_Cz0kz9D_ui1yQ/exec';

// Escape HTML untuk keamanan
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render testimonial ke DOM
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
             alt="${escapeHtml(t.name)}" 
             class="author-avatar">
        <div class="author-info">
          <h4>${escapeHtml(t.name)}</h4>
          <small>${new Date(t.timestamp).toLocaleString()}</small>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Ambil testimonial (default 5 terbaru, semua kalau all=true)
async function fetchTestimonials(showAll = false) {
  console.log("📡 Fetching testimonials dari Google Sheets...");
  try {
    const url = showAll ? `${GAS_URL}?all=true` : GAS_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("✅ Data berhasil diambil:", data);
    renderTestimonials(data);
  } catch (err) {
    console.error("❌ Gagal fetch testimonials:", err);
  }
}

// Kirim testimonial baru
async function postTestimonial(name, message) {
  console.log(`✍️ Mengirim testimonial baru (no-cors): ${name} - ${message}`);
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
      mode: 'no-cors' // penting untuk bypass CORS
    });

    alert('✅ Ulasan berhasil dikirim! Tunggu sebentar untuk muncul di daftar.');
    setTimeout(() => fetchTestimonials(), 2000); // reload list
  } catch (err) {
    console.error("❌ Error postTestimonial (no-cors):", err);
    alert('⚠️ Terjadi error saat mengirim ulasan.');
  }
}

// Prompt user untuk input testimonial
function addNewTestimonial() {
  const name = prompt("Masukkan nama Anda:");
  const comment = prompt("Masukkan ulasan Anda:");
  if (!name || !comment) {
    alert('Nama dan ulasan wajib diisi.');
    return;
  }
  postTestimonial(name.trim(), comment.trim());
}

// ========== Gallery ========== //
async function loadGallery() {
  try {
    const res = await fetch('gallery.json');
    const data = await res.json();
    const container = document.getElementById('gallery-grid') || document.querySelector('.gallery-grid');
    if (!container) return;

    container.innerHTML = '';
    if (!data.gallery || !data.gallery.length) {
      container.innerHTML = '<p>Belum ada foto galeri.</p>';
      return;
    }

    data.gallery.forEach(item => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <picture>
          <source srcset="${item.imageWebp}" type="image/webp">
          <img src="${item.imageFallback}" alt="${escapeHtml(item.caption)}" loading="lazy">
        </picture>
        <p class="caption">${escapeHtml(item.caption)}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Gagal memuat gallery:', err);
  }
}

// ========== Init on Page Load ========== //
window.addEventListener('DOMContentLoaded', () => {
  fetchTestimonials(); // default: 5 terbaru
  loadGallery();

    // === Registration Form Handler ===
  const regForm = document.getElementById('registrationForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        type: 'registration',
        nama: document.getElementById('nama').value.trim(),
        kelas: document.getElementById('kelas').value,
        program: document.getElementById('program').value,
        waktu: document.getElementById('waktu').value,
        parentName: document.getElementById('parentName').value.trim(),
        phone: document.getElementById('phone').value.trim()
      };

      try {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors', // biar nggak kena blokir CORS
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        alert('✅ Pendaftaran berhasil dikirim! Kami akan segera menghubungi Anda.');
        regForm.reset();
      } catch (err) {
        console.error('❌ Gagal kirim pendaftaran:', err);
        alert('⚠️ Terjadi kesalahan saat mengirim pendaftaran. Coba lagi.');
      }
    });
  }
});








