/* ==========================================================================
   SHINEPOINT — APPLICATION LOGIC
   ========================================================================== */

// ---- Business contact details (change these two lines if numbers/email change) ----
const WHATSAPP_NUMBER = "923035767651";          // used for the floating chat + booking redirect
const OWNER_EMAIL = "itsmubashirali728@gmail.com"; // booking details are emailed here automatically

// ---- Default (seed) content — shown the first time the page loads.
// Owner can delete any of these from the site itself using the ✕ button,
// and anything added later is saved permanently in the browser (localStorage). ----
const DEFAULT_GALLERY = [
  { id: 1, url: "https://picsum.photos/id/111/600/450", alt: "Foam wash transformation" },
  { id: 2, url: "https://picsum.photos/id/1071/600/450", alt: "Interior deep cleaning" },
  { id: 3, url: "https://picsum.photos/id/1072/600/450", alt: "Ceramic coating finish" },
  { id: 4, url: "https://picsum.photos/id/1073/600/450", alt: "Paint correction result" },
  { id: 5, url: "https://picsum.photos/id/1074/600/450", alt: "Showroom-level detailing" }
];

const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: "5 Signs Your Car Is Ready for a Ceramic Coating",
    excerpt: "If water no longer beads on your bonnet, swirl marks catch the sunlight, or your paint feels rough after washing, your clear coat has lost its protection. A ceramic coating rebuilds that barrier, making dust and grime easy to rinse off and keeping the paint glossy for months instead of weeks between details."
  },
  {
    id: 2,
    title: "Protecting Your Paint During Pakistan's Summer Heat",
    excerpt: "Intense sun, dust storms, and tree sap are hardest on a car's paint between May and August. Parking in shade, washing off dust before it scratches the clear coat, and applying a wax or sealant before summer starts can prevent the fading and etching that heat and UV rays cause over time."
  },
  {
    id: 3,
    title: "Interior vs. Exterior Detailing: What Your Car Actually Needs",
    excerpt: "Exterior detailing protects the paint and keeps your car looking sharp from the outside, while interior detailing removes dust, allergens, and odours that build up in the cabin over months of daily driving. Most owners get the best results by alternating between the two every few visits rather than focusing on one only."
  }
];

let galleryData = JSON.parse(localStorage.getItem('sp_gallery_v2')) || null;
let articleData = JSON.parse(localStorage.getItem('sp_articles_v2')) || null;

// Seed default content only the very first time (i.e. nothing saved yet)
if (galleryData === null) {
  galleryData = DEFAULT_GALLERY;
  localStorage.setItem('sp_gallery_v2', JSON.stringify(galleryData));
}
if (articleData === null) {
  articleData = DEFAULT_ARTICLES;
  localStorage.setItem('sp_articles_v2', JSON.stringify(articleData));
}

function renderGallery() {
  const container = document.getElementById('galleryContainer');
  if (galleryData.length === 0) {
    container.innerHTML = `<div class="empty-state">No images currently in gallery. Click "+ Add New Photo" to upload your pictures.</div>`;
    return;
  }
  container.innerHTML = galleryData.map(item => `
    <div class="gallery-card">
      <button class="delete-btn" onclick="deleteImage(${item.id})" title="Delete photo">✕</button>
      <img src="${item.url}" alt="${item.alt}" loading="lazy">
    </div>
  `).join('');
}

function renderArticles() {
  const container = document.getElementById('articlesContainer');
  if (articleData.length === 0) {
    container.innerHTML = `<div class="empty-state">No articles available. Click "+ Add Article" to publish new content.</div>`;
    return;
  }
  container.innerHTML = articleData.map(item => `
    <div class="article-card">
      <button class="delete-btn" onclick="deleteArticle(${item.id})" title="Delete article">✕</button>
      <div>
        <h3 class="article-title">${item.title}</h3>
        <p class="article-text">${item.excerpt}</p>
      </div>
    </div>
  `).join('');
}

function deleteImage(id) {
  if (confirm("Are you sure you want to delete this photo?")) {
    galleryData = galleryData.filter(item => item.id !== id);
    localStorage.setItem('sp_gallery_v2', JSON.stringify(galleryData));
    renderGallery();
  }
}

function deleteArticle(id) {
  if (confirm("Are you sure you want to delete this article?")) {
    articleData = articleData.filter(item => item.id !== id);
    localStorage.setItem('sp_articles_v2', JSON.stringify(articleData));
    renderArticles();
  }
}

// ---- Image upload: supports picking a real photo from the device,
// OR pasting an image link — whichever is filled in is used. ----
function handleImageUpload(e) {
  e.preventDefault();
  const fileInput = document.getElementById('imgFile');
  const urlInput = document.getElementById('imgUrl').value.trim();
  const alt = document.getElementById('imgAlt').value.trim();
  const file = fileInput.files[0];

  function saveImage(url) {
    galleryData.unshift({ id: Date.now(), url, alt });
    localStorage.setItem('sp_gallery_v2', JSON.stringify(galleryData));
    renderGallery();
    closeModal('galleryModal');
    e.target.reset();
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) { saveImage(evt.target.result); };
    reader.readAsDataURL(file);
  } else if (urlInput) {
    saveImage(urlInput);
  } else {
    alert("Please choose a photo from your device or paste an image link.");
  }
}

function handleArticleUpload(e) {
  e.preventDefault();
  const newArt = {
    id: Date.now(),
    title: document.getElementById('artTitle').value,
    excerpt: document.getElementById('artExcerpt').value
  };
  articleData.unshift(newArt);
  localStorage.setItem('sp_articles_v2', JSON.stringify(articleData));
  renderArticles();
  closeModal('articleModal');
  e.target.reset();
}

// ---- Booking form: opens WhatsApp for the owner AND emails the booking
// automatically via FormSubmit (no backend/server needed). ----
function sendToWhatsApp(e) {
  e.preventDefault();

  const name = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const service = document.getElementById('custService').value;
  const time = document.getElementById('custTime').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const waMessage = `*New Car Wash Booking Request*%0A%0A` +
                  `*Name:* ${encodeURIComponent(name)}%0A` +
                  `*Phone:* ${encodeURIComponent(phone)}%0A` +
                  `*Service:* ${encodeURIComponent(service)}%0A` +
                  `*Preferred Time:* ${encodeURIComponent(time)}`;

  // 1) Open WhatsApp chat directly to the business number
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank');

  // 2) Also email the booking to the owner automatically in the background
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      _subject: `New Booking Request - ${service}`,
      Name: name,
      Phone: phone,
      Service: service,
      "Preferred Time": time
    })
  })
  .catch(() => { /* WhatsApp already opened, email is a secondary channel */ })
  .finally(() => {
    submitBtn.textContent = "Send via WhatsApp";
    submitBtn.disabled = false;
    closeModal('bookingModal');
    e.target.reset();
  });
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

window.onload = function () {
  renderGallery();
  renderArticles();
};
