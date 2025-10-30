// Control Panel JavaScript

let trainers = [];
let editingTrainerId = null;

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const panelContainer = document.getElementById('panelContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addTrainerBtn = document.getElementById('addTrainerBtn');
const trainerFormCard = document.getElementById('trainerFormCard');
const trainerForm = document.getElementById('trainerForm');
const cancelBtn = document.getElementById('cancelBtn');
const trainersTable = document.getElementById('trainersTable');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Initialize
async function init() {
  // Check if already logged in
  const authResult = await AuthAPI.verify();
  
  if (authResult.success) {
    showPanel();
    await loadTrainers();
  } else {
    showLogin();
  }
}

// Show login page
function showLogin() {
  loginContainer.style.display = 'block';
  panelContainer.style.display = 'none';
  logoutBtn.style.display = 'none';
}

// Show panel
function showPanel() {
  loginContainer.style.display = 'none';
  panelContainer.style.display = 'block';
  logoutBtn.style.display = 'block';
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  
  try {
    const result = await AuthAPI.login(password);
    
    if (result.success) {
      showMessage('تم تسجيل الدخول بنجاح', 'success');
      showPanel();
      await loadTrainers();
    }
  } catch (error) {
    showMessage(error.message || 'كلمة المرور غير صحيحة', 'error');
  }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  AuthAPI.logout();
  showMessage('تم تسجيل الخروج بنجاح', 'success');
  showLogin();
  loginForm.reset();
});

// Load trainers
async function loadTrainers() {
  try {
    trainersTable.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>جاري تحميل البيانات...</p>
      </div>
    `;

    const result = await TrainersAPI.getAll();
    
    if (result.success) {
      trainers = result.trainers;
      renderTrainers();
    }
  } catch (error) {
    trainersTable.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>فشل في تحميل البيانات</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Render trainers table
function renderTrainers() {
  if (trainers.length === 0) {
    trainersTable.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>لا توجد بيانات مدربين</p>
      </div>
    `;
    return;
  }

  // Sort trainers by total titles
  const sortedTrainers = [...trainers].sort((a, b) => {
    const totalA = a.leagues + a.cups + a.tournaments;
    const totalB = b.leagues + b.cups + b.tournaments;
    return totalB - totalA;
  });

  const tableHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>الدوريات</th>
            <th>الكؤوس</th>
            <th>البطولات</th>
            <th>المجموع</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTrainers.map((trainer, index) => {
            const total = trainer.leagues + trainer.cups + trainer.tournaments;
            return `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${trainer.name}</strong></td>
                <td>
                  ${trainer.leagues > 0 ? `<span class="stat-badge badge-leagues">${trainer.leagues}</span>` : '0'}
                </td>
                <td>
                  ${trainer.cups > 0 ? `<span class="stat-badge badge-cups">${trainer.cups}</span>` : '0'}
                </td>
                <td>
                  ${trainer.tournaments > 0 ? `<span class="stat-badge badge-tournaments">${trainer.tournaments}</span>` : '0'}
                </td>
                <td><strong>${total}</strong></td>
                <td>
                  <div class="table-actions">
                    <button class="icon-btn edit" onclick="editTrainer(${trainer.id})" title="تعديل">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteTrainer(${trainer.id})" title="حذف">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  trainersTable.innerHTML = tableHTML;
}

// Show add trainer form
addTrainerBtn.addEventListener('click', () => {
  editingTrainerId = null;
  document.getElementById('formTitle').textContent = 'إضافة مدرب جديد';
  trainerForm.reset();
  document.getElementById('trainerId').value = '';
  trainerFormCard.style.display = 'block';
  trainerFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Cancel form
cancelBtn.addEventListener('click', () => {
  trainerFormCard.style.display = 'none';
  trainerForm.reset();
  editingTrainerId = null;
});

// Edit trainer
window.editTrainer = function(id) {
  const trainer = trainers.find(t => t.id === id);
  if (!trainer) return;

  editingTrainerId = id;
  document.getElementById('formTitle').textContent = 'تعديل بيانات المدرب';
  document.getElementById('trainerId').value = id;
  document.getElementById('trainerName').value = trainer.name;
  document.getElementById('leagues').value = trainer.leagues;
  document.getElementById('cups').value = trainer.cups;
  document.getElementById('tournaments').value = trainer.tournaments;
  
  trainerFormCard.style.display = 'block';
  trainerFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Save trainer (add or update)
trainerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const trainerData = {
    name: document.getElementById('trainerName').value.trim(),
    leagues: parseInt(document.getElementById('leagues').value) || 0,
    cups: parseInt(document.getElementById('cups').value) || 0,
    tournaments: parseInt(document.getElementById('tournaments').value) || 0
  };

  try {
    let result;
    
    if (editingTrainerId) {
      result = await TrainersAPI.update(editingTrainerId, trainerData);
    } else {
      result = await TrainersAPI.create(trainerData);
    }

    if (result.success) {
      showMessage(result.message, 'success');
      trainerFormCard.style.display = 'none';
      trainerForm.reset();
      editingTrainerId = null;
      await loadTrainers();
    }
  } catch (error) {
    showMessage(error.message || 'حدث خطأ', 'error');
  }
});

// Delete trainer
let deleteTrainerId = null;

window.deleteTrainer = function(id) {
  deleteTrainerId = id;
  deleteModal.style.display = 'flex';
};

window.closeDeleteModal = function() {
  deleteModal.style.display = 'none';
  deleteTrainerId = null;
};

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deleteTrainerId) return;

  try {
    const result = await TrainersAPI.delete(deleteTrainerId);
    
    if (result.success) {
      showMessage(result.message, 'success');
      closeDeleteModal();
      await loadTrainers();
    }
  } catch (error) {
    showMessage(error.message || 'فشل في حذف المدرب', 'error');
  }
});

// Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});

// Initialize theme manager (from settings.js)
document.addEventListener('DOMContentLoaded', () => {
  init();
  
  // Initialize theme toggle
  if (typeof ThemeManager !== 'undefined') {
    new ThemeManager();
  }
});
