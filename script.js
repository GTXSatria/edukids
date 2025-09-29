// =====================================
// URL Apps Script untuk ULASAN
// =====================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyvD4OEf5EyTUrTm8ZVXpdJxExCGLFAcPvq6X579nubACzpzxSjiP4NxWCFG0Ky5otVbQ/exec';

// Escape HTML biar aman
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// =====================================
// TESTIMONIALS (via Google Apps Script)
// =====================================
async function fetchTestimonials() {
  try {
    const res = await fetch(GAS_URL + "?type=testimonials&all=true");
    const data = await res.json();
    renderTestimonials(data);
  } catch (err) {
    console.error("Gagal mengambil testimoni:", err);
  }
}

function renderTestimonials(list) {
  const container = document.querySelector('.testimonials-list');
  if (!container) return;
  container.innerHTML = '';

  if (!list || !list.length) {
    container.innerHTML = '<p>Belum ada ulasan.</p>';
    return;
  }

  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <p>"${escapeHtml(t.message)}"</p>
      <h4>- ${escapeHtml(t.name)}</h4>
      <small>${new Date(t.timestamp).toLocaleString()}</small>
    `;
    container.appendChild(card);
  });
}

const testimonialForm = document.getElementById('testimonialForm');
if (testimonialForm) {
  testimonialForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!message) {
      alert("Pesan tidak boleh kosong.");
      return;
    }

    try {
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ type: "testimonial", name, message }),
      });
      alert("✅ Terima kasih! Ulasan Anda sudah terkirim.");
      testimonialForm.reset();
      fetchTestimonials();
    } catch (err) {
      console.error("Gagal mengirim ulasan:", err);
      alert("❌ Terjadi kesalahan saat mengirim ulasan.");
    }
  });
}

// =====================================
// GALLERY (dari gallery.json)
// =====================================
async function fetchGallery() {
  try {
    const res = await fetch("gallery.json");
    const data = await res.json();
    renderGallery(data.gallery);
  } catch (err) {
    console.error("Gagal memuat galeri:", err);
  }
}

function renderGallery(list) {
  const container = document.querySelector('.gallery-grid');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(item => {
    const fig = document.createElement('figure');
    fig.innerHTML = `
      <picture>
        <source srcset="${item.image}" type="image/webp">
        <img src="${item.image.replace('.webp', '.jpg')}" 
             alt="${escapeHtml(item.caption)}" loading="lazy">
      </picture>
      <figcaption>${escapeHtml(item.caption)}</figcaption>
    `;
    container.appendChild(fig);
  });
}

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
