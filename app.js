// Target sizes
const SIZES = {
    phone: { width: 1242, height: 2688, label: 'iPhone 6.5"' },
    ipad:  { width: 2064, height: 2752, label: 'iPad 13"' }
};

// State
let currentDevice = 'phone';
let images = []; // { file, originalUrl, resizedBlob, resizedUrl, name, origWidth, origHeight }

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagesSection = document.getElementById('imagesSection');
const imageGrid = document.getElementById('imageGrid');
const imageCount = document.getElementById('imageCount');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const deviceBtns = document.querySelectorAll('.device-btn');

// Device selector
deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        deviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDevice = btn.dataset.device;
        // Re-resize all images for new device
        if (images.length > 0) {
            resizeAllImages();
        }
    });
});

// Upload area events
uploadArea.addEventListener('click', () => fileInput.click());
addMoreBtn.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleFiles(files);
    fileInput.value = '';
});

// Handle uploaded files
async function handleFiles(files) {
    for (const file of files) {
        const img = {
            file,
            name: file.name,
            originalUrl: URL.createObjectURL(file),
            resizedBlob: null,
            resizedUrl: null,
            origWidth: 0,
            origHeight: 0
        };
        images.push(img);
    }
    updateUI();
    await resizeAllImages();
}

// Resize a single image to target dimensions
function resizeImage(imgEntry) {
    return new Promise((resolve) => {
        const target = SIZES[currentDevice];
        const img = new Image();
        img.onload = () => {
            imgEntry.origWidth = img.naturalWidth;
            imgEntry.origHeight = img.naturalHeight;

            const canvas = document.createElement('canvas');
            canvas.width = target.width;
            canvas.height = target.height;
            const ctx = canvas.getContext('2d');

            // Draw blurred background (cover fit)
            ctx.save();
            const bgScaleX = target.width / img.naturalWidth;
            const bgScaleY = target.height / img.naturalHeight;
            const bgScale = Math.max(bgScaleX, bgScaleY);
            
            const bgWidth = img.naturalWidth * bgScale;
            const bgHeight = img.naturalHeight * bgScale;
            const bgX = (target.width - bgWidth) / 2;
            const bgY = (target.height - bgHeight) / 2;
            
            ctx.filter = 'blur(40px)';
            ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);
            
            // Add a subtle dark overlay to make the main image stand out
            ctx.filter = 'none';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Calculate contain-fit dimensions for the main image (pad to fit without cropping)
            const scaleX = target.width / img.naturalWidth;
            const scaleY = target.height / img.naturalHeight;
            const scale = Math.min(scaleX, scaleY);

            const drawWidth = img.naturalWidth * scale;
            const drawHeight = img.naturalHeight * scale;
            const drawX = (target.width - drawWidth) / 2;
            const drawY = (target.height - drawHeight) / 2;

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            canvas.toBlob((blob) => {
                if (imgEntry.resizedUrl) URL.revokeObjectURL(imgEntry.resizedUrl);
                imgEntry.resizedBlob = blob;
                imgEntry.resizedUrl = URL.createObjectURL(blob);
                resolve();
            }, 'image/png');
        };
        img.src = imgEntry.originalUrl;
    });
}

// Resize all images
async function resizeAllImages() {
    const promises = images.map(img => resizeImage(img));
    await Promise.all(promises);
    updateUI();
}

// Update UI
function updateUI() {
    const count = images.length;
    imagesSection.style.display = count > 0 ? 'block' : 'none';
    imageCount.textContent = `${count} image${count !== 1 ? 's' : ''} ready`;

    renderGrid();
}

// Render image grid
function renderGrid() {
    const target = SIZES[currentDevice];
    imageGrid.innerHTML = '';

    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'image-card' + (img.resizedBlob ? '' : ' processing');

        const thumbSrc = img.resizedUrl || img.originalUrl;
        const sizeInfo = img.origWidth ? `${img.origWidth} × ${img.origHeight} → ${target.width} × ${target.height}` : 'Processing...';

        card.innerHTML = `
            <div class="thumb-wrapper">
                <img class="thumb" src="${thumbSrc}" alt="${img.name}">
                <div class="processing-indicator"><div class="spinner"></div></div>
            </div>
            <div class="card-info">
                <div class="filename" title="${img.name}">${img.name}</div>
                <div class="original-size">${sizeInfo}</div>
                <div class="card-actions">
                    <button class="btn btn-primary btn-sm download-btn" ${!img.resizedBlob ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        Download
                    </button>
                    <button class="btn btn-danger btn-sm remove-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                </div>
            </div>
        `;

        // Download single
        card.querySelector('.download-btn').addEventListener('click', () => {
            if (img.resizedBlob) downloadBlob(img.resizedBlob, getResizedName(img.name));
        });

        // Remove single
        card.querySelector('.remove-btn').addEventListener('click', () => {
            URL.revokeObjectURL(img.originalUrl);
            if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
            images.splice(index, 1);
            updateUI();
        });

        imageGrid.appendChild(card);
    });
}

// Download all as individual files (or ZIP if JSZip available)
downloadAllBtn.addEventListener('click', async () => {
    const readyImages = images.filter(img => img.resizedBlob);
    if (readyImages.length === 0) return;

    if (readyImages.length === 1) {
        downloadBlob(readyImages[0].resizedBlob, getResizedName(readyImages[0].name));
        return;
    }

    // Try ZIP download using JSZip (loaded from CDN)
    try {
        if (typeof JSZip === 'undefined') {
            // Dynamically load JSZip
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        }
        const zip = new JSZip();
        readyImages.forEach(img => {
            zip.file(getResizedName(img.name), img.resizedBlob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const deviceLabel = currentDevice === 'phone' ? 'iPhone' : 'iPad';
        downloadBlob(zipBlob, `screenshots-${deviceLabel}.zip`);
    } catch {
        // Fallback: download individually
        readyImages.forEach(img => {
            downloadBlob(img.resizedBlob, getResizedName(img.name));
        });
    }
});

// Clear all
clearAllBtn.addEventListener('click', () => {
    images.forEach(img => {
        URL.revokeObjectURL(img.originalUrl);
        if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
    });
    images = [];
    updateUI();
});

// Helpers
function getResizedName(originalName) {
    const target = SIZES[currentDevice];
    const ext = originalName.lastIndexOf('.');
    const base = ext !== -1 ? originalName.substring(0, ext) : originalName;
    return `${base}_${target.width}x${target.height}.png`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
