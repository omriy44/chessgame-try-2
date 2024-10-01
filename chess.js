const BOARD_SIZE = 8;
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
let isWhiteTurn = true;

const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

function initializeBoard() {
    // Set up white pieces
    board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    board[6] = Array(8).fill('P');

    // Set up black pieces
    board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    board[1] = Array(8).fill('p');
}

function updateBoard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const squareId = `${String.fromCharCode(97 + j)}${8 - i}`;
            const square = document.getElementById(squareId);
            if (square) {
                square.textContent = PIECES[board[i][j]] || '';
            }
        }
    }
    const turnElement = document.getElementById('turn');
    if (turnElement) {
        turnElement.textContent = isWhiteTurn ? "White's turn" : "Black's turn";
    }
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
    if (moveInput) {
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
}

window.onload = function() {
    initializeBoard();
    updateBoard();
};
