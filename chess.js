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

    // Piece-specific movement rules
    switch (piece.toLowerCase()) {
        case 'p': return isValidPawnMove(fromFile, fromRank, toFile, toRank, isWhitePiece);
        case 'r': return isValidRookMove(fromFile, fromRank, toFile, toRank);
        case 'n': return isValidKnightMove(fromFile, fromRank, toFile, toRank);
        case 'b': return isValidBishopMove(fromFile, fromRank, toFile, toRank);
        case 'q': return isValidQueenMove(fromFile, fromRank, toFile, toRank);
        case 'k': return isValidKingMove(fromFile, fromRank, toFile, toRank);
        default: return false;
    }
}

function isValidPawnMove(fromFile, fromRank, toFile, toRank, isWhite) {
    const direction = isWhite ? -1 : 1;
    const startRank = isWhite ? 6 : 1;

    // Move forward one square
    if (fromFile === toFile && toRank === fromRank + direction && board[toRank][toFile] === ' ') {
        return true;
    }

    // Move forward two squares from starting position
    if (fromFile === toFile && fromRank === startRank && toRank === fromRank + 2 * direction &&
        board[fromRank + direction][fromFile] === ' ' && board[toRank][toFile] === ' ') {
        return true;
    }

    // Capture diagonally
    if (Math.abs(fromFile - toFile) === 1 && toRank === fromRank + direction && 
        board[toRank][toFile] !== ' ' && 
        isWhite !== (board[toRank][toFile] === board[toRank][toFile].toUpperCase())) {
        return true;
    }

    return false;
}

function isValidRookMove(fromFile, fromRank, toFile, toRank) {
    if (fromFile !== toFile && fromRank !== toRank) return false;
    return isPathClear(fromFile, fromRank, toFile, toRank);
}

function isValidKnightMove(fromFile, fromRank, toFile, toRank) {
    const fileDiff = Math.abs(fromFile - toFile);
    const rankDiff = Math.abs(fromRank - toRank);
    return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);
}

function isValidBishopMove(fromFile, fromRank, toFile, toRank) {
    if (Math.abs(fromFile - toFile) !== Math.abs(fromRank - toRank)) return false;
    return isPathClear(fromFile, fromRank, toFile, toRank);
}

function isValidQueenMove(fromFile, fromRank, toFile, toRank) {
    if ((fromFile !== toFile && fromRank !== toRank) && 
        (Math.abs(fromFile - toFile) !== Math.abs(fromRank - toRank))) return false;
    return isPathClear(fromFile, fromRank, toFile, toRank);
}

function isValidKingMove(fromFile, fromRank, toFile, toRank) {
    const fileDiff = Math.abs(fromFile - toFile);
    const rankDiff = Math.abs(fromRank - toRank);
    return fileDiff <= 1 && rankDiff <= 1;
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
