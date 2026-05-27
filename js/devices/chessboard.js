import { completeDevice } from '../game.js';

// Định nghĩa quân cờ vua và bàn cờ
const INITIAL_BOARD = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

export const ChessboardHandler = {
  boardState: [],
  selectedSquare: null,
  isThinking: false,
  boardContainer: null,
  logContent: null,
  evalText: null,
  advantageBar: null,
  advantageValue: 0.0,

  init() {
    this.boardContainer = document.getElementById('chess-board-ui');
    this.logContent = document.getElementById('chess-log-content');
    this.evalText = document.getElementById('chess-eval-text');
    
    this.setupAdvantageBar();

    document.getElementById('btn-chess-reset').addEventListener('click', () => {
      this.resetGame();
    });
  },

  onOpen() {
    this.resetGame();
  },

  // Tạo thanh đánh giá sức mạnh động cơ Stockfish ảo (Advantage Engine Bar)
  setupAdvantageBar() {
    const container = document.querySelector('.chessboard-container');
    if (document.getElementById('chess-adv-bar-wrapper')) return;

    const barWrapper = document.createElement('div');
    barWrapper.id = 'chess-adv-bar-wrapper';
    barWrapper.style.display = 'flex';
    barWrapper.style.flexDirection = 'column';
    barWrapper.style.width = '14px';
    barWrapper.style.height = '352px'; // Chiều cao khớp bàn cờ mới 44px * 8 = 352px
    barWrapper.style.background = '#090d16';
    barWrapper.style.border = '2px solid rgba(0, 240, 255, 0.25)';
    barWrapper.style.borderRadius = '4px';
    barWrapper.style.marginRight = '18px';
    barWrapper.style.overflow = 'hidden';
    barWrapper.style.position = 'relative';

    const blackPart = document.createElement('div');
    blackPart.id = 'chess-adv-black';
    blackPart.style.width = '100%';
    blackPart.style.height = '50%';
    blackPart.style.background = '#18181b';
    blackPart.style.transition = 'height 0.4s ease';

    const whitePart = document.createElement('div');
    whitePart.id = 'chess-adv-white';
    whitePart.style.width = '100%';
    whitePart.style.flexGrow = '1';
    whitePart.style.background = '#00f0ff'; // Màu cyan công nghệ
    whitePart.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.4)';
    whitePart.style.transition = 'height 0.4s ease';

    barWrapper.appendChild(blackPart);
    barWrapper.appendChild(whitePart);
    
    container.insertBefore(barWrapper, this.boardContainer);
    this.advantageBar = { blackPart, whitePart };
  },

  resetGame() {
    this.boardState = INITIAL_BOARD.map(row => [...row]);
    this.selectedSquare = null;
    this.isThinking = false;
    this.advantageValue = 0.0;

    this.logContent.innerHTML = '[HỆ THỐNG]: Đã kết nối Bàn cờ cảm biến Smart Chessboard v1.0<br>[CẢM BIẾN]: Đang hiệu chuẩn ma trận từ trường... Đã sẵn sàng.<br>[HỆ THỐNG]: Lượt đi: Trắng (Bạn). Hãy kéo di chuyển quân cờ của bạn.';
    this.evalText.innerHTML = '<span style="color: #cbd5e1;">ENGINE STATUS:</span> <span style="color: #00f0ff;">IDLE [Evaluation: +0.0]</span>';

    this.updateAdvantageBarUI(0.0);
    this.renderBoard();
  },

  updateAdvantageBarUI(evalValue) {
    if (!this.advantageBar) return;
    
    let percentage = 50 + (evalValue / 16) * 100;
    percentage = Math.min(95, Math.max(5, percentage));

    let blackHeight = 100 - percentage;
    this.advantageBar.blackPart.style.height = `${blackHeight}%`;
  },

  renderBoard() {
    this.boardContainer.innerHTML = '';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        const isLight = (row + col) % 2 === 0;
        
        square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.boardState[row][col];
        if (piece) {
          const pieceSpan = document.createElement('span');
          pieceSpan.className = 'chess-piece';
          
          // Ánh xạ quân Trắng (ruột rỗng) sang quân Đen (ruột đặc) để hiển thị full trắng đặc đẹp mắt
          const displayMap = { '♙': '♟', '♖': '♜', '♘': '♞', '♗': '♝', '♕': '♛', '♔': '♚' };
          pieceSpan.textContent = displayMap[piece] || piece;
          
          const isWhitePiece = '♙♖♘♗♕♔'.includes(piece);
          pieceSpan.classList.add(isWhitePiece ? 'white-piece' : 'black-piece');
          
          square.appendChild(pieceSpan);
        }

        if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
          square.classList.add('selected');
        }

        // Ô gợi ý đi tốt đầu tiên
        if (!this.selectedSquare && row === 6 && col === 4 && piece === '♙') {
          square.classList.add('suggested'); 
        }

        square.addEventListener('click', () => this.handleSquareClick(row, col));
        this.boardContainer.appendChild(square);
      }
    }
  },

  handleSquareClick(row, col) {
    if (this.isThinking) return;

    const piece = this.boardState[row][col];
    
    if (!this.selectedSquare) {
      if (piece && '♙♖♘♗♕♔'.includes(piece)) {
        this.selectedSquare = { row, col };
        const notation = `${this.getColLetter(col)}${8 - row}`;
        this.logMove(`[CẢM BIẾN]: Phát hiện quân cờ tại ${notation.toUpperCase()} được nhấc lên.`);
        this.renderBoard();
      }
    } else {
      const fromRow = this.selectedSquare.row;
      const fromCol = this.selectedSquare.col;

      if (fromRow === row && fromCol === col) {
        this.selectedSquare = null;
        this.logMove(`[CẢM BIẾN]: Đặt quân cờ lại vị trí cũ.`);
        this.renderBoard();
        return;
      }

      if (this.isValidMove(fromRow, fromCol, row, col)) {
        this.executePlayerMove(fromRow, fromCol, row, col);
      } else {
        // Kiểm tra xem nước đi có đúng luật cơ bản nhưng bị chặn do làm Vua bị chiếu không
        if (this.isValidMoveBasic(fromRow, fromCol, row, col) && 
            !this.isValidMove(fromRow, fromCol, row, col)) {
          this.selectedSquare = null;
          this.logMove(`[HỆ THỐNG]: Nước đi bị cấm vì sẽ làm Vua của bạn bị chiếu!`);
          this.renderBoard();
        } else if (piece && '♙♖♘♗♕♔'.includes(piece)) {
          this.selectedSquare = { row, col };
          const notation = `${this.getColLetter(col)}${8 - row}`;
          this.logMove(`[CẢM BIẾN]: Đổi sang quân cờ tại ${notation.toUpperCase()}.`);
          this.renderBoard();
        } else {
          this.selectedSquare = null;
          this.logMove(`[CẢM BIẾN]: Nước đi không hợp lệ. Đặt quân cờ về vị trí cũ.`);
          this.renderBoard();
        }
      }
    }
  },

  isValidMoveBasic(fromRow, fromCol, toRow, toCol, board = this.boardState) {
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    
    if (!piece) return false;
    
    // Không thể đi vào ô có quân cùng màu
    const isWhitePiece = '♙♖♘♗♕♔'.includes(piece);
    if (targetPiece) {
      const isTargetWhite = '♙♖♘♗♕♔'.includes(targetPiece);
      if (isWhitePiece === isTargetWhite) return false;
    }

    const rDiff = Math.abs(toRow - fromRow);
    const cDiff = Math.abs(toCol - fromCol);

    if (piece === '♙') { // Tốt Trắng
      if (fromCol === toCol && targetPiece === '') {
        if (toRow === fromRow - 1) return true;
        if (fromRow === 6 && toRow === 4 && board[5][fromCol] === '') return true;
      }
      if (cDiff === 1 && toRow === fromRow - 1 && targetPiece !== '') return true;
      return false;
    }

    if (piece === '♟') { // Tốt Đen
      if (fromCol === toCol && targetPiece === '') {
        if (toRow === fromRow + 1) return true;
        if (fromRow === 1 && toRow === 3 && board[2][fromCol] === '') return true;
      }
      if (cDiff === 1 && toRow === fromRow + 1 && targetPiece !== '') return true;
      return false;
    }

    if (piece === '♘' || piece === '♞') { // Mã
      return (rDiff === 2 && cDiff === 1) || (rDiff === 1 && cDiff === 2);
    }

    if (piece === '♖' || piece === '♜') { // Xe
      if (fromRow !== toRow && fromCol !== toCol) return false;
      return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
    }

    if (piece === '♗' || piece === '♝') { // Tượng
      if (rDiff !== cDiff) return false;
      return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
    }

    if (piece === '♕' || piece === '♛') { // Hậu
      if (fromRow !== toRow && fromCol !== toCol && rDiff !== cDiff) return false;
      return this.isPathClear(fromRow, fromCol, toRow, toCol, board);
    }

    if (piece === '♔' || piece === '♚') { // Vua
      return rDiff <= 1 && cDiff <= 1;
    }

    return false;
  },

  isValidMove(fromRow, fromCol, toRow, toCol, board = this.boardState) {
    // 1. Kiểm tra nước đi cơ bản của quân cờ
    if (!this.isValidMoveBasic(fromRow, fromCol, toRow, toCol, board)) {
      return false;
    }

    // 2. Giả lập nước đi để kiểm tra xem có làm Vua của chính mình bị chiếu không
    const piece = board[fromRow][fromCol];
    const isWhite = '♙♖♘♗♕♔'.includes(piece);
    const color = isWhite ? 'white' : 'black';

    const tempBoard = board.map(row => [...row]);
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = '';

    if (this.isKingInCheck(tempBoard, color)) {
      return false;
    }

    return true;
  },

  isKingInCheck(board, color) {
    const kingChar = color === 'white' ? '♔' : '♚';
    let kingRow = -1;
    let kingCol = -1;

    // Tìm tọa độ của Vua
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingChar) {
          kingRow = r;
          kingCol = c;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    if (kingRow === -1) return false;

    // Duyệt qua tất cả quân cờ đối phương xem có chiếu được Vua không
    const isWhite = color === 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === '') continue;

        const isPieceWhite = '♙♖♘♗♕♔'.includes(piece);
        // Nếu là quân đối phương
        if (isPieceWhite !== isWhite) {
          if (this.isValidMoveBasic(r, c, kingRow, kingCol, board)) {
            return true;
          }
        }
      }
    }
    return false;
  },

  isPathClear(fromRow, fromCol, toRow, toCol, board = this.boardState) {
    const stepRow = Math.sign(toRow - fromRow);
    const stepCol = Math.sign(toCol - fromCol);
    
    let r = fromRow + stepRow;
    let c = fromCol + stepCol;
    
    while (r !== toRow || c !== toCol) {
      if (board[r][c] !== '') return false;
      r += stepRow;
      c += stepCol;
    }
    return true;
  },

  executePlayerMove(fromRow, fromCol, toRow, toCol) {
    this.isThinking = true;
    const piece = this.boardState[fromRow][fromCol];
    const notation = `${this.getColLetter(fromCol)}${8 - fromRow} ➔ ${this.getColLetter(toCol)}${8 - toRow}`;
    
    this.logMove(`[CẢM BIẾN]: Phát hiện di chuyển quân Trắng: ${notation.toUpperCase()}.`);
    this.logMove(`[HỆ THỐNG]: Đang truyền tọa độ nước đi tới AI Engine...`);

    this.animateMove(fromRow, fromCol, toRow, toCol, () => {
      this.boardState[toRow][toCol] = piece;
      this.boardState[fromRow][fromCol] = '';
      this.selectedSquare = null;
      this.renderBoard();
      this.triggerAIMove(toRow, toCol);
    });
  },

  animateMove(fromRow, fromCol, toRow, toCol, callback) {
    const fromSquare = this.boardContainer.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = this.boardContainer.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
    if (!fromSquare || !toSquare) {
      callback();
      return;
    }

    const pieceSpan = fromSquare.querySelector('.chess-piece');
    if (!pieceSpan) {
      callback();
      return;
    }

    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    const containerRect = this.boardContainer.getBoundingClientRect();

    // Tạo quân cờ hoạt ảnh trượt từ tính 3D
    const animPiece = document.createElement('div');
    animPiece.textContent = pieceSpan.textContent;
    animPiece.className = 'chess-piece';
    animPiece.style.position = 'absolute';
    animPiece.style.color = pieceSpan.style.color;
    animPiece.style.textShadow = pieceSpan.style.textShadow;
    animPiece.style.left = `${fromRect.left - containerRect.left + 8}px`;
    animPiece.style.top = `${fromRect.top - containerRect.top + 8}px`;
    animPiece.style.zIndex = '1000';
    animPiece.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    animPiece.style.pointerEvents = 'none';

    this.boardContainer.appendChild(animPiece);

    // Ẩn quân cờ thật ở ô xuất phát
    pieceSpan.style.visibility = 'hidden';

    // Kích hoạt animation
    animPiece.offsetHeight;

    animPiece.style.left = `${toRect.left - containerRect.left + 8}px`;
    animPiece.style.top = `${toRect.top - containerRect.top + 8}px`;

    // Nếu ô đích có quân cờ (bị ăn), làm mờ dần nó
    const targetPieceSpan = toSquare.querySelector('.chess-piece');
    if (targetPieceSpan) {
      targetPieceSpan.style.transition = 'opacity 0.4s ease';
      targetPieceSpan.style.opacity = '0.2';
    }

    setTimeout(() => {
      animPiece.remove();
      callback();
    }, 600);
  },

  triggerAIMove(playerToRow, playerToCol) {
    this.evalText.innerHTML = `<span style="color: #cbd5e1;">ENGINE:</span> <span style="color: #f59e0b; animation: pulse 1s infinite;">ĐANG TÌM KIẾM NƯỚC ĐI TỐI ƯU... [DEPTH: 2]</span>`;

    setTimeout(() => {
      this.executeAIMove();
    }, 800);
  },

  getPossibleMoves(board, color) {
    const moves = [];
    const isWhite = color === 'white';
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === '') continue;
        
        const isPieceWhite = '♙♖♘♗♕♔'.includes(piece);
        if (isPieceWhite === isWhite) {
          for (let tr = 0; tr < 8; tr++) {
            for (let tc = 0; tc < 8; tc++) {
              if (this.isValidMove(r, c, tr, tc, board)) {
                moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc });
              }
            }
          }
        }
      }
    }
    return moves;
  },

  evaluateBoard(board) {
    let score = 0;
    
    // Bảng giá trị quân cờ
    const pieceValues = {
      '♙': -10, '♖': -50, '♘': -30, '♗': -30, '♕': -90, '♔': -900,
      '♟': 10, '♜': 50, '♞': 30, '♝': 30, '♛': 90, '♚': 900
    };
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === '') continue;
        
        score += pieceValues[piece] || 0;
        
        // Điểm vị thế đơn giản
        if (piece === '♟') {
          score += r * 0.3; // Tốt Đen hướng xuống dưới
        } else if (piece === '♙') {
          score -= (7 - r) * 0.3; // Tốt Trắng hướng lên trên
        }
        
        // Ưu tiên chiếm 4 ô trung tâm đối với Mã và Tượng
        if ('♞♝'.includes(piece)) {
          if (r >= 3 && r <= 4 && c >= 3 && c <= 4) score += 2.0;
        } else if ('♘♗'.includes(piece)) {
          if (r >= 3 && r <= 4 && c >= 3 && c <= 4) score -= 2.0;
        }
      }
    }
    return score;
  },

  executeAIMove() {
    let bestMove = null;
    let bestValue = -Infinity;
    
    // Sao chép bàn cờ để chạy thử nghiệm nước đi
    const tempBoard = this.boardState.map(row => [...row]);
    const blackMoves = this.getPossibleMoves(tempBoard, 'black');
    
    // Nếu có nước đi phản hồi cụ thể ban đầu e2-e4 -> e7-e5
    if (this.boardState[4][4] === '♙' && this.boardState[1][4] === '♟' && this.boardState[3][4] === '') {
      bestMove = { fromRow: 1, fromCol: 4, toRow: 3, toCol: 4 };
    } else {
      // Chạy MiniMax tìm nước đi tốt nhất cho quân Đen
      for (let move of blackMoves) {
        const sourcePiece = tempBoard[move.fromRow][move.fromCol];
        const targetPiece = tempBoard[move.toRow][move.toCol];
        
        // Thử nước đi của Đen
        tempBoard[move.toRow][move.toCol] = sourcePiece;
        tempBoard[move.fromRow][move.fromCol] = '';
        
        // Tìm nước phản hồi tốt nhất của Trắng (Trắng muốn tối thiểu hóa điểm số của Đen)
        const whiteMoves = this.getPossibleMoves(tempBoard, 'white');
        let minWhiteValue = Infinity;
        
        for (let wMove of whiteMoves) {
          const wSource = tempBoard[wMove.fromRow][wMove.fromCol];
          const wTarget = tempBoard[wMove.toRow][wMove.toCol];
          
          // Thử nước đi của Trắng
          tempBoard[wMove.toRow][wMove.toCol] = wSource;
          tempBoard[wMove.fromRow][wMove.fromCol] = '';
          
          const val = this.evaluateBoard(tempBoard);
          if (val < minWhiteValue) {
            minWhiteValue = val;
          }
          
          // Hoàn tác nước đi của Trắng
          tempBoard[wMove.fromRow][wMove.fromCol] = wSource;
          tempBoard[wMove.toRow][wMove.toCol] = wTarget;
        }
        
        if (whiteMoves.length === 0) {
          minWhiteValue = this.evaluateBoard(tempBoard);
        }
        
        // Đen chọn nước đi tối đa hóa điểm số
        if (minWhiteValue > bestValue) {
          bestValue = minWhiteValue;
          bestMove = move;
        }
        
        // Hoàn tác nước đi của Đen
        tempBoard[move.fromRow][move.fromCol] = sourcePiece;
        tempBoard[move.toRow][move.toCol] = targetPiece;
      }
    }
    
    if (bestMove) {
      const piece = this.boardState[bestMove.fromRow][bestMove.fromCol];
      const notation = `${this.getColLetter(bestMove.fromCol)}${8 - bestMove.fromRow} ➔ ${this.getColLetter(bestMove.toCol)}${8 - bestMove.toRow}`;
      
      this.logMove(`[CƠ HỌC]: Đang kích hoạt nam châm từ tính dưới bàn cờ...`);
      this.logMove(`[CƠ HỌC]: Đang tự động di chuyển quân Đen: ${notation.toUpperCase()}...`);
      
      this.animateMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol, () => {
        this.boardState[bestMove.toRow][bestMove.toCol] = piece;
        this.boardState[bestMove.fromRow][bestMove.fromCol] = '';
        this.selectedSquare = null;
        
        this.renderBoard();
        this.highlightAISquare(bestMove.toRow, bestMove.toCol);
        this.logMove(`[HỆ THỐNG]: Nước đi của AI hoàn tất. Lượt đi của bạn.`);
        
        // Cập nhật thanh đánh giá sức mạnh động cơ Stockfish
        const rawScore = this.evaluateBoard(this.boardState);
        const evalScore = rawScore / 10.0;
        this.evalText.innerHTML = `<span style="color: #cbd5e1;">ENGINE:</span> <span style="color: #00f0ff;">${evalScore >= 0 ? '+' : ''}${evalScore.toFixed(1)} (Thế trận ổn định)</span>`;
        this.updateAdvantageBarUI(evalScore);
        
        this.isThinking = false;
        completeDevice('chessboard', 10);
      });
    } else {
      this.isThinking = false;
      this.logMove(`[HỆ THỐNG]: AI không tìm được nước đi hợp lệ. Bạn thắng!`);
    }
  },

  highlightAISquare(row, col) {
    setTimeout(() => {
      const squares = this.boardContainer.querySelectorAll('.chess-square');
      squares.forEach(sq => {
        if (parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col) {
          sq.classList.add('indicator-ai');
        }
      });
    }, 50);
  },

  getColLetter(col) {
    return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][col];
  },

  logMove(msg) {
    this.logContent.innerHTML += `<br>• ${msg}`;
    this.logContent.scrollTop = this.logContent.scrollHeight; 
  }
};
