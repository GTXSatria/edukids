// script.js (full) - Replace seluruh file dengan ini

// ========== Config / Endpoints ==========
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxfAcxN3gOnKA4bs5Fd7OC-FGA9uJPR9XmydkPo-1iXpMKfvyFijWSHWuZADPFhYe7zgg/exec';

// ========== Utilities ==========
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ========== Testimonials ==========
function renderTestimonials(list) {
  const container = document.querySelector('.testimonials-slider');
  if (!container) {
    console.warn("⚠️ .testimonials-slider tidak ditemukan di DOM");
    return;
  }

  console.log(`🎨 Render ${list.length || 0} testimonial ke DOM`);
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

// Ambil testimonial (default 5 terbaru, atau all jika showAll=true)
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
    // fallback: tampilkan pesan
    const container = document.querySelector('.testimonials-slider');
    if (container) container.innerHTML = '<p>Gagal memuat ulasan.</p>';
  }
}

// Kirim testimonial (POST). Pastikan kita sertakan "type":"testimonial"
async function postTestimonial(name, message) {
  console.log(`✍️ Mengirim testimonial baru (no-cors): ${name} - ${message}`);
  const payload = { type: 'testimonial', name: name, message: message };

  try {
    // mode: 'no-cors' supaya request tidak diblokir oleh CORS di GitHub Pages.
    // note: response akan opaque, jadi kita tidak dapat membaca JSON response.
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });

    alert('✅ Ulasan berhasil dikirim! Tunggu sebentar untuk muncul di daftar.');
    // reload testimonials (beri jeda supaya sheet sempat update)
    setTimeout(() => fetchTestimonials(), 2000);
  } catch (err) {
    console.error("❌ Error postTestimonial (no-cors):", err);
    alert('⚠️ Terjadi error saat mengirim ulasan.');
  }
}

// Prompt user untuk input testimonial (dipanggil dari tombol)
function addNewTestimonial() {
  const name = prompt("Masukkan nama Anda:");
  const comment = prompt("Masukkan ulasan Anda:");
  if (!name || !comment) {
    alert('Nama dan ulasan wajib diisi.');
    return;
  }
  postTestimonial(name.trim(), comment.trim());
}

// ========== Registration Form Handling ==========
/**
 * Submit handler untuk form pendaftaran.
 * - Memerlukan form dengan id="registration-form"
 * - Field names expected: kelas, program, waktu, parentName, phone
 */
async function submitRegistrationForm(e) {
  if (e && e.preventDefault) e.preventDefault();

  const form = document.getElementById('registration-form');
  if (!form) {
    console.warn('Form pendaftaran dengan id="registration-form" tidak ditemukan.');
    alert('Form pendaftaran tidak tersedia.');
    return;
  }

  // Ambil nilai - cocokkan dengan name attributes yang ada pada HTML Anda
  const kelas = (form.querySelector('[name="kelas"]') || {}).value || '';
  const program = (form.querySelector('[name="program"]') || {}).value || '';
  const waktu = (form.querySelector('[name="waktu"]') || {}).value || '';
  const parentName = (form.querySelector('[name="parentName"]') || {}).value || '';
  const phone = (form.querySelector('[name="phone"]') || {}).value || '';

  // Validasi sederhana
  if (!parentName.trim()) { alert('Nama Orang Tua wajib diisi.'); return; }
  if (!phone.trim()) { alert('Nomor telepon wajib diisi.'); return; }
  if (!kelas.trim()) { alert('Silakan pilih Kelas.'); return; }
  if (!program.trim()) { alert('Silakan pilih Program.'); return; }
  if (!waktu.trim()) { alert('Silakan pilih waktu.'); return; }

  const payload = {
    type: 'registration',
    kelas: kelas.trim(),
    program: program.trim(),
    waktu: waktu.trim(),
    parentName: parentName.trim(),
    phone: phone.trim()
  };

  console.log('📨 Kirim registration payload:', payload);

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });

    alert('✅ Pendaftaran berhasil dikirim! Terima kasih.');
    form.reset();
  } catch (err) {
    console.error('❌ Error submitRegistrationForm:', err);
    alert('⚠️ Terjadi error saat mengirim pendaftaran.');
  }
}

// Expose registration submit function for inline onsubmit (if used)
window.submitRegistrationForm = submitRegistrationForm;

// ========== Gallery ==========
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
        <img src="${item.url}" alt="${escapeHtml(item.caption)}">
        <p class="caption">${escapeHtml(item.caption)}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Gagal memuat gallery:', err);
    const container = document.getElementById('gallery-grid');
    if (container) container.innerHTML = '<p>Gagal memuat galeri.</p>';
  }
}

// ========== Init on Page Load ==========
window.addEventListener('DOMContentLoaded', () => {
  // make functions callable from HTML attributes if needed
  window.fetchTestimonials = fetchTestimonials;
  window.addNewTestimonial = addNewTestimonial;

  // load data
  fetchTestimonials(); // default 5 terbaru
  loadGallery();

  // attach registration form handler if form exists
  const regForm = document.getElementById('registration-form');
  if (regForm) {
    regForm.addEventListener('submit', submitRegistrationForm);
    console.log('✅ Registration form handler attached.');
  } else {
    console.log('ℹ️ Registration form not found (skipped attaching handler). If you want form submit to work, add id="registration-form" to your form.');
  }
});


