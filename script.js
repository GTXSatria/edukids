// URL Apps Script
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwidZHDzIVRF2uBQ5B2JbYUyr0VQSx83d_Ky37Am0nwQLlC47iJF6VUrTK0wp6h63ZD_w/exec';

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
    const container = document.getElementById('gallery-grid');
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
        <img src="${item.url}" alt="${item.caption}">
        <p class="caption">${item.caption}</p>
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
  /* gallery-fix.js
 * Perbaikan fungsi loadGallery untuk GTX EduKids
 * - Mendukung format JSON: either top-level array or { gallery: [...] }
 * - Menggunakan properti `image` (fallback ke `url`/`src` jika ada)
 * - Menambahkan `alt` dan `loading="lazy"`
 * - Error handling dan pesan kosong
 *
 * Cara pakai:
 * 1) Ganti fungsi loadGallery di script.js dengan isi file ini, atau
 * 2) Tambahkan file ini ke project dan panggil setelah script.js di index.html:
 *    <script src="gallery-fix.js"></script>
 */

// safe-escape untuk teks yang akan dimasukkan ke DOM
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>\"']/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[s];
  });
}

async function loadGallery() {
  // cari container gallery — dukung beberapa kemungkinan selector
  const container = document.querySelector('.gallery-grid') || document.querySelector('#gallery .gallery-grid');
  if (!container) {
    console.warn('[gallery-fix] gallery container (.gallery-grid) tidak ditemukan di DOM.');
    return;
  }

  try {
    // fetch dengan cache-busting jika perlu
    const resp = await fetch('gallery.json', { cache: 'no-cache' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    const data = await resp.json();
    // dukung dua format: array langsung atau object { gallery: [...] }
    const items = Array.isArray(data) ? data : (Array.isArray(data.gallery) ? data.gallery : []);

    // kosongkan container sebelum render
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.innerHTML = '<p class="gallery-empty">Tidak ada gambar di galeri.</p>';
      return;
    }

    items.forEach(item => {
      // dukungan fallback properti (image, url, src)
      const src = item.image || item.url || item.src || '';
      const caption = item.caption || item.title || '';

      const card = document.createElement('div');
      card.className = 'gallery-item';

      // buat elemen <img>
      const img = document.createElement('img');
      img.src = src;
      img.alt = escapeHtml(caption) || 'Gallery image';
      img.loading = 'lazy';
      img.decoding = 'async';

      // opsional: jika src kosong, jangan coba tampilkan gambar
      if (!src) {
        const placeholder = document.createElement('div');
        placeholder.className = 'gallery-placeholder';
        placeholder.textContent = caption || 'No image available';
        card.appendChild(placeholder);
      } else {
        card.appendChild(img);
      }

      const p = document.createElement('p');
      p.className = 'caption';
      p.textContent = caption;
      card.appendChild(p);

      container.appendChild(card);
    });

  } catch (err) {
    console.error('[gallery-fix] Gagal memuat gallery.json:', err);
    container.innerHTML = '<p class="gallery-error">Gagal memuat galeri. Silakan coba lagi nanti.</p>';
  }
}

// Pastikan function dipanggil satu kali saat DOM siap. Jika script.js lama
// sudah memanggil loadGallery(), kamu bisa menghapus pemanggilan ganda.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGallery);
} else {
  // jika DOM sudah siap, panggil langsung
  loadGallery();
}
});

// =====================================
// REGISTRATION (langsung ke WhatsApp)
// =====================================
const regForm = document.getElementById('registrationForm');
if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value;
    const program = document.getElementById('program').value;
    const waktu = document.getElementById('waktu').value;
    const parentName = document.getElementById('parentName').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const pesan = 
`Halo Admin GTX EduKids, saya ingin mendaftarkan anak saya:%0A
👦 Nama Anak: ${nama}%0A
🏫 Kelas: ${kelas}%0A
📘 Program: ${program}%0A
⏰ Waktu: ${waktu}%0A
👩‍👦 Nama Orang Tua: ${parentName}%0A
📱 No. WA: ${phone}`;

    const waUrl = `https://wa.me/6283895603395?text=${pesan}`;
    window.open(waUrl, '_blank');
    regForm.reset();
    alert("Anda akan diarahkan ke WhatsApp untuk konfirmasi pendaftaran.");
  });
}
