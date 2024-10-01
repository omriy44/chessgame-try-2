const BOARD_SIZE = 8;
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
let isWhiteTurn = true;

const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

function initializeBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    console.log("Board initialized");
}

function createBoardDOM() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const square = document.createElement('div');
            square.id = `${String.fromCharCode(97 + j)}${8 - i}`;
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            boardElement.appendChild(square);
        }
    }
    console.log("Board DOM created");
}

function updateBoard() {
    console.log("Updating board...");
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const squareId = `${String.fromCharCode(97 + j)}${8 - i}`;
            const square = document.getElementById(squareId);
            if (square) {
                square.textContent = PIECES[board[i][j]] || '';
            }
        }
    }
    document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
    console.log("Board updated");
}

function isValidMove(move) {
    console.log(`Checking move: ${move}`);
    const [from, to] = move.split('-');
    if (!from || !to || from.length !== 2 || to.length !== 2) {
        console.log("Invalid move format");
        return false;
    }

    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    if (fromFile < 0 || fromFile > 7 || fromRank < 0 || fromRank > 7 ||
        toFile < 0 || toFile > 7 || toRank < 0 || toRank > 7) {
        console.log("Move out of board bounds");
        return false;
    }

    const piece = board[fromRank][fromFile];
    if (piece === ' ') {
        console.log("No piece at start position");
        return false;
    }

    const isWhitePiece = piece === piece.toUpperCase();
    if (isWhitePiece !== isWhiteTurn) {
        console.log("Wrong color piece for current turn");
        return false;
    }

    const targetPiece = board[toRank][toFile];
    if (targetPiece !== ' ' && isWhitePiece === (targetPiece === targetPiece.toUpperCase())) {
        console.log("Cannot capture own piece");
        return false;
    }

    // Check if the path is clear (except for knights)
    if (piece.toLowerCase() !== 'n' && !isPathClear(fromFile, fromRank, toFile, toRank)) {
        console.log("Path is not clear");
        return false;
    }

    // For now, allow any move that meets the above criteria
    console.log("Move is valid");
    return true;
}

function isPathClear(fromFile, fromRank, toFile, toRank) {
    const fileStep = Math.sign(toFile - fromFile);
    const rankStep = Math.sign(toRank - fromRank);

    let currentFile = fromFile + fileStep;
    let currentRank = fromRank + rankStep;

    while (currentFile !== toFile || currentRank !== toRank) {
        if (board[currentRank][currentFile] !== ' ') {
            return false;
        }
        currentFile += fileStep;
        currentRank += rankStep;
    }

    return true;
}

function makeMove(move) {
    console.log(`Making move: ${move}`);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';
}

window.handleMove = function() {
    const moveInput = document.getElementById('move');
    const move = moveInput.value.toLowerCase();
    console.log(`Attempting move: ${move}`);
    if (isValidMove(move)) {
        makeMove(move);
        isWhiteTurn = !isWhiteTurn;
        updateBoard();
        moveInput.value = '';
        console.log("Move made successfully");
    } else {
        alert('Illegal move. Try again.');
        moveInput.value = '';
        console.log("Illegal move attempted");
    }
};

window.onload = function() {
    createBoardDOM();
    initializeBoard();
    updateBoard();
};
