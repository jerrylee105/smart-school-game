import { completeDevice, GameState } from '../game.js';

export const SmartSpeakerHandler = {
  popup: null,
  closeBtn: null,
  speechBubble: null,
  micBtn: null,
  dropdown: null,
  
  audioPlayer: null,
  isProcessing: false,
  recognition: null,
  isListening: false,
  
  init() {
    this.popup = document.getElementById('speaker-popup');
    this.closeBtn = document.getElementById('btn-close-speaker-popup');
    this.micBtn = document.getElementById('btn-speaker-popup-mic');
    this.dropdown = document.getElementById('speaker-cmd-dropdown');
    
    // Nút đóng pop-up
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.onClose());
    }
    
    // Gán sự kiện cho menu select dropdown
    if (this.dropdown) {
      this.dropdown.addEventListener('change', (e) => {
        const command = e.target.value;
        if (command) {
          this.issueCommand(command);
        }
      });
    }

    // Cài đặt mic thu âm
    if (this.micBtn) {
      this.micBtn.addEventListener('click', () => this.toggleVoiceListening());
    }

    this.setupSpeechRecognition();
  },

  setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'vi-VN';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.micBtn.classList.add('active');
        this.micBtn.textContent = '🔴';
      };

      this.recognition.onerror = (e) => {
        console.error("Speech recognition error", e);
        this.stopVoiceListening();
      };

      this.recognition.onend = () => {
        this.stopVoiceListening();
      };

      this.recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        this.issueCommand(resultText);
      };
    } else {
      if (this.micBtn) {
        this.micBtn.style.display = 'none';
      }
    }
  },

  toggleVoiceListening() {
    if (this.isProcessing) return;
    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  },

  stopVoiceListening() {
    this.isListening = false;
    this.micBtn.classList.remove('active');
    this.micBtn.textContent = '🎙️';
  },

  onOpen() {
    if (this.popup) {
      this.popup.classList.remove('hidden');
    }
    this.reset();
  },

  onClose() {
    if (this.popup) {
      this.popup.classList.add('hidden');
    }
    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    GameState.activeDevice = null;
  },

  reset() {
    this.isProcessing = false;
    if (this.dropdown) {
      this.dropdown.value = ""; // Reset dropdown về mặc định
    }
    this.stopVoiceListening();
  },

  issueCommand(commandText) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    setTimeout(() => { this.isProcessing = false; }, 600);

    const cleanCmd = commandText.normalize('NFC').toLowerCase();
    console.log("Loa AI nhận lệnh:", cleanCmd);

    let audioFile = "speaker_unknown.mp3";

    // 1. Điều khiển Lớp học 6A (Phòng học / STEM)
    const isClassroomOn = cleanCmd.includes("mở đèn phòng học") || cleanCmd.includes("bật đèn phòng học") || 
                         cleanCmd.includes("mở đèn lớp") || cleanCmd.includes("bật đèn lớp") ||
                         cleanCmd.includes("mở đèn phòng stem") || cleanCmd.includes("bật đèn phòng stem") ||
                         cleanCmd.includes("bật đèn lớp học 6a") || cleanCmd.includes("mở đèn lớp học 6a") ||
                         cleanCmd.includes("bật đèn lớp 6a") || cleanCmd.includes("mở đèn lớp 6a");

    const isClassroomOff = cleanCmd.includes("tắt đèn phòng học") || cleanCmd.includes("tắt đèn lớp") || 
                           cleanCmd.includes("tắt đèn phòng stem") || cleanCmd.includes("tắt đèn lớp học 6a") || 
                           cleanCmd.includes("tắt đèn lớp 6a");

    // 2. Điều khiển Thư viện thông minh
    const isLibraryOn = cleanCmd.includes("mở đèn thư viện") || cleanCmd.includes("bật đèn thư viện") || 
                        cleanCmd.includes("mở đèn thư viện thông minh") || cleanCmd.includes("bật đèn thư viện thông minh");

    const isLibraryOff = cleanCmd.includes("tắt đèn thư viện") || cleanCmd.includes("tắt đèn thư viện thông minh");

    // 3. Điều khiển Phòng cờ vua
    const isChessOn = cleanCmd.includes("mở đèn phòng cờ") || cleanCmd.includes("bật đèn phòng cờ") || 
                      cleanCmd.includes("mở đèn phòng cờ vua") || cleanCmd.includes("bật đèn phòng cờ vua") ||
                      cleanCmd.includes("bật đèn lớp cờ") || cleanCmd.includes("mở đèn lớp cờ");

    const isChessOff = cleanCmd.includes("tắt đèn phòng cờ") || cleanCmd.includes("tắt đèn phòng cờ vua") || 
                       cleanCmd.includes("tắt đèn lớp cờ");

    if (isClassroomOn) {
      GameState.lights.classroom = true;
      audioFile = "speaker_classroom_on.mp3";
    } else if (isClassroomOff) {
      GameState.lights.classroom = false;
      audioFile = "speaker_classroom_off.mp3";
    } 
    
    else if (isLibraryOn) {
      GameState.lights.library = true;
      audioFile = "speaker_library_on.mp3";
    } else if (isLibraryOff) {
      GameState.lights.library = false;
      audioFile = "speaker_library_off.mp3";
    }
    
    else if (isChessOn) {
      GameState.lights.chess = true;
      audioFile = "speaker_chess_on.mp3";
    } else if (isChessOff) {
      GameState.lights.chess = false;
      audioFile = "speaker_chess_off.mp3";
    }
    
    // Các lệnh thông thường khác
    else if (cleanCmd.includes("thời tiết")) {
      audioFile = "speaker_weather.mp3";
    } else if (cleanCmd.includes("sự thật thú vị") || cleanCmd.includes("khoa học")) {
      audioFile = "speaker_science.mp3";
    }

    this.playVoice(audioFile);

    // Quay lại trạng thái rảnh sau khi phát xong
    setTimeout(() => {
      if (this.dropdown) {
        this.dropdown.value = ""; // Reset dropdown về lựa chọn ban đầu
      }
    }, 4500);

    completeDevice('smart_speaker', 10);
  },

  playVoice(audioFilename) {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    this.audioPlayer = new Audio(`assets/${audioFilename}`);
    this.audioPlayer.play().catch(err => console.log("Audio play blocked/failed:", err));
  }
};
