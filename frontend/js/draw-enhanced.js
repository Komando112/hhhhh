// Enhanced Draw System with Backend Integration

let names = [];
let clubs = [];
let currentDraw = null;
let drawTitle = "قرعة جديدة";

// DOM Elements
const nameInput = document.getElementById('nameInput');
const clubInput = document.getElementById('clubInput');
const addNameBtn = document.getElementById('addNameBtn');
const addClubBtn = document.getElementById('addClubBtn');
const namesList = document.getElementById('namesList');
const clubsList = document.getElementById('clubsList');
const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const drawTitleInput = document.getElementById('drawTitleInput');
const saveTitleBtn = document.getElementById('saveTitleBtn');
const currentTitleDisplay = document.getElementById('currentTitleDisplay');
const savedDrawsCard = document.getElementById('savedDrawsCard');
const savedDrawsList = document.getElementById('savedDrawsList');

// Initialize
function init() {
  loadFromStorage();
  loadSavedDraws();
  renderDrawTitle();
  renderNames();
  renderClubs();
  updateDrawButton();
  addEventListeners();
}

// Load from localStorage
function loadFromStorage() {
  const savedNames = localStorage.getItem('drawNames');
  const savedClubs = localStorage.getItem('drawClubs');
  const savedTitle = localStorage.getItem('drawTitle');

  if (savedNames) names = JSON.parse(savedNames);
  if (savedClubs) clubs = JSON.parse(savedClubs);
  if (savedTitle) {
    drawTitle = savedTitle;
    drawTitleInput.value = savedTitle;
  }
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem('drawNames', JSON.stringify(names));
  localStorage.setItem('drawClubs', JSON.stringify(clubs));
  localStorage.setItem('drawTitle', drawTitle);
}

