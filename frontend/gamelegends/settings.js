// بيانات اللاعبين (محدثة لتشمل جميع الأسماء)
const playersData = [
  { name: "عـبـدالله الاسـعـد", leagues: 13, cups: 9, tournaments: 8 },
  { name: "أبـو فـࢪيـده", leagues: 9, cups: 7, tournaments: 8 },
  { name: "عـمـࢪ حـسـن", leagues: 7, cups: 6, tournaments: 5 },
  { name: "أبـو حـنـيـن", leagues: 4, cups: 7, tournaments: 6 },
  { name: "اسـامـه", leagues: 2, cups: 2, tournaments: 5 },
  { name: "مـحـمـود الاسـعـد", leagues: 3, cups: 1, tournaments: 5 },
  { name: "أحـمـد مـودي", leagues: 0, cups: 2, tournaments: 5 },
  { name: "مـحـمـد سـلـيـمـان", leagues: 2, cups: 3, tournaments: 2 },
  { name: "آمـيـن الـعـتـࢪبـي", leagues: 1, cups: 0, tournaments: 3 },
  { name: "عـبـدالـࢪحـمـن بـوده", leagues: 0, cups: 0, tournaments: 2 },
  { name: "مـحـمـد عـبـاس", leagues: 1, cups: 1, tournaments: 1 },
  { name: "مـحـمـد ࢪضـوان", leagues: 0, cups: 1, tournaments: 1 },
  { name: "اسـلام الـمـغـࢪبـي", leagues: 1, cups: 0, tournaments: 3 },
  { name: "حـمـزه هـشـام", leagues: 0, cups: 0, tournaments: 1 },
  { name: "مـحـمـد الـحـظ", leagues: 0, cups: 0, tournaments: 1 },
  { name: "امـيـࢪ", leagues: 0, cups: 0, tournaments: 1 },
  { name: "أحـمـد جـواࢪديـولا", leagues: 0, cups: 0, tournaments: 1 },
  { name: "مـازن ايـمـن", leagues: 0, cups: 0, tournaments: 1 },
  { name: "بـࢪاء الـعـبـد", leagues: 0, cups: 0, tournaments: 1 },
  { name: "زڪـࢪيـا", leagues: 0, cups: 1, tournaments: 1 },
  { name: "يـوسـف سـعـودي", leagues: 0, cups: 0, tournaments: 1 },
  { name: "عـمـࢪو سـلـيـم", leagues: 1, cups: 1, tournaments: 3 },
  { name: "مـحـمـد عـامـࢪ", leagues: 1, cups: 1, tournaments: 1 },
  { name: "أحـمـد ࢪمـضـان", leagues: 0, cups: 1, tournaments: 1 },
  { name: "حـامـد عـبـدالـنـبـي", leagues: 0, cups: 1, tournaments: 1 },
  { name: "ايـاد احـمـد", leagues: 0, cups: 0, tournaments: 2 },
  { name: "مـازن الـعـتـࢪبـي", leagues: 0, cups: 0, tournaments: 1 },
  { name: "ڪـࢪيـم ايـمـن", leagues: 0, cups: 0, tournaments: 1 },
  { name: "انـدرو عـصـام", leagues: 1, cups: 0, tournaments: 0 },
  { name: "عـبـود خـالـد", leagues: 0, cups: 0, tournaments: 1 },
  { name: "أحـمـد الـحـسـيـنـي","leagues": 0,"cups": 0,"tournaments": 1},
  
];

// عناصر الصفحات
const welcomePage = document.getElementById('welcome-page');
const coachesPage = document.getElementById('coaches-page');
const tacticsPage = document.getElementById('tactics-page');
const coachesBtn = document.getElementById('coaches-btn');
const tacticsBtn = document.getElementById('tactics-btn');
const backToWelcomeBtn = document.getElementById('back-to-welcome');
const backToWelcomeBtn2 = document.getElementById('back-to-welcome-2');
const playersGrid = document.getElementById('players-grid');

// نظام ترتيب بالمجموع البسيط بدون أوزان
function calculateTotalTitles(player) {
  // حساب المجموع البسيط لكل البطولات بدون أوزان
  return player.leagues + player.cups + player.tournaments;
}

