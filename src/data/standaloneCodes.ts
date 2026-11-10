// We provide the raw standalone strings directly
export const STANDALONE_SURVEY_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Prompt:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Prompt', 'sans-serif'],
            serif: ['Cormorant Garamond', 'serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Prompt', sans-serif; -webkit-tap-highlight-color: transparent; }
  </style>
</head>
<body class="bg-stone-950 text-stone-100 min-h-screen pb-12 selection:bg-amber-300 selection:text-stone-950">
  <div class="max-w-md mx-auto px-4 pt-8">
    <header class="text-center mb-8">
      <div class="flex items-center justify-center gap-2 text-xs text-stone-400 uppercase tracking-wider mb-2 font-mono">
        <span>ระบบประเมินนิรนาม</span>
        <span>·</span>
        <span>ไม่บันทึกข้อมูลส่วนตัว</span>
      </div>
      <h1 class="text-2xl font-serif font-semibold text-stone-100 tracking-tight">แบบประเมินความพึงพอใจ</h1>
      <p class="text-xs text-stone-400 mt-1.5">โครงการฝึกอบรมเพื่อพัฒนาทักษะการทำงาน</p>
    </header>

    <div id="alreadySubmittedCard" class="hidden bg-stone-900/80 border border-stone-800 rounded-2xl p-6 text-center backdrop-blur shadow-lg mb-6">
      <div class="w-12 h-12 bg-amber-400/10 border border-amber-300/30 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-300">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h2 class="text-lg font-serif font-semibold text-stone-100">บันทึกข้อมูลเรียบร้อยแล้ว</h2>
      <p class="text-xs text-stone-400 mt-1.5 leading-relaxed">ขอขอบพระคุณสำหรับความคิดเห็นอันมีค่า ข้อมูลของท่านได้แสดงบนหน้าจอ Dashboard สดเรียบร้อยแล้ว</p>
      <button onclick="resetSubmissionState()" class="mt-4 text-xs text-stone-500 hover:text-stone-300 underline font-mono">
        (ทดสอบตอบใหม่อีกครั้ง)
      </button>
    </div>

    <form id="surveyForm" onsubmit="handleSubmit(event)" class="space-y-4">
      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div class="mb-3">
          <div class="text-[11px] font-mono text-stone-400">01. เกณฑ์การประเมิน</div>
          <h3 class="text-sm font-semibold text-stone-100 mt-0.5">1. ความชัดเจนและประโยชน์ของเนื้อหาหลักสูตร</h3>
          <p class="text-xs text-stone-400 mt-0.5">เนื้อหาเรียบเรียงเข้าใจง่าย ตรงตามวัตถุประสงค์ และนำไปใช้งานได้</p>
        </div>
        <div class="grid grid-cols-5 gap-1.5" data-question="q1"></div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div class="mb-3">
          <div class="text-[11px] font-mono text-stone-400">02. เกณฑ์การประเมิน</div>
          <h3 class="text-sm font-semibold text-stone-100 mt-0.5">2. ความรู้ความสามารถและเทคนิคของวิทยากร</h3>
          <p class="text-xs text-stone-400 mt-0.5">ถ่ายทอดได้น่าสนใจ มีปฏิสัมพันธ์ และตอบข้อสงสัยได้ชัดเจน</p>
        </div>
        <div class="grid grid-cols-5 gap-1.5" data-question="q2"></div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div class="mb-3">
          <div class="text-[11px] font-mono text-stone-400">03. เกณฑ์การประเมิน</div>
          <h3 class="text-sm font-semibold text-stone-100 mt-0.5">3. การนำความรู้และทักษะไปประยุกต์ใช้</h3>
          <p class="text-xs text-stone-400 mt-0.5">สามารถต่อยอดกับงานหรือการเรียนรู้ในชีวิตจริงได้ทันที</p>
        </div>
        <div class="grid grid-cols-5 gap-1.5" data-question="q3"></div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div class="mb-3">
          <div class="text-[11px] font-mono text-stone-400">04. เกณฑ์การประเมิน</div>
          <h3 class="text-sm font-semibold text-stone-100 mt-0.5">4. คุณภาพของสื่อ สไลด์ เอกสาร และระบบ</h3>
          <p class="text-xs text-stone-400 mt-0.5">สื่อทันสมัย เอกสารอ่านง่าย และอุปกรณ์/ระบบพร้อมใช้งาน</p>
        </div>
        <div class="grid grid-cols-5 gap-1.5" data-question="q4"></div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <div class="mb-3">
          <div class="text-[11px] font-mono text-stone-400">05. เกณฑ์การประเมิน</div>
          <h3 class="text-sm font-semibold text-stone-100 mt-0.5">5. ความเหมาะสมของเวลา สถานที่ และการบริการ</h3>
          <p class="text-xs text-stone-400 mt-0.5">การจัดสรรเวลาเหมาะสม บรรยากาศเอื้อต่อการเรียน และทีมงานดูแลดี</p>
        </div>
        <div class="grid grid-cols-5 gap-1.5" data-question="q5"></div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm">
        <label for="feedback" class="block text-xs font-semibold text-stone-200 mb-1">
          ข้อเสนอแนะเพิ่มเติม / สิ่งที่ประทับใจ <span class="text-stone-500 font-mono font-normal">(ไม่บังคับ)</span>
        </label>
        <textarea id="feedback" rows="3" placeholder="ระบุความคิดเห็นหรือข้อเสนอแนะเพื่อการพัฒนาหลักสูตร..." class="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"></textarea>
      </div>

      <div id="errorBox" class="hidden bg-stone-900 border border-rose-900/60 text-rose-300 text-xs p-3 rounded-xl font-sans"></div>

      <button type="submit" id="submitBtn" class="w-full py-3.5 rounded-xl font-medium text-sm bg-stone-100 hover:bg-white text-stone-950 shadow-sm active:scale-98 transition transform flex items-center justify-center gap-2">
        <span>ส่งผลการประเมิน</span>
        <svg class="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </form>
  </div>

  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyYOUR_API_KEY_HERE",
      authDomain: "your-project-id.firebaseapp.com",
      databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    const answers = { q1: null, q2: null, q3: null, q4: null, q5: null };
    const ratingLabels = {
      1: { label: 'น้อยที่สุด', symbol: '·' },
      2: { label: 'น้อย', symbol: '▽' },
      3: { label: 'ปานกลาง', symbol: '―' },
      4: { label: 'มาก', symbol: '◇' },
      5: { label: 'มากที่สุด', symbol: '✦' }
    };

    function initRatingButtons() {
      ['q1', 'q2', 'q3', 'q4', 'q5'].forEach(qKey => {
        const container = document.querySelector(\`[data-question="\${qKey}"]\`);
        if (!container) return;
        container.innerHTML = '';
        for (let score = 1; score <= 5; score++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = \`flex flex-col items-center justify-between py-2.5 px-1 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 transition-all rating-btn-\${qKey}-\${score}\`;
          btn.innerHTML = \`
            <span class="text-xs font-mono">\${ratingLabels[score].symbol}</span>
            <span class="text-sm font-mono font-bold mt-0.5 text-stone-300">\${score}</span>
            <span class="text-[10px] text-stone-500 mt-0.5 text-center px-0.5 truncate">\${ratingLabels[score].label}</span>
          \`;
          btn.onclick = () => selectScore(qKey, score);
          container.appendChild(btn);
        }
      });
    }

    function selectScore(qKey, score) {
      answers[qKey] = score;
      for (let s = 1; s <= 5; s++) {
        const btn = document.querySelector(\`.rating-btn-\${qKey}-\${s}\`);
        if (!btn) continue;
        if (s === score) {
          btn.className = \`flex flex-col items-center justify-between py-2.5 px-1 rounded-xl border border-amber-300/80 bg-amber-400/15 text-amber-200 shadow-sm transition-all rating-btn-\${qKey}-\${s}\`;
          btn.querySelector('.text-stone-300')?.classList.replace('text-stone-300', 'text-amber-200');
          btn.querySelector('.text-stone-500')?.classList.replace('text-stone-500', 'text-stone-300');
        } else {
          btn.className = \`flex flex-col items-center justify-between py-2.5 px-1 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 hover:bg-stone-800/50 transition-all opacity-60 rating-btn-\${qKey}-\${s}\`;
        }
      }
      hideError();
    }

    function getDeviceId() {
      let id = localStorage.getItem('survey_device_id');
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('survey_device_id', id);
      }
      return id;
    }

    function checkAlreadySubmitted() {
      const submitted = localStorage.getItem('training_survey_submitted');
      if (submitted) {
        document.getElementById('alreadySubmittedCard').classList.remove('hidden');
        document.getElementById('surveyForm').classList.add('hidden');
        return true;
      }
      return false;
    }

    function resetSubmissionState() {
      localStorage.removeItem('training_survey_submitted');
      document.getElementById('alreadySubmittedCard').classList.add('hidden');
      document.getElementById('surveyForm').classList.remove('hidden');
    }

    function showError(msg) {
      const errBox = document.getElementById('errorBox');
      errBox.textContent = msg;
      errBox.classList.remove('hidden');
      errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
      document.getElementById('errorBox').classList.add('hidden');
    }

    async function handleSubmit(e) {
      e.preventDefault();
      const missing = [];
      if (!answers.q1) missing.push('ข้อ 1');
      if (!answers.q2) missing.push('ข้อ 2');
      if (!answers.q3) missing.push('ข้อ 3');
      if (!answers.q4) missing.push('ข้อ 4');
      if (!answers.q5) missing.push('ข้อ 5');

      if (missing.length > 0) {
        showError('กรุณาให้คะแนนให้ครบทุกข้อ (ยังไม่ได้ตอบ: ' + missing.join(', ') + ')');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>กำลังบันทึกข้อมูล...</span>';

      const feedback = document.getElementById('feedback').value.trim();
      const avg = Number(((answers.q1 + answers.q2 + answers.q3 + answers.q4 + answers.q5) / 5).toFixed(2));
      const deviceId = getDeviceId();

      const payload = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        average: avg,
        feedback: feedback || '',
        deviceId: deviceId
      };

      try {
        await db.ref('responses').push(payload);
        localStorage.setItem('training_survey_submitted', 'true');
        checkAlreadySubmitted();
      } catch (err) {
        console.error('Firebase save error:', err);
        showError('เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || 'โปรดตรวจสอบ Firebase Rules หรืออินเทอร์เน็ต'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ส่งผลการประเมิน</span>';
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      initRatingButtons();
      checkAlreadySubmitted();
    });
  </script>
</body>
</html>`;

export const STANDALONE_DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Dashboard - ผลการประเมินความพึงพอใจการอบรม</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-database-compat.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Prompt', 'sans-serif'],
            serif: ['Cormorant Garamond', 'serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
  </style>
</head>
<body class="bg-stone-950 text-stone-100 min-h-screen selection:bg-amber-300 selection:text-stone-950">
  <nav class="border-b border-stone-800 bg-stone-950/80 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      <h1 class="text-base md:text-lg font-serif font-semibold tracking-wide text-stone-100 flex items-center gap-2">
        <span>Executive Dashboard</span>
        <span class="text-[11px] font-mono text-stone-400 font-normal">· Live Telemetry</span>
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="downloadCSV()" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-white text-stone-950 shadow-sm transition flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <span>ดาวน์โหลด CSV</span>
      </button>

      <button onclick="toggleFullscreen()" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition">
        <span>เต็มจอ</span>
      </button>
    </div>
  </nav>

  <main class="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 shadow-sm">
        <div class="text-[11px] font-mono text-stone-400 uppercase tracking-wider">จำนวนผู้ประเมิน</div>
        <div class="flex items-baseline gap-2 mt-3">
          <span id="statCount" class="text-4xl md:text-5xl font-serif font-bold text-stone-100">0</span>
          <span class="text-stone-400 text-sm">คน</span>
        </div>
        <div class="text-[11px] text-stone-500 mt-2 font-mono">อัปเดตแบบเรียลไทม์</div>
      </div>

      <div class="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-sm md:col-span-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono text-stone-400 uppercase tracking-wider">คะแนนเฉลี่ยรวมทุกด้าน</span>
          <span id="statBadge" class="text-xs font-medium px-2.5 py-0.5 rounded-full border border-stone-700 text-stone-300">รอข้อมูล</span>
        </div>
        <div class="flex items-baseline gap-3 mt-3">
          <span id="statAverage" class="text-5xl md:text-6xl font-serif font-bold text-amber-200 tracking-tight">0.00</span>
          <span class="text-stone-500 text-xl font-serif">/ 5.00</span>
        </div>
        <p id="statDesc" class="text-xs text-stone-400 mt-1 line-clamp-1">กำลังรอข้อมูลการตอบจากผู้เข้าร่วมอบรม...</p>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <canvas id="qrCanvas" class="w-20 h-20 rounded-lg bg-white p-1 border border-stone-300 shrink-0"></canvas>
        <div>
          <div class="text-xs font-medium text-stone-200">สแกนเพื่อร่วมตอบ</div>
          <p class="text-[11px] text-stone-400 mt-0.5 leading-tight">ใช้กล้องโทรศัพท์สแกน QR Code</p>
          <span class="text-[10px] text-stone-400 font-mono mt-1 block truncate" id="qrUrlLabel"></span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-stone-900/50 border border-stone-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-serif font-semibold text-stone-100">คะแนนเฉลี่ยรายหัวข้อ (สเกล 1-5)</h2>
          <span class="text-[11px] font-mono text-stone-400">เกณฑ์ 4.51-5.00 = มากที่สุด</span>
        </div>
        <div class="h-[280px]">
          <canvas id="barChart"></canvas>
        </div>
      </div>

      <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 shadow-sm">
        <h2 class="text-sm font-serif font-semibold text-stone-100 mb-4">สัดส่วนคะแนนดาว</h2>
        <div class="space-y-3" id="starsContainer"></div>
      </div>
    </div>

    <div class="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-serif font-semibold text-stone-100">ข้อเสนอแนะล่าสุด</h2>
          <p class="text-xs text-stone-400">ความคิดเห็นจริงจากห้องอบรม</p>
        </div>
        <span id="feedbackCount" class="text-xs font-mono text-stone-400">0 ข้อความ</span>
      </div>
      <div id="feedbackList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
        <p class="text-xs text-stone-500 col-span-full py-4 text-center">ยังไม่มีข้อเสนอแนะเพิ่มเติม</p>
      </div>
    </div>
  </main>

  <script>
    const firebaseConfig = {
      apiKey: "AIzaSyYOUR_API_KEY_HERE",
      authDomain: "your-project-id.firebaseapp.com",
      databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    let allResponses = [];
    let barChart = null;

    const questionLabels = [
      '1. เนื้อหาหลักสูตร',
      '2. วิทยากร & การสอน',
      '3. การนำไปประยุกต์',
      '4. สื่อ & เอกสาร',
      '5. เวลา สถานที่ บริการ'
    ];

    function initQRCode() {
      const currentUrl = window.location.href.replace(/dashboard\\.html.*/, 'survey.html');
      document.getElementById('qrUrlLabel').textContent = currentUrl;
      QRCode.toCanvas(document.getElementById('qrCanvas'), currentUrl, {
        width: 80,
        margin: 1,
        color: { dark: '#1c1917', light: '#ffffff' }
      }, (err) => {
        if (err) console.error(err);
      });
    }

    function initChart() {
      const ctx = document.getElementById('barChart').getContext('2d');
      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: questionLabels,
          datasets: [{
            label: 'คะแนนเฉลี่ย',
            data: [0, 0, 0, 0, 0],
            backgroundColor: 'rgba(253, 230, 138, 0.85)',
            hoverBackgroundColor: 'rgba(254, 243, 199, 1)',
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 5,
              ticks: { stepSize: 1, color: '#78716c' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
              ticks: { color: '#a8a29e', font: { family: 'Prompt', size: 11 } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => \`คะแนนเฉลี่ย: \${context.raw} / 5.00\`
              }
            }
          }
        }
      });
    }

    function getInterpretation(avg) {
      if (avg >= 4.51) return { text: 'มากที่สุด (ดีเยี่ยม)', color: 'bg-amber-950/40 text-amber-200 border-amber-300/40' };
      if (avg >= 3.51) return { text: 'มาก (ดี)', color: 'bg-stone-900 text-stone-200 border-stone-400/40' };
      if (avg >= 2.51) return { text: 'ปานกลาง', color: 'bg-stone-900 text-stone-300 border-stone-600/40' };
      if (avg >= 1.51) return { text: 'น้อย (ควรปรับปรุง)', color: 'bg-stone-900 text-stone-400 border-stone-700/40' };
      return { text: 'น้อยที่สุด (ต้องเร่งแก้ไข)', color: 'bg-stone-900 text-stone-500 border-stone-800' };
    }

    function updateDashboard(items) {
      allResponses = items;
      const count = items.length;
      document.getElementById('statCount').textContent = count;

      if (count === 0) {
        document.getElementById('statAverage').textContent = '0.00';
        document.getElementById('statBadge').textContent = 'ยังไม่มีข้อมูล';
        if (barChart) {
          barChart.data.datasets[0].data = [0, 0, 0, 0, 0];
          barChart.update();
        }
        return;
      }

      const sumQ = [0, 0, 0, 0, 0];
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRatings = 0;

      items.forEach(r => {
        sumQ[0] += Number(r.q1) || 0;
        sumQ[1] += Number(r.q2) || 0;
        sumQ[2] += Number(r.q3) || 0;
        sumQ[3] += Number(r.q4) || 0;
        sumQ[4] += Number(r.q5) || 0;

        [r.q1, r.q2, r.q3, r.q4, r.q5].forEach(score => {
          if (score >= 1 && score <= 5) {
            starCounts[score]++;
            totalRatings++;
          }
        });
      });

      const avgQ = sumQ.map(s => Number((s / count).toFixed(2)));
      const overall = Number((avgQ.reduce((a, b) => a + b, 0) / 5).toFixed(2));

      document.getElementById('statAverage').textContent = overall.toFixed(2);
      const interp = getInterpretation(overall);
      const badge = document.getElementById('statBadge');
      badge.textContent = interp.text;
      badge.className = \`text-xs font-medium px-2.5 py-0.5 rounded-full border \${interp.color}\`;
      document.getElementById('statDesc').textContent = \`จากการประเมินทั้งหมด \${count} คน\`;

      if (barChart) {
        barChart.data.datasets[0].data = avgQ;
        barChart.update();
      }

      renderStarDistribution(starCounts, totalRatings);
      renderFeedbacks(items);
    }

    function renderStarDistribution(counts, total) {
      const container = document.getElementById('starsContainer');
      container.innerHTML = '';
      for (let star = 5; star >= 1; star--) {
        const c = counts[star] || 0;
        const pct = total > 0 ? Math.round((c / total) * 100) : 0;
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 text-xs';
        row.innerHTML = \`
          <div class="w-10 font-mono text-stone-300 flex items-center justify-end gap-1">
            <span>\${star}</span><span class="text-amber-300">★</span>
          </div>
          <div class="flex-1 bg-stone-950 rounded-full h-2 overflow-hidden">
            <div class="bg-amber-300 h-2 rounded-full transition-all duration-400" style="width: \${pct}%"></div>
          </div>
          <span class="w-10 text-right font-mono text-stone-400">\${pct}%</span>
          <span class="text-[10px] text-stone-500 font-mono w-8">(\${c})</span>
        \`;
        container.appendChild(row);
      }
    }

    function renderFeedbacks(items) {
      const container = document.getElementById('feedbackList');
      const feedbacks = items.filter(r => r.feedback && r.feedback.trim() !== '').reverse();
      document.getElementById('feedbackCount').textContent = \`\${feedbacks.length} ข้อความ\`;

      if (feedbacks.length === 0) {
        container.innerHTML = '<p class="text-xs text-stone-500 col-span-full py-4 text-center">ยังไม่มีข้อเสนอแนะเพิ่มเติม</p>';
        return;
      }

      container.innerHTML = feedbacks.slice(0, 15).map(f => {
        const timeStr = f.timestamp ? new Date(f.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
        return \`
          <div class="bg-stone-950/70 border border-stone-800 rounded-xl p-3 text-xs shadow-sm">
            <div class="flex items-center justify-between text-[11px] text-stone-400 mb-1">
              <span class="text-amber-200 font-serif font-bold">\${f.average} ★</span>
              <span class="font-mono">\${timeStr}</span>
            </div>
            <p class="text-stone-300 leading-relaxed break-words">"\${escapeHtml(f.feedback)}"</p>
          </div>
        \`;
      }).join('');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    }

    function downloadCSV() {
      if (allResponses.length === 0) {
        alert('ยังไม่มีข้อมูลสำหรับส่งออก CSV');
        return;
      }
      let csv = '\\uFEFFลำดับ,วันที่และเวลา,ข้อ 1 เนื้อหา,ข้อ 2 วิทยากร,ข้อ 3 การนำไปใช้,ข้อ 4 สื่อเอกสาร,ข้อ 5 สถานที่เวลา,คะแนนเฉลี่ย,ข้อเสนอแนะ\\n';
      allResponses.forEach((r, idx) => {
        const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleString('th-TH') : '';
        const cleanFeedback = (r.feedback || '').replace(/"/g, '""');
        csv += \`\${idx + 1},"\${dateStr}",\${r.q1},\${r.q2},\${r.q3},\${r.q4},\${r.q5},\${r.average},"\${cleanFeedback}"\\n\`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = \`training_feedback_\${new Date().toISOString().slice(0,10)}.csv\`;
      link.click();
    }

    window.addEventListener('DOMContentLoaded', () => {
      initQRCode();
      initChart();

      db.ref('responses').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.keys(val).map(key => ({
            id: key,
            ...val[key]
          }));
          updateDashboard(list);
        } else {
          updateDashboard([]);
        }
      });
    });
  </script>
</body>
</html>`;

export const FIREBASE_SETUP_GUIDE_MD = `# คู่มือการตั้งค่า Firebase Realtime Database และ Deploy ฟรีทีละสเต็ป

ระบบนี้ออกแบบมาให้ใช้งานบน **Firebase Spark Plan (ฟรี 100%)** โดยไม่ต้องผูกบัตรเครดิต สามารถเก็บข้อมูลได้เรียลไทม์ และรองรับผู้เข้าอบรมพร้อมกันได้สบาย

---

### ขั้นตอนที่ 1: สร้าง Firebase Project (ฟรี)
1. ไปที่เว็บไซต์ [https://console.firebase.google.com](https://console.firebase.google.com) และเข้าสู่ระบบด้วยบัญชี Google
2. คลิกปุ่ม **"Add project"** (เพิ่มโปรเจกต์)
3. ตั้งชื่อโปรเจกต์ เช่น \`training-satisfaction\` แล้วกด **Continue**
4. สำหรับ Google Analytics สามารถเปิดหรือปิดก็ได้ แล้วกด **Create project**
5. รอระบบสร้างโปรเจกต์ประมาณ 15 วินาที แล้วคลิก **Continue**

---

### ขั้นตอนที่ 2: สร้างและตั้งค่า Firebase Realtime Database
1. ในแถบเมนูด้านซ้าย เลือก **Build** -> **Realtime Database**
2. คลิกปุ่ม **"Create Database"**
3. เลือกตำแหน่งเซิร์ฟเวอร์ (แนะนำ **Singapore (asia-southeast1)** หรือ **United States**) แล้วคลิก Next
4. ในขั้นตอน Security Rules ให้เลือก **"Start in test mode"** แล้วกด **Enable**
5. คลิกแท็บ **Rules** ด้านบน แล้วเปลี่ยนเป็นกฎดังนี้ (เพื่อให้ผู้เข้าอบรมส่งคะแนนได้โดยไม่ต้องล็อกอิน):
\`\`\`json
{
  "rules": {
    "responses": {
      ".read": true,
      ".write": true
    }
  }
}
\`\`\`
6. กดปุ่ม **"Publish"** เพื่อบันทึกกฎ

---

### ขั้นตอนที่ 3: รับค่า Firebase Config มาใส่ในโค้ด
1. ในหน้า Firebase Console คลิกรูปฟันเฟืองที่มุมซ้ายบน ⚙️ -> เลือก **Project settings**
2. เลื่อนลงมาที่หัวข้อ **"Your apps"** แล้วคลิกไอคอนเว็บ **</>** (Web)
3. ตั้งชื่อ App เช่น \`survey-web\` แล้วคลิก **Register app**
4. คุณจะเห็นโค้ดส่วน \`firebaseConfig\` หน้าตาแบบนี้:
\`\`\`javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
\`\`\`
*(**ข้อสังเกตสำคัญ**: ต้องมีบรรทัด \`databaseURL\` หากไม่มี ให้ก๊อปปี้ URL จากหน้า Realtime Database มาใส่)*
5. นำชุด \`firebaseConfig\` นี้ ไปวางแทนที่ \`const firebaseConfig = { ... }\` ในไฟล์ทั้งสอง:
   - ไฟล์ \`survey.html\` (หน้าตอบ)
   - ไฟล์ \`dashboard.html\` (หน้า Dashboard)

---

### ขั้นตอนที่ 4: วิธีทดสอบในเครื่องทันที
- คุณสามารถดับเบิลคลิกไฟล์ \`survey.html\` และ \`dashboard.html\` เพื่อเปิดในเบราว์เซอร์ได้ทันที!
- ลองส่งแบบประเมินในหน้า \`survey.html\` จะเห็นผลคะแนนและกราฟในหน้า \`dashboard.html\` ขยับอัปเดตแบบ Realtime ทันที

---

### ขั้นตอนที่ 5: วิธี Deploy ออนไลน์ฟรี (เลือก 1 ช่องทาง)

#### วิธีที่ 1: Deploy ผ่าน Netlify Drop (ง่ายที่สุดใน 10 วินาที)
1. เข้าเว็บ [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. ลากโฟลเดอร์ที่มีไฟล์ \`survey.html\` และ \`dashboard.html\` ไปวาง
3. คุณจะได้ URL สาธารณะฟรีพร้อมให้ผู้เข้าร่วมอบรมสแกนตอบได้ทันที

#### วิธีที่ 2: Deploy ผ่าน Firebase Hosting (แนะนำสำหรับการใช้งานระยะยาว)
1. ติดตั้ง Firebase CLI: \`npm install -g firebase-tools\`
2. ล็อกอิน: \`firebase login\`
3. รัน \`firebase init hosting\` (เลือก Use existing project, กำหนด public directory เป็น .)
4. อัปโหลด: \`firebase deploy --only hosting\`

#### วิธีที่ 3: Deploy ผ่าน GitHub Pages (ฟรี)
1. นำไฟล์ขึ้น GitHub Repository
2. ไปที่ **Settings** -> **Pages** -> เลือก Branch \`main\`
`;