// Load saved draws from backend
async function loadSavedDraws() {
  try {
    const result = await LotteryAPI.getAll();
    
    if (result.success && result.draws && result.draws.length > 0) {
      savedDrawsCard.style.display = 'block';
      renderSavedDraws(result.draws);
    } else {
      savedDrawsCard.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load saved draws:', error);
  }
}

// Render saved draws
function renderSavedDraws(draws) {
  const drawsHTML = draws.map(draw => {
    const expiresAt = new Date(draw.expiresAt);
    const now = new Date();
    const timeLeft = expiresAt - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `
      <div class="saved-draw-item">
        <div class="draw-info">
          <h4><i class="fas fa-trophy"></i> ${draw.title}</h4>
          <p class="draw-time">
            <i class="fas fa-clock"></i> 
            ${hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} دقيقة`}
          </p>
        </div>
        <div class="draw-actions">
          <button onclick="viewDraw(${draw.id})" class="action-btn small secondary">
            <i class="fas fa-eye"></i> عرض
          </button>
          <button onclick="deleteSavedDraw(${draw.id})" class="action-btn small danger">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </div>
    `;
  }).join('');

  savedDrawsList.innerHTML = drawsHTML;
}

// View saved draw
window.viewDraw = function(id) {
  LotteryAPI.getAll().then(result => {
    if (result.success) {
      const draw = result.draws.find(d => d.id === id);
      if (draw) {
        currentDraw = draw;
        drawTitle = draw.title;
        renderDrawTitle();
        renderResults(draw.results);
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
};

// Delete saved draw (requires password)
window.deleteSavedDraw = async function(id) {
  const password = prompt('يرجى إدخال كلمة المرور لحذف القرعة:');
  
  if (!password) return;

  try {
    // Login to get token
    await AuthAPI.login(password);
    
    // Delete draw
    const result = await LotteryAPI.delete(id);
    
    if (result.success) {
      showMessage(result.message, 'success');
      await loadSavedDraws();
      
      // If this was the current draw, hide results
      if (currentDraw && currentDraw.id === id) {
        currentDraw = null;
        resultsSection.style.display = 'none';
      }
    }
  } catch (error) {
    showMessage(error.message || 'فشل في حذف القرعة', 'error');
  }
};

// Event listeners
function addEventListeners() {
  addNameBtn.addEventListener('click', addName);
  addClubBtn.addEventListener('click', addClub);
  saveTitleBtn.addEventListener('click', saveDrawTitle);

  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addName();
  });

  clubInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addClub();
  });

  drawTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveDrawTitle();
  });

  drawBtn.addEventListener('click', showPasswordModal);
  resetBtn.addEventListener('click', resetDraw);
  clearAllBtn.addEventListener('click', clearAll);
}

// Add name
function addName() {
  const name = nameInput.value.trim();
  if (!name) {
    showMessage('يرجى إدخال اسم', 'error');
    return;
  }

  if (names.includes(name)) {
    showMessage('هذا الاسم موجود مسبقاً', 'warning');
    return;
  }

  names.push(name);
  nameInput.value = '';
  renderNames();
  saveToStorage();
  updateDrawButton();
  showMessage('تم إضافة الاسم بنجاح', 'success');
}

// Add club
function addClub() {
  const club = clubInput.value.trim();
  if (!club) {
    showMessage('يرجى إدخال نادي', 'error');
    return;
  }

  if (clubs.includes(club)) {
    showMessage('هذا النادي موجود مسبقاً', 'warning');
    return;
  }

  clubs.push(club);
  clubInput.value = '';
  renderClubs();
  saveToStorage();
  updateDrawButton();
  showMessage('تم إضافة النادي بنجاح', 'success');
}

// Delete name
window.deleteName = function(index) {
  names.splice(index, 1);
  renderNames();
  saveToStorage();
  updateDrawButton();
  showMessage('تم حذف الاسم', 'success');
};

// Delete club
window.deleteClub = function(index) {
  clubs.splice(index, 1);
  renderClubs();
  saveToStorage();
  updateDrawButton();
  showMessage('تم حذف النادي', 'success');
};

// Render names
function renderNames() {
  if (names.length === 0) {
    namesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>لا توجد أسماء مضافة</p>
      </div>
    `;
    return;
  }

  namesList.innerHTML = names.map((name, index) => `
    <div class="item">
      <span class="item-name">${name}</span>
      <button class="delete-btn" onclick="deleteName(${index})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

// Render clubs
function renderClubs() {
  if (clubs.length === 0) {
    clubsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-trophy"></i>
        <p>لا توجد أندية مضافة</p>
      </div>
    `;
    return;
  }

  clubsList.innerHTML = clubs.map((club, index) => `
    <div class="item">
      <span class="item-name">${club}</span>
      <button class="delete-btn" onclick="deleteClub(${index})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

// Save draw title
function saveDrawTitle() {
  const title = drawTitleInput.value.trim();

  if (!title) {
    showMessage('يرجى إدخال عنوان للقرعة', 'error');
    return;
  }

  drawTitle = title;
  renderDrawTitle();
  saveToStorage();
  showMessage('تم حفظ عنوان القرعة بنجاح', 'success');
}

// Render draw title
function renderDrawTitle() {
  currentTitleDisplay.innerHTML = `
    <div class="title-display">
      <i class="fas fa-tag"></i>
      <span class="title-text">${drawTitle}</span>
    </div>
  `;
  document.title = `${drawTitle} - Game Legends`;
}

// Update draw button
function updateDrawButton() {
  const canDraw = names.length > 0 && clubs.length > 0;
  drawBtn.disabled = !canDraw;

  if (!canDraw) {
    drawBtn.style.opacity = '0.6';
    drawBtn.style.cursor = 'not-allowed';
  } else {
    drawBtn.style.opacity = '1';
    drawBtn.style.cursor = 'pointer';
  }
}

// Show password modal
function showPasswordModal() {
  if (names.length === 0 || clubs.length === 0) {
    showMessage('يرجى إضافة أسماء وأندية أولاً', 'error');
    return;
  }

  const password = prompt('يرجى إدخال كلمة المرور لإجراء القرعة:');
  
  if (password) {
    performDraw(password);
  }
}

// Perform draw
async function performDraw(password) {
  drawBtn.classList.add('drawing');

  try {
    // Login to get token
    await AuthAPI.login(password);

    // Create lottery draw
    const result = await LotteryAPI.create({
      title: drawTitle,
      names: names,
      clubs: clubs
    });

    if (result.success) {
      currentDraw = result.draw;
      renderResults(result.draw.results);
      resultsSection.style.display = 'block';
      showMessage('تم إجراء القرعة وحفظها لمدة 24 ساعة!', 'success');
      resultsSection.scrollIntoView({ behavior: 'smooth' });
      
      // Reload saved draws
      await loadSavedDraws();
    }
  } catch (error) {
    showMessage(error.message || 'كلمة المرور غير صحيحة', 'error');
  } finally {
    drawBtn.classList.remove('drawing');
  }
}

// Render results
function renderResults(results) {
  resultsGrid.innerHTML = `
    <div class="draw-title-header">
      <h3><i class="fas fa-trophy"></i> ${drawTitle}</h3>
      <p class="draw-subtitle">نتيجة القرعة - محفوظة لمدة 24 ساعة</p>
    </div>
    ${results.map((result, index) => `
      <div class="result-item" style="animation-delay: ${index * 0.1}s">
        <div class="result-icon">
          <i class="fas fa-handshake"></i>
        </div>
        <div class="result-name">${result.name}</div>
        <div class="result-club">${result.club}</div>
      </div>
    `).join('')}
  `;
}

// Reset draw
function resetDraw() {
  currentDraw = null;
  resultsSection.style.display = 'none';
  showMessage('تم إعادة تعيين القرعة', 'success');
}

// Clear all
function clearAll() {
  if (confirm('هل أنت متأكد من مسح جميع الأسماء والأندية؟')) {
    names = [];
    clubs = [];

    renderNames();
    renderClubs();
    saveToStorage();
    updateDrawButton();

    showMessage('تم مسح جميع الأسماء والأندية', 'success');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
