let names = [];
let clubs = [];
let results = [];
let drawTitle = "قرعة جديدة";
let currentSessionId = null;
const DRAW_PASSWORD = "1";

// عناصر DOM
const nameInput = document.getElementById('nameInput');
const clubInput = document.getElementById('clubInput');
const addNameBtn = document.getElementById('addNameBtn');
const addClubBtn = document.getElementById('addClubBtn');
const namesList = document.getElementById('namesList');
const clubsList = document.getElementById('clubsList');
const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const endSessionBtn = document.getElementById('endSessionBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const statusMessage = document.getElementById('statusMessage');
const drawTitleInput = document.getElementById('drawTitleInput');
const saveTitleBtn = document.getElementById('saveTitleBtn');
const currentTitleDisplay = document.getElementById('currentTitleDisplay');

// تهيئة التطبيق
function init() {
  loadFromStorage();
  cleanupExpiredDraws(); // تنظيف النتائج المنتهية
  checkForSavedDraw(); // التحقق من وجود قرعة محفوظة
  renderDrawTitle();
  renderNames();
  renderClubs();
  updateDrawButton();
  addEventListeners();
}

// تنظيف النتائج المنتهية الصلاحية
function cleanupExpiredDraws() {
  const savedDraws = getSavedDraws();
  const validDraws = savedDraws.filter(draw => 
    new Date(draw.expiresAt) > new Date()
  );
  
  if (validDraws.length !== savedDraws.length) {
    localStorage.setItem('savedDraws', JSON.stringify(validDraws));
    console.log(`تم تنظيف ${savedDraws.length - validDraws.length} نتيجة منتهية`);
  }
}

// الحصول على جميع النتائج المحفوظة
function getSavedDraws() {
  return JSON.parse(localStorage.getItem('savedDraws') || '[]');
}

// حفظ نتيجة القرعة الحالية
function saveCurrentDraw() {
  if (results.length === 0) {
    return; // لا تحفظ إذا لا توجد نتائج
  }
  
  const savedDraws = getSavedDraws();
  const drawData = {
    id: currentSessionId || Date.now(),
    title: drawTitle,
    results: [...results], // حفظ النتائج فقط
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
  };
  
  // إذا كانت نتيجة موجودة، قم بتحديثها، وإلا أضف جديدة
  const existingIndex = savedDraws.findIndex(d => d.id === currentSessionId);
  if (existingIndex !== -1) {
    savedDraws[existingIndex] = drawData;
  } else {
    savedDraws.push(drawData);
    currentSessionId = drawData.id;
  }
  
  localStorage.setItem('savedDraws', JSON.stringify(savedDraws));
  console.log('تم حفظ نتيجة القرعة:', drawData.title);
}

// تحميل نتيجة محددة
function loadDraw(drawId) {
  const savedDraws = getSavedDraws();
  const draw = savedDraws.find(d => d.id === drawId);
  
  if (draw) {
    drawTitle = draw.title;
    results = [...draw.results]; // تحميل النتائج فقط
    currentSessionId = draw.id;
    
    renderDrawTitle();
    renderResults();
    resultsSection.style.display = 'block';
    updateResultsSectionTitle();
    updateTimeRemaining();
    
    showMessage('تم تحميل نتيجة القرعة بنجاح', 'success');
    return true;
  }
  return false;
}

// التحقق من وجود قرعة محفوظة وتحميلها
function checkForSavedDraw() {
  const savedDraws = getSavedDraws();
  if (savedDraws.length > 0) {
    // تحميل أحدث قرعة
    const latestDraw = savedDraws[savedDraws.length - 1];
    if (new Date(latestDraw.expiresAt) > new Date()) {
      loadDraw(latestDraw.id);
    }
  }
}

// تحميل البيانات من localStorage (الأسماء والأندية فقط)
function loadFromStorage() {
  const savedNames = localStorage.getItem('drawNames');
  const savedClubs = localStorage.getItem('drawClubs');
  const savedTitle = localStorage.getItem('drawTitle');
  
  if (savedNames) names = JSON.parse(savedNames);
  if (savedClubs) clubs = JSON.parse(savedClubs);
  if (savedTitle) drawTitle = savedTitle;
}

// حفظ البيانات في localStorage (الأسماء والأندية فقط)
function saveToStorage() {
  localStorage.setItem('drawNames', JSON.stringify(names));
  localStorage.setItem('drawClubs', JSON.stringify(clubs));
  localStorage.setItem('drawTitle', drawTitle);
}

// إضافة مستمعي الأحداث
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
  endSessionBtn.addEventListener('click', endSession);
}

// إضافة اسم
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

