import { completeDevice } from '../game.js';

// Dữ liệu các trang sách
const bookPages = [
  // Trang 1
  [
    { text: "Digital", wordId: 0 },
    { text: "citizenship", wordId: 1 },
    { text: "helps", wordId: 2 },
    { text: "us", wordId: 3 },
    { text: "stay", wordId: 4 },
    { text: "safe", wordId: 5 },
    { text: "online.", wordId: 6 },
    { text: "We", wordId: 7, breakBefore: true },
    { text: "should", wordId: 8 },
    { text: "respect", wordId: 9 },
    { text: "others", wordId: 10 },
    { text: "on", wordId: 11 },
    { text: "social", wordId: 12 },
    { text: "networks.", wordId: 13 },
    { text: "Do", wordId: 14, breakBefore: true },
    { text: "not", wordId: 15 },
    { text: "share", wordId: 16 },
    { text: "personal", wordId: 17 },
    { text: "information", wordId: 18 },
    { text: "with", wordId: 19 },
    { text: "strangers.", wordId: 20 }
  ],
  // Trang 2
  [
    { text: "Think", wordId: 21 },
    { text: "carefully", wordId: 22 },
    { text: "before", wordId: 23 },
    { text: "posting", wordId: 24 },
    { text: "online", wordId: 25 },
    { text: "comments.", wordId: 26 },
    { text: "Be", wordId: 27, breakBefore: true },
    { text: "kind", wordId: 28 },
    { text: "and", wordId: 29 },
    { text: "support", wordId: 30 },
    { text: "your", wordId: 31 },
    { text: "friends.", wordId: 32 },
    { text: "Do", wordId: 33, breakBefore: true },
    { text: "not", wordId: 34 },
    { text: "use", wordId: 35 },
    { text: "bad", wordId: 36 },
    { text: "language", wordId: 37 },
    { text: "online.", wordId: 38 },
    { text: "Report", wordId: 39, breakBefore: true },
    { text: "cyberbullying", wordId: 40 },
    { text: "to", wordId: 41 },
    { text: "teachers", wordId: 42 },
    { text: "or", wordId: 43 },
    { text: "parents.", wordId: 44 }
  ],
  // Trang 3
  [
    { text: "Create", wordId: 45 },
    { text: "strong", wordId: 46 },
    { text: "passwords", wordId: 47 },
    { text: "for", wordId: 48 },
    { text: "your", wordId: 49 },
    { text: "accounts.", wordId: 50 },
    { text: "Do", wordId: 51, breakBefore: true },
    { text: "not", wordId: 52 },
    { text: "click", wordId: 53 },
    { text: "on", wordId: 54 },
    { text: "suspicious", wordId: 55 },
    { text: "links.", wordId: 56 },
    { text: "Keep", wordId: 57, breakBefore: true },
    { text: "your", wordId: 58 },
    { text: "devices", wordId: 59 },
    { text: "updated", wordId: 60 },
    { text: "regularly.", wordId: 61 },
    { text: "Using", wordId: 62, breakBefore: true },
    { text: "technology", wordId: 63 },
    { text: "responsibly", wordId: 64 },
    { text: "is", wordId: 65 },
    { text: "very", wordId: 66 },
    { text: "important.", wordId: 67 }
  ]
];

