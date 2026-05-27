import { completeDevice, GameState } from '../game.js';

// Danh sách cơ sở dữ liệu sách phong phú, gần gũi và hấp dẫn cho học sinh lớp 2
export const BookDatabase = [
  // Cổ tích - Kệ C-01 (Hàng 1, Cột 1): x_ke = 25, y_ke = 110. Sách cách nhau 20px
  { title: "Sự tích Cây Tre Trăm Đốt", genre: "cổ tích", shelf: "C-01", shelfX: 43, shelfY: 121, largeX: 292, largeY: 441, status: "available" },
  { title: "Truyện cổ tích Tấm Cám", genre: "cổ tích", shelf: "C-01", shelfX: 63, shelfY: 121, largeX: 315, largeY: 441, status: "checked-out" },
  { title: "Thạch Sanh chém Chằn tinh", genre: "cổ tích", shelf: "C-01", shelfX: 83, shelfY: 121, largeX: 338, largeY: 441, status: "available" },
  
  // Khoa học - Kệ B-03 (Hàng 1, Cột 2): x_ke = 135, y_ke = 110.
  { title: "Khám phá Vũ Trụ Bao La", genre: "khoa học", shelf: "B-03", shelfX: 153, shelfY: 121, largeX: 407, largeY: 441, status: "available" },
  { title: "Khủng Long Kỷ Jura Vui Nhộn", genre: "khoa học", shelf: "B-03", shelfX: 173, shelfY: 121, largeX: 430, largeY: 441, status: "available" },
  { title: "Bí Mật Dưới Lòng Đại Dương", genre: "khoa học", shelf: "B-03", shelfX: 193, shelfY: 121, largeX: 453, largeY: 441, status: "checked-out" },
  
  // Lịch sử - Kệ A-12 (Hàng 1, Cột 3): x_ke = 245, y_ke = 110.
  { title: "Lịch sử Việt Nam bằng tranh", genre: "lịch sử", shelf: "A-12", shelfX: 263, shelfY: 121, largeX: 522, largeY: 441, status: "available" },
  { title: "Hùng Vương dựng nước Văn Lang", genre: "lịch sử", shelf: "A-12", shelfX: 283, shelfY: 121, largeX: 545, largeY: 441, status: "available" },
  { title: "Bản Đồ Thế Giới Thú Vị", genre: "lịch sử", shelf: "A-12", shelfX: 303, shelfY: 121, largeX: 568, largeY: 441, status: "checked-out" },
  
  // Toán học - Kệ D-05 (Hàng 2, Cột 1): x_ke = 25, y_ke = 195.
  { title: "Toán Học Vui Vẻ Lớp 2", genre: "toán học", shelf: "D-05", shelfX: 43, shelfY: 206, largeX: 292, largeY: 501, status: "available" },
  { title: "Xứ Sở Hình Học Kỳ Diệu", genre: "toán học", shelf: "D-05", shelfX: 63, shelfY: 206, largeX: 315, largeY: 501, status: "checked-out" },
  { title: "Trò chơi câu đố tư duy", genre: "toán học", shelf: "D-05", shelfX: 83, shelfY: 206, largeX: 338, largeY: 501, status: "available" },
  
  // Truyện tranh - Kệ E-07 (Hàng 2, Cột 2): x_ke = 135, y_ke = 195.
  { title: "Dế Mèn Phiêu Lưu Ký", genre: "truyện tranh", shelf: "E-07", shelfX: 153, shelfY: 206, largeX: 407, largeY: 501, status: "available" },
  { title: "Trạng Tí và những người bạn", genre: "truyện tranh", shelf: "E-07", shelfX: 173, shelfY: 206, largeX: 430, largeY: 501, status: "available" },
  { title: "Thần Đồng Đất Việt - Tập 1", genre: "truyện tranh", shelf: "E-07", shelfX: 193, shelfY: 206, largeX: 453, largeY: 501, status: "checked-out" },
  
  // Kỹ năng - Kệ F-09 (Hàng 2, Cột 3): x_ke = 245, y_ke = 195.
  { title: "Bài Học Cảm Ơn và Xin Lỗi", genre: "kỹ năng", shelf: "F-09", shelfX: 263, shelfY: 206, largeX: 522, largeY: 501, status: "available" },
  { title: "Cẩm Nang An Toàn Cho Bé", genre: "kỹ năng", shelf: "F-09", shelfX: 283, shelfY: 206, largeX: 545, largeY: 501, status: "available" },
  { title: "Học cách tự lập mỗi ngày", genre: "kỹ năng", shelf: "F-09", shelfX: 303, shelfY: 206, largeX: 568, largeY: 501, status: "available" }
];

