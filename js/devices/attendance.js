import { completeDevice } from '../game.js';

export const AttendanceHandler = {
  canvas: null,
  ctx: null,
  video: null,
  stream: null,
  cameraActive: false,
  animationId: null,
  scanProgress: 0,
  isScanning: false,
  landmarks: [],
  faceDetected: false,
  fallbackMode: false,
  
  isBlocked: false,
  faceDetector: null,
  detectInterval: 0,
  scanIntervalId: null,
  
  init() {
    this.canvas = document.getElementById('attendance-camera-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');
    this.video.style.display = 'none';
    document.body.appendChild(this.video);

    const btnToggle = document.getElementById('btn-toggle-camera');
    btnToggle.addEventListener('click', () => {
      this.toggleCamera();
    });

    if ('FaceDetector' in window) {
      this.faceDetector = new FaceDetector({ maxDetectedFaces: 1, fastMode: true });
    }
  },

  onOpen() {
    this.reset();
  },

  onClose() {
    this.stopCamera();
  },

  reset() {
    this.stopCamera();
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
    this.cameraActive = false;
    this.isScanning = false;
    this.scanProgress = 0;
    this.landmarks = [];
    this.faceDetected = false;
    this.fallbackMode = false;
    this.isBlocked = false;
    this.detectInterval = 0;
    
    document.getElementById('btn-toggle-camera').textContent = 'Kích hoạt quét sinh trắc';
    document.getElementById('scan-bounding-box').classList.add('hidden');
    document.getElementById('scan-line').classList.add('hidden');
    document.getElementById('scan-progress-area').classList.add('hidden');
    
    const resultBox = document.getElementById('attendance-result');
    resultBox.classList.add('hidden');
    resultBox.innerHTML = '';
    
    const progressBar = document.getElementById('attendance-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    const placeholder = document.getElementById('attendance-avatar-pic');
    placeholder.classList.remove('hidden');
    placeholder.textContent = 'Camera đang tắt';

    this.ctx.fillStyle = '#03050a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  async toggleCamera() {
    if (this.cameraActive) {
      this.reset();
    } else {
      this.cameraActive = true;
      document.getElementById('btn-toggle-camera').textContent = 'Ngắt kết nối camera';
      
      const placeholder = document.getElementById('attendance-avatar-pic');
      placeholder.textContent = 'Đang kết nối camera thiết bị...';

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' }
        });
        
        this.video.srcObject = this.stream;
        this.video.play();
        
        placeholder.classList.add('hidden');
        this.fallbackMode = false;
      } catch (err) {
        console.warn("Không thể truy cập camera thật:", err);
        this.fallbackMode = true;
        placeholder.classList.add('hidden');
      }

      this.generateLandmarks();
      this.startCameraSimulation();
    }
  },

  generateLandmarks() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.landmarks = [];

    // Chân mày
    for (let x = -30; x <= -10; x += 6) this.landmarks.push({ x: centerX + x, y: centerY - 25, base: {x: centerX + x, y: centerY - 25} });
    for (let x = 10; x <= 30; x += 6) this.landmarks.push({ x: centerX + x, y: centerY - 25, base: {x: centerX + x, y: centerY - 25} });

    // Sống mũi
    for (let y = -20; y <= 5; y += 5) this.landmarks.push({ x: centerX, y: centerY + y, base: {x: centerX, y: centerY + y} });

    // Mắt
    for (let a = 0; a < Math.PI * 2; a += Math.PI/4) {
      let x = centerX - 18 + Math.cos(a)*6;
      let y = centerY - 10 + Math.sin(a)*6;
      this.landmarks.push({ x: x, y: y, base: {x: x, y: y} });
    }
    for (let a = 0; a < Math.PI * 2; a += Math.PI/4) {
      let x = centerX + 18 + Math.cos(a)*6;
      let y = centerY - 10 + Math.sin(a)*6;
      this.landmarks.push({ x: x, y: y, base: {x: x, y: y} });
    }

    // Viền cằm U-shape
    for (let a = Math.PI*0.1; a <= Math.PI*0.9; a += Math.PI/10) {
      let x = centerX + Math.cos(a)*50;
      let y = centerY + Math.sin(a)*50;
      this.landmarks.push({ x: x, y: y, base: {x: x, y: y} });
    }

    // Miệng
    for (let x = -15; x <= 15; x += 5) {
      let yOffset = (x*x) / 45;
      let xPos = centerX + x;
      let yPos = centerY + 18 + yOffset;
      this.landmarks.push({ x: xPos, y: yPos, base: {x: xPos, y: yPos} });
    }
  },

  startCameraSimulation() {
    const render = async () => {
      if (!this.cameraActive) return;
      await this.drawCameraFeed();
      if (!this.cameraActive) return;
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  },

  stopCamera() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  },

  async drawCameraFeed() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // 1. Vẽ luồng hình ảnh camera
    if (this.cameraActive && !this.fallbackMode && this.video.readyState >= 2) {
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.video, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);
      this.drawFallbackAvatar();
    }

    // Thực hiện phân tích che mặt/camera sau mỗi 6 khung hình để tối ưu CPU
    this.detectInterval++;
    if (this.detectInterval % 6 === 0) {
      const isPresent = await this.checkFacePresence();
      if (!this.cameraActive) return;
      
      if (isPresent !== this.faceDetected) {
        this.faceDetected = isPresent;
        
        if (this.faceDetected) {
          this.isBlocked = false;
          if (this.scanProgress < 100) {
            this.startScanning();
          }
        } else {
          this.isBlocked = true;
          this.isScanning = false;
          document.getElementById('scan-line').classList.add('hidden');
          document.getElementById('scan-progress-area').classList.add('hidden');
          
          const boundingBox = document.getElementById('scan-bounding-box');
          boundingBox.classList.remove('hidden');
          boundingBox.style.borderColor = '#ef4444';
          boundingBox.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.7)';
        }
      }
    }

    // Vẽ lưới tọa độ mờ
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Vẽ stencil hướng dẫn căn khuôn mặt
    if (!this.faceDetected && this.cameraActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      
      const centerX = w / 2;
      const centerY = h / 2;
      
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 55, 75, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText("HƯỚNG KHUÔN MẶT VÀO ĐÂY", centerX, centerY - 85);
      ctx.restore();
    }

    // 2. Vẽ lưới mốc sinh học chuyển động nhẹ (chỉ khi phát hiện thấy mặt và không bị che)
    if (this.faceDetected && !this.isBlocked) {
      const isComplete = this.scanProgress >= 100;
      const meshColor = isComplete ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 240, 255, 0.4)';
      const dotColor = isComplete ? '#10b981' : '#00f0ff';
      
      ctx.strokeStyle = meshColor;
      ctx.lineWidth = 0.8;

      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1.5;

      ctx.beginPath();
      for (let i = 0; i < this.landmarks.length - 1; i++) {
        let pt1 = this.landmarks[i];
        let pt2 = this.landmarks[i+1];
        
        pt1.x = pt1.base.x + jitterX;
        pt1.y = pt1.base.y + jitterY;
        pt2.x = pt2.base.x + jitterX;
        pt2.y = pt2.base.y + jitterY;

        if (Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y) < 25) {
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
        }
      }
      ctx.stroke();

      ctx.fillStyle = dotColor;
      this.landmarks.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 3. Thông số Telemetry HUD cảnh báo
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`API_FEED: ${this.fallbackMode ? 'FALLBACK_SYNTHETIC' : 'REALTIME_WEBCAM'}`, 15, 25);
    
    if (this.isBlocked) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`FACE_DETECTED: NO (CAMERA BLOCKED / NO FACE)`, 15, 40);
      ctx.fillText(`WARNING: SCANNING SUSPENDED`, 15, 55);
    } else {
      ctx.fillText(`FACE_DETECTED: ${this.faceDetected ? 'YES (LOCKED)' : 'NO (SEARCHING...)'}`, 15, 40);
      ctx.fillText(`MATCH_CONFIDENCE: ${this.faceDetected ? (70 + this.scanProgress * 0.298).toFixed(1) : '0.0'}%`, 15, 55);
    }
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.fillText(`SYSTEM_LATENCY: 12ms`, 15, 70);

    // Cảnh báo đè lên camera khi không có mặt hoặc bị che
    if (this.isBlocked) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("HỆ THỐNG DỪNG: KHÔNG PHÁT HIỆN GƯƠNG MẶT", w / 2, h / 2 - 40);
      ctx.font = '9px monospace';
      ctx.fillText("VUI LÒNG HƯỚNG MẶT VÀO CAMERA HOẶC KHÔNG CHE ỐNG LÍNH", w / 2, h / 2 - 25);
      ctx.textAlign = 'left';
    }

    // Khung ngắm 4 góc
    ctx.strokeStyle = this.isBlocked ? '#ef4444' : 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    const cornerSize = 15;
    ctx.beginPath(); ctx.moveTo(10, 10 + cornerSize); ctx.lineTo(10, 10); ctx.lineTo(10 + cornerSize, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 10, 10 + cornerSize); ctx.lineTo(w - 10, 10); ctx.lineTo(w - 10 - cornerSize, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, h - 10 - cornerSize); ctx.lineTo(10, h - 10); ctx.lineTo(10 + cornerSize, h - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 10, h - 10 - cornerSize); ctx.lineTo(w - 10, h - 10); ctx.lineTo(w - 10 - cornerSize, h - 10); ctx.stroke();
  },

  // Giải thuật kiểm tra sự hiện diện của khuôn mặt bằng thuật toán Sinh trắc Học Pixel & Tông Màu Da (Skin Tone & Luminance Analysis)
  async checkFacePresence() {
    if (!this.cameraActive) return false;

    // 1. Kiểm tra bằng FaceDetector API của trình duyệt nếu được hỗ trợ phần cứng gốc
    if (this.faceDetector && !this.fallbackMode && this.video.readyState >= 2) {
      try {
        const faces = await this.faceDetector.detect(this.canvas);
        return faces.length > 0;
      } catch (err) {
        console.error("Lỗi FaceDetector API:", err);
      }
    }

    // 2. Thuật toán phân tích pixel nâng cao (Skin Tone Percentage & Color Variance)
    const w = this.canvas.width;
    const h = this.canvas.height;
    const rectSize = 120;
    const rectX = (w - rectSize) / 2;
    const rectY = (h - rectSize) / 2;

    try {
      const imgData = this.ctx.getImageData(rectX, rectY, rectSize, rectSize);
      const data = imgData.data;
      
      let totalLuminance = 0;
      let rSum = 0, gSum = 0, bSum = 0;
      let skinPixels = 0;
      let skinLuminanceSum = 0;
      let skinLuminanceSqSum = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];
        let lum = (0.299 * r + 0.587 * g + 0.114 * b);
        
        totalLuminance += lum;

        // Giải thuật dò sắc tố da người trong không gian màu RGB
        const isSkin = (
          r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) > 12 &&
          (Math.max(r, g, b) - Math.min(r, g, b)) > 15
        );
        if (isSkin) {
          skinPixels++;
          skinLuminanceSum += lum;
          skinLuminanceSqSum += lum * lum;
        }
      }
      
      const numPixels = data.length / 4;
      const avgLuminance = totalLuminance / numPixels;
      const avgR = rSum / numPixels;
      const avgG = gSum / numPixels;
      const avgB = bSum / numPixels;
      
      // Tính độ lệch màu chuẩn của toàn ảnh
      let variance = 0;
      for (let i = 0; i < data.length; i += 4) {
        let rDiff = data[i] - avgR;
        let gDiff = data[i+1] - avgG;
        let bDiff = data[i+2] - avgB;
        variance += (rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
      }
      const stdDev = Math.sqrt(variance / (numPixels * 3));

      // Tỷ lệ phần trăm điểm ảnh màu da ở khu trung tâm
      const skinRatio = skinPixels / numPixels;

      // Tính độ chênh lệch độ sáng trên các pixel có màu da (Skin Luminance Standard Deviation)
      let skinStdDev = 0;
      if (skinPixels > 10) {
        const avgSkinLum = skinLuminanceSum / skinPixels;
        const skinVariance = (skinLuminanceSqSum / skinPixels) - (avgSkinLum * avgSkinLum);
        skinStdDev = Math.sqrt(Math.max(0, skinVariance));
      }

      // ĐÁNH GIÁ CHÂN THỰC:
      // A. Nếu bị che ống kính tối thui (Luminance cực thấp < 20)
      if (avgLuminance < 20) {
        return false; 
      }

      // B. Nếu bị che tay sơ/che hờ hững (khiến toàn màn hình trơn màu da, stdDev thấp hoặc skinRatio cực cao)
      // - Nếu skinRatio > 0.85 (tức là 85% khung hình ngắm là màu da) -> có vật cản áp sát như lòng bàn tay/ngón tay.
      // - Nếu skinStdDev < 15 (tức là màu da trơn tuột, không có chi tiết mắt mũi hay đổ bóng tối sáng của khuôn mặt thật) -> không phải mặt.
      if (skinRatio > 0.85 || (skinRatio > 0.10 && skinStdDev < 15)) {
        return false; // Bị che hờ bằng tay/vật cản
      }

      // C. Chế độ dự phòng Fallback
      if (this.fallbackMode) {
        return true; 
      }

      // D. Điều kiện có khuôn mặt thật: Tỷ lệ màu da từ 10% đến 85% và có độ chênh lệch sáng tối của chi tiết khuôn mặt (skinStdDev >= 15)
      return skinRatio >= 0.10 && skinRatio <= 0.85 && skinStdDev >= 15;
      
    } catch (e) {
      return true; 
    }
  },

  drawFallbackAvatar() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    let shirtGrad = ctx.createLinearGradient(centerX - 60, h, centerX + 60, centerY + 50);
    shirtGrad.addColorStop(0, '#0d1b3e');
    shirtGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = shirtGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - 60, h);
    ctx.quadraticCurveTo(centerX - 50, centerY + 55, centerX - 30, centerY + 55);
    ctx.lineTo(centerX + 30, centerY + 55);
    ctx.quadraticCurveTo(centerX + 50, centerY + 55, centerX + 60, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 6, 43, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY, 12, 0, Math.PI * 2);
    ctx.arc(centerX + 15, centerY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 3, centerY);
    ctx.lineTo(centerX + 3, centerY);
    ctx.stroke();

    ctx.strokeStyle = '#c53030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 16, 8, 0, Math.PI);
    ctx.stroke();
  },

  startScanning() {
    this.isScanning = true;
    this.scanProgress = 0;
    
    document.getElementById('scan-bounding-box').classList.remove('hidden');
    document.getElementById('scan-line').classList.remove('hidden');
    document.getElementById('scan-progress-area').classList.remove('hidden');
    
    const boundingBox = document.getElementById('scan-bounding-box');
    boundingBox.style.borderColor = '#00f0ff';
    boundingBox.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.5)';

    const progressBar = document.getElementById('attendance-progress-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    const statusText = document.getElementById('attendance-status');

    statusText.textContent = 'Phát hiện khuôn mặt! Đang phân tích sinh trắc học học đường...';

    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
    }
    this.scanIntervalId = setInterval(() => {
      if (!this.isScanning || !this.cameraActive) {
        clearInterval(this.scanIntervalId);
        this.scanIntervalId = null;
        return;
      }

      this.scanProgress += 2.5;
      progressBar.style.width = `${this.scanProgress}%`;

      if (this.scanProgress >= 100) {
        clearInterval(this.scanIntervalId);
        this.scanIntervalId = null;
        this.onScanComplete();
      }
    }, 50);
  },

  onScanComplete() {
    this.isScanning = false;
    document.getElementById('scan-line').classList.add('hidden');
    document.getElementById('scan-progress-area').classList.add('hidden');
    
    const boundingBox = document.getElementById('scan-bounding-box');
    boundingBox.style.borderColor = '#10b981';
    boundingBox.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.7)';

    const resultBox = document.getElementById('attendance-result');
    resultBox.classList.remove('hidden');
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    resultBox.innerHTML = `
      <h4>✓ XÁC THỰC SINH TRẮC HỌC THÀNH CÔNG</h4>
      <p>Học sinh: <strong>Minh</strong></p>
      <p>Lớp: <strong>6A</strong></p>
      <p>Mã học sinh: <strong>Minh-6A-998</strong></p>
      <p>Trạng thái: <strong>ĐÃ ĐIỂM DANH (ATTENDED)</strong></p>
      <p>Thời gian ghi nhận hệ thống: <strong>${timeStr}</strong></p>
      <p style="color: #059669; margin-top: 6px; font-size: 11px; font-weight: 600;">Độ tin cậy khớp mẫu (Confidence Match): 99.8%</p>
    `;

    completeDevice('attendance_device', 10);
  }
};
