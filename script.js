// script.js - GTX EduKids (versi dengan no-cors agar tetap jalan)

// URL Web App Google Apps Script (ganti dengan URL aktifmu)
const GAS_URL = "https://script.google.com/macros/s/AKfycbxDd4T8G349lYRUgHQ1DUIMwbdRQwk6bozEEvuwpGHJo_0Vtlm00q5J8K_kjipI_DhzQg/exec";

// ========== Helper ========== //
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[s];
  });
}

// ========== Testimonials ========== //
async function fetchTestimonials() {
  try {
    // Dengan no-cors → response tidak bisa dibaca, jadi hanya untuk trigger request.
    await fetch(GAS_URL, { method: 'GET', mode: 'no-cors' });
    // Tidak bisa render JSON → biarkan container tetap kosong atau isi pesan default.
    const container = document.getElementById("testimonials-container");
    if (container && container.innerHTML.trim() === "") {
      container.innerHTML = '<p>Ulasan berhasil dikirim. Silakan reload halaman untuk melihat data terbaru.</p>';
    }
  } catch (err) {
    console.error("[Testimonials] gagal fetch:", err);
  }
}

async function postTestimonial(name, message) {
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors', // tetap gunakan no-cors agar request tidak diblokir
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    alert("Ulasan Anda sudah terkirim! Reload halaman untuk melihat update.");
  } catch (err) {
    console.error("[Testimonials] gagal post:", err);
  }
}

function addNewTestimonial() {
  const name = prompt("Nama Anda:") || "Anonim";
  const message = prompt("Pesan/Ulasan:");
  if (message && message.trim() !== "") {
    postTestimonial(name, message);
  }
}

// ========== Gallery ========== //
async function loadGallery() {
  const container = document.querySelector('.gallery-grid');
  if (!container) return;

  try {
    const resp = await fetch('gallery.json', { cache: 'no-cache' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    const data = await resp.json();
    const items = Array.isArray(data) ? data : (Array.isArray(data.gallery) ? data.gallery : []);

    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.innerHTML = '<p class="gallery-empty">Tidak ada gambar di galeri.</p>';
      return;
    }

    items.forEach(item => {
      const src = item.image || item.url || item.src || '';
      const caption = item.caption || item.title || '';

      const card = document.createElement('div');
      card.className = 'gallery-item';

      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = escapeHtml(caption) || 'Gallery image';
        img.loading = 'lazy';
        img.decoding = 'async';
        card.appendChild(img);
      }

      const p = document.createElement('p');
      p.className = 'caption';
      p.textContent = caption;
      card.appendChild(p);

      container.appendChild(card);
    });
  } catch (err) {
    console.error('[Gallery] Gagal memuat gallery.json:', err);
    container.innerHTML = '<p class="gallery-error">Gagal memuat galeri. Silakan coba lagi nanti.</p>';
  }
}

// ========== Mobile Menu ========== //
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu');
  const navMenu = document.querySelector('.nav-menu');
  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// ========== Init ========== //
document.addEventListener('DOMContentLoaded', () => {
  fetchTestimonials();
  loadGallery();
  initMobileMenu();
});
