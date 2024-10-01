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
                highlightCheck();
            }
        }
    }
    document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
    console.log("Board updated");
    highlightCheck();
}

function isValidMove(move, checkForCheck = true) {
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
    let validMove;
    switch (piece.toLowerCase()) {
        case 'p': validMove = isValidPawnMove(fromFile, fromRank, toFile, toRank, isWhitePiece); break;
        case 'r': validMove = isValidRookMove(fromFile, fromRank, toFile, toRank); break;
        case 'n': validMove = isValidKnightMove(fromFile, fromRank, toFile, toRank); break;
        case 'b': validMove = isValidBishopMove(fromFile, fromRank, toFile, toRank); break;
        case 'q': validMove = isValidQueenMove(fromFile, fromRank, toFile, toRank); break;
        case 'k': validMove = isValidKingMove(fromFile, fromRank, toFile, toRank); break;
        default: return false;
    }

    if (validMove && checkForCheck) {
        // Make the move temporarily
        const capturedPiece = board[toRank][toFile];
        board[toRank][toFile] = board[fromRank][fromFile];
        board[fromRank][fromFile] = ' ';

        // Check if the move leaves the king in check
        const inCheck = isInCheck(isWhitePiece);

        // Undo the move
        board[fromRank][fromFile] = board[toRank][toFile];
        board[toRank][toFile] = capturedPiece;

        if (inCheck) {
            console.log("Move leaves king in check");
            return false;
        }
    }

    return validMove;
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

function findKing(isWhite) {
    const kingPiece = isWhite ? 'K' : 'k';
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            if (board[rank][file] === kingPiece) {
                return { file, rank };
            }
        }
    }
    return null; // This should never happen in a valid game
}

function isInCheck(isWhiteKing) {
    const king = findKing(isWhiteKing);
    if (!king) return false;

    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            const piece = board[rank][file];
            if (piece !== ' ' && isWhiteKing !== (piece === piece.toUpperCase())) {
                if (isValidMove(`${String.fromCharCode(97 + file)}${8 - rank}-${String.fromCharCode(97 + king.file)}${8 - king.rank}`)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function highlightCheck() {
    const king = findKing(isWhiteTurn);
    if (king && isInCheck(isWhiteTurn)) {
        const squareId = `${String.fromCharCode(97 + king.file)}${8 - king.rank}`;
        const square = document.getElementById(squareId);
        if (square) {
            square.style.backgroundColor = 'red';
        }
    }
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
        
        if (isInCheck(!isWhiteTurn)) {
            alert(isWhiteTurn ? "Black is in check!" : "White is in check!");
        }
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
