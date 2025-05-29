const uploadForm = document.getElementById('uploadForm')
const imageInput = document.getElementById('imageInput')
const titleInput = document.getElementById('titleInput')
const categorySelect = document.getElementById('categorySelect')
const newCategoryInput = document.getElementById('newCategory')
const gallery = document.getElementById('gallery')
const filterButtons = document.getElementById('filterButtons')
const lightbox = document.getElementById('lightbox')
const lightboxImage = document.getElementById('lightboxImage')
const lightboxTitle = document.getElementById('lightboxTitle')
const closeBtn = document.getElementById('closeBtn')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')

let predefinedCategories = ['Professional Images', 'Personal Images']
let specialCategories = ['Camera']  
let customCategories = []
let categories = ['All', ...predefinedCategories, ...specialCategories]
let images = []
let currentIndex = 0

function saveToStorage() {
  localStorage.setItem('imageGalleryImages', JSON.stringify(images))
  localStorage.setItem('imageGalleryCustomCategories', JSON.stringify(customCategories))
}

function loadFromStorage() {
  const storedImages = localStorage.getItem('imageGalleryImages')
  const storedCustomCats = localStorage.getItem('imageGalleryCustomCategories')
  if (storedImages) images = JSON.parse(storedImages)
  if (storedCustomCats) {
    customCategories = JSON.parse(storedCustomCats)
    categories = ['All', ...predefinedCategories, ...customCategories, ...specialCategories]
  }
}

function updateCategoryOptions() {
  categorySelect.innerHTML = ''
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Choose a category';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  categorySelect.appendChild(placeholderOption);

  const dropdownCategories = [...predefinedCategories, ...customCategories];
  dropdownCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function updateFilterButtons() {
  filterButtons.innerHTML = ''
  const filterCats = ['All', ...predefinedCategories, ...customCategories, ...specialCategories]
  filterCats.forEach(cat => {
    const btn = document.createElement('button')
    btn.textContent = cat
    btn.addEventListener('click', () => renderGallery(cat))
    filterButtons.appendChild(btn)
  })
}

function renderGallery(filter = 'All') {
  gallery.innerHTML = ''
  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter)
  filteredImages.forEach((img, index) => {
    const div = document.createElement('div')
    div.className = 'image-item'

    const image = document.createElement('img')
    image.src = img.src
    image.alt = img.title
    image.addEventListener('click', () => openLightbox(index, filter))

    const caption = document.createElement('p')
    caption.textContent = img.title

    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.className = 'delete-btn'
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const realIndex = images.indexOf(img)
      if (realIndex > -1) {
        images.splice(realIndex, 1)
        saveToStorage()
        renderGallery(filter)
      }
    })

    div.appendChild(image)
    div.appendChild(caption)
    div.appendChild(delBtn)
    gallery.appendChild(div)
  })
}

function openLightbox(index, filter) {
  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter)
  const img = filteredImages[index]
  currentIndex = images.indexOf(img)
  lightboxImage.src = img.src
  lightboxTitle.textContent = img.title
  lightbox.style.display = 'flex'
}

function closeLightbox() {
  lightbox.style.display = 'none'
}

function navigateLightbox(step) {
  currentIndex = (currentIndex + step + images.length) % images.length
  const img = images[currentIndex]
  lightboxImage.src = img.src
  lightboxTitle.textContent = img.title
}
const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', () => {
  if (currentIndex >= 0 && currentIndex < images.length) {
    images.splice(currentIndex, 1); 
    saveToStorage();                
    closeLightbox();                
    renderGallery('All');           
  }
});


uploadForm.addEventListener('submit', e => {
  e.preventDefault()
  const file = imageInput.files[0]
  const reader = new FileReader()
  const title = titleInput.value.trim()
  const customCat = newCategoryInput.value.trim()
  const selectedCat = categorySelect.value
  const category = customCat || selectedCat

  if (customCat && !customCategories.includes(customCat)) {
    customCategories.push(customCat)
    categories = ['All', ...predefinedCategories, ...customCategories, ...specialCategories]
    updateCategoryOptions()
    updateFilterButtons()
  }

  reader.onload = () => {
    images.push({ src: reader.result, title, category })
    saveToStorage()
    renderGallery('All')
    uploadForm.reset()
  }
  if (file) reader.readAsDataURL(file)
})

closeBtn.addEventListener('click', closeLightbox)
prevBtn.addEventListener('click', () => navigateLightbox(-1))
nextBtn.addEventListener('click', () => navigateLightbox(1))

const openCameraBtn = document.getElementById('openCameraBtn')
const cameraModal = document.getElementById('cameraModal')
const modalVideo = document.getElementById('modalVideo')
const modalCaptureBtn = document.getElementById('modalCaptureBtn')
const modalCloseBtn = document.getElementById('modalCloseBtn')

let cameraStream = null

openCameraBtn.addEventListener('click', () => {
  cameraModal.style.display = 'flex'
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      cameraStream = stream
      modalVideo.srcObject = stream
    })
    .catch(() => {
      alert('Cannot access camera.')
      cameraModal.style.display = 'none'
    })
})

modalCaptureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas')
  canvas.width = modalVideo.videoWidth || 360
  canvas.height = modalVideo.videoHeight || 270
  const ctx = canvas.getContext('2d')
  ctx.drawImage(modalVideo, 0, 0, canvas.width, canvas.height)
  const imageDataUrl = canvas.toDataURL('image/png')
  images.push({ src: imageDataUrl, title: 'Camera Photo', category: 'Camera' })
  saveToStorage()
  renderGallery('All')
  closeCameraModal()
})

modalCloseBtn.addEventListener('click', () => {
  closeCameraModal()
})

function closeCameraModal() {
  cameraModal.style.display = 'none'
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop())
    cameraStream = null
  }
  modalVideo.srcObject = null
}

loadFromStorage()
updateCategoryOptions()
updateFilterButtons()
renderGallery('All')
