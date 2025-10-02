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
  try {
    const url = showAll ? `${GAS_URL}?all=true` : GAS_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderTestimonials(data);
  } catch (err) {
    console.error("❌ Gagal fetch testimonials:", err);
  }
}

// Kirim testimonial baru
async function postTestimonial(name, message) {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
      mode: 'no-cors'
    });
    alert('✅ Ulasan berhasil dikirim! Tunggu sebentar untuk muncul di daftar.');
    setTimeout(() => fetchTestimonials(), 2000);
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

// Pendaftaran via WhatsApp
const regForm = document.getElementById('registrationForm');
if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value;
    const waktu = document.getElementById('waktu').value;
    const parentName = document.getElementById('parentName').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const pesan = 
`Halo Admin GTX EduKids, saya ingin mendaftarkan anak saya:%0A
👦 Nama Anak: ${nama}%0A
🏫 Kelas: ${kelas}%0A
⏰ Waktu: ${waktu}%0A
👩‍👦 Nama Orang Tua: ${parentName}%0A
📱 No. WA: ${phone}`;

    const waUrl = `https://wa.me/6283895603395?text=${pesan}`;
    window.open(waUrl, '_blank');
    regForm.reset();
    alert("Anda akan diarahkan ke WhatsApp untuk konfirmasi pendaftaran.");
  });
}

// ==== Fix biar tombol HTML onclick bisa jalan ====
window.addNewTestimonial = addNewTestimonial;
window.fetchTestimonials = fetchTestimonials;

const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

// klik hamburger
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// klik menu item → langsung menuju target & tutup menu
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// Memuat galeri dari file JSON
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
        <picture>
          <source srcset="${item.imageWebp}" type="image/webp">
          <img src="${item.imageFallback}" alt="${item.caption}">
        </picture>
        <p class="caption">${item.caption}</p>
      `;
      
      // Menambahkan event listener untuk modal
      const image = div.querySelector('img');
      image.addEventListener('click', () => openModal(image.src));

      container.appendChild(div);
    });
  } catch (err) {
    console.error('Gagal memuat gallery:', err);
  }
}

// Fungsi untuk membuka modal dengan gambar
function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  
  console.log("Membuka modal dengan gambar: ", imageSrc); // Tambahkan log untuk memeriksa gambar yang dimuat

  modal.style.display = 'block';
  modalImage.src = imageSrc;  // Menampilkan gambar di dalam modal
  modalImage.setAttribute('title', "Gambar galeri");  // Mengatur title untuk gambar modal
}

// Fungsi untuk menutup modal
function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}

// Menunggu halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
  fetchTestimonials(); 
  loadGallery();
});