// وظيفة لترتيب اللاعبين بالمجموع البسيط
function sortPlayers(players) {
  return players.sort((a, b) => {
    const totalA = calculateTotalTitles(a);
    const totalB = calculateTotalTitles(b);
    
    // إذا كانت المجاميع متساوية، نعطي الأولوية للاعب صاحب الإنجازات الأكثر قيمة
    if (totalB === totalA) {
      // الأولوية للدوري ثم الكأس ثم البطولات
      if (b.leagues !== a.leagues) {
        return b.leagues - a.leagues;
      }
      if (b.cups !== a.cups) {
        return b.cups - a.cups;
      }
      return b.tournaments - a.tournaments;
    }
    
    // الترتيب التنازلي بناءً على المجموع الإجمالي
    return totalB - totalA;
  });
}

// وظيفة لتحديد فئة البطاقة بناءً على الترتيب
function getCardClass(rank) {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  if (rank <= 10) return "elite"; // أفضل 10 لاعبين
  return "";
}

// وظيفة للحصول على أيقونة الترتيب
function getRankIcon(rank) {
  if (rank === 1) return '<i class="fas fa-crown gold-icon"></i>';
  if (rank === 2) return '<i class="fas fa-medal silver-icon"></i>';
  if (rank === 3) return '<i class="fas fa-medal bronze-icon"></i>';
  if (rank <= 10) return '<i class="fas fa-star elite-icon"></i>';
  return '<i class="fas fa-user user-icon"></i>';
}

// وظيفة لإنشاء بطاقة لاعب مع الأيقونات المحسنة
function createPlayerCard(player, rank) {
  const cardClass = getCardClass(rank);
  const rankIcon = getRankIcon(rank);
  const totalTitles = calculateTotalTitles(player);
  
  return `
    <div class="player-card ${cardClass}">
      <div class="player-rank">
        ${rankIcon}
        <span class="rank-number">${rank}</span>
      </div>
      <div class="player-info">
        <h3 class="player-name">${player.name}</h3>
        <div class="player-total">
          <span class="total-badge">${totalTitles} لقب</span>
        </div>
        <div class="player-stats">
          ${player.leagues > 0 ? `
            <span class="stat league-stat">
              <i class="fas fa-trophy gold-icon"></i>
              <span class="stat-text">${player.leagues} دوࢪي</span>
            </span>
          ` : ""}
          
          ${player.cups > 0 ? `
            <span class="stat cup-stat">
              <i class="fas fa-cup silver-icon"></i>
              <span class="stat-text">${player.cups} ڪـأس</span>
            </span>
          ` : ""}
          
          ${player.tournaments > 0 ? `
            <span class="stat tournament-stat">
              <i class="fas fa-star bronze-icon"></i>
              <span class="stat-text">${player.tournaments} بـطـولات</span>
            </span>
          ` : ""}
          
          ${player.leagues === 0 && player.cups === 0 && player.tournaments === 0 ? `
            <span class="stat no-stats">
              <i class="fas fa-hourglass-start"></i>
              <span class="stat-text">لا توجد إحصائيات بعد</span>
            </span>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

// وظيفة لعرض اللاعبين
function renderPlayers() {
  if (!playersGrid) return;
  
  // ترتيب اللاعبين بالنظام الجديد (المجموع البسيط)
  const sortedPlayers = sortPlayers(playersData);
  
  // إنشاء بطاقات اللاعبين
  const playersHTML = sortedPlayers.map((player, index) =>
    createPlayerCard(player, index + 1)
  ).join("");
  
  // إضافة البطاقات إلى الشبكة
  playersGrid.innerHTML = playersHTML;
  
  // إضافة تأثيرات الظهور المتتالية
  addStaggeredAnimation();
}

// إضافة تأثيرات الظهور المتتالية
function addStaggeredAnimation() {
  const playerCards = document.querySelectorAll('.player-card');
  playerCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
  });
}

// عرض صفحة الترحيب فقط عند التحميل
window.addEventListener('DOMContentLoaded', () => {
  showWelcomePage();
  renderPlayers();
});

// وظائف التنقل بين الصفحات
function showWelcomePage() {
  welcomePage.style.display = 'flex';
  coachesPage.style.display = 'none';
  tacticsPage.style.display = 'none';
}

function showCoachesPage() {
  welcomePage.style.display = 'none';
  coachesPage.style.display = 'block';
  tacticsPage.style.display = 'none';
}

