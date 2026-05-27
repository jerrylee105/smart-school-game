import { completeDevice } from '../game.js';

export const DigiScreenHandler = {
  avatarCanvas: null,
  avatarCtx: null,
  boardCanvas: null,
  boardCtx: null,
  
  isSpeaking: false,
  speechTimer: 0,
  hologramPhase: 0,
  planetAngle: 0,
  boardAnimId: null,
  avatarAnimId: null,
  currentVisualType: 'default', // 'default' | 'mars' | 'neural' | 'lock' | 'globe'
  currentAudio: null, // Đối tượng phát âm thanh offline
  
  // Danh sách các sao trong không gian vẽ sao hỏa cố định để không bị giật
  starPositions: [
    { x: 40, y: 30 }, { x: 90, y: 140 }, { x: 130, y: 60 }, 
    { x: 380, y: 40 }, { x: 420, y: 150 }, { x: 320, y: 220 }, 
    { x: 60, y: 190 }, { x: 300, y: 90 }, { x: 200, y: 230 },
    { x: 110, y: 20 }, { x: 260, y: 15 }, { x: 450, y: 80 }
  ],
  
  init() {
    this.avatarCanvas = document.getElementById('digi-avatar-canvas');
    this.avatarCtx = this.avatarCanvas.getContext('2d');
    
    this.boardCanvas = document.getElementById('whiteboard-canvas');
    this.boardCtx = this.boardCanvas.getContext('2d');

    // Lắng nghe sự kiện click trực tiếp lên các nút câu hỏi lựa chọn nhanh
    document.querySelectorAll('.btn-quick-q').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const question = e.currentTarget.getAttribute('data-q');
        this.askQuestion(question);
      });
    });
  },

  typewriterTimeout: null,

  onOpen() {
    this.reset();
    this.startAvatarLoop();
    this.startBoardLoop();
  },

  onClose() {
    this.stopLoops();
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Tắt tiếng khi thoát
    }
  },

  reset() {
    this.stopLoops();
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isSpeaking = false;
    this.hologramPhase = 0;
    this.planetAngle = 0;
    this.currentVisualType = 'default';

    document.getElementById('digi-speech-bubble').textContent = 'KẾT NỐI TRỢ LÝ ẢO HỌC TẬP DIGI: Đang chờ lệnh...';
    this.boardCanvas.classList.remove('hidden');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  stopLoops() {
    if (this.avatarAnimId) cancelAnimationFrame(this.avatarAnimId);
    if (this.boardAnimId) cancelAnimationFrame(this.boardAnimId);
    this.avatarAnimId = null;
    this.boardAnimId = null;
  },

  askQuestion(query) {
    if (!query.trim()) return;

    const lowerQ = query.toLowerCase();
    let responseText = "";
    
    if (lowerQ.includes('mars') || lowerQ.includes('sao hỏa')) {
      responseText = "Sao Hỏa có màu đỏ cam đặc trưng do bề mặt được bao phủ bởi lớp bụi Oxit Sắt Fe2O3 dồi dào, tương tự như rỉ sét. Lớp bụi siêu mịn này liên tục bị gió cuốn vào bầu khí quyển mỏng của hành tinh, phản xạ ánh sáng tạo ra màu đỏ rực rỡ khi nhìn từ Trái Đất.";
      this.currentVisualType = 'mars';
    } else if (lowerQ.includes('ai') || lowerQ.includes('trí tuệ')) {
      responseText = "Hệ thống AI tự động học hỏi bằng cách nạp dữ liệu số hóa, đưa qua các lớp mạng thần kinh liên kết để nhân các trọng số và tối ưu giải thuật lan truyền ngược nhằm phát hiện các mẫu hình phức tạp, giúp tạo ra các dự đoán thông minh.";
      this.currentVisualType = 'neural';
    } else if (lowerQ.includes('bảo mật')) {
      responseText = "Bảo mật số an toàn dựa trên cơ chế mã hóa đối xứng AES để bảo vệ luồng dữ liệu, giao thức xác thực hai lớp (2FA) chống đánh cắp danh tính, và tường lửa lọc luồng truy cập bất thường để ngăn chặn hacker.";
      this.currentVisualType = 'lock';
    } else if (lowerQ.includes('công dân số')) {
      responseText = "Là một công dân số văn minh, bạn cần tôn trọng bản quyền sở hữu trí tuệ, bảo vệ dữ liệu cá nhân của mình, và tuyệt đối không phát ngôn xúc phạm, kích động bạo lực hay lan truyền tin giả trên mạng xã hội.";
      this.currentVisualType = 'globe';
    } else {
      responseText = `Yêu cầu đã được tiếp nhận. Đang xử lý phân tích ngữ nghĩa qua khối xử lý ngôn ngữ tự nhiên NLP.`;
      this.currentVisualType = 'default';
    }

    document.getElementById('digi-speech-bubble').textContent = "DIGI YÊU CẦU PHÁT NGÔN: Đang trả lời...";
    
    // Kích hoạt giọng nói AI phát âm bằng file âm thanh chất lượng cao
    this.speakTTS(responseText, this.currentVisualType);
    completeDevice('interactive_screen', 10);
  },

  speakTTS(text, visualType) {
    // 1. Dừng audio cũ nếu đang phát
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    // 2. Chạy hiệu ứng gõ chữ typewriter ngay lập tức
    this.isSpeaking = true;
    this.playTypewriter(text);

    // 3. Phát file audio MP3 offline chuyên nghiệp
    const audioFiles = {
      'mars': 'assets/audio_mars.mp3',
      'neural': 'assets/audio_neural.mp3',
      'lock': 'assets/audio_lock.mp3',
      'globe': 'assets/audio_globe.mp3'
    };

    const audioSrc = audioFiles[visualType];
    if (audioSrc) {
      this.currentAudio = new Audio(audioSrc);
      
      this.currentAudio.addEventListener('ended', () => {
        this.isSpeaking = false;
        this.currentAudio = null;
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.warn("Không tìm thấy file audio offline, chuyển sang TTS mặc định của trình duyệt:", e);
        this.currentAudio = null;
        this.speakBrowserTTS(text);
      });

      this.currentAudio.play().catch(err => {
        console.warn("Không thể tự động phát audio do chính sách bảo mật, chuyển sang TTS mặc định:", err);
        this.speakBrowserTTS(text);
      });
    } else {
      this.speakBrowserTTS(text);
    }
  },

  // Hàm phát âm thanh mặc định bằng trình duyệt để dự phòng
  speakBrowserTTS(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        if (!this.currentAudio) this.isSpeaking = false;
      };
      utterance.onerror = () => {
        if (!this.currentAudio) this.isSpeaking = false;
      };
      window.speechSynthesis.speak(utterance);
    } else {
      this.isSpeaking = false;
    }
  },

  playTypewriter(text) {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }

    const rawPhrases = this.splitTextIntoPhrases(text, 75);
    const phrases = rawPhrases.map((p, i) => (i === 0 ? "DIGI: " + p : p));

    let phraseIdx = 0;
    let charIdx = 0;
    let currentText = "";
    const bubble = document.getElementById('digi-speech-bubble');

    const typeChar = () => {
      if (phraseIdx >= phrases.length) {
        // Kết thúc toàn bộ gõ chữ, chỉ khôi phục text thông báo sau 3 giây
        this.typewriterTimeout = setTimeout(() => {
          bubble.textContent = 'KẾT NỐI TRỢ LÝ ẢO HỌC TẬP DIGI: Đang chờ lệnh...';
          // Chỉ tắt trạng thái sóng âm nếu không còn phát âm thanh
          if (!this.currentAudio) {
            this.isSpeaking = false;
          }
        }, 3000);
        return;
      }

      const targetPhrase = phrases[phraseIdx];
      if (charIdx < targetPhrase.length) {
        currentText += targetPhrase[charIdx];
        bubble.textContent = currentText;
        charIdx++;
        this.typewriterTimeout = setTimeout(typeChar, 35); // Tốc độ gõ 35ms
      } else {
        // Dừng lại khoảng 2-2.5 giây cho người chơi đọc trước khi gõ tiếp phân đoạn mới
        const delay = Math.max(2200, targetPhrase.length * 30);
        this.typewriterTimeout = setTimeout(() => {
          currentText = "";
          bubble.textContent = "";
          charIdx = 0;
          phraseIdx++;
          typeChar();
        }, delay);
      }
    };

    typeChar();
  },

  splitTextIntoPhrases(text, maxLen = 75) {
    const words = text.split(' ');
    const phrases = [];
    let currentPhrase = "";

    for (let word of words) {
      if ((currentPhrase + " " + word).trim().length > maxLen) {
        phrases.push(currentPhrase.trim());
        currentPhrase = word;
      } else {
        currentPhrase = (currentPhrase + " " + word).trim();
      }
    }
    if (currentPhrase) {
      phrases.push(currentPhrase.trim());
    }
    return phrases;
  },

  startAvatarLoop() {
    const loop = () => {
      this.drawAvatar();
      this.avatarAnimId = requestAnimationFrame(loop);
    };
    this.avatarAnimId = requestAnimationFrame(loop);
  },

  // Vẽ Trợ lý ảo dạng Hologram Sóng Âm Tròn Công Nghệ Cao (Futuristic Wave Audio Visualizer)
  drawAvatar() {
    const ctx = this.avatarCtx;
    const w = this.avatarCanvas.width;
    const h = this.avatarCanvas.height;
    
    ctx.clearRect(0, 0, w, h);
    const centerX = w / 2;
    const centerY = h / 2;

    this.hologramPhase += 0.05;

    let baseAmplitude = this.isSpeaking ? 15 : 4;
    let waveScale = this.isSpeaking ? (1 + Math.sin(Date.now() / 70) * 0.4) : 0.8;

    ctx.save();

    let glow = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 80);
    glow.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 12]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 75, this.hologramPhase * 0.15, this.hologramPhase * 0.15 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let l = 0; l < 3; l++) {
      ctx.strokeStyle = l === 0 ? 'rgba(0, 240, 255, 0.75)' : (l === 1 ? 'rgba(139, 92, 246, 0.55)' : 'rgba(16, 185, 129, 0.45)');
      ctx.lineWidth = l === 0 ? 2 : 1.2;
      ctx.beginPath();

      const numPoints = 80;
      const baseRadius = 45 - l * 5;
      
      for (let i = 0; i <= numPoints; i++) {
        let angle = (i / numPoints) * Math.PI * 2;
        let offset = Math.sin(angle * (6 + l) + this.hologramPhase * (2.2 + l)) * baseAmplitude * waveScale;
        let r = baseRadius + offset;
        
        let x = centerX + Math.cos(angle) * r;
        let y = centerY + Math.sin(angle) * r;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = this.isSpeaking ? 16 : 5;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("DIGI SYSTEM TRANSCIEVER", centerX, centerY + 65);
    ctx.fillText(this.isSpeaking ? "STATUS: VOICE_OUTPUT_ON" : "STATUS: VOICE_IDLE", centerX, centerY + 76);

    ctx.restore();
  },

  startBoardLoop() {
    const loop = () => {
      this.drawBoardVisuals();
      this.boardAnimId = requestAnimationFrame(loop);
    };
    this.boardAnimId = requestAnimationFrame(loop);
  },

  // Vẽ Đồ họa lý giải kiến thức cao cấp trên màn 500x280 mới
  drawBoardVisuals() {
    const ctx = this.boardCtx;
    const w = this.boardCanvas.width;
    const h = this.boardCanvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();

    // Nền tối bảng phụ
    ctx.fillStyle = '#020306';
    ctx.fillRect(0, 0, w, h);

    if (this.currentVisualType === 'default') {
      // 1. Màn hình chờ kỹ thuật (Tech Grid Screensaver)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }



      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("DIGI ACADEMIC INTERACTIVE CONSOLE V2.0", w / 2, h / 2 - 8);
      
      let alpha = 0.3 + Math.abs(Math.sin(Date.now() / 300)) * 0.7;
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.font = '9px monospace';
      ctx.fillText(">> HỆ THỐNG ĐANG CHỜ - VUI LÒNG CLICK CHỌN CÂU HỎI PHÍA DƯỚI <<", w / 2, h / 2 + 15);

    } else if (this.currentVisualType === 'mars') {
      // 2. BẢN VẼ SAO HỎA CHI TIẾT
      // Vẽ vũ trụ tinh vân huyền ảo ở nền
      let nebula = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 240);
      nebula.addColorStop(0, 'rgba(30, 9, 45, 0.4)'); // Tím sẫm ở tâm
      nebula.addColorStop(0.5, 'rgba(15, 7, 25, 0.2)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      // Vẽ sao nền lấp lánh
      this.starPositions.forEach((star, idx) => {
        let alpha = 0.2 + Math.abs(Math.sin(Date.now() / 350 + idx)) * 0.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, idx % 3 === 0 ? 0.8 : (idx % 3 === 1 ? 1.5 : 2), 0, Math.PI * 2);
        ctx.fill();
      });

      this.planetAngle += 0.003;
      const centerX = w / 2;
      const centerY = h / 2 - 15;
      const r = 62;

      // Quỹ đạo vệ tinh elip nghiêng
      const orbitA = r + 50;
      const orbitB = r / 2 + 10;
      const orbitTilt = Math.PI / 10; // Nghiêng 18 độ
      
      // Quỹ đạo nét đứt mờ ảo phía sau hành tinh
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, orbitA, orbitB, orbitTilt, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Khí quyển phát quang đa lớp
      let atmosphereGlow = ctx.createRadialGradient(centerX, centerY, r - 5, centerX, centerY, r + 30);
      atmosphereGlow.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
      atmosphereGlow.addColorStop(0.3, 'rgba(249, 115, 22, 0.25)');
      atmosphereGlow.addColorStop(0.7, 'rgba(0, 240, 255, 0.08)');
      atmosphereGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphereGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r + 30, 0, Math.PI * 2);
      ctx.fill();

      // Cầu hành tinh
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      // Mảng địa hình Oxit sắt dịch chuyển mượt mà
      ctx.save();
      // Clip để vẽ mảng địa hình giới hạn trong hình tròn hành tinh
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.clip();

      // Vẽ các đám mây bụi / mảng lục địa màu đỏ gạch/nâu sẫm xoay tròn
      ctx.fillStyle = '#5c0f0f';
      for (let i = -1; i <= 1; i++) {
        let xOffset = ((this.planetAngle * r * 1.5) % (r * 3)) - r * 1.5 + (i * r * 2.5);
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset, centerY + 10, r * 0.7, r * 0.25, Math.PI / 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset - 20, centerY - 15, r * 0.4, r * 0.2, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5c0f0f';
      }

      // Hố thiên thạch xoay theo hành tinh
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillStyle = 'rgba(79, 15, 15, 0.7)';
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        let xOffset = ((this.planetAngle * r * 1.5) % (r * 3)) - r * 1.5 + (i * r * 2.5);
        // Hố 1
        ctx.beginPath();
        ctx.arc(centerX + xOffset - 15, centerY + 5, 5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        // Hố 2
        ctx.beginPath();
        ctx.arc(centerX + xOffset + 35, centerY - 8, 7, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
      }

      // Chỏm cực phủ băng carbon trắng tinh khiết
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - r + 5, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Đổ bóng 3D nghệ thuật
      let shadow = ctx.createRadialGradient(centerX - 15, centerY - 15, 0, centerX, centerY, r);
      shadow.addColorStop(0, 'rgba(255, 165, 0, 0.15)'); // Phản chiếu ánh sáng cam ấm nhẹ ở trung tâm sáng
      shadow.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      shadow.addColorStop(1, 'rgba(2, 3, 6, 0.95)'); // Bóng tối đen hoàn toàn ở rìa khuất
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Thôi clip hành tinh

      // Vẽ vệ tinh đang bay (đứng trước hoặc đứng sau tùy vị trí elip)
      const satAngle = (Date.now() / 1500) % (Math.PI * 2);
      const satX = centerX + Math.cos(satAngle) * orbitA;
      const satY = centerY + Math.sin(satAngle) * orbitB;
      // Trục xoay nghiêng vệ tinh tương ứng elip
      const rotSatX = centerX + (satX - centerX) * Math.cos(orbitTilt) - (satY - centerY) * Math.sin(orbitTilt);
      const rotSatY = centerY + (satX - centerX) * Math.sin(orbitTilt) + (satY - centerY) * Math.cos(orbitTilt);

      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(rotSatX, rotSatY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rotSatX - 8, rotSatY);
      ctx.lineTo(rotSatX + 8, rotSatY);
      ctx.stroke();
      ctx.restore();

      // Chỉ báo HUD nhắm mục tiêu góc cạnh nghệ thuật
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const targetPointX = centerX - 25;
      const targetPointY = centerY + 15;
      ctx.arc(targetPointX, targetPointY, 3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(targetPointX, targetPointY);
      ctx.lineTo(targetPointX - 25, targetPointY + 35);
      ctx.lineTo(targetPointX - 90, targetPointY + 35);
      ctx.stroke();

      // Nền kính mờ cho hộp chỉ số HUD bên trái
      ctx.fillStyle = 'rgba(2, 3, 6, 0.65)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(targetPointX - 180, targetPointY + 20, 85, 30, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText("ATMOSPHERE", targetPointX - 175, targetPointY + 32);
      ctx.fillStyle = '#00f0ff';
      ctx.fillText("CO2/N2 [THIN]", targetPointX - 175, targetPointY + 42);

      // Đường dẫn chỉ số bên phải
      const targetPointR2X = centerX + r - 15;
      const targetPointR2Y = centerY - 10;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(targetPointR2X, targetPointR2Y);
      ctx.lineTo(targetPointR2X + 35, targetPointR2Y + 40);
      ctx.lineTo(targetPointR2X + 105, targetPointR2Y + 40);
      ctx.stroke();

      ctx.fillStyle = 'rgba(2, 3, 6, 0.65)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.roundRect(targetPointR2X + 110, targetPointR2Y + 25, 85, 30, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText("SURFACE DUST", targetPointR2X + 115, targetPointR2Y + 37);
      ctx.fillStyle = '#ff5e7e';
      ctx.fillText("FE2O3 [RED-ORANGE]", targetPointR2X + 115, targetPointR2Y + 47);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("HÌNH ẢNH: QUANG PHỔ & TRẠM VỆ TINH SAO HỎA (MARS)", w / 2, h - 22);

    } else if (this.currentVisualType === 'neural') {
      // 3. MẠNG NƠ-RON HOẠT ĐỘNG SINH HỌC (Stretched Neural Network)
      const time = Date.now() / 350;
      const layers = [3, 4, 2];
      const nodes = [];
      const paddingX = 135;
      const paddingY = 42;

      for (let i = 0; i < layers.length; i++) {
        let x = 115 + i * paddingX;
        let count = layers[i];
        let layerNodes = [];
        let startY = (h - (count - 1) * paddingY) / 2 - 10;
        
        for (let j = 0; j < count; j++) {
          let oscY = Math.sin(time + i * 2 + j) * 4;
          let oscX = Math.cos(time + i * 1.5 + j * 0.8) * 2;
          layerNodes.push({ 
            x: x + oscX, 
            y: startY + j * paddingY + oscY, 
            val: Math.sin(time + i + j * 1.2) 
          });
        }
        nodes.push(layerNodes);
      }

      for (let i = 0; i < nodes.length - 1; i++) {
        for (let a = 0; a < nodes[i].length; a++) {
          for (let b = 0; b < nodes[i+1].length; b++) {
            let nA = nodes[i][a];
            let nB = nodes[i+1][b];
            
            let cp1X = nA.x + paddingX / 2;
            let cp1Y = nA.y;
            let cp2X = nB.x - paddingX / 2;
            let cp2Y = nB.y;

            let weight = 0.5 + (nA.val + nB.val) * 0.25;
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.05 + weight * 0.08})`;
            ctx.lineWidth = 1 + weight * 1.5;
            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, nB.x, nB.y);
            ctx.stroke();

            let signalPos = (time * 0.25 + a * 0.2 + b * 0.15) % 1.0;
            
            let t = signalPos;
            let mt = 1 - t;
            let sigX = mt*mt*mt*nA.x + 3*mt*mt*t*cp1X + 3*mt*t*t*cp2X + t*t*t*nB.x;
            let sigY = mt*mt*mt*nA.y + 3*mt*mt*t*cp1Y + 3*mt*t*t*cp2Y + t*t*t*nB.y;

            ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(sigX, sigY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            let t1 = Math.max(0, signalPos - 0.05);
            let mt1 = 1 - t1;
            let sigX1 = mt1*mt1*mt1*nA.x + 3*mt1*mt1*t1*cp1X + 3*mt1*t1*t1*cp2X + t1*t1*t1*nB.x;
            let sigY1 = mt1*mt1*mt1*nA.y + 3*mt1*mt1*t1*cp1Y + 3*mt1*t1*t1*cp2Y + t1*t1*t1*nB.y;
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(sigX1, sigY1, 1.8, 0, Math.PI * 2);
            ctx.fill();

            let t2 = Math.max(0, signalPos - 0.1);
            let mt2 = 1 - t2;
            let sigX2 = mt2*mt2*mt2*nA.x + 3*mt2*mt2*t2*cp1X + 3*mt2*t2*t2*cp2X + t2*t2*t2*nB.x;
            let sigY2 = mt2*mt2*mt2*nA.y + 3*mt2*mt2*t2*cp1Y + 3*mt2*t2*t2*cp2Y + t2*t2*t2*nB.y;
            ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(sigX2, sigY2, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      nodes.forEach((layer, layerIdx) => {
        layer.forEach(node => {
          let nodeGlow = 5 + Math.max(0, node.val) * 15;
          ctx.save();
          ctx.shadowColor = layerIdx === 0 ? '#ef4444' : (layerIdx === 1 ? '#00f0ff' : '#10b981');
          ctx.shadowBlur = nodeGlow;
          
          let color = layerIdx === 0 ? '#ef4444' : (layerIdx === 1 ? '#00f0ff' : '#10b981');
          
          let radialGlow = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, 14);
          radialGlow.addColorStop(0, color);
          radialGlow.addColorStop(0.3, `rgba(${layerIdx === 0 ? '239,68,68' : (layerIdx === 1 ? '0,240,255' : '16,185,129')}, 0.4)`);
          radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = radialGlow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      });

      ctx.fillStyle = 'rgba(2, 3, 6, 0.6)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.8;
      
      const labelX = [115, 250, 385];
      const labelText = ["INPUT LAYER", "HIDDEN LAYER", "OUTPUT LAYER"];
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.roundRect(labelX[k] - 40, 12, 80, 16, 3);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(labelText[k], labelX[k], 23);
      }

      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("HÌNH ẢNH: QUY TRÌNH HỌC MÁY (NEURAL NETWORK)", w / 2, h - 22);

    } else if (this.currentVisualType === 'lock') {
      // 4. LÁ CHẮN HEXAGON PHÒNG THỦ & HACKER TẤN CÔNG
      const centerX = w / 2;
      const centerY = h / 2 - 15;
      const time = Date.now() / 1000;

      const attackStreams = [
        { angle: Math.PI * 1.1 + Math.sin(time) * 0.1, speed: 1.8, offset: 0 },
        { angle: Math.PI * 1.9 + Math.cos(time * 0.8) * 0.15, speed: 2.2, offset: 1.2 },
        { angle: Math.PI * 0.65 + Math.sin(time * 1.2) * 0.1, speed: 1.5, offset: 2.5 }
      ];

      attackStreams.forEach(stream => {
        let progress = ((time * stream.speed + stream.offset) % 1.0);
        let startDist = 220;
        let endDist = 62;
        let currentDist = startDist - (startDist - endDist) * progress;

        let x = centerX + Math.cos(stream.angle) * currentDist;
        let y = centerY + Math.sin(stream.angle) * currentDist;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(stream.angle) * 12, y + Math.sin(stream.angle) * 12);
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(x + Math.cos(stream.angle) * 18, y + Math.sin(stream.angle) * 18, 1.5, 0, Math.PI*2);
        ctx.fill();

        if (progress > 0.9) {
          let explodePower = (progress - 0.9) / 0.1;
          ctx.strokeStyle = `rgba(239, 68, 68, ${1 - explodePower})`;
          ctx.lineWidth = 1;
          for (let a = 0; a < 6; a++) {
            let sparkAngle = stream.angle + Math.PI + (a - 2.5) * 0.3;
            let sparkDist = explodePower * 14;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(stream.angle) * endDist, centerY + Math.sin(stream.angle) * endDist);
            ctx.lineTo(
              centerX + Math.cos(stream.angle) * endDist + Math.cos(sparkAngle) * sparkDist, 
              centerY + Math.sin(stream.angle) * endDist + Math.sin(sparkAngle) * sparkDist
            );
            ctx.stroke();
          }
        }
      });

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, time * 0.4, time * 0.4 + Math.PI*2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10 + Math.abs(Math.sin(time * 3)) * 8;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.07)';
      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY - 25);
      ctx.quadraticCurveTo(centerX, centerY - 32, centerX + 35, centerY - 25);
      ctx.lineTo(centerX + 35, centerY + 12);
      ctx.quadraticCurveTo(centerX + 30, centerY + 38, centerX, centerY + 48);
      ctx.quadraticCurveTo(centerX - 30, centerY + 38, centerX - 35, centerY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.clip();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 0.8;
      const hexSize = 10;
      const hHeight = hexSize * Math.sqrt(3);
      for (let hx = centerX - 60; hx < centerX + 60; hx += hexSize * 1.5) {
        for (let hy = centerY - 60; hy < centerY + 60; hy += hHeight) {
          let oddOffset = (Math.round(hx / (hexSize * 1.5)) % 2) * (hHeight / 2);
          ctx.beginPath();
          for (let side = 0; side < 6; side++) {
            let angle = (side / 6) * Math.PI * 2;
            let px = hx + Math.cos(angle) * (hexSize - 1.5);
            let py = hy + oddOffset + Math.sin(angle) * (hexSize - 1.5);
            if (side === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 5, 9, Math.PI, 0);
      ctx.lineTo(centerX + 9, centerY + 8);
      ctx.moveTo(centerX - 9, centerY - 5);
      ctx.lineTo(centerX - 9, centerY + 8);
      ctx.stroke();

      let goldGlow = ctx.createLinearGradient(centerX - 13, centerY + 3, centerX + 13, centerY + 21);
      goldGlow.addColorStop(0, '#fbbf24');
      goldGlow.addColorStop(0.5, '#f59e0b');
      goldGlow.addColorStop(1, '#d97706');
      ctx.fillStyle = goldGlow;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(centerX - 13, centerY + 3, 26, 18, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#020306';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 10, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX - 1, centerY + 10);
      ctx.lineTo(centerX - 2.5, centerY + 17);
      ctx.lineTo(centerX + 2.5, centerY + 17);
      ctx.lineTo(centerX + 1, centerY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("HÌNH ẢNH: TƯỜNG LỬA & MÃ HÓA BẢO MẬT (FIREWALL)", w / 2, h - 22);

    } else if (this.currentVisualType === 'globe') {
      // 5. QUẢ ĐỊA CẦU MẠNG LƯỚI CÔNG NGHỆ HOLOGRAM (Cyber Network Globe)
      this.planetAngle += 0.005;
      const centerX = w / 2;
      const centerY = h / 2 - 15;
      const r = 58;

      let globeGlow = ctx.createRadialGradient(centerX, centerY, r - 5, centerX, centerY, r + 25);
      globeGlow.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
      globeGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.1)');
      globeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = globeGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r + 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, r + 15, r * 0.35, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, r + 15, r * 0.35, -Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.lineWidth = 0.8;
      
      for (let lat = -r + 15; lat < r; lat += 15) {
        let wLat = Math.sqrt(r*r - lat*lat);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + lat, wLat, wLat * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let rot = 0; rot < Math.PI; rot += Math.PI / 4) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r, r * Math.abs(Math.sin(this.planetAngle + rot)), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const nodes = [
        { latAngle: -0.4, lonAngle: 0.3, color: '#00f0ff' },
        { latAngle: 0.2, lonAngle: 1.2, color: '#10b981' },
        { latAngle: 0.6, lonAngle: 2.8, color: '#ff5e7e' },
        { latAngle: -0.8, lonAngle: 4.2, color: '#fbbf24' },
        { latAngle: 0.4, lonAngle: 5.4, color: '#00f0ff' }
      ];

      nodes.forEach((n, idx) => {
        let rotLon = n.lonAngle + this.planetAngle;
        let cosLat = Math.cos(n.latAngle);
        let x = centerX + Math.cos(rotLon) * r * cosLat;
        let y = centerY + Math.sin(n.latAngle) * r * 0.6;

        let isFront = Math.sin(rotLon) > -0.2;
        if (isFront) {
          ctx.save();
          let glowSize = 4 + Math.abs(Math.sin(Date.now() / 250 + idx)) * 6;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = glowSize;
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      const pulseTime = (Date.now() / 1500) % 1.0;
      ctx.strokeStyle = `rgba(139, 92, 246, ${1 - pulseTime})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r + 5 + pulseTime * 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("HÌNH ẢNH: KHÔNG GIAN MẠNG LIÊN KẾT (DIGITAL CITIZEN)", w / 2, h - 22);
    }

    // Vẽ khung viền và 4 góc chữ L định vị đè lên mọi hình minh họa
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    const corner = 10;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(15, 15 + corner); ctx.lineTo(15, 15); ctx.lineTo(15 + corner, 15);
    // Top-Right
    ctx.moveTo(w - 15, 15 + corner); ctx.lineTo(w - 15, 15); ctx.lineTo(w - 15 - corner, 15);
    // Bottom-Left
    ctx.moveTo(15, h - 15 - corner); ctx.lineTo(15, h - 15); ctx.lineTo(15 + corner, h - 15);
    // Bottom-Right
    ctx.moveTo(w - 15, h - 15 - corner); ctx.lineTo(w - 15, h - 15); ctx.lineTo(w - 15 - corner, h - 15);
    ctx.stroke();

    ctx.restore();
  }
};