// Từ điển thông minh cho cả 3 trang
const dictionary = {
  // Từ đơn
  "digital": "kỹ thuật số",
  "citizenship": "quyền công dân",
  "helps": "giúp",
  "us": "chúng ta",
  "stay": "luôn",
  "safe": "an toàn",
  "online": "trực tuyến",
  "we": "chúng ta",
  "should": "nên",
  "respect": "tôn trọng",
  "others": "người khác",
  "on": "trên",
  "social": "xã hội",
  "networks": "mạng lưới",
  "do": "làm",
  "not": "không",
  "share": "chia sẻ",
  "personal": "cá nhân",
  "information": "thông tin",
  "with": "với",
  "strangers": "người lạ",
  "think": "suy nghĩ",
  "carefully": "cẩn thận",
  "before": "trước khi",
  "posting": "đăng",
  "comments": "bình luận",
  "be": "hãy",
  "kind": "tử tế",
  "and": "và",
  "support": "hỗ trợ",
  "your": "của bạn",
  "friends": "bạn bè",
  "use": "sử dụng",
  "bad": "xấu / tồi tệ",
  "language": "ngôn ngữ",
  "report": "báo cáo",
  "cyberbullying": "bắt nạt qua mạng",
  "to": "cho / tới",
  "teachers": "giáo viên",
  "or": "hoặc",
  "parents": "cha mẹ",
  "create": "tạo",
  "strong": "mạnh",
  "passwords": "mật khẩu",
  "for": "cho",
  "accounts": "tài khoản",
  "click": "nhấp chuột",
  "suspicious": "đáng ngờ",
  "links": "liên kết",
  "keep": "giữ",
  "devices": "thiết bị",
  "updated": "cập nhật",
  "regularly": "thường xuyên",
  "using": "sử dụng",
  "technology": "công nghệ",
  "responsibly": "có trách nhiệm",
  "is": "là",
  "very": "rất",
  "important": "quan trọng",

  // Cụm từ 2 từ
  "digital citizenship": "công dân số",
  "helps us": "giúp chúng ta",
  "stay safe": "luôn an toàn",
  "safe online": "an toàn trực tuyến",
  "should respect": "nên tôn trọng",
  "respect others": "tôn trọng người khác",
  "social networks": "mạng xã hội",
  "do not": "không được",
  "not share": "không chia sẻ",
  "personal information": "thông tin cá nhân",
  "with strangers": "với người lạ",
  "think carefully": "suy nghĩ cẩn thận",
  "before posting": "trước khi đăng",
  "online comments": "bình luận trực tuyến",
  "be kind": "hãy tử tế",
  "support your": "hỗ trợ của bạn",
  "your friends": "bạn bè của bạn",
  "bad language": "ngôn từ xấu",
  "report cyberbullying": "báo cáo hành vi bắt nạt qua mạng",
  "cyberbullying to": "bắt nạt mạng cho",
  "to teachers": "cho giáo viên",
  "teachers or": "giáo viên hoặc",
  "or parents": "hoặc cha mẹ",
  "create strong": "tạo mật khẩu mạnh",
  "strong passwords": "mật khẩu mạnh",
  "your accounts": "tài khoản của bạn",
  "do not click": "không nhấp vào",
  "click on": "nhấp vào",
  "suspicious links": "liên kết đáng ngờ",
  "keep your": "giữ của bạn",
  "your devices": "thiết bị của bạn",
  "updated regularly": "cập nhật thường xuyên",
  "using technology": "sử dụng công nghệ",
  "responsibly is": "một cách có trách nhiệm là",
  "very important": "rất quan trọng",

  // Cụm từ 3 từ trở lên
  "stay safe online": "luôn an toàn trực tuyến",
  "helps us stay safe": "giúp chúng ta luôn an toàn",
  "helps us stay safe online": "giúp chúng ta giữ an toàn trực tuyến",
  "digital citizenship helps us": "quyền công dân số giúp chúng ta",
  "we should respect": "chúng ta nên tôn trọng",
  "should respect others": "nên tôn trọng người khác",
  "on social networks": "trên mạng xã hội",
  "respect others on social networks": "tôn trọng người khác trên mạng xã hội",
  "we should respect others on social networks": "chúng ta nên tôn trọng người khác trên mạng xã hội",
  "do not share": "không được chia sẻ",
  "do not share personal": "không được chia sẻ cá nhân",
  "do not share personal information": "không chia sẻ thông tin cá nhân",
  "share personal information": "chia sẻ thông tin cá nhân",
  "share personal information with strangers": "chia sẻ thông tin cá nhân với người lạ",
  "do not share personal information with strangers": "không được chia sẻ thông tin cá nhân với người lạ",
  
  "think carefully before": "suy nghĩ cẩn thận trước khi",
  "carefully before posting": "cẩn thận trước khi đăng",
  "before posting online": "trước khi đăng trực tuyến",
  "posting online comments": "đăng bình luận trực tuyến",
  "think carefully before posting online comments": "Hãy suy nghĩ cẩn thận trước khi đăng bình luận trực tuyến.",
  "be kind and": "hãy tử tế và",
  "kind and support": "tử tế và hỗ trợ",
  "and support your": "và hỗ trợ của bạn",
  "support your friends": "hỗ trợ bạn bè của bạn",
  "be kind and support your friends": "Hãy tử tế và hỗ trợ bạn bè của bạn.",
  "do not use": "không được sử dụng",
  "not use bad": "không sử dụng tồi tệ",
  "use bad language": "sử dụng ngôn từ xấu",
  "bad language online": "ngôn từ xấu trực tuyến",
  "do not use bad language": "không được sử dụng ngôn từ xấu",
  "do not use bad language online": "Đừng sử dụng ngôn từ tồi tệ khi trực tuyến.",
  "report cyberbullying to": "báo cáo hành vi bắt nạt qua mạng cho",
  "cyberbullying to teachers": "bắt nạt mạng cho giáo viên",
  "to teachers or": "cho giáo viên hoặc",
  "teachers or parents": "giáo viên hoặc cha mẹ",
  "report cyberbullying to teachers or parents": "Báo cáo hành vi bắt nạt qua mạng cho giáo viên hoặc cha mẹ.",
  
  "create strong passwords": "tạo các mật khẩu mạnh",
  "strong passwords for": "mật khẩu mạnh cho",
  "passwords for your": "mật khẩu cho của bạn",
  "for your accounts": "cho các tài khoản của bạn",
  "create strong passwords for your accounts": "Hãy tạo các mật khẩu mạnh cho tài khoản của bạn.",
  "do not click on": "đừng nhấp chuột vào",
  "not click on suspicious": "đừng nhấp vào đáng ngờ",
  "click on suspicious": "nhấp chuột vào đáng ngờ",
  "click on suspicious links": "nhấp chuột vào các liên kết đáng ngờ",
  "do not click on suspicious links": "Đừng bao giờ nhấp vào các liên kết đáng ngờ.",
  "keep your devices": "giữ các thiết bị của bạn",
  "your devices updated": "thiết bị của bạn được cập nhật",
  "devices updated regularly": "các thiết bị được cập nhật thường xuyên",
  "keep your devices updated regularly": "Hãy giữ cho các thiết bị của bạn được cập nhật thường xuyên.",
  "using technology responsibly": "sử dụng công nghệ có trách nhiệm",
  "technology responsibly is": "công nghệ một cách có trách nhiệm là",
  "responsibly is very": "có trách nhiệm là rất",
  "is very important": "là vô cùng quan trọng",
  "using technology responsibly is very important": "Sử dụng công nghệ một cách có trách nhiệm là vô cùng quan trọng."
};