// حفظ عنوان القرعة
function saveDrawTitle() {
  const title = drawTitleInput.value.trim();
  
  if (!title) {
    showMessage('يرجى إدخال عنوان للقرعة', 'error');
    return;
  }
  
  drawTitle = title;
  drawTitleInput.value = '';
  renderDrawTitle();
  saveToStorage();
  
  if (resultsSection.style.display !== 'none') {
    updateResultsSectionTitle();
    const titleElement = resultsGrid.querySelector('.draw-title-header h3');
    const subtitleElement = resultsGrid.querySelector('.draw-subtitle');
    
    if (titleElement) titleElement.textContent = drawTitle;
    if (subtitleElement) subtitleElement.textContent = drawTitle;
  }
  
  showMessage('تم حفظ عنوان القرعة بنجاح', 'success');
}

// عرض عنوان القرعة
function renderDrawTitle() {
  if (currentTitleDisplay) {
    currentTitleDisplay.innerHTML = `
      <div class="title-display">
        <i class="fas fa-tag"></i>
        <span class="title-text">${drawTitle}</span>
        ${currentSessionId ? `<span class="session-badge">نتيجة محفوظة</span>` : ''}
      </div>
    `;
  }
  
  document.title = `${drawTitle} - Game Legends`;
}

// إضافة نادي
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

// حذف اسم
function deleteName(index) {
  names.splice(index, 1);
  renderNames();
  saveToStorage();
  updateDrawButton();
  showMessage('تم حذف الاسم', 'success');
}

// حذف نادي
function deleteClub(index) {
  clubs.splice(index, 1);
  renderClubs();
  saveToStorage();
  updateDrawButton();
  showMessage('تم حذف النادي', 'success');
}

// عرض الأسماء
function renderNames() {
  namesList.innerHTML = '';
  
  if (names.length === 0) {
    namesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>لا توجد أسماء مضافة</p>
      </div>
    `;
    return;
  }
  
  names.forEach((name, index) => {
    const nameElement = document.createElement('div');
    nameElement.className = 'item';
    nameElement.innerHTML = `
      <span class="item-name">${name}</span>
      <button class="delete-btn" onclick="deleteName(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    namesList.appendChild(nameElement);
  });
}

// عرض الأندية
function renderClubs() {
  clubsList.innerHTML = '';
  
  if (clubs.length === 0) {
    clubsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-trophy"></i>
        <p>لا توجد أندية مضافة</p>
      </div>
    `;
    return;
  }
  
  clubs.forEach((club, index) => {
    const clubElement = document.createElement('div');
    clubElement.className = 'item';
    clubElement.innerHTML = `
      <span class="item-name">${club}</span>
      <button class="delete-btn" onclick="deleteClub(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    clubsList.appendChild(clubElement);
  });
}

// تحديث حالة زر القرعة
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

