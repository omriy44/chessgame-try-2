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

    // For now, allow any move that meets the above criteria
    console.log("Move is valid");
    return true;
}

// ... (keep your existing piece movement validation functions)

function isInCheck(isWhiteKing) {
    console.log(`Checking if ${isWhiteKing ? 'white' : 'black'} king is in check`);
    // Find the king's position
    let kingFile, kingRank;
    const kingPiece = isWhiteKing ? 'K' : 'k';
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            if (board[rank][file] === kingPiece) {
                kingFile = file;
                kingRank = rank;
                break;
            }
        }
        if (kingFile !== undefined) break;
    }

    // Check if any opponent's piece can attack the king
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            const piece = board[rank][file];
            if (piece !== ' ' && isWhiteKing !== (piece === piece.toUpperCase())) {
                if (isValidMove(`${String.fromCharCode(97 + file)}${8 - rank}-${String.fromCharCode(97 + kingFile)}${8 - kingRank}`)) {
                    console.log(`King is in check by piece at ${String.fromCharCode(97 + file)}${8 - rank}`);
                    return true;
                }
            }
        }
    }
    console.log("King is not in check");
    return false;
}

function highlightKingInCheck(isWhiteKing) {
    console.log(`Highlighting ${isWhiteKing ? 'white' : 'black'} king`);
    const kingPiece = isWhiteKing ? 'K' : 'k';
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            if (board[rank][file] === kingPiece) {
                const squareId = `${String.fromCharCode(97 + file)}${8 - rank}`;
                const square = document.getElementById(squareId);
                if (square) {
                    square.style.backgroundColor = 'red';
                    console.log(`King square ${squareId} highlighted`);
                }
                return;
            }
        }
    }
}

function clearHighlights() {
    console.log("Clearing highlights");
    for (let rank = 0; rank < BOARD_SIZE; rank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
            const squareId = `${String.fromCharCode(97 + file)}${8 - rank}`;
            const square = document.getElementById(squareId);
            if (square) {
                square.style.backgroundColor = '';
            }
        }
    }
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
    if (isValidMove(move, isCurrentPlayerInCheck)) {
        makeMove(move);
        isWhiteTurn = !isWhiteTurn;
        clearHighlights();
        updateBoard();
        moveInput.value = '';
        console.log("Move made successfully");
        
        isCurrentPlayerInCheck = isInCheck(isWhiteTurn);
        if (isCurrentPlayerInCheck) {
            highlightKingInCheck(isWhiteTurn);
            alert(isWhiteTurn ? "White is in check!" : "Black is in check!");
        }
    } else {
        console.log("Move is invalid");
        if (isCurrentPlayerInCheck) {
            alert('Illegal move. You must move out of check.');
        } else {
            alert('Illegal move. Try again.');
        }
        moveInput.value = '';
    }
};

window.onload = function() {
    createBoardDOM();
    initializeBoard();
    updateBoard();
};