export const TranslatePenHandler = {
  container: null,
  textLine: null,
  penCursor: null,
  pronounceBtn: null,
  currentUtterance: null,
  
  currentPage: 0,
  isDragging: false,
  startWordIndex: -1,
  currentWordIndex: -1,
  scannedText: "",

  // Hệ thống hạt bụi laser
  particleCanvas: null,
  particleCtx: null,
  particles: [],
  particleAnimId: null,
  mouseX: 0,
  mouseY: 0,

  init() {
    this.container = document.querySelector('.scannable-line-container');
    this.textLine = document.getElementById('scannable-line');
    this.penCursor = document.getElementById('drag-pen-cursor');
    this.pronounceBtn = document.getElementById('btn-pen-pronounce');

    // Click kéo quét chữ
    this.container.addEventListener('mousedown', (e) => this.onDragStart(e));
    window.addEventListener('mousemove', (e) => this.onDragMove(e));
    window.addEventListener('mouseup', () => this.onDragEnd());

    // Cảm ứng điện thoại
    this.container.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0]));
    window.addEventListener('touchmove', (e) => this.onDragMove(e.touches[0]));
    window.addEventListener('touchend', () => this.onDragEnd());

    // Rê chuột bám bút tự do
    this.container.addEventListener('mousemove', (e) => this.updatePenOnly(e));
    this.container.addEventListener('mouseenter', () => this.penCursor.classList.remove('hidden'));
    this.container.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.penCursor.classList.add('hidden');
      }
    });

    // Sự kiện chuyển trang
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.flipPage(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.flipPage(1));
    }

    this.pronounceBtn.addEventListener('click', () => {
      this.playPronunciation();
    });
  },

  onOpen() {
    this.currentPage = 0;
    this.renderPage();
    this.updateNavigationUI();
    this.setupParticleCanvas();
    this.reset();
    this.startParticleLoop();
  },

  onClose() {
    this.stopParticleLoop();
  },

  setupParticleCanvas() {
    if (!this.particleCanvas) {
      this.particleCanvas = document.createElement('canvas');
      this.particleCanvas.id = 'pen-particle-canvas';
      this.particleCanvas.style.position = 'absolute';
      this.particleCanvas.style.top = '0';
      this.particleCanvas.style.left = '0';
      this.particleCanvas.style.width = '100%';
      this.particleCanvas.style.height = '100%';
      this.particleCanvas.style.pointerEvents = 'none';
      this.particleCanvas.style.zIndex = '5';
      this.container.appendChild(this.particleCanvas);
    }
    
    const rect = this.container.getBoundingClientRect();
    this.particleCanvas.width = rect.width;
    this.particleCanvas.height = rect.height;
    this.particleCtx = this.particleCanvas.getContext('2d');
  },

  reset() {
    this.isDragging = false;
    this.startWordIndex = -1;
    this.currentWordIndex = -1;
    this.scannedText = "";
    this.particles = [];
    this.pronounceBtn.disabled = true;

    this.textLine.querySelectorAll('span').forEach(span => {
      span.classList.remove('scanned');
    });

    this.penCursor.classList.add('hidden');

    const oledScreen = document.getElementById('pen-screen-result');
    oledScreen.innerHTML = `
      <span class="pen-title">OLED MONITOR V2.0</span>
      <p class="translation-placeholder">Bút quang học sẵn sàng. Hãy nhấp giữ và trượt đầu bút qua chữ...</p>
    `;
    document.getElementById('pen-screen-loading').classList.add('hidden');
  },

  renderPage() {
    this.textLine.innerHTML = "";
    const words = bookPages[this.currentPage];
    
    let currentRowEl = null;
    words.forEach(w => {
      if (w.breakBefore || !currentRowEl) {
        currentRowEl = document.createElement("div");
        currentRowEl.className = "scannable-row";
        if (w.breakBefore) {
          currentRowEl.style.marginTop = "10px";
        }
        this.textLine.appendChild(currentRowEl);
      }
      
      const span = document.createElement("span");
      span.setAttribute("data-word", w.wordId);
      span.textContent = w.text;
      
      currentRowEl.appendChild(span);
      currentRowEl.appendChild(document.createTextNode(" "));
    });
  },

  flipPage(direction) {
    if (this.isDragging) return;
    if (this.container.classList.contains("page-flipping")) return;
    
    const targetPage = this.currentPage + direction;
    if (targetPage < 0 || targetPage >= bookPages.length) return;
    
    // Bắt đầu hiệu ứng lật trang 3D
    this.container.classList.add("page-flipping");
    
    setTimeout(() => {
      this.currentPage = targetPage;
      this.renderPage();
      this.updateNavigationUI();
      this.resetPageState();
      
      const rect = this.container.getBoundingClientRect();
      if (this.particleCanvas) {
        this.particleCanvas.width = rect.width;
        this.particleCanvas.height = rect.height;
      }
      
      this.container.classList.remove("page-flipping");
    }, 500); // Tăng thời gian chờ lên 500ms để khớp với hiệu ứng 3D lật trang 1.0s chậm hơn
  },

  updateNavigationUI() {
    const prevBtn = document.getElementById("btn-prev-page");
    const nextBtn = document.getElementById("btn-next-page");
    const indicator = document.getElementById("page-indicator");
    
    if (prevBtn) prevBtn.disabled = (this.currentPage === 0);
    if (nextBtn) nextBtn.disabled = (this.currentPage === bookPages.length - 1);
    if (indicator) indicator.textContent = `Trang ${this.currentPage + 1} / ${bookPages.length}`;
  },

  resetPageState() {
    this.startWordIndex = -1;
    this.currentWordIndex = -1;
    this.scannedText = "";
    this.particles = [];
    this.pronounceBtn.disabled = true;
    
    const oledScreen = document.getElementById('pen-screen-result');
    oledScreen.innerHTML = `
      <span class="pen-title">OLED MONITOR V2.0</span>
      <p class="translation-placeholder">Bút đã sẵn sàng quét...</p>
    `;
    document.getElementById('pen-screen-loading').classList.add('hidden');
  },

  onDragStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.penCursor.classList.remove('hidden');
    this.updatePenCoords(e);
    
    const span = this.getWordSpanUnderCoords(e.clientX, e.clientY);
    if (span) {
      this.startWordIndex = parseInt(span.getAttribute('data-word'));
      this.currentWordIndex = this.startWordIndex;
      this.updateHighlighting();
      this.performLiveTranslation();
    } else {
      this.startWordIndex = -1;
      this.currentWordIndex = -1;
      this.textLine.querySelectorAll('span').forEach(s => s.classList.remove('scanned'));
    }
  },

  onDragMove(e) {
    if (!this.isDragging) return;
    this.updatePenCoords(e);
    this.emitParticles();
    
    const span = this.getWordSpanUnderCoords(e.clientX, e.clientY);
    if (span && this.startWordIndex !== -1) {
      this.currentWordIndex = parseInt(span.getAttribute('data-word'));
      this.updateHighlighting();
      this.performLiveTranslation();
    }
  },

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const minIdx = Math.min(this.startWordIndex, this.currentWordIndex);
    const maxIdx = Math.max(this.startWordIndex, this.currentWordIndex);
    const wordsScannedCount = (minIdx !== -1 && maxIdx !== -1) ? (maxIdx - minIdx + 1) : 0;

    if (wordsScannedCount > 0) {
      // Kích hoạt chạy chữ LED sau khi thả chuột
      this.activateMarquee();
      completeDevice('translation_pen', 10);
    } else {
      this.reset();
    }
  },

  // Kích hoạt hiệu ứng chạy chữ LED cho text tràn trên OLED screen
  activateMarquee() {
    const oledScreen = document.getElementById('pen-screen-result');
    requestAnimationFrame(() => {
      const els = oledScreen.querySelectorAll('.original, .translated');
      els.forEach(el => {
        if (el.scrollWidth > el.clientWidth) {
          const distance = el.clientWidth - el.scrollWidth;
          el.style.setProperty('--marquee-distance', `${distance}px`);
          el.classList.add('marquee');
        }
      });
    });
  },

  updatePenOnly(e) {
    if (this.isDragging) return;
    this.updatePenCoords(e);
  },

  updatePenCoords(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    if (this.mouseX >= 0 && this.mouseX <= rect.width && this.mouseY >= 0 && this.mouseY <= rect.height) {
      this.penCursor.style.left = `${this.mouseX}px`;
      this.penCursor.style.top = `${this.mouseY}px`;
    }
  },

  getWordSpanUnderCoords(x, y) {
    const el = document.elementFromPoint(x, y);
    if (el && el.tagName === 'SPAN' && el.hasAttribute('data-word')) {
      return el;
    }
    
    let closestSpan = null;
    let minDist = Infinity;
    this.textLine.querySelectorAll('span').forEach(span => {
      const rect = span.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(x - centerX, y - centerY);
      if (dist < 40) {
        if (dist < minDist) {
          minDist = dist;
          closestSpan = span;
        }
      }
    });
    return closestSpan;
  },

  updateHighlighting() {
    if (this.startWordIndex === -1 || this.currentWordIndex === -1) return;
    
    const minIdx = Math.min(this.startWordIndex, this.currentWordIndex);
    const maxIdx = Math.max(this.startWordIndex, this.currentWordIndex);
    
    this.textLine.querySelectorAll('span').forEach(span => {
      const idx = parseInt(span.getAttribute('data-word'));
      if (idx >= minIdx && idx <= maxIdx) {
        span.classList.add('scanned');
      } else {
        span.classList.remove('scanned');
      }
    });
  },

  getTranslation(phrase) {
    const cleanPhrase = phrase.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    if (dictionary[cleanPhrase]) {
      return dictionary[cleanPhrase];
    }
    
    const words = cleanPhrase.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    const translated = words.map(w => dictionary[w] || w);
    return translated.join(" ");
  },

  performLiveTranslation() {
    const minIdx = Math.min(this.startWordIndex, this.currentWordIndex);
    const maxIdx = Math.max(this.startWordIndex, this.currentWordIndex);
    
    let wordsArr = [];
    for (let i = minIdx; i <= maxIdx; i++) {
      const span = this.textLine.querySelector(`span[data-word="${i}"]`);
      if (span) {
        wordsArr.push(span.textContent);
      }
    }
    
    const phrase = wordsArr.join(" ");
    this.scannedText = phrase;
    
    const translation = this.getTranslation(phrase);
    const oledScreen = document.getElementById('pen-screen-result');
    
    if (phrase.trim()) {
      oledScreen.innerHTML = `
        <span class="pen-title">OLED MONITOR V2.0</span>
        <div class="original" style="font-family: Georgia, serif; font-style: italic;">"${phrase}"</div>
        <div class="translated">⚙️ DỊCH: "${translation}"</div>
      `;
      this.pronounceBtn.disabled = false;
    } else {
      oledScreen.innerHTML = `
        <span class="pen-title">OLED MONITOR V2.0</span>
        <p class="translation-placeholder">Bút đã sẵn sàng quét...</p>
      `;
      this.pronounceBtn.disabled = true;
    }
  },

  emitParticles() {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.mouseX,
        y: this.mouseY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2 - 0.5,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.3 ? '#00f0ff' : '#8b5cf6',
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  },

  startParticleLoop() {
    const loop = () => {
      this.drawParticles();
      this.particleAnimId = requestAnimationFrame(loop);
    };
    this.particleAnimId = requestAnimationFrame(loop);
  },

  stopParticleLoop() {
    if (this.particleAnimId) {
      cancelAnimationFrame(this.particleAnimId);
      this.particleAnimId = null;
    }
  },

  drawParticles() {
    if (!this.particleCtx) return;
    const ctx = this.particleCtx;
    const w = this.particleCanvas.width;
    const h = this.particleCanvas.height;

    ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.isDragging) {
      ctx.save();
      let laserGrad = ctx.createLinearGradient(this.mouseX, 0, this.mouseX, h);
      laserGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      laserGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.6)');
      laserGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.mouseX, 0);
      ctx.lineTo(this.mouseX, h);
      ctx.stroke();
      ctx.restore();
    }
  },

  playPronunciation() {
    if (!this.scannedText) return;
    const textToSpeak = this.scannedText.trim();
    if (!textToSpeak) return;

    this.pronounceBtn.textContent = '🔊 SPEAKING...';
    this.pronounceBtn.disabled = true;

    const resetBtn = () => {
      this.pronounceBtn.textContent = '🔊 Nghe phát âm';
      this.pronounceBtn.disabled = false;
    };

    // Gọi server TTS (macOS 'say' command, giọng Samantha) → trả về file WAV
    const url = `/tts?text=${encodeURIComponent(textToSpeak)}&voice=Samantha&rate=160`;

    const audio = new Audio(url);
    audio.volume = 1.0;

    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(err => {
        console.error('[TTS] Play error:', err);
        resetBtn();
      });
    }, { once: true });

    audio.addEventListener('ended', () => {
      console.log('[TTS] ✓ Xong');
      resetBtn();
    }, { once: true });

    audio.addEventListener('error', (e) => {
      console.error('[TTS] ✗ Audio error:', e);
      resetBtn();
    }, { once: true });

    // Fallback reset sau 15s
    setTimeout(() => {
      if (this.pronounceBtn.disabled) resetBtn();
    }, 15000);
  }
};