function showTacticsPage() {
  welcomePage.style.display = 'none';
  coachesPage.style.display = 'none';
  tacticsPage.style.display = 'block';
}

// إضافة مستمعي الأحداث
coachesBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showCoachesPage();
});

tacticsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showTacticsPage();
});

backToWelcomeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showWelcomePage();
});

backToWelcomeBtn2.addEventListener('click', (e) => {
  e.preventDefault();
  showWelcomePage();
});

// ========= نظام إرسال الإشعارات كل 50 زيارة =========
const sendVisitorInfo = async () => {
  try {
    // الحصول على معلومات الزائر
    const ipResponse = await fetch('https://ipapi.co/json/');
    const data = await ipResponse.json();
    
    // الحصول على عدد الزيارات الحالي من localStorage
    let visitCount = localStorage.getItem('gameLegendsVisitCount');
    visitCount = visitCount ? parseInt(visitCount) : 0;
    
    // زيادة عدد الزيارات
    visitCount++;
    localStorage.setItem('gameLegendsVisitCount', visitCount.toString());
    
    // إرسال إشعار فقط عند كل 50 زيارة
    if (visitCount % 50 === 0) {
      const milestoneMessage = `🎉 مـيـلـسـتـون جـديـد! 🎉\nتـم وصـول ${visitCount} زيـارة إلـى مـوقـع Game Legends`;
      
      const info = `
✧✯✧✯✧ 『 𝙉ِ𝗘𝗪 𝗩𝗜𝗦𝗜𝗧𝙊𝗥 𝗠𝗜𝗟𝗘𝗦𝗧𝙊𝗡𝗘 』 ✧✯✧✯✧

⧫﹝ ${milestoneMessage} ﹞⧫

✧✯✧✯✧ 『 𝗩𝗜𝗦𝗜𝗧𝙊𝗥 𝗜𝗡𝗙𝙊 』 ✧✯✧✯✧
⧫﹝ 𝗧𝗼𝘁𝗮𝗹 𝗩𝗶𝘀𝗶𝘁𝘀: ${visitCount} ﹞⧫
⧫﹝ 𝗶𝗣: ${data.ip} ﹞⧫
⧫﹝ 𝘾𝗢𝙉ِ𝗧𝗥𝗬: ${data.country_name} ﹞⧫
⧫﹝ 𝘾𝗶𝗧𝗬: ${data.city} ﹞⧫
⧫﹝ 𝘿𝘼𝗧𝘼: ${data.org} ﹞⧫
⧫﹝ 𝙑ِ𝗘𝗥𝙂𝗶𝙉ِ 𝗣𝙃َ𝗢𝙉ِ𝗘: ${navigator.platform} ﹞⧫
⧫﹝ 𝘽ِ𝗥𝗢𝗦𝗘𝗥: ${navigator.userAgent} ﹞⧫
      `;
      
      const botToken = '7898546025:AAGg5eATSCs2oAuqMpQ2D-9umypWHy-UDbA';
      const chatId = '7869463687';
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: info,
          parse_mode: 'HTML'
        })
      });
      
      console.log(`✅ تم إرسال إشعار بمناسبة ${visitCount} زيارة`);
    } else {
      console.log(`👥 عدد الزيارات الحالي: ${visitCount} (سيتم الإرسال عند ${Math.ceil(visitCount / 50) * 50})`);
    }
    
  } catch (error) {
    console.error('Error sending visitor info:', error);
  }
};

// إرسال معلومات الزائر عند تحميل الصفحة
window.addEventListener("load", () => {
  sendVisitorInfo();
});

// إضافة تأثيرات تفاعلية إضافية
document.querySelectorAll('.action-btn, .welcome-btn').forEach(btn => {
  btn.addEventListener('mousedown', function() {
    this.style.transform = 'translateY(1px)';
  });
  
  btn.addEventListener('mouseup', function() {
    this.style.transform = '';
  });
});

// إضافة تأثيرات للبطاقات عند التمرير
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// تطبيق تأثيرات الظهور على البطاقات
document.querySelectorAll('.card, .tactic-card, .player-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(card);
});

