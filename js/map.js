import { GameState } from './game.js';
import { UIManager } from './ui.js';
import { BookDatabase } from './devices/libraryKiosk.js';

// Vị trí và thông tin của 6 thiết bị AI đã được phân bổ lại hợp lý
export const DeviceHotspots = [
  { id: 'attendance_device', x: 210, y: 400, radius: 40, label: '🖥️ Điểm Danh Khuôn Mặt', completed: false, desc: 'Đứng gần hoặc Click để quét khuôn mặt ngoài cổng' },
  { id: 'interactive_screen', x: 490, y: 70, radius: 40, label: '🖥️ Màn Hình Thông Minh', completed: false, desc: 'Đứng gần hoặc Click để mở trợ lý DIGI', noPedestal: true },
  { id: 'translation_pen', x: 316, y: 148, radius: 40, label: '🖊️ Bút Dịch Thuật', completed: false, desc: 'Đứng gần hoặc Click để lấy bút quét dịch', noPedestal: true },
  { id: 'library_kiosk', x: 490, y: 370, radius: 40, label: '📚 Kiot Thư Viện', completed: false, desc: 'Đứng gần hoặc Click để tra cứu sơ đồ kệ', noPedestal: true },
  { id: 'chessboard', x: 810, y: 140, radius: 40, label: '♟️ Bàn Cờ Vua', completed: false, desc: 'Đứng gần hoặc Click để đấu với Chess AI' },
  { id: 'smart_speaker', x: 620, y: 290, radius: 40, label: '🔊 Loa Thông Minh', completed: false, desc: 'Đứng gần hoặc Click để ra lệnh giọng nói ở hành lang' }
];

// Cấu hình 4 Camera AI quét
export const AICameras = [
  { id: 'cam_left', x: 262, y: 240, scanRange: 200, label: 'Camera AI Trái', baseAngle: Math.PI / 2 },
  { id: 'cam_right', x: 978, y: 240, scanRange: 200, label: 'Camera AI Phải', baseAngle: Math.PI / 2 },
  { id: 'cam_gate_left', x: 22, y: 182, scanRange: 200, label: 'Camera AI Cổng Trái', baseAngle: 0 },
  { id: 'cam_library_garden', x: 602, y: 440, scanRange: 200, label: 'Camera AI Thư Viện', baseAngle: 0 }
];

// Định nghĩa tọa độ cắt các vật phẩm từ ảnh school_assets.png (1024x1024)
const ASSET_MAP = {
  desk: { x: 70, y: 70, w: 290, h: 180 },
  chair: { x: 480, y: 70, w: 105, h: 180 },
  bookshelf1: { x: 705, y: 75, w: 220, h: 220 },
  bookshelf2: { x: 395, y: 325, w: 255, h: 305 },
  pinetree: { x: 70, y: 320, w: 265, h: 380 },
  bush_small: { x: 800, y: 360, w: 120, h: 110 },
  computer: { x: 795, y: 550, w: 125, h: 135 },
  bush_large: { x: 95, y: 780, w: 160, h: 140 },
  chessboard: { x: 395, y: 770, w: 155, h: 155 },
  camera: { x: 615, y: 795, w: 130, h: 110 },
  speaker: { x: 800, y: 795, w: 120, h: 120 }
};

// Định nghĩa dữ liệu pixel sprite dự phòng (fallback) cho nhân vật học sinh Minh 8-bit
const FALLBACK_PLAYER_SPRITES = {
  down: [
    "..tttttt..",
    ".tttttttt.",
    ".ttsssssst.",
    ".tssssssst",
    ".tseessest",
    ".tssssssst",
    "..ssssss..",
    "...cccc...",
    "..cccccc..",
    ".ccpccpcc.",
    ".cppccppc.",
    "..bbbbbb..",
    "..bb..bb..",
    "..bb..bb..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  up: [
    "..tttttt..",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    "..tttttt..",
    "..pppppp..",
    ".pppppppp.",
    ".pppppppp.",
    ".pppppppp.",
    "..bbbbbb..",
    "..bb..bb..",
    "..bb..bb..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  left: [
    "...ttttt..",
    "..ttttttt.",
    "..ttsssss.",
    "..tssssss.",
    "..tseesss.",
    "..tssssss.",
    "...sssss..",
    "...ccccc..",
    "..cccccc..",
    ".cppcccc..",
    ".cppccccc.",
    "..bbbbbb..",
    "...bb..b..",
    "...bb..b..",
    "...gg..g..",
    "...gg..g.."
  ],
  right: [
    "..ttttt...",
    ".ttttttt..",
    ".ssssstt..",
    ".sssssst..",
    ".ssseest..",
    ".sssssst..",
    "..sssss...",
    "..ccccc...",
    "..cccccc..",
    "..ccccppc.",
    ".cccccppc.",
    "..bbbbbb..",
    "..b..bb...",
    "..b..bb...",
    "..g..gg...",
    "..g..gg..."
  ]
};

const NPC_BINH_SPRITES = {
  down: [
    "..tttttt..",
    ".tttttttt.",
    ".ttsssssst.",
    ".tssssssst",
    ".tseessest",
    ".tssssssst",
    "..ssssss..",
    "...cccc...",
    "..cccccc..",
    ".ccaaccaac.",
    ".caaccaacc.",
    "..qqqqqq..",
    "..qq..qq..",
    "..qq..qq..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  up: [
    "..tttttt..",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    ".tttttttt.",
    "..tttttt..",
    "..aaaaaa..",
    ".aaaaaaaa.",
    ".aaaaaaaa.",
    ".aaaaaaaa.",
    "..qqqqqq..",
    "..qq..qq..",
    "..qq..qq..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  left: [
    "...ttttt..",
    "..ttttttt.",
    "..ttsssss.",
    "..tssssss.",
    "..tseesss.",
    "..tssssss.",
    "...sssss..",
    "...ccccc..",
    "..cccccc..",
    ".caacccc..",
    ".caaccccc.",
    "..qqqqqq..",
    "...qq..q..",
    "...qq..q..",
    "...gg..g..",
    "...gg..g.."
  ],
  right: [
    "..ttttt...",
    ".ttttttt..",
    ".ssssstt..",
    ".sssssst..",
    ".ssseest..",
    ".sssssst..",
    "..sssss...",
    "..ccccc...",
    "..cccccc..",
    "..ccccaac.",
    ".cccccaac.",
    "..qqqqqq..",
    "..q..qq...",
    "..q..qq...",
    "..g..gg...",
    "..g..gg..."
  ]
};

const NPC_AN_SPRITES = {
  down: [
    "..nttttn..",
    ".tttttttt.",
    ".ttsssssst.",
    "ttsssssstt",
    "ttseessett",
    "ttsssssstt",
    ".tsssssst.",
    "..scccss..",
    "..aaaaaa..",
    ".aaaaaaaaaa.",
    ".aaaaaaaaaa.",
    "..vvvvvv..",
    "..vv..vv..",
    "..ssssss..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  up: [
    "..nttttn..",
    ".tttttttt.",
    ".tttttttt.",
    "tttttttttt",
    "tttttttttt",
    "tttttttttt",
    "tttttttttt",
    "..aaaaaa..",
    ".aaaaaaaa.",
    ".aaaaaaaa.",
    ".aaaaaaaa.",
    "..vvvvvv..",
    "..vv..vv..",
    "..ssssss..",
    "..gg..gg..",
    "..gg..gg.."
  ],
  left: [
    "...ntttt..",
    "..ttttttt.",
    "..ttsssss.",
    "ttssssss.",
    "ttseesss.",
    "ttssssss.",
    ".tsssss..",
    "..sccccc..",
    "..aaaaaa..",
    ".aaaaccc..",
    ".aaaacccc.",
    "..vvvvvv..",
    "...vv..v..",
    "...ss..s..",
    "...gg..g..",
    "...gg..g.."
  ],
  right: [
    "..ttttn...",
    ".ttttttt..",
    ".ssssstt..",
    ".sssssstt.",
    ".ssseestt.",
    ".sssssstt.",
    "..ssssst..",
    "..ccccc...",
    "..aaaaaa..",
    "..cccaaaa.",
    ".ccccaaaa.",
    "..vvvvvv..",
    "..v..vv...",
    "..s..ss...",
    "..g..gg...",
    "..g..gg..."
  ]
};

