import { GameState } from './game.js';
import { AttendanceHandler } from './devices/attendance.js';
import { DigiScreenHandler } from './devices/digiScreen.js';
import { TranslatePenHandler } from './devices/translatePen.js';
import { LibraryKioskHandler } from './devices/libraryKiosk.js';
import { ChessboardHandler } from './devices/chessboard.js';
import { SmartSpeakerHandler } from './devices/smartSpeaker.js';

export const UIManager = {
  overworldView: null,
  closeUpView: null,
  btnReturnMap: null,
  
  init() {
    this.overworldView = document.getElementById('overworld-view');
    this.closeUpView = document.getElementById('close-up-view');
    this.btnReturnMap = document.getElementById('btn-return-map');

    // Nút quay trở về bản đồ
    this.btnReturnMap.addEventListener('click', () => {
      this.closeDevice();
    });

    // Khởi tạo các trình điều khiển thiết bị
    AttendanceHandler.init();
    DigiScreenHandler.init();
    TranslatePenHandler.init();
    LibraryKioskHandler.init();
    ChessboardHandler.init();
    SmartSpeakerHandler.init();
  },

  openDevice(deviceId) {
    if (deviceId === 'smart_speaker') {
      GameState.activeDevice = deviceId;
      SmartSpeakerHandler.onOpen();
      return;
    }

    GameState.view = 'CLOSE_UP';
    GameState.activeDevice = deviceId;

    // Ẩn bản đồ, hiện overlay cận cảnh
    this.overworldView.classList.remove('active');
    this.closeUpView.classList.add('active');
    document.getElementById('app-container').classList.add('close-up-mode');

    // Ẩn tất cả các panel thiết bị
    document.querySelectorAll('.device-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Kích hoạt panel thiết bị tương ứng
    let activePanelId = '';
    switch(deviceId) {
      case 'attendance_device':
        activePanelId = 'device-attendance';
        AttendanceHandler.onOpen();
        break;
      case 'interactive_screen':
        activePanelId = 'device-screen';
        DigiScreenHandler.onOpen();
        break;
      case 'translation_pen':
        activePanelId = 'device-translation-pen';
        TranslatePenHandler.onOpen();
        break;
      case 'library_kiosk':
        activePanelId = 'device-library';
        LibraryKioskHandler.onOpen();
        break;
      case 'chessboard':
        activePanelId = 'device-chessboard';
        ChessboardHandler.onOpen();
        break;
      case 'smart_speaker':
        activePanelId = 'device-speaker';
        SmartSpeakerHandler.onOpen();
        break;
    }

    if (activePanelId) {
      document.getElementById(activePanelId).classList.add('active');
    }
  },

  closeDevice() {
    // Gọi giải phóng của thiết bị đang hoạt động nếu có
    if (GameState.activeDevice === 'attendance_device') {
      AttendanceHandler.onClose();
    } else if (GameState.activeDevice === 'interactive_screen') {
      DigiScreenHandler.onClose();
    } else if (GameState.activeDevice === 'translation_pen') {
      TranslatePenHandler.onClose();
    } else if (GameState.activeDevice === 'library_kiosk') {
      LibraryKioskHandler.onClose();
    } else if (GameState.activeDevice === 'smart_speaker') {
      SmartSpeakerHandler.onClose();
    }

    GameState.view = 'OVERWORLD';
    GameState.activeDevice = null;

    // Hiện lại bản đồ, ẩn overlay cận cảnh
    this.closeUpView.classList.remove('active');
    this.overworldView.classList.add('active');
    document.getElementById('app-container').classList.remove('close-up-mode');
  }
};