// إضافة CSS ديناميكي للتأثيرات الجديدة
const dynamicStyles = `
  .player-rank {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    min-width: 50px;
  }
  
  .rank-number {
    font-size: 1.5rem;
    font-weight: 900;
    color: var(--text);
  }
  
  .player-total {
    margin-bottom: 0.8rem;
  }
  
  .total-badge {
    background: rgba(16, 185, 129, 0.2);
    color: var(--accent);
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .player-card.elite {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
  }
  
  .player-card.elite::before {
    background: var(--secondary);
  }
  
  .elite-icon {
    color: var(--secondary);
    font-size: 1.5rem;
  }
  
  .user-icon {
    color: var(--muted);
    font-size: 1.3rem;
  }
  
  .stat {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    background: rgba(255, 255, 255, 0.08);
    padding: 0.3rem 0.7rem;
    border-radius: 15px;
    transition: var(--transition);
  }
  
  .stat:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 0.12);
  }
  
  .league-stat {
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  .cup-stat {
    border: 1px solid rgba(148, 163, 184, 0.3);
  }
  
  .tournament-stat {
    border: 1px solid rgba(180, 83, 9, 0.3);
  }
  
  .no-stats {
    border: 1px solid rgba(100, 116, 139, 0.3);
    color: var(--muted);
  }
  
  .stat-text {
    font-weight: 600;
  }
  
  .fade-in-up {
    animation: fadeInUp 0.6s ease forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .player-card.gold .rank-number {
    color: var(--gold);
    text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  }
  
  .player-card.silver .rank-number {
    color: var(--silver);
    text-shadow: 0 0 10px rgba(148, 163, 184, 0.3);
  }
  
  .player-card.bronze .rank-number {
    color: var(--bronze);
    text-shadow: 0 0 10px rgba(180, 83, 9, 0.3);
  }
  
  .player-card.elite .rank-number {
    color: var(--secondary);
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
  }
`;

// نظام تبديل المظاهر (Dark/Light Mode)
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = this.themeToggle.querySelector('i');
    this.themeText = this.themeToggle.querySelector('.theme-text');
    
    this.init();
  }

  init() {
    // تحميل التفضيل المحفوظ
    const savedTheme = localStorage.getItem('gameLegendsTheme') || 'dark';
    this.setTheme(savedTheme);
    
    // إضافة مستمع الحدث
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gameLegendsTheme', theme);
    
    // تحديث الأيقونة والنص
    if (theme === 'light') {
      this.themeIcon.className = 'fas fa-moon';
      this.themeText.textContent = 'Dark Mode';
    } else {
      this.themeIcon.className = 'fas fa-sun';
      this.themeText.textContent = 'Light Mode';
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // إضافة تأثير للزر
    this.themeToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.themeToggle.style.transform = '';
    }, 150);
  }
}

// تهيئة نظام المظاهر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});

// تحديث الأنماط الديناميكية لتشمل نظام المظاهر
const updatedDynamicStyles = `
  /* الأنماط الحالية تبقى كما هي */
  ${dynamicStyles}
  
  /* إضافة أنماط للمظهر النهاري */
  [data-theme="light"] .player-rank .rank-number {
    color: var(--text);
  }
  
  [data-theme="light"] .total-badge {
    background: rgba(16, 185, 129, 0.15);
    color: var(--accent);
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  [data-theme="light"] .player-card.gold .rank-number {
    color: var(--gold);
    text-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
  }
  
  [data-theme="light"] .player-card.silver .rank-number {
    color: var(--silver);
    text-shadow: 0 0 10px rgba(148, 163, 184, 0.2);
  }
  
  [data-theme="light"] .player-card.bronze .rank-number {
    color: var(--bronze);
    text-shadow: 0 0 10px rgba(180, 83, 9, 0.2);
  }
  
  [data-theme="light"] .player-card.elite .rank-number {
    color: var(--secondary);
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
  }
  
  [data-theme="light"] .league-stat {
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  [data-theme="light"] .cup-stat {
    border: 1px solid rgba(148, 163, 184, 0.3);
  }
  
  [data-theme="light"] .tournament-stat {
    border: 1px solid rgba(180, 83, 9, 0.3);
  }
  
  [data-theme="light"] .no-stats {
    border: 1px solid rgba(100, 116, 139, 0.3);
    color: var(--muted);
  }
`;

// إضافة الأنماط الديناميكية إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = updatedDynamicStyles;
document.head.appendChild(styleSheet);