// عرض نافذة كلمة المرور
function showPasswordModal() {
  if (names.length === 0 || clubs.length === 0) {
    showMessage('يرجى إضافة أسماء وأندية أولاً', 'error');
    return;
  }
  
  const modalHTML = `
    <div class="modal-overlay" id="passwordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-lock"></i> مصادقة إجراء القرعة</h3>
          <button class="modal-close" onclick="closePasswordModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>يرجى إدخال كلمة المرور للمتابعة:</p>
          <input type="password" id="passwordInput" class="text-input modal-input" placeholder="أدخل كلمة المرور...">
          <div class="modal-actions">
            <button class="action-btn secondary" onclick="closePasswordModal()">إلغاء</button>
            <button class="action-btn primary" onclick="verifyPassword()">متابعة</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  setTimeout(() => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
      passwordInput.focus();
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          verifyPassword();
        }
      });
    }
  }, 100);
}

// إغلاق نافذة كلمة المرور
function closePasswordModal() {
  const modal = document.getElementById('passwordModal');
  if (modal) {
    modal.remove();
  }
}

// التحقق من كلمة المرور
function verifyPassword() {
  const passwordInput = document.getElementById('passwordInput');
  const enteredPassword = passwordInput.value.trim();
  
  if (!enteredPassword) {
    showMessage('يرجى إدخال كلمة المرور', 'error');
    return;
  }
  
  if (enteredPassword === DRAW_PASSWORD) {
    closePasswordModal();
    performDraw();
  } else {
    showMessage('كلمة المرور غير صحيحة', 'error');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// إجراء القرعة
function performDraw() {
  drawBtn.classList.add('drawing');
  
  setTimeout(() => {
    results = [];
    const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
    
    let clubIndex = 0;
    names.forEach(name => {
      const club = shuffledClubs[clubIndex % shuffledClubs.length];
      results.push({ name, club });
      clubIndex++;
    });
    
    results = results.sort(() => Math.random() - 0.5);
    updateResultsSectionTitle();
    renderResults();
    resultsSection.style.display = 'block';
    
    drawBtn.classList.remove('drawing');
    showMessage('تم إجراء القرعة بنجاح!', 'success');
    saveCurrentDraw(); // حفظ النتيجة فقط بعد إجراء القرعة
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }, 1000);
}

// تحديث عنوان قسم النتائج
function updateResultsSectionTitle() {
  const resultsTitle = resultsSection.querySelector('h2');
  if (resultsTitle) {
    resultsTitle.innerHTML = `<i class="fas fa-list-alt"></i> ${drawTitle}`;
  }
}

// عرض النتائج
function renderResults() {
  resultsGrid.innerHTML = '';
  
  const titleElement = document.createElement('div');
  titleElement.className = 'draw-title-header';
  titleElement.innerHTML = `
    <h3><i class="fas fa-trophy"></i> ${drawTitle}</h3>
    <p class="draw-subtitle">نتيجة القرعة</p>
    <div class="session-info">
      <span class="time-remaining" id="timeRemaining"></span>
      ${currentSessionId ? `<button class="action-btn small secondary" onclick="deleteCurrentDraw()">حذف النتيجة</button>` : ''}
    </div>
  `;
  resultsGrid.appendChild(titleElement);
  
  results.forEach((result, index) => {
    const resultElement = document.createElement('div');
    resultElement.className = 'result-item';
    resultElement.style.animationDelay = `${index * 0.1}s`;
    
    resultElement.innerHTML = `
      <div class="result-icon">
        <i class="fas fa-handshake"></i>
      </div>
      <div class="result-name">${result.name}</div>
      <div class="result-club">${result.club}</div>
    `;
    
    resultsGrid.appendChild(resultElement);
  });
  
  // تحديث الوقت المتبقي
  updateTimeRemaining();
}

// تحديث الوقت المتبقي
function updateTimeRemaining() {
  const timeRemainingElement = document.getElementById('timeRemaining');
  if (!timeRemainingElement) return;
  
  const savedDraws = getSavedDraws();
  const currentDraw = savedDraws.find(d => d.id === currentSessionId);
  
  if (currentDraw) {
    const expiresAt = new Date(currentDraw.expiresAt);
    const now = new Date();
    const timeLeft = expiresAt - now;
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      timeRemainingElement.textContent = `⏰ محفوظة لمدة: ${hours} ساعة ${minutes} دقيقة`;
      timeRemainingElement.className = 'time-remaining active';
    } else {
      timeRemainingElement.textContent = '⏰ انتهت مدة الحفظ';
      timeRemainingElement.className = 'time-remaining expired';
      // حذف تلقائي عند انتهاء المدة
      deleteCurrentDraw();
    }
  }
}

// حذف النتيجة الحالية
function deleteCurrentDraw() {
  if (confirm('هل تريد حذف نتيجة القرعة الحالية؟')) {
    const savedDraws = getSavedDraws();
    const updatedDraws = savedDraws.filter(d => d.id !== currentSessionId);
    localStorage.setItem('savedDraws', JSON.stringify(updatedDraws));
    
    results = [];
    currentSessionId = null;
    resultsSection.style.display = 'none';
    
    showMessage('تم حذف نتيجة القرعة', 'success');
  }
}

// إعادة تعيين القرعة
function resetDraw() {
  results = [];
  resultsSection.style.display = 'none';
  showMessage('تم إعادة تعيين القرعة', 'success');
}

// مسح الكل (الأسماء والأندية فقط)
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

// إنهاء الجلسة ومسح جميع البيانات
function endSession() {
  if (confirm('هل أنت متأكد من إنهاء الجلسة ومسح جميع البيانات؟')) {
    // مسح الأسماء والأندية من localStorage
    localStorage.removeItem('drawNames');
    localStorage.removeItem('drawClubs');
    localStorage.removeItem('drawTitle');
    
    // مسح النتيجة الحالية
    if (currentSessionId) {
      deleteCurrentDraw();
    }
    
    // مسح من الذاكرة
    names = [];
    clubs = [];
    results = [];
    drawTitle = "قرعة جديدة";
    currentSessionId = null;
    
    // إعادة العرض
    renderDrawTitle();
    renderNames();
    renderClubs();
    resultsSection.style.display = 'none';
    updateDrawButton();
    
    showMessage('تم إنهاء الجلسة ومسح جميع البيانات', 'success');
  }
}

// عرض رسائل الحالة
function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

// تحديث الوقت المتبقي كل دقيقة
setInterval(() => {
  if (currentSessionId) {
    updateTimeRemaining();
  }
}, 60000);

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);