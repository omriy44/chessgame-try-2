const BOARD_SIZE = 8;
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
let isWhiteTurn = true;

const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

function initializeBoard() {
    // Initialize empty squares
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = ' ';
        }
    }

    // Set up white pieces
    board[7][0] = board[7][7] = 'R';
    board[7][1] = board[7][6] = 'N';
    board[7][2] = board[7][5] = 'B';
    board[7][3] = 'Q';
    board[7][4] = 'K';
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[6][i] = 'P';
    }

    // Set up black pieces
    board[0][0] = board[0][7] = 'r';
    board[0][1] = board[0][6] = 'n';
    board[0][2] = board[0][5] = 'b';
    board[0][3] = 'q';
    board[0][4] = 'k';
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[1][i] = 'p';
    }
}

function updateBoard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const square = document.getElementById(`${String.fromCharCode(97 + j)}${8 - i}`);
            square.textContent = PIECES[board[i][j]] || '';
        }
    }
    document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
}

function isValidMove(move) {
    // This is a simplified validation. A real chess game would need more complex logic.
    const parts = move.split('-');
    if (parts.length !== 2) return false;
    return isValidSquare(parts[0]) && isValidSquare(parts[1]);
}

function isValidSquare(square) {
    if (square.length !== 2) return false;
    const file = square.charAt(0);
    const rank = square.charAt(1);
    return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
}

function makeMove(move) {
    const parts = move.split('-');
    const fromFile = parts[0].charCodeAt(0) - 97;
    const fromRank = 8 - parseInt(parts[0].charAt(1));
    const toFile = parts[1].charCodeAt(0) - 97;
    const toRank = 8 - parseInt(parts[1].charAt(1));

    const piece = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';
    board[toRank][toFile] = piece;
}

function handleMove() {
    const moveInput = document.getElementById('move');
    const move = moveInput.value;
    if (isValidMove(move)) {
        makeMove(move);
        isWhiteTurn = !isWhiteTurn;
        updateBoard();
        moveInput.value = '';
    } else {
        alert('Invalid move. Try again.');
    }
}

window.onload = function() {
    initializeBoard();
    updateBoard();
};