export const LibraryKioskHandler = {
  canvas: null,
  ctx: null,
  selectedBook: null,
  pathAnimProgress: 0,
  pathAnimationId: null,
  currentNodes: [],
  audioPlayer: null,
  
  init() {
    this.canvas = document.getElementById('library-map-canvas');
    this.ctx = this.canvas.getContext('2d');

    const btnSearch = document.getElementById('btn-kiosk-search');
    const inputSearch = document.getElementById('kiosk-search-input');
    
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        // Bỏ chọn nút thể loại nhanh khi gõ tìm kiếm tự do
        document.querySelectorAll('.btn-category').forEach(btn => btn.classList.remove('selected-cat'));
        this.searchBooks(inputSearch.value);
      });
    }

    if (inputSearch) {
      inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          document.querySelectorAll('.btn-category').forEach(btn => btn.classList.remove('selected-cat'));
          this.searchBooks(inputSearch.value);
        }
      });
    }

    // Đăng ký sự kiện click cho các nút thể loại sách nhanh (rất dễ dùng cho lớp 2)
    document.querySelectorAll('.btn-category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Toggle class được chọn active
        document.querySelectorAll('.btn-category').forEach(b => b.classList.remove('selected-cat'));
        btn.classList.add('selected-cat');
        
        // Gán từ khóa vào input và tìm kiếm luôn
        const genre = btn.getAttribute('data-genre');
        if (inputSearch) inputSearch.value = btn.textContent.trim().substring(2); // lấy chữ bỏ icon
        this.searchBooks(genre);
      });
    });
  },

  onOpen() {
    this.reset();
    this.drawLibraryBaseMap();
  },

  onClose() {
    this.stopPathAnimation();
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
  },

  reset() {
    this.stopPathAnimation();
    this.selectedBook = null;
    this.pathAnimProgress = 0;
    this.currentNodes = [];
    GameState.showBookBubble = false; // Reset trạng thái bong bóng
    
    const inputField = document.getElementById('kiosk-search-input');
    if (inputField) inputField.value = '';
    
    document.querySelectorAll('.btn-category').forEach(btn => btn.classList.remove('selected-cat'));
    
    const resultsContainer = document.getElementById('kiosk-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="no-result">Hệ thống kiot đã sẵn sàng. Em hãy chọn thể loại sách yêu thích ở trên nhé!</div>
      `;
    }

    this.drawLibraryBaseMap();
  },

  stopPathAnimation() {
    if (this.pathAnimationId) {
      cancelAnimationFrame(this.pathAnimationId);
      this.pathAnimationId = null;
    }
  },

  searchBooks(query) {
    const resultsContainer = document.getElementById('kiosk-results');
    const lowerQ = query.trim().toLowerCase();
    
    if (!lowerQ) {
      resultsContainer.innerHTML = '<div class="no-result">Vui lòng chọn thể loại hoặc nhập tên sách.</div>';
      return;
    }

    const filtered = BookDatabase.filter(book => {
      return book.title.toLowerCase().includes(lowerQ) || 
             book.genre.toLowerCase().includes(lowerQ) ||
             book.shelf.toLowerCase().includes(lowerQ);
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div class="no-result">Không tìm thấy cuốn sách nào phù hợp. Em thử chọn thể loại khác nhé!</div>';
      return;
    }

    resultsContainer.innerHTML = '';
    filtered.forEach(book => {
      const bookDiv = document.createElement('div');
      // Thêm class available-item để tự động tìm và định vị
      bookDiv.className = `book-item ${book.status === 'available' ? 'available-item' : ''}`;
      
      const statusText = book.status === 'available' ? 'Còn Sách' : 'Đã Mượn';
      const statusClass = book.status === 'available' ? 'available' : 'checked-out';

      bookDiv.innerHTML = `
        <div class="book-info">
          <h4>${book.title}</h4>
          <span>Kệ: ${book.shelf} | Thể loại: ${book.genre.toUpperCase()}</span>
        </div>
        <span class="book-status ${statusClass}">${statusText}</span>
      `;

      bookDiv.addEventListener('click', () => {
        if (book.status === 'available') {
          document.querySelectorAll('.book-item').forEach(item => item.classList.remove('selected'));
          bookDiv.classList.add('selected');
          
          // Ghi nhớ cuốn sách đang chọn
          GameState.selectedLibraryBook = book;
          GameState.showBookBubble = false; // Reset bong bóng khi chọn sách mới
          
          this.drawRouteToShelf(book);
        } else {
          this.speakText('library_book_borrowed.mp3');
        }
      });

      resultsContainer.appendChild(bookDiv);
    });

    // Học sinh lớp 2: Tự động chọn cuốn sách đầu tiên có sẵn để hiển thị đường dẫn đi ngay lập tức!
    const firstAvailable = filtered.find(b => b.status === 'available');
    if (firstAvailable) {
      setTimeout(() => {
        const items = resultsContainer.querySelectorAll('.book-item');
        for (let item of items) {
          if (item.classList.contains('available-item')) {
            item.click();
            break;
          }
        }
      }, 50);
    }

    completeDevice('library_kiosk', 10);
  },

  drawLibraryBaseMap() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    // Phóng to bản đồ theo tỉ lệ 450/350 = 1.2857
    ctx.scale(1.2857, 1.2857);

    // Vẽ nền phòng thư viện màu thảm xanh lam dịu nhẹ
    ctx.fillStyle = '#0c1524';
    ctx.fillRect(0, 0, 350, 280);

    // Vẽ tường bao quanh thư viện (mô phỏng 2D thực tế)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 330, 260);

    // Vẽ bàn đọc sách lớn của thủ thư ở góc trên bên trái
    ctx.fillStyle = '#7c2d12'; // Màu gỗ đậm
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.fillRect(25, 45, 55, 25);
    ctx.strokeRect(25, 45, 55, 25);
    
    // Vẽ hai chiếc ghế nhỏ cạnh bàn thủ thư
    ctx.fillStyle = '#b45309';
    ctx.fillRect(35, 74, 12, 8);
    ctx.fillRect(57, 74, 12, 8);

    // Vẽ chữ "THƯ VIỆN THÔNG MINH" trên góc trái
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("THƯ VIỆN THÔNG MINH", 25, 30);

    // Vẽ Kiot Thư Viện đứng (nơi người chơi tương tác - góc trên bên phải)
    // Vẽ biểu tượng máy console màu xanh ngọc
    ctx.fillStyle = '#059669'; // Xanh lá cây
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(245, 55, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vòng tròn phát sáng nhấp nháy định vị cho Kiot
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(245, 55, 14 + Math.sin(Date.now() / 150) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("KIOT TRA CỨU", 245, 75);

    // Vẽ 6 Kệ sách thực tế xếp thành 2 hàng dọc, 3 cột ngang
    const shelves = [
      { id: "C-01", name: "CỔ TÍCH C-01", x: 25, y: 110, w: 75, h: 22 },
      { id: "B-03", name: "KHOA HỌC B-03", x: 135, y: 110, w: 75, h: 22 },
      { id: "A-12", name: "LỊCH SỬ A-12", x: 245, y: 110, w: 75, h: 22 },
      { id: "D-05", name: "TOÁN HỌC D-05", x: 25, y: 195, w: 75, h: 22 },
      { id: "E-07", name: "TRUYỆN TRANH E-07", x: 135, y: 195, w: 75, h: 22 },
      { id: "F-09", name: "KỸ NĂNG F-09", x: 245, y: 195, w: 75, h: 22 }
    ];

    shelves.forEach(s => {
      // Thùng gỗ kệ sách
      ctx.fillStyle = '#92400e'; // Nâu gỗ ấm
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);

      // Phông nền tối bên trong chứa gáy sách
      ctx.fillStyle = '#451a03';
      ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);

      // Vẽ các cuốn sách đủ màu sắc sặc sỡ xếp khít nhau bên trong kệ
      const bookColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#ec4899', '#f97316'];
      let curX = s.x + 4;
      let bookIdx = 0;
      while (curX < s.x + s.w - 6) {
        const bookW = 3 + (bookIdx % 3); // rộng 3-5px
        ctx.fillStyle = bookColors[(s.x + curX + bookIdx) % bookColors.length];
        ctx.fillRect(curX, s.y + 3, bookW, s.h - 6);
        curX += bookW + 1;
        bookIdx++;
      }

      // Nhãn tên kệ sách ngộ nghĩnh
      ctx.fillStyle = '#94a3b8';
      ctx.font = '7px "Press Start 2P", monospace';
      if (s.name.includes("C-01") || s.name.includes("D-05")) {
        ctx.textAlign = 'left';
        ctx.fillText(s.name, s.x, s.y - 4);
      } else if (s.name.includes("A-12") || s.name.includes("F-09")) {
        ctx.textAlign = 'right';
        ctx.fillText(s.name, s.x + s.w, s.y - 4);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(s.name, s.x + s.w/2, s.y - 4);
      }
    });

    ctx.restore();
  },

  drawRouteToShelf(book) {
    this.stopPathAnimation();
    this.selectedBook = book;
    this.pathAnimProgress = 0;

    // Bố trí lộ trình đi ngộ nghĩnh từ Kiot (245, 55) qua các hành lang tới tâm kệ sách
    const pathNodes = [];
    pathNodes.push({ x: 245, y: 55 });     // Bắt đầu từ Kiot
    pathNodes.push({ x: 227, y: 55 });     // Ra hành lang dọc phải
    
    // Tùy thuộc vào vị trí kệ để vẽ đường đi chính xác qua các hành lang
    if (book.shelf === "A-12") {
      pathNodes.push({ x: 227, y: book.shelfY });
      pathNodes.push({ x: book.shelfX, y: book.shelfY });  // Vào đúng vị trí cuốn sách kệ A-12
    } else if (book.shelf === "F-09") {
      pathNodes.push({ x: 227, y: book.shelfY });
      pathNodes.push({ x: book.shelfX, y: book.shelfY });  // Vào đúng vị trí cuốn sách kệ F-09
    } else if (book.shelf === "B-03") {
      pathNodes.push({ x: 227, y: book.shelfY });
      pathNodes.push({ x: book.shelfX, y: book.shelfY });  // Vào đúng vị trí cuốn sách kệ B-03
    } else if (book.shelf === "E-07") {
      pathNodes.push({ x: 227, y: book.shelfY });
      pathNodes.push({ x: book.shelfX, y: book.shelfY });  // Vào đúng vị trí cuốn sách kệ E-07
    } else if (book.shelf === "C-01") {
      pathNodes.push({ x: 227, y: 163 });  // Dọc xuống ngã tư hành lang giữa
      pathNodes.push({ x: 117, y: 163 });  // Ngang sang hành lang dọc trái
      pathNodes.push({ x: 117, y: book.shelfY });  // Lên ngang hàng sách
      pathNodes.push({ x: book.shelfX, y: book.shelfY });   // Vào đúng vị trí cuốn sách kệ C-01
    } else if (book.shelf === "D-05") {
      pathNodes.push({ x: 227, y: 163 });  // Dọc xuống ngã tư hành lang giữa
      pathNodes.push({ x: 117, y: 163 });  // Ngang sang hành lang dọc trái
      pathNodes.push({ x: 117, y: book.shelfY });  // Xuống ngang hàng sách
      pathNodes.push({ x: book.shelfX, y: book.shelfY });   // Vào đúng vị trí cuốn sách kệ D-05
    }

    this.currentNodes = pathNodes;

    const animateRoute = () => {
      this.drawLibraryBaseMap();
      
      const ctx = this.ctx;
      this.pathAnimProgress += 0.008; // Tốc độ di chuyển lướt mượt mà
      if (this.pathAnimProgress > 1) {
        this.pathAnimProgress = 0; 
      }

      ctx.save();
      // Phóng to lộ trình vẽ theo đúng tỉ lệ 1.2857
      ctx.scale(1.2857, 1.2857);

      // 1. Vẽ các vết chân/đốm sáng nhỏ màu cam chỉ đường nhấp nháy dọc lối đi
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(pathNodes[0].x, pathNodes[0].y);
      for (let i = 1; i < pathNodes.length; i++) {
        ctx.lineTo(pathNodes[i].x, pathNodes[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Tính toán và vẽ Đốm sáng dẫn đường chạy lấp lánh (vị trí hiện tại)
      let currentPos = this.getPositionAlongPath(pathNodes, this.pathAnimProgress);
      ctx.save();
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Đánh dấu đích đến nhấp nháy một vòng tròn lớn rực rỡ kèm mũi tên chỉ xuống tại kệ sách
      ctx.save();
      const glowScale = 12 + Math.sin(Date.now() / 100) * 3;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(book.shelfX, book.shelfY, glowScale, 0, Math.PI * 2);
      ctx.stroke();

      // Vẽ mũi tên chỉ vào kệ sách đích
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(book.shelfX, book.shelfY - glowScale - 12);
      ctx.lineTo(book.shelfX - 5, book.shelfY - glowScale - 17);
      ctx.lineTo(book.shelfX + 5, book.shelfY - glowScale - 17);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();

      this.pathAnimationId = requestAnimationFrame(animateRoute);
    };

    this.pathAnimationId = requestAnimationFrame(animateRoute);
  },

  getPositionAlongPath(nodes, t) {
    if (nodes.length < 2) return nodes[0];

    let totalLen = 0;
    const segments = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      let len = Math.hypot(nodes[i+1].x - nodes[i].x, nodes[i+1].y - nodes[i].y);
      segments.push(len);
      totalLen += len;
    }

    let targetLen = t * totalLen;
    let accumulated = 0;

    for (let i = 0; i < segments.length; i++) {
      if (accumulated + segments[i] >= targetLen) {
        let segT = (targetLen - accumulated) / segments[i];
        let p1 = nodes[i];
        let p2 = nodes[i+1];
        return {
          x: p1.x + (p2.x - p1.x) * segT,
          y: p1.y + (p2.y - p1.y) * segT
        };
      }
      accumulated += segments[i];
    }

    return nodes[nodes.length - 1];
  },

  speakText(audioFilename) {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    this.audioPlayer = new Audio(`assets/${audioFilename}`);
    this.audioPlayer.play().catch(err => console.log("Audio play blocked/failed:", err));
  }
};