export const MapManager = {
  canvas: null,
  ctx: null,
  keys: {},
  joystickInput: { x: 0, y: 0 },
  pulseAnim: 0,
  activeHotspot: null,
  gridOffset: 0,
  audioPlayer: null,
  bookBubbleTimer: null,
  
  // Khai báo quản lý tải ảnh
  sprites: {
    player: null,
    binh: null,
    an: null,
    dung: null,
    lan: null,
    vy: null,
    objects: null,
    loaded: false
  },
  npcs: [],
  
  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Tắt khử răng cưa để tạo nét pixel art 8-bit sắc nét khi scale ảnh
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    // Khởi tạo 5 NPC di chuyển ngẫu nhiên
    this.npcs = [
      {
        id: 'npc_minh_green',
        x: 350,
        y: 280, // Hành lang trung tâm
        speed: 1.2, // Tốc độ di chuyển vừa phải tự nhiên
        direction: 'down',
        isMoving: true,
        moveTimer: 0
      },
      {
        id: 'npc_minh_purple',
        x: 100,
        y: 320, // Ngoài sân trường
        speed: 1.2,
        direction: 'right',
        isMoving: true,
        moveTimer: 0
      },
      {
        id: 'npc_dung',
        x: 750,
        y: 450, // Khu vườn sinh thái
        speed: 1.2,
        direction: 'left',
        isMoving: true,
        moveTimer: 0
      },
      {
        id: 'npc_lan',
        x: 550,
        y: 280, // Hành lang
        speed: 1.2,
        direction: 'up',
        isMoving: true,
        moveTimer: 0
      },
      {
        id: 'npc_vy',
        x: 820,
        y: 180, // Phòng cờ vua
        speed: 1.2,
        direction: 'down',
        isMoving: true,
        moveTimer: 0
      }
    ];
    
    // Tải trực tiếp ảnh PNG trong suốt đã được xử lý trên máy chủ
    let loadedCount = 0;
    const onLoadAsset = () => {
      loadedCount++;
      if (loadedCount === 7) { // 4 ảnh cũ + 3 ảnh học sinh mới
        this.sprites.loaded = true;
      }
    };
    
    const playerImg = new Image();
    playerImg.src = 'assets/student_minh.png';
    playerImg.onload = () => {
      this.sprites.player = playerImg;
      onLoadAsset();
    };
    playerImg.onerror = (err) => {
      console.error("Error loading student asset", err);
    };

    const binhImg = new Image();
    binhImg.src = 'assets/student_binh.png';
    binhImg.onload = () => {
      this.sprites.binh = binhImg;
      onLoadAsset();
    };
    binhImg.onerror = (err) => {
      console.error("Error loading student binh asset", err);
    };

    const anImg = new Image();
    anImg.src = 'assets/student_an.png';
    anImg.onload = () => {
      this.sprites.an = anImg;
      onLoadAsset();
    };
    anImg.onerror = (err) => {
      console.error("Error loading student an asset", err);
    };

    const dungImg = new Image();
    dungImg.src = 'assets/student_dung.png';
    dungImg.onload = () => {
      this.sprites.dung = dungImg;
      onLoadAsset();
    };
    dungImg.onerror = (err) => {
      console.error("Error loading student dung asset", err);
    };

    const lanImg = new Image();
    lanImg.src = 'assets/student_lan.png';
    lanImg.onload = () => {
      this.sprites.lan = lanImg;
      onLoadAsset();
    };
    lanImg.onerror = (err) => {
      console.error("Error loading student lan asset", err);
    };

    const vyImg = new Image();
    vyImg.src = 'assets/student_vy.png';
    vyImg.onload = () => {
      this.sprites.vy = vyImg;
      onLoadAsset();
    };
    vyImg.onerror = (err) => {
      console.error("Error loading student vy asset", err);
    };
    
    const objectsImg = new Image();
    objectsImg.src = 'assets/school_assets.png';
    objectsImg.onload = () => {
      this.sprites.objects = objectsImg;
      onLoadAsset();
    };
    objectsImg.onerror = (err) => {
      console.error("Error loading school assets", err);
    };
    
    // Đăng ký sự kiện bàn phím
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' || e.key === ' ') {
        this.triggerNearDevice();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Cho phép chạm hoặc click trực tiếp lên Hotspot hoặc kệ sách định vị để tương tác
    const handleDeviceClick = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = ((clientX - rect.left) / rect.width) * this.canvas.width;
      const clickY = ((clientY - rect.top) / rect.height) * this.canvas.height;

      console.log(`Canvas click/touch at coordinates: X=${clickX.toFixed(1)}, Y=${clickY.toFixed(1)}`);

      // 1. Kiểm tra chạm/click trực tiếp vào từng cuốn sách (Trái/Giữa/Phải) của 6 kệ sách khi nhân vật đứng gần
      for (let book of BookDatabase) {
        // Kiểm tra khoảng cách Y (rơi vào kệ sách cao 22px)
        if (Math.abs(clickY - book.largeY) <= 11) {
          // Kiểm tra khoảng cách X (rơi vào cuốn sách rộng ~23px, từ tâm ra là 11px)
          if (Math.abs(clickX - book.largeX) <= 11) {
            const player = GameState.player;
            const distToPlayer = Math.hypot(player.x - book.largeX, player.y - book.largeY);
            
            // Chỉ tương tác khi nhân vật Minh đứng gần kệ sách (<= 60px)
            if (distToPlayer <= 60) {
              if (book.status === 'available') {
                GameState.selectedLibraryBook = book;
                GameState.showBookBubble = true;
                console.log(`Bấm trúng sách: ${book.title}`);
                
                // Tự động ẩn bong bóng sau 4 giây
                if (this.bookBubbleTimer) clearTimeout(this.bookBubbleTimer);
                this.bookBubbleTimer = setTimeout(() => {
                  GameState.showBookBubble = false;
                }, 4000);
              } else {
                // Sách đã mượn ngoài map: Không bubble, không voice
                GameState.showBookBubble = false;
                GameState.selectedLibraryBook = null;
                console.log(`Sách đã bị mượn ngoài map: ${book.title} (không hiện bubble, không phát voice)`);
              }
              return true; // Ngăn không cho click lan sang các hotspot khác
            }
          }
        }
      }

      for (let hotspot of DeviceHotspots) {
        let dist = Math.hypot(clickX - hotspot.x, clickY - hotspot.y);
        if (dist < hotspot.radius) {
          console.log(`Tương tác thiết bị: ${hotspot.id}`);
          UIManager.openDevice(hotspot.id);
          return true;
        }
      }
      return false;
    };

    this.canvas.addEventListener('click', (e) => {
      handleDeviceClick(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const handled = handleDeviceClick(touch.clientX, touch.clientY);
        if (handled) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    this.initJoystick();
  },

  initJoystick() {
    const container = document.getElementById('virtual-joystick-container');
    const knob = document.getElementById('virtual-joystick-knob');
    if (!container || !knob) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    const maxRadius = 30; // Giới hạn kéo của joystick knob để gọn gàng phù hợp với học sinh

    this.joystickInput = { x: 0, y: 0 };

    const handleStart = (clientX, clientY) => {
      dragging = true;
      const rect = knob.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      knob.style.transition = 'none';
    };

    const handleMove = (clientX, clientY) => {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const distance = Math.hypot(dx, dy);

      let angle = Math.atan2(dy, dx);
      let moveX = dx;
      let moveY = dy;

      if (distance > maxRadius) {
        moveX = Math.cos(angle) * maxRadius;
        moveY = Math.sin(angle) * maxRadius;
      }

      knob.style.transform = `translate(${moveX}px, ${moveY}px)`;

      const limitDistance = Math.min(distance, maxRadius);
      this.joystickInput.x = (Math.cos(angle) * limitDistance) / maxRadius;
      this.joystickInput.y = (Math.sin(angle) * limitDistance) / maxRadius;
    };

    const handleEnd = () => {
      if (!dragging) return;
      dragging = false;
      knob.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      knob.style.transform = 'translate(0px, 0px)';
      this.joystickInput = { x: 0, y: 0 };
    };

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (dragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', handleEnd, { passive: true });

    container.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (dragging) {
        handleMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', handleEnd);
  },

  // Vẽ hình ảnh từ file asset và trả về true nếu thành công
  drawAsset(ctx, key, dx, dy, dw, dh) {
    if (this.sprites.loaded && this.sprites.objects) {
      const asset = ASSET_MAP[key];
      if (asset) {
        ctx.drawImage(this.sprites.objects, asset.x, asset.y, asset.w, asset.h, dx, dy, dw, dh);
        return true;
      }
    }
    return false;
  },

  markDeviceCompleted(id) {
    const hotspot = DeviceHotspots.find(h => h.id === id);
    if (hotspot) hotspot.completed = true;
  },

  update() {
    const player = GameState.player;
    let dx = 0;
    let dy = 0;

    // Giảm tốc độ di chuyển khi sử dụng joystick cảm ứng (để trẻ em dễ kiểm soát)
    const isKeyboardActive = (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] || this.keys['arrowup'] || this.keys['arrowdown'] || this.keys['arrowleft'] || this.keys['arrowright']);
    const speed = (!isKeyboardActive && (Math.abs(this.joystickInput.x) > 0.1 || Math.abs(this.joystickInput.y) > 0.1)) ? (player.speed * 0.55) : player.speed;

    // Lấy tín hiệu điều khiển
    if (this.keys['w'] || this.keys['arrowup'] || this.joystickInput.y < -0.3) { dy = -speed; player.direction = 'up'; }
    if (this.keys['s'] || this.keys['arrowdown'] || this.joystickInput.y > 0.3) { dy = speed; player.direction = 'down'; }
    if (this.keys['a'] || this.keys['arrowleft'] || this.joystickInput.x < -0.3) { dx = -speed; player.direction = 'left'; }
    if (this.keys['d'] || this.keys['arrowright'] || this.joystickInput.x > 0.3) { dx = speed; player.direction = 'right'; }

    player.isMoving = (dx !== 0 || dy !== 0);

    // Tính toán vị trí mới tạm thời
    let newX = player.x + dx;
    let newY = player.y + dy;

    // Kiểm tra va chạm với tường giới hạn bản đồ trường học
    if (this.checkCollision(newX, newY)) {
      // Cho phép trượt dọc theo tường
      if (!this.checkCollision(newX, player.y)) {
        player.x = newX;
      } else if (!this.checkCollision(player.x, newY)) {
        player.y = newY;
      }
    } else {
      player.x = newX;
      player.y = newY;
    }

    // Tăng biến hoạt ảnh nhấp nháy cho vòng sáng hotspot
    this.pulseAnim += 0.08;
    if (player.isMoving) {
      this.gridOffset = (this.gridOffset - 0.8) % 16;
    }

    // Cập nhật NPC di chuyển random mượt mà không bị giật cục
    if (this.npcs) {
      this.npcs.forEach(npc => {
        npc.moveTimer--;
        
        // Chọn hướng mới nếu hết thời gian đi thẳng hoặc bị va chạm ở bước tiếp theo
        let needsNewDirection = (npc.moveTimer <= 0);

        if (npc.isMoving) {
          let ndx = 0;
          let ndy = 0;
          if (npc.direction === 'up') ndy = -npc.speed;
          else if (npc.direction === 'down') ndy = npc.speed;
          else if (npc.direction === 'left') ndx = -npc.speed;
          else if (npc.direction === 'right') ndx = npc.speed;

          let newNpcX = npc.x + ndx;
          let newNpcY = npc.y + ndy;

          // Kiểm tra va chạm ở bước tiếp theo
          if (this.checkCollision(newNpcX, newNpcY)) {
            needsNewDirection = true;
          } else {
            npc.x = newNpcX;
            npc.y = newNpcY;
          }
        }

        if (needsNewDirection) {
          const directions = ['up', 'down', 'left', 'right'];
          const validDirs = [];
          
          // Thử kiểm tra trước 4 bước chân để đảm bảo hướng đi thông thoáng
          for (let d of directions) {
            let ndx = 0;
            let ndy = 0;
            if (d === 'up') ndy = -npc.speed;
            else if (d === 'down') ndy = npc.speed;
            else if (d === 'left') ndx = -npc.speed;
            else if (d === 'right') ndx = npc.speed;
            
            if (!this.checkCollision(npc.x + ndx * 4, npc.y + ndy * 4)) {
              validDirs.push(d);
            }
          }
          
          // Nếu không tìm được hướng 4 bước trống, kiểm tra 1 bước chân
          if (validDirs.length === 0) {
            for (let d of directions) {
              let ndx = 0;
              let ndy = 0;
              if (d === 'up') ndy = -npc.speed;
              else if (d === 'down') ndy = npc.speed;
              else if (d === 'left') ndx = -npc.speed;
              else if (d === 'right') ndx = npc.speed;
              
              if (!this.checkCollision(npc.x + ndx, npc.y + ndy)) {
                validDirs.push(d);
              }
            }
          }
          
          if (validDirs.length > 0) {
            // Ưu tiên giữ hướng cũ nếu hướng đó vẫn đi được (giúp đi thẳng tự nhiên hơn)
            const oldDir = npc.direction;
            if (oldDir !== 'none' && validDirs.includes(oldDir) && Math.random() < 0.75) {
              npc.direction = oldDir;
            } else {
              // Chọn ngẫu nhiên hướng đi được khác
              npc.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
            npc.isMoving = true;
            npc.moveTimer = 120 + Math.floor(Math.random() * 120); // Đi thẳng 2-4 giây
          } else {
            // Nếu bị kẹt hoàn toàn, đứng yên nghỉ ngơi thay vì tìm hướng liên tục gây giật
            npc.direction = 'none';
            npc.isMoving = false;
            npc.moveTimer = 60 + Math.floor(Math.random() * 60); // Đứng nghỉ 1-2 giây
          }
        }
      });
    }

    // Kiểm tra xem Player có đi lại gần camera AI nào không (khoảng cách lại gần thực tế < 90px)
    this.playerInCameraZone = false;
    for (let cam of AICameras) {
      let dist = Math.hypot(player.x - cam.x, player.y - cam.y);
      if (dist < 90) {
        this.playerInCameraZone = true;
        break;
      }
    }

    // Kiểm tra xem có đứng gần thiết bị nào không
    this.activeHotspot = null;
    for (let hotspot of DeviceHotspots) {
      let dist = Math.hypot(player.x - hotspot.x, player.y - hotspot.y);
      if (dist < hotspot.radius + 15) {
        this.activeHotspot = hotspot;
        break;
      }
    }

    // Tự động ẩn bong bóng nếu di chuyển đi xa khỏi cuốn sách đang tìm kiếm
    const book = GameState.selectedLibraryBook;
    if (book && GameState.showBookBubble) {
      const dist = Math.hypot(player.x - book.largeX, player.y - book.largeY);
      if (dist > 50) {
        GameState.showBookBubble = false;
        console.log("Di chuyển ra xa, tự động ẩn bong bóng sách.");
      }
    }
  },

  // Hệ thống chặn va chạm (Wall/Room Boundaries)
  checkCollision(x, y) {
    const margin = 15;
    
    // Giới hạn biên ngoài bản đồ trường học
    if (x < margin || x > 1024 - margin || y < 50 || y > 576 - margin) {
      return true;
    }

    // 1. Chặn đi xuyên tường ngang y = 240 (Ngăn phòng học trên và hành lang)
    if (y >= 236 && y <= 244) {
      // Nếu nằm trong khoảng ngang của Lớp học 6A (x: 260->600) nhưng NẰM NGOÀI cửa lớp (x: 480->540)
      if (x >= 260 && x <= 600 && (x < 480 || x > 540)) {
        return true; 
      }
      // Nếu nằm trong khoảng ngang của Phòng cờ (x: 640->980) nhưng NẰM NGOÀI cửa phòng cờ (x: 760->820)
      if (x >= 640 && x <= 980 && (x < 760 || x > 820)) {
        return true; 
      }
    }

    // 2. Chặn đi xuyên tường ngang y = 340 (Ngăn thư viện dưới và hành lang)
    if (y >= 336 && y <= 344) {
      // Nếu nằm trong khoảng ngang của Thư viện (x: 260->600) nhưng NẰM NGOÀI cửa thư viện (x: 360->420)
      if (x >= 260 && x <= 600 && (x < 360 || x > 420)) {
        return true; 
      }
    }

    // Vùng phòng hợp lệ (Chồng chéo nhẹ ở ranh giới Y để đi qua cửa trơn tru)
    const inSanTruoc = (x >= 20 && x <= 250 && y >= 240 && y <= 480);
    const inHanhLang = (x >= 240 && x <= 980 && y >= 235 && y <= 345);
    const inLop6A = (x >= 260 && x <= 600 && y >= 50 && y <= 245);
    const inPhongCo = (x >= 640 && x <= 980 && y >= 50 && y <= 245);
    const inThuVien = (x >= 260 && x <= 600 && y >= 335 && y <= 550);
    const inKhuVuon = (x >= 640 && x <= 980 && y >= 335 && y <= 550);

    if (inSanTruoc || inHanhLang || inLop6A || inPhongCo || inThuVien || inKhuVuon) {
      return false; 
    }
    
    return true; // Va chạm tường
  },

  triggerNearDevice() {
    if (this.activeHotspot) {
      UIManager.openDevice(this.activeHotspot.id);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Vẽ sơ đồ sàn các phòng học và sân cỏ 8-bit retro
    this.drawFloorPlan();

    // 2. Vẽ 2 camera AI quét 180 độ (nón quét vẽ dưới chân player để player đi đè lên)
    this.drawAICameras();

    // 3. Vẽ các vòng phát sáng AI Device Hotspots dạng retro sparkles
    this.drawHotspots();

    // 4. Vẽ Avatar nhân vật Minh dạng Pixel Art
    this.drawPlayer();

    // 4.5. Vẽ các NPC di chuyển random
    this.drawNPCs();

    // 5. Vẽ bong bóng thoại phát hiện chuyển động nếu có (vẽ trên đầu camera khi phát hiện người)
    this.drawAICameraBubbles();

    // 6. Vẽ bảng chỉ dẫn tương tác dạng NES HUD
    this.drawInteractPrompt();

    // 6.5. Vẽ bong bóng thoại cho cuốn sách được tra cứu khi người chơi đứng gần
    this.drawSelectedBookBubble();
  },

  // Vẽ sàn gạch/gỗ pixel của từng phòng
  drawPixelFloor(x, y, w, h, type) {
    const ctx = this.ctx;
    ctx.save();
    
    if (type === 'foyer') {
      // Sàn gạch đá sảnh đón tiếp xám nhạt
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#95a5a6';
      ctx.lineWidth = 2;
      for (let px = x; px < x + w; px += 24) {
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + h);
        ctx.stroke();
      }
      for (let py = y; py < y + h; py += 16) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
    } else if (type === 'classroom') {
      // Sàn gỗ phòng học màu beige
      ctx.fillStyle = '#eed7a1';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#c6a469';
      ctx.lineWidth = 1.5;
      for (let py = y + 12; py < y + h; py += 12) {
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x + w, py);
        ctx.stroke();
      }
      for (let py = y; py < y + h; py += 12) {
        let shift = (py % 24 === 0) ? 20 : 40;
        for (let px = x + shift; px < x + w; px += 60) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + 12);
          ctx.stroke();
        }
      }
    } else if (type === 'corridor') {
      // Sàn gạch ca-rô hành lang màu cam đất/vàng cát
      for (let px = x; px < x + w; px += 16) {
        for (let py = y; py < y + h; py += 16) {
          ctx.fillStyle = ((Math.floor(px / 16) + Math.floor(py / 16)) % 2 === 0) ? '#e28743' : '#eab676';
          ctx.fillRect(px, py, Math.min(16, x + w - px), Math.min(16, y + h - py));
        }
      }
    } else if (type === 'library') {
      // Thảm xanh lam thư viện
      ctx.fillStyle = '#2b6cb0';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#2c5282';
      for (let px = x + 8; px < x + w; px += 16) {
        for (let py = y + 8; py < y + h; py += 16) {
          ctx.fillRect(px, py, 2, 2);
          ctx.fillRect(px + 4, py + 4, 2, 2);
        }
      }
    } else if (type === 'chess') {
      // Gạch ca-rô trắng đen phòng cờ vua
      for (let px = x; px < x + w; px += 20) {
        for (let py = y; py < y + h; py += 20) {
          ctx.fillStyle = ((Math.floor(px / 20) + Math.floor(py / 20)) % 2 === 0) ? '#f7fafc' : '#4a5568';
          ctx.fillRect(px, py, Math.min(20, x + w - px), Math.min(20, y + h - py));
        }
      }
    } else if (type === 'stem') {
      // Sàn phòng STEM màu xám điện tử
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x, y, w, h);
      
      ctx.strokeStyle = '#4299e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Vẽ mạch điện tử 8-bit
      ctx.moveTo(x + 30, y + 40);
      ctx.lineTo(x + 100, y + 40);
      ctx.lineTo(x + 120, y + 70);
      
      ctx.moveTo(x + w - 40, y + h - 40);
      ctx.lineTo(x + w - 40, y + h - 80);
      ctx.lineTo(x + w - 70, y + h - 110);
      ctx.stroke();
      
      // Node mạch điện tử
      ctx.fillStyle = '#48bb78';
      ctx.beginPath();
      ctx.arc(x + 100, y + 40, 3, 0, Math.PI * 2);
      ctx.arc(x + 120, y + 70, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 70, y + h - 110, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // Vẽ tường gạch đỏ retro dày dặn
  drawBrickWall(x1, y1, x2, y2) {
    const ctx = this.ctx;
    ctx.save();
    
    // Viền đen ngoài tường gạch
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Lõi gạch đỏ
    ctx.strokeStyle = '#c53030';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Vân mạch gạch sáng và đen
    ctx.strokeStyle = '#e53e3e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (y1 === y2) {
      // Tường ngang
      ctx.moveTo(x1, y1 - 1);
      ctx.lineTo(x2, y1 - 1);
      ctx.stroke();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let x = Math.min(x1, x2) + 12; x < Math.max(x1, x2); x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y1 - 3);
        ctx.lineTo(x, y1 + 3);
        ctx.stroke();
      }
    } else if (x1 === x2) {
      // Tường dọc
      ctx.moveTo(x1 - 1, y1);
      ctx.lineTo(x1 - 1, y2);
      ctx.stroke();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let y = Math.min(y1, y2) + 10; y < Math.max(y1, y2); y += 12) {
        ctx.beginPath();
        ctx.moveTo(x1 - 3, y);
        ctx.lineTo(x1 + 3, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  // Vẽ cây thông bằng ảnh asset (hoặc fallback bằng code)
  drawPixelTree(ctx, x, y) {
    ctx.save();
    // Thử vẽ bằng asset cây thông chất lượng cao
    if (this.drawAsset(ctx, 'pinetree', x - 20, y - 44, 40, 56)) {
      ctx.restore();
      return;
    }
    
    // Fallback vẽ bằng code cũ
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 3, y, 6, 12);
    ctx.fillStyle = '#000000';
    ctx.strokeRect(x - 3, y, 6, 12);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.lineTo(x - 16, y - 8); ctx.lineTo(x + 16, y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x - 12, y); ctx.lineTo(x + 12, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  // Vẽ bụi cây bằng ảnh asset (hoặc fallback bằng code)
  drawPixelBush(ctx, x, y, isLarge = false) {
    ctx.save();
    const key = isLarge ? 'bush_large' : 'bush_small';
    const sizeW = isLarge ? 28 : 22;
    const sizeH = isLarge ? 24 : 20;
    
    if (this.drawAsset(ctx, key, x - sizeW/2, y - sizeH/2, sizeW, sizeH)) {
      ctx.restore();
      return;
    }

    // Fallback vẽ bằng code cũ
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 11, y - 7, 22, 14);
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(x - 10, y - 6, 20, 12);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(x - 8, y - 8, 16, 10);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x - 4, y - 10, 8, 4);
    ctx.restore();
  },

  // Vẽ khóm hoa pixel
  drawPixelFlower(ctx, x, y, color) {
    ctx.save();
    ctx.fillStyle = '#1b5e20'; // Cuống lá xanh
    ctx.fillRect(x - 1, y, 2, 4);
    ctx.fillStyle = color; // Cánh hoa màu sắc
    ctx.fillRect(x - 2, y - 3, 4, 3);
    ctx.fillStyle = '#ffffff'; // Nhụy hoa trắng
    ctx.fillRect(x - 1, y - 2, 2, 1);
    ctx.restore();
  },

  // Vẽ bàn cờ thi đấu thường cho 2 người chơi
  drawRegularChessTable(ctx, x, y) {
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#000000';

    // Bàn gỗ
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x - 16, y - 8, 32, 16);
    ctx.strokeRect(x - 16, y - 8, 32, 16);

    // Bàn cờ nhỏ ở giữa mặt bàn (ca-rô trắng đen)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.strokeRect(x - 6, y - 6, 12, 12);
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x - 6, y - 6, 6, 6);
    ctx.fillRect(x, y, 6, 6);

    // Hai ghế hai bên
    if (!this.drawAsset(ctx, 'chair', x - 30, y - 8, 12, 16)) {
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(x - 28, y - 7, 10, 14);
      ctx.strokeRect(x - 28, y - 7, 10, 14);
    }
    if (!this.drawAsset(ctx, 'chair', x + 18, y - 8, 12, 16)) {
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(x + 18, y - 7, 10, 14);
      ctx.strokeRect(x + 18, y - 7, 10, 14);
    }

    ctx.restore();
  },

  drawFloorPlan() {
    const ctx = this.ctx;

    // 1. Vẽ nền cỏ xanh tươi sáng của sân trường
    ctx.fillStyle = '#7ac74c';
    ctx.fillRect(0, 0, 1024, 576);

    // Vẽ vân cỏ pixel mờ ảo
    ctx.fillStyle = '#6ab83c';
    for (let x = 8; x < 1024; x += 32) {
      for (let y = 8; y < 576; y += 32) {
        let rx = x + (Math.sin(x * y) * 8);
        let ry = y + (Math.cos(x + y) * 8);
        ctx.fillRect(rx, ry, 2, 2);
      }
    }

    // 2. Vẽ sàn gạch các phòng học và hành lang
    this.drawPixelFloor(260, 50, 340, 190, 'classroom');   // LỚP HỌC 6A
    this.drawPixelFloor(240, 240, 740, 90, 'corridor');     // HÀNH LANG KẾT NỐI
    this.drawPixelFloor(260, 330, 340, 220, 'library');     // THƯ VIỆN THÔNG MINH
    this.drawPixelFloor(640, 50, 340, 190, 'classroom');     // PHÒNG CỜ VUA (đổi từ gạch caro sang sàn gỗ)
    
    // Lối đi lát gạch ngoài trời ở cổng trường (Sân trước) hình chữ L nối vào hành lang
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(20, 330, 220, 120); // Đoạn ngang
    ctx.fillRect(160, 240, 80, 90);  // Đoạn dọc nối lên hành lang (mở rộng chiều ngang từ 40 lên 80)

    // Vẽ viền gạch xám đậm cho lối đi chữ L
    ctx.fillStyle = '#94a3b8';
    // Viền ngang dưới (y = 450, x: 20 -> 240)
    for (let px = 20; px < 240; px += 16) {
      ctx.fillRect(px, 450, 16, 2);
    }
    // Viền ngang trên bên trái (y = 330, x: 20 -> 160)
    for (let px = 20; px < 160; px += 16) {
      ctx.fillRect(px, 330, 16, 2);
    }
    // Viền ngang trên của đoạn nối (y = 240, x: 160 -> 240)
    for (let px = 160; px < 240; px += 16) {
      ctx.fillRect(px, 240, 16, 2);
    }
    // Viền dọc bên trái cổng (x = 20, y: 330 -> 450)
    for (let py = 330; py < 450; py += 16) {
      ctx.fillRect(20, py, 2, 16);
    }
    // Viền dọc bên phải dưới (x = 240, y: 330 -> 450)
    for (let py = 330; py < 450; py += 16) {
      ctx.fillRect(240, py, 2, 16);
    }
    // Viền dọc bên trái của đoạn nối (x = 160, y: 240 -> 330)
    for (let py = 240; py < 330; py += 16) {
      ctx.fillRect(160, py, 2, 16);
    }

    // 3. Vẽ các bức tường gạch đỏ bao quanh phòng học
    // Tường biên ngoài trường học
    this.drawBrickWall(260, 50, 600, 50);       // Tường trên Lớp 6A
    this.drawBrickWall(640, 50, 980, 50);       // Tường trên Phòng cờ
    this.drawBrickWall(260, 550, 600, 550);     // Tường dưới Thư viện
    
    // Tường biên dọc bên trái ranh giới ngoài sân trường ngoài cổng (như hình người dùng gửi)
    this.drawBrickWall(20, 50, 20, 314);        // Biên dọc trái trên
    this.drawBrickWall(20, 448, 20, 550);       // Biên dọc trái dưới

    // Tường dọc biên trái của các phòng
    this.drawBrickWall(260, 50, 260, 240);      // Dọc trái Lớp 6A
    this.drawBrickWall(260, 330, 260, 550);     // Dọc trái Thư viện

    // Tường dọc biên phải của các phòng
    this.drawBrickWall(600, 50, 600, 240);      // Dọc phải Lớp 6A
    this.drawBrickWall(640, 50, 640, 240);      // Dọc trái Phòng cờ
    this.drawBrickWall(980, 50, 980, 240);      // Dọc phải Phòng cờ
    this.drawBrickWall(600, 330, 600, 550);     // Dọc phải Thư viện

    // Tường ngang ngăn cách phòng với hành lang (chừa cửa)
    this.drawBrickWall(260, 240, 480, 240);     // Ngăn Lớp 6A (phần trái)
    this.drawBrickWall(540, 240, 600, 240);     // Ngăn Lớp 6A (phần phải, cửa x:480-540)
    
    this.drawBrickWall(640, 240, 760, 240);     // Ngăn Phòng cờ (phần trái)
    this.drawBrickWall(820, 240, 980, 240);     // Ngăn Phòng cờ (phần phải, cửa x:760-820)

    this.drawBrickWall(260, 330, 360, 330);     // Ngăn Thư viện (phần trái)
    this.drawBrickWall(420, 330, 600, 330);     // Ngăn Thư viện (phần phải, cửa x:360-420)

    // 4. Vẽ hai cột cổng trường học pixel art ngoài sân
    // Cột cổng trên
    ctx.fillStyle = '#000000';
    ctx.fillRect(16, 314, 16, 18);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(18, 316, 12, 14);
    ctx.fillStyle = '#f1c40f'; // Đèn cổng vàng
    ctx.fillRect(23, 310, 2, 4);

    // Cột cổng dưới
    ctx.fillStyle = '#000000';
    ctx.fillRect(16, 448, 16, 18);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(18, 450, 12, 14);
    ctx.fillStyle = '#f1c40f'; // Đèn cổng vàng
    ctx.fillRect(23, 444, 2, 4);

    // 5. Vẽ bàn ghế lớp học 6A (x: 260->600, y: 50->240)
    for (let bx = 300; bx <= 480; bx += 60) {
      if (!this.drawAsset(ctx, 'desk', bx, 158, 32, 20)) {
        // Fallback bàn
        ctx.fillStyle = '#8b5a2b'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.fillRect(bx, 162, 32, 16); ctx.strokeRect(bx, 162, 32, 16);
      }
      if (!this.drawAsset(ctx, 'chair', bx + 8, 180, 16, 18)) {
        // Fallback ghế
        ctx.fillStyle = '#a0522d'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.fillRect(bx + 6, 185, 20, 10); ctx.strokeRect(bx + 6, 185, 20, 10);
      }
    }
    
    // Bảng đen lớp học treo trên tường
    ctx.fillStyle = '#000000';
    ctx.fillRect(360, 52, 80, 16);
    ctx.fillStyle = '#1e3d2f'; // Bảng xanh lá cây
    ctx.fillRect(362, 54, 76, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(380, 60, 3, 2);
    ctx.fillRect(390, 58, 6, 1);

    // 6. Vẽ giá sách thư viện (x: 260->600, y: 340->550) xếp ngay ngắn ở phía dưới phòng (6 kệ)
    const bookshelves = [
      { x: 280, y: 430 }, { x: 395, y: 430 }, { x: 510, y: 430 },
      { x: 280, y: 490 }, { x: 395, y: 490 }, { x: 510, y: 490 }
    ];
    bookshelves.forEach(b => {
      if (!this.drawAsset(ctx, 'bookshelf2', b.x, b.y, 70, 22)) {
        // Fallback giá sách
        ctx.fillStyle = '#8b5a2b'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
        ctx.fillRect(b.x, b.y, 70, 14); ctx.strokeRect(b.x, b.y, 70, 14);
        
        const bookColors = ['#e53e3e', '#3182ce', '#dd6b20', '#38a169', '#d69e2e'];
        let currentX = b.x + 4;
        while (currentX < b.x + 64) {
          let bookW = 3 + Math.floor(Math.random() * 3);
          ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
          ctx.fillRect(currentX, b.y + 2, bookW, 10);
          currentX += bookW + 1;
        }
      }
    });

    // Bàn đọc sách thư viện lớn (Bàn thủ thư được dời lên gần cửa bên trái, hạ thấp xuống để tránh đè chữ)
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(285, 385, 50, 24);
    ctx.strokeRect(285, 385, 50, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(297, 392, 10, 8); // Sách trên bàn
    ctx.fillStyle = '#000000';
    ctx.fillRect(302, 392, 1, 8); // Gáy sách

    // 7. Bàn cờ thi đấu thường và ghế ngồi trong phòng cờ vua (x: 640->980, y: 50->240)
    // Ghế cho bàn cờ thông minh ở giữa (x: 810, y: 140)
    if (!this.drawAsset(ctx, 'chair', 780, 138, 14, 16)) {
      ctx.fillStyle = '#5c3a21'; ctx.fillRect(780, 140, 14, 14); ctx.strokeRect(780, 140, 14, 14);
    }
    if (!this.drawAsset(ctx, 'chair', 840, 138, 14, 16)) {
      ctx.fillStyle = '#5c3a21'; ctx.fillRect(840, 140, 14, 14); ctx.strokeRect(840, 140, 14, 14);
    }

    // Vẽ thêm 4 bàn cờ thi đấu thường xung quanh tạo không khí CLB cờ thực tế
    this.drawRegularChessTable(ctx, 710, 95);
    this.drawRegularChessTable(ctx, 710, 185);
    this.drawRegularChessTable(ctx, 910, 95);
    this.drawRegularChessTable(ctx, 910, 185);

    // 8. Trang trí Khu vườn sinh thái mở rộng (x: 640->980, y: 340->550)
    // Vẽ hàng rào gỗ ngăn cách khu vườn với bên ngoài ở biên dưới
    ctx.fillStyle = '#a0522d';
    for (let rx = 640; rx <= 980; rx += 20) {
      ctx.fillRect(rx, 550, 6, 8); // Cọc rào đứng
      ctx.fillRect(rx, 552, 20, 2); // Rào ngang
    }
    // Ghế gỗ ngắm cảnh trong khu vườn
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(800, 470, 40, 14);
    ctx.strokeRect(800, 470, 40, 14);
    ctx.fillRect(800, 470, 4, 10); // Chân ghế
    ctx.fillRect(836, 470, 4, 10);

    // 9. Vẽ cây xanh, bụi cây ngoài sân vườn trường
    // Cây vườn ngoài sân phía trên cổng trường (di dời từ khe hẹp)
    this.drawPixelTree(ctx, 80, 110);
    this.drawPixelTree(ctx, 160, 150);
    this.drawPixelBush(ctx, 110, 190);
    this.drawPixelFlower(ctx, 70, 150, '#e53e3e');
    this.drawPixelFlower(ctx, 150, 110, '#f7d51d');

    // Cây vườn sinh thái dưới (rất tươi mát)
    this.drawPixelTree(ctx, 700, 380);
    this.drawPixelTree(ctx, 880, 390);
    this.drawPixelTree(ctx, 780, 500);
    this.drawPixelTree(ctx, 920, 490);
    
    this.drawPixelBush(ctx, 660, 420);
    this.drawPixelBush(ctx, 840, 410);
    this.drawPixelBush(ctx, 940, 420);
    this.drawPixelBush(ctx, 720, 520);
    this.drawPixelBush(ctx, 880, 520);
    
    this.drawPixelFlower(ctx, 680, 450, '#ed64a6');
    this.drawPixelFlower(ctx, 860, 440, '#f7d51d');
    this.drawPixelFlower(ctx, 740, 480, '#e53e3e');
    this.drawPixelFlower(ctx, 900, 470, '#38a169');

    // Cây cối ở khu vực cổng trường góc trái dưới
    this.drawPixelBush(ctx, 50, 490, true);
    this.drawPixelBush(ctx, 160, 500);
    this.drawPixelFlower(ctx, 60, 510, '#e53e3e');
    this.drawPixelFlower(ctx, 150, 490, '#f7d51d');

    // Vẽ nhãn kỹ thuật retro cho các phòng
    const roomLabels = [
      { name: 'CỔNG TRƯỜNG', x: 50, y: 310 },
      { name: 'LỚP HỌC 6A', x: 290, y: 75 },
      { name: 'HÀNH LANG TRUNG TÂM', x: 260, y: 265 },
      { name: 'THƯ VIỆN THÔNG MINH', x: 290, y: 360 },
      { name: 'PHÒNG CỜ VUA', x: 670, y: 75 },
      { name: 'KHU VƯỜN SINH THÁI', x: 670, y: 360 }
    ];
    roomLabels.forEach(rl => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(rl.x - 4, rl.y - 12, ctx.measureText(rl.name).width + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(rl.name, rl.x, rl.y);
    });

    // Vẽ lớp phủ tối nếu đèn tắt
    if (GameState.lights) {
      ctx.save();
      
      // Lớp học 6A (Phòng học)
      if (!GameState.lights.classroom) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(260, 50, 340, 190);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('🔌 ĐÈN TẮT', 270, 95);
      }
      // Thư viện thông minh
      if (!GameState.lights.library) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(260, 330, 340, 220);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('🔌 ĐÈN TẮT', 270, 375);
      }
      // Phòng cờ vua
      if (!GameState.lights.chess) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(640, 50, 340, 190);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('🔌 ĐÈN TẮT', 650, 95);
      }
      
      ctx.restore();
    }
  },

  // Vẽ bục thiết bị gỗ 8-bit
  drawPedestal(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#000000'; // Viền đen bục
    ctx.fillRect(x - 14, y + 2, 28, 10);
    ctx.fillStyle = '#5c3a21'; // Thân bục gỗ nâu
    ctx.fillRect(x - 12, y + 4, 24, 6);
    ctx.fillStyle = '#d69e2e'; // Mặt bục gỗ sáng
    ctx.fillRect(x - 12, y + 2, 24, 2);
    ctx.restore();
  },

  // Vẽ các thiết bị AI dạng pixel art đặc trưng từ file asset
  drawDeviceSprite(ctx, id, x, y) {
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#000000';
    
    if (id === 'attendance_device') {
      // Màn hình tablet điểm danh nằm dọc có hình avatar pixel
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';

      // 1. Chân đỡ tablet (nối xuống bục)
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(x - 2, y + 11, 4, 5);
      ctx.strokeRect(x - 2, y + 11, 4, 5);

      // 2. Vỏ máy tính bảng tablet dọc (18x26)
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(x - 9, y - 15, 18, 26);
      ctx.strokeRect(x - 9, y - 15, 18, 26);

      // Nút Home tròn nhỏ ở đáy tablet
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 1.5, y + 8, 3, 2);

      // 3. Màn hình quét màu xanh lục nhạt neon
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(x - 7, y - 12, 14, 18);

      // 4. Vẽ Avatar khuôn mặt pixel (học sinh) bên trong màn hình
      // Tóc nâu
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(x - 4, y - 9, 8, 3);
      // Mặt beige
      ctx.fillStyle = '#fcd5b5';
      ctx.fillRect(x - 3, y - 6, 6, 6);
      ctx.fillRect(x - 4, y - 4, 1, 2); // Tai trái
      ctx.fillRect(x + 3, y - 4, 1, 2); // Tai phải
      // Mắt đen
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 2, y - 4, 1, 1);
      ctx.fillRect(x + 1, y - 4, 1, 1);
      // Miệng đỏ nhỏ
      ctx.fillStyle = '#e53e3e';
      ctx.fillRect(x - 1, y - 2, 2, 1);
      // Vai áo trắng học sinh
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5, y, 10, 4);
      // Cổ áo/Cravat xanh
      ctx.fillStyle = '#3182ce';
      ctx.fillRect(x - 1, y, 2, 2);

      ctx.restore();
    } else if (id === 'interactive_screen') {
      // Màn hình Smart Screen phẳng hiện đại treo tường
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      
      // Khung viền màn hình mỏng màu xám titan
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(x - 20, y - 13, 40, 26);
      ctx.strokeRect(x - 20, y - 13, 40, 26);
      
      // Màn hình hiển thị màu xanh nước biển hiện đại
      ctx.fillStyle = '#1a365d';
      ctx.fillRect(x - 17, y - 10, 34, 20);
      
      // Chi tiết thông minh (giao diện DIGI Assistant)
      // Vòng tròn màu xanh sáng ở giữa biểu thị AI đang hoạt động
      ctx.fillStyle = '#63b3ed';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Các hạt quét sóng âm màu xanh cyan nhỏ xung quanh vòng tròn
      ctx.fillStyle = '#90cdf4';
      ctx.fillRect(x - 10, y - 4, 2, 8);
      ctx.fillRect(x + 8, y - 6, 2, 12);
      ctx.fillRect(x - 6, y + 2, 4, 2);
      
      ctx.restore();
    } else if (id === 'translation_pen') {
      // Bút dịch thuật nằm nghiêng trên mặt bàn học
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 6); // Xoay nghiêng 30 độ
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      // Thân bút xanh dương
      ctx.fillStyle = '#3182ce';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.strokeRect(-2, -6, 4, 12);
      // Đầu bút vàng
      ctx.fillStyle = '#f7d51d';
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.lineTo(0, 9);
      ctx.lineTo(2, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (id === 'library_kiosk') {
      // Máy tra cứu kiosk thư viện retro
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(x - 7, y - 18, 14, 21);
      ctx.strokeRect(x - 7, y - 18, 14, 21);
      
      // Màn hình nhỏ xanh lá
      ctx.fillStyle = '#48bb78';
      ctx.fillRect(x - 4, y - 15, 8, 6);
      
      // Bàn phím lồi
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(x - 9, y - 7, 18, 3);
      ctx.strokeRect(x - 9, y - 7, 18, 3);
    } else if (id === 'chessboard') {
      // Bàn cờ thông minh tự vẽ sắc nét không bị cắt góc
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';

      // Bàn gỗ vuông màu nâu sẫm
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(x - 16, y - 16, 32, 32);
      ctx.strokeRect(x - 16, y - 16, 32, 32);

      // Bàn cờ ca-rô trắng đen ở giữa
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 12, y - 12, 24, 24);
      ctx.strokeRect(x - 12, y - 12, 24, 24);
      
      // Vẽ các ô vuông màu xám đậm xen kẽ
      ctx.fillStyle = '#4a5568';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if ((r + c) % 2 === 1) {
            ctx.fillRect(x - 12 + c * 6, y - 12 + r * 6, 6, 6);
          }
        }
      }

      // Đèn LED thông minh nhấp nháy màu xanh dương/cyan ở góc bàn cờ
      ctx.fillStyle = (Math.sin(Date.now() / 150) > 0) ? '#63b3ed' : '#1a365d';
      ctx.fillRect(x + 10, y - 14, 3, 3);

      ctx.restore();
    } else if (id === 'smart_speaker') {
      // Loa thông minh tự vẽ hình trụ tròn 3D retro sắc nét
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      
      // Thân loa (hình trụ tròn)
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(x - 10, y - 6, 20, 12);
      ctx.strokeRect(x - 10, y - 6, 20, 12);
      
      // Đáy loa bo tròn
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.ellipse(x, y + 6, 10, 4, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Nắp loa (mặt trên hình ellipse)
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.ellipse(x, y - 6, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Vòng đèn LED phát sáng thông minh ở nắp trên (nhấp nháy xanh dương)
      ctx.strokeStyle = (Math.sin(Date.now() / 180) > 0) ? '#63b3ed' : '#2b6cb0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - 6, 7, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Các lỗ màng loa nhỏ
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(x - 6, y - 2, 2, 2);
      ctx.fillRect(x - 2, y - 2, 2, 2);
      ctx.fillRect(x + 2, y - 2, 2, 2);
      ctx.fillRect(x - 4, y + 2, 2, 2);
      ctx.fillRect(x, y + 2, 2, 2);
      ctx.fillRect(x + 4, y + 2, 2, 2);
      
      ctx.restore();
    }
    ctx.restore();
  },

  drawHotspots() {
    const ctx = this.ctx;

    DeviceHotspots.forEach(h => {
      const isCompleted = h.completed;
      const themeColor = isCompleted ? '#92cc41' : '#f7d51d'; // Xanh lá nếu xong, vàng nếu chưa

      // 1. Vẽ bục gỗ pixel art bên dưới thiết bị (chỉ vẽ nếu không có cấu hình noPedestal)
      if (!h.noPedestal) {
        this.drawPedestal(ctx, h.x, h.y + 12);
      }

      // 2. Vẽ thiết bị lơ lửng trên bục
      this.drawDeviceSprite(ctx, h.id, h.x, h.y);

      // 3. Vẽ vòng tròn lấp lánh xoay xoay quanh thiết bị
      ctx.save();
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); // Vòng nét đứt phong cách retro
      ctx.lineDashOffset = -this.pulseAnim * 15;
      ctx.beginPath();
      ctx.arc(h.x, h.y - 2, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Vẽ các hạt lấp lánh (sparkles) bay xung quanh vòng
      ctx.fillStyle = themeColor;
      for (let i = 0; i < 6; i++) {
        let angle = (this.pulseAnim * 1.2 + (i * Math.PI * 2 / 6)) % (Math.PI * 2);
        let dist = 24 + Math.cos(this.pulseAnim * 2 + i) * 3;
        let sx = h.x + Math.cos(angle) * dist;
        let sy = h.y - 2 + Math.sin(angle) * dist;
        ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
      }
    });
  },

  // Vẽ 2 Camera AI và nón quét laser 180 độ
  drawAICameras() {
    const ctx = this.ctx;
    const now = Date.now();

    AICameras.forEach(cam => {
      // 1. Tính toán góc quét dao động theo thời gian (quay chậm lại rõ rệt: chia cho 3500 thay vì 1800)
      let offset = Math.sin(now / 3500) * (Math.PI / 2.2);
      let base = cam.baseAngle !== undefined ? cam.baseAngle : Math.PI / 2;
      let scanAngle = base + offset;

      // 2. Vẽ nón quét phát sáng màu đỏ mờ (vùng quét rộng hơn: góc mở 0.65 radian)
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cam.x, cam.y);
      ctx.arc(cam.x, cam.y, cam.scanRange, scanAngle - 0.65, scanAngle + 0.65);
      ctx.closePath();
      ctx.fill();
      
      // Vẽ tia quét trung tâm dạng nét đứt mỏng
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cam.x, cam.y);
      ctx.lineTo(cam.x + Math.cos(scanAngle) * cam.scanRange, cam.y + Math.sin(scanAngle) * cam.scanRange);
      ctx.stroke();
      ctx.restore();

      // 3. Vẽ camera AI (hình camera gắn tường nhỏ xoay theo góc quét)
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.rotate(scanAngle - Math.PI / 2);
      
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      
      // Chân đế gắn tường
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(-3, -6, 6, 4);
      ctx.strokeRect(-3, -6, 6, 4);
      
      // Thân camera xoay
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-4, -2, 8, 12);
      ctx.strokeRect(-4, -2, 8, 12);
      
      // Ống kính màu đen
      ctx.fillStyle = '#000000';
      ctx.fillRect(-2, 10, 4, 3);
      
      // Đèn LED chỉ thị AI màu đỏ nhỏ ở đuôi camera
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-1, 0, 2, 2);

      ctx.restore();
    });
  },

  // Vẽ bong bóng thoại (chat bubble) cảnh báo khi phát hiện có người ở vùng quét camera AI
  drawAICameraBubbles() {
    const ctx = this.ctx;
    const player = GameState.player;
    const now = Date.now();

    AICameras.forEach(cam => {
      // Tính toán góc quét hiện tại (quay chậm lại rõ rệt: chia cho 3500 thay vì 1800)
      let offset = Math.sin(now / 3500) * (Math.PI / 2.2);
      let base = cam.baseAngle !== undefined ? cam.baseAngle : Math.PI / 2;
      let scanAngle = base + offset;

      let detected = false;

      // 1. Kiểm tra người chơi Minh
      let distPlayer = Math.hypot(player.x - cam.x, player.y - cam.y);
      if (distPlayer < cam.scanRange) {
        let angleToPlayer = Math.atan2(player.y - cam.y, player.x - cam.x);
        let diff = Math.abs(angleToPlayer - scanAngle);
        while (diff > Math.PI) diff = Math.PI * 2 - diff;
        
        if (diff < 0.65) {
          detected = true;
        }
      }

      // 2. Nếu chưa phát hiện người chơi, kiểm tra các NPC
      if (!detected && this.npcs) {
        for (let npc of this.npcs) {
          let distNpc = Math.hypot(npc.x - cam.x, npc.y - cam.y);
          if (distNpc < cam.scanRange) {
            let angleToNpc = Math.atan2(npc.y - cam.y, npc.x - cam.x);
            let diff = Math.abs(angleToNpc - scanAngle);
            while (diff > Math.PI) diff = Math.PI * 2 - diff;
            
            if (diff < 0.65) {
              detected = true;
              break;
            }
          }
        }
      }

      // Vẽ bong bóng thoại
      if (detected) {
        ctx.save();
        const bubbleText = "Phát hiện chuyển động";
        ctx.font = "bold 11px Arial";
        const textWidth = ctx.measureText(bubbleText).width;
        const bubbleW = textWidth + 12;
        const bubbleH = 20;
        const bx = cam.x - bubbleW / 2;
        const by = cam.y - 32;

        // Vẽ khung bong bóng
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx, by, bubbleW, bubbleH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bubbleW, bubbleH);

        // Mũi tên chỉ xuống dưới
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cam.x - 4, by + bubbleH);
        ctx.lineTo(cam.x + 4, by + bubbleH);
        ctx.lineTo(cam.x, by + bubbleH + 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(cam.x - 4, by + bubbleH);
        ctx.lineTo(cam.x, by + bubbleH + 4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cam.x + 4, by + bubbleH);
        ctx.lineTo(cam.x, by + bubbleH + 4);
        ctx.stroke();

        // Chữ màu đỏ nhấp nháy cảnh báo
        ctx.fillStyle = (Math.floor(now / 150) % 2 === 0) ? '#ef4444' : '#b91c1c';
        ctx.textAlign = 'center';
        ctx.fillText(bubbleText, cam.x, by + 14);
        ctx.restore();
      }
    });
  },

  drawPlayer() {
    const ctx = this.ctx;
    const player = GameState.player;
    ctx.save();

    // Vẽ bóng dưới chân Player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + 10, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sonar quét cảm biến màu vàng retro lấp lánh nhẹ
    const scanAngle = 0.5;
    let dirAngle = 0;
    if (player.direction === 'right') dirAngle = 0;
    else if (player.direction === 'down') dirAngle = Math.PI / 2;
    else if (player.direction === 'left') dirAngle = Math.PI;
    else if (player.direction === 'up') dirAngle = -Math.PI / 2;

    ctx.fillStyle = 'rgba(247, 213, 29, 0.15)';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.arc(player.x, player.y, 35, dirAngle - scanAngle, dirAngle + scanAngle);
    ctx.closePath();
    ctx.fill();

    // Thử vẽ nhân vật Minh bằng ảnh asset cao cấp
    if (this.sprites.loaded && this.sprites.player) {
      let rowIdx = 1; // Hàng mặc định: Down
      if (player.direction === 'up') rowIdx = 0;
      else if (player.direction === 'down') rowIdx = 1;
      else if (player.direction === 'right') rowIdx = 3;
      else if (player.direction === 'left') rowIdx = 2;
      
      // Chạy 4 khung hình animation khi di chuyển, đứng yên chọn khung hình 2
      let colIdx = player.isMoving ? (Math.floor(Date.now() / 120) % 4) : 2;
      
      // Tọa độ cắt từ spritesheet student_minh.png (1024x1024)
      let srcX = colIdx * 256 + 48;  // Crop sát nhân vật
      let srcY = rowIdx * 256;       // Bắt đầu từ đỉnh ô 256 để lấy trọn vẹn đỉnh đầu
      let srcW = 160;
      let srcH = 240;
      
      // Vẽ nhân vật Minh sắc nét
      ctx.drawImage(this.sprites.player, srcX, srcY, srcW, srcH, player.x - 12, player.y - 20, 24, 32);
    } else {
      // Fallback vẽ bằng ma trận pixel code cũ nếu ảnh chưa tải xong
      const sprite = FALLBACK_PLAYER_SPRITES[player.direction] || FALLBACK_PLAYER_SPRITES.down;
      const startX = player.x - 12;
      const startY = player.y - 20;
      const pixelW = 2.4;
      const pixelH = 2.0;
      const isMoving = player.isMoving;
      const walkFrame = Math.floor(Date.now() / 150) % 2;
      const colorMap = {
        '.': null, 't': '#4a3728', 's': '#fcd5b5', 'e': '#000000',
        'c': '#ffffff', 'p': '#e53e3e', 'b': '#3182ce', 'g': '#1a202c'
      };

      for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 10; col++) {
          let char = sprite[row][col];
          if (char === '.' || !char) continue;
          let color = colorMap[char];
          
          if (isMoving && row >= 13) {
            if (walkFrame === 0) {
              if (col < 5 && row === 15) continue;
            } else {
              if (col >= 5 && row === 15) continue;
            }
          }
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(startX + col * pixelW, startY + row * pixelH, pixelW + 0.2, pixelH + 0.2);
          }
        }
      }
    }

    // Nhãn ID học sinh retro phía trên
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('H/S MINH 6A', player.x, player.y - 25);
    ctx.fillStyle = '#f7d51d';
    ctx.fillText('H/S MINH 6A', player.x - 0.5, player.y - 25.5);

    ctx.restore();
  },

  drawNPCs() {
    const ctx = this.ctx;
    if (!this.npcs) return;

    this.npcs.forEach(npc => {
      ctx.save();

      // Vẽ bóng dưới chân NPC
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 10, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Xác định spritesheet tương ứng
      let npcImg = null;
      if (npc.id === 'npc_minh_green') npcImg = this.sprites.binh;
      else if (npc.id === 'npc_minh_purple') npcImg = this.sprites.an;
      else if (npc.id === 'npc_dung') npcImg = this.sprites.dung;
      else if (npc.id === 'npc_lan') npcImg = this.sprites.lan;
      else if (npc.id === 'npc_vy') npcImg = this.sprites.vy;

      if (this.sprites.loaded && npcImg) {
        let rowIdx = 1; // Hàng mặc định: Down
        if (npc.direction === 'up') rowIdx = 0;
        else if (npc.direction === 'down') rowIdx = 1;
        else if (npc.direction === 'right') {
          rowIdx = (npc.id === 'npc_lan' || npc.id === 'npc_vy') ? 2 : 3;
        }
        else if (npc.direction === 'left') {
          rowIdx = (npc.id === 'npc_lan' || npc.id === 'npc_vy') ? 3 : 2;
        }
        
        // Chạy 4 khung hình animation khi di chuyển, đứng yên chọn khung hình 2
        let colIdx = npc.isMoving ? (Math.floor(Date.now() / 120) % 4) : 2;
        
        let srcX = colIdx * 256 + 48;
        let srcY = rowIdx * 256;
        let srcW = 160;
        let srcH = 240;
        
        ctx.drawImage(npcImg, srcX, srcY, srcW, srcH, npc.x - 12, npc.y - 20, 24, 32);
      } else {
        // Fallback vẽ bằng ma trận pixel nếu ảnh chưa load kịp
        const spriteSet = (npc.id === 'npc_minh_green' || npc.id === 'npc_dung') ? NPC_BINH_SPRITES : NPC_AN_SPRITES;
        const sprite = spriteSet[npc.direction] || spriteSet.down;
        
        const startX = npc.x - 12;
        const startY = npc.y - 20;
        const pixelW = 2.4;
        const pixelH = 2.0;
        const isMoving = npc.isMoving;
        const walkFrame = Math.floor(Date.now() / 150) % 2;
        
        const colorMap = {
          '.': null,
          't': (npc.id === 'npc_minh_green') ? '#1e293b' : '#f59e0b',
          'n': '#ef4444',
          's': '#fcd5b5',
          'e': '#000000',
          'c': '#ffffff',
          'a': (npc.id === 'npc_minh_green') ? '#22c55e' : '#ec4899',
          'q': '#64748b',
          'v': '#1e1b4b',
          'g': (npc.id === 'npc_minh_green') ? '#0f172a' : '#ffffff'
        };

        for (let row = 0; row < 16; row++) {
          for (let col = 0; col < 10; col++) {
            let char = sprite[row][col];
            if (char === '.' || !char) continue;
            let color = colorMap[char];
            if (isMoving && row >= 14) {
              if (walkFrame === 0) {
                if (col < 5 && row === 15) continue;
              } else {
                if (col >= 5 && row === 15) continue;
              }
            }
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(startX + col * pixelW, startY + row * pixelH, pixelW + 0.2, pixelH + 0.2);
            }
          }
        }
      }

      ctx.restore();
      
      // Vẽ nhãn tên NPC phía trên đầu
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      
      const labelTexts = {
        'npc_minh_green': 'H/S BÌNH 6B',
        'npc_minh_purple': 'H/S AN 6C',
        'npc_dung': 'THẦY DŨNG',
        'npc_lan': 'H/S LAN 6E',
        'npc_vy': 'H/S VY 6F'
      };
      
      const labelColors = {
        'npc_minh_green': '#4ade80',
        'npc_minh_purple': '#c084fc',
        'npc_dung': '#60a5fa',
        'npc_lan': '#f472b6',
        'npc_vy': '#fbbf24'
      };
      
      const labelText = labelTexts[npc.id] || 'HỌC SINH';
      const labelColor = labelColors[npc.id] || '#ffffff';
      
      ctx.fillText(labelText, npc.x, npc.y - 25);
      ctx.fillStyle = labelColor;
      ctx.fillText(labelText, npc.x - 0.5, npc.y - 25.5);
      ctx.restore();
    });
  },

  drawInteractPrompt() {
    const ctx = this.ctx;
    const hotspot = this.activeHotspot;
    const playerInCam = this.playerInCameraZone;

    if (!hotspot && !playerInCam) return;

    ctx.save();
    
    const panelW = 420;
    const panelH = 65;
    const panelX = 512 - panelW / 2;
    const panelY = 490;

    // Vẽ khung viền đôi phong cách retro NES
    ctx.fillStyle = '#212529'; // Nền đen phẳng
    ctx.fillRect(panelX, panelY, panelW, panelH);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelW, panelH); // Viền ngoài đen dày

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8); // Viền trong trắng mỏng

    // Viết văn bản HUD chỉ dẫn tương tác
    ctx.textAlign = 'center';
    
    if (hotspot) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Arial';
      ctx.fillText(`PHÁT HIỆN: ${hotspot.label.toUpperCase()}`, 512, panelY + 24);
      
      ctx.fillStyle = '#f7d51d';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(`>> ${hotspot.desc.toUpperCase()}`, 512, panelY + 44);
    } else if (playerInCam) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Arial';
      ctx.fillText("PHÁT HIỆN: 📷 CAMERA AI", 512, panelY + 24);
      
      ctx.fillStyle = '#f7d51d'; // Màu vàng tương tự các thiết bị AI khác
      ctx.font = 'bold 13px Arial';
      ctx.fillText(">> PHÁT HIỆN CAMERA AI NHẬN DIỆN CHUYỂN ĐỘNG", 512, panelY + 44);
    }
    
    ctx.restore();
  },

  // Vẽ bong bóng thoại hiển thị tên cuốn sách định vị khi người chơi đến gần kệ sách đó và click vào kệ sách
  drawSelectedBookBubble() {
    const book = GameState.selectedLibraryBook;
    if (!book || GameState.view !== 'OVERWORLD' || !GameState.showBookBubble) return;

    const player = GameState.player;
    // Kiểm tra khoảng cách từ người chơi tới tọa độ sách trên bản đồ lớn
    const distance = Math.hypot(player.x - book.largeX, player.y - book.largeY);
    
    // Chỉ hiện bong bóng thoại khi người chơi đi vào khoảng cách gần (trong vòng 50px) và đã click kích hoạt
    if (distance <= 50) {
      const ctx = this.ctx;
      ctx.save();
      
      const text = `📖 ${book.title}`;
      ctx.font = 'bold 11px Arial';
      const textWidth = ctx.measureText(text).width;
      const bubbleW = textWidth + 16;
      const bubbleH = 24;
      const bx = book.largeX - bubbleW / 2;
      const by = book.largeY - 38;

      // Vẽ bóng đổ nhẹ cho bong bóng thoại
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      // Khung bong bóng màu vàng cam pastel nổi bật dễ thương
      ctx.fillStyle = '#ffedd5'; // Orange pastel
      ctx.strokeStyle = '#ea580c'; // Nâu cam đậm
      ctx.lineWidth = 1.5;
      
      // Bo tròn nhẹ góc bong bóng
      this.drawRoundedRect(ctx, bx, by, bubbleW, bubbleH, 6);
      
      // Mũi tên chỉ xuống dưới
      ctx.shadowColor = 'transparent'; // Tắt shadow cho mũi tên để tránh viền đục
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.moveTo(book.largeX - 5, by + bubbleH);
      ctx.lineTo(book.largeX + 5, by + bubbleH);
      ctx.lineTo(book.largeX, by + bubbleH + 5);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(book.largeX - 5, by + bubbleH);
      ctx.lineTo(book.largeX, by + bubbleH + 5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(book.largeX + 5, by + bubbleH);
      ctx.lineTo(book.largeX, by + bubbleH + 5);
      ctx.stroke();

      // Chữ màu nâu đậm dễ thương, tương phản tốt
      ctx.fillStyle = '#7c2d12';
      ctx.textAlign = 'center';
      ctx.fillText(text, book.largeX, by + 16);
      
      ctx.restore();
    }
  },

  // Hàm vẽ hình chữ nhật bo góc helper
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
};
