import { MapManager } from './map.js';
import { UIManager } from './ui.js';

// Khởi tạo trạng thái game tập trung
export const GameState = {
  view: 'OVERWORLD', // 'OVERWORLD' hoặc 'CLOSE_UP'
  activeDevice: null,
  score: 0,
  completedDevices: new Set(),
  player: {
    x: 100, // Bắt đầu ở sân trường ngoài cổng
    y: 380,
    speed: 4,
    width: 24,
    height: 32,
    direction: 'down',
    isMoving: false
  },
  lights: {
    classroom: true,   // Lớp học 6A (Phòng học)
    library: true,     // Thư viện thông minh
    chess: true        // Phòng cờ vua
  },
  selectedLibraryBook: null, // Sách đang được chọn định vị trong Kiot thư viện
  showBookBubble: false // Trạng thái hiển thị bong bóng chat tên cuốn sách khi click vào kệ
};

// Cập nhật điểm và tiến trình lên giao diện chính
export function updateStats() {
  document.getElementById('score-val').textContent = GameState.score;
  document.getElementById('progress-val').textContent = `${GameState.completedDevices.size}/6`;
}

// Hàm ghi nhận đã hoàn thành thiết bị
export function completeDevice(deviceId, points = 10) {
  if (!GameState.completedDevices.has(deviceId)) {
    GameState.completedDevices.add(deviceId);
    GameState.score += points;
    updateStats();
    
    // Đánh dấu thiết bị đã hoàn thành trong hệ thống Map
    MapManager.markDeviceCompleted(deviceId);
  }
}

// Vòng lặp trò chơi
function gameLoop() {
  if (GameState.view === 'OVERWORLD') {
    MapManager.update();
    MapManager.draw();
  }
  requestAnimationFrame(gameLoop);
}

// Khởi chạy ứng dụng khi tải xong DOM
window.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo giao diện
  UIManager.init();
  
  // Khởi tạo bản đồ 2D
  MapManager.init();
  
  // Cập nhật điểm số ban đầu
  updateStats();
  
  // Chạy vòng lặp game
  gameLoop();
});
