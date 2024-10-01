function debug(message) {
    console.log(message);
    const debugElement = document.getElementById('debug');
    if (debugElement) {
        debugElement.innerHTML += message + '<br>';
    }
}

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
    debug("Creating board DOM");
    const boardElement = document.getElementById('board');
    if (!boardElement) {
        debug("Board element not found in createBoardDOM");
        return;
    }
    boardElement.innerHTML = '';

    // Add top coordinates
    boardElement.appendChild(createCoordinate(''));
    for (let i = 0; i < BOARD_SIZE; i++) {
        boardElement.appendChild(createCoordinate(String.fromCharCode(97 + i)));
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
        // Add left coordinates
        boardElement.appendChild(createCoordinate(8 - i));

        for (let j = 0; j < BOARD_SIZE; j++) {
            const square = document.createElement('div');
            square.id = `${String.fromCharCode(97 + j)}${8 - i}`;
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
            square.addEventListener('dragover', allowDrop);
            square.addEventListener('drop', drop);
            boardElement.appendChild(square);
        }
    }
    debug("Board DOM created");
}

function createCoordinate(text) {
    const coordinate = document.createElement('div');
    coordinate.classList.add('coordinate');
    coordinate.textContent = text;
    return coordinate;
}

function updateBoard() {
    console.log("Updating board...");
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const squareId = `${String.fromCharCode(97 + j)}${8 - i}`;
            const square = document.getElementById(squareId);
            if (square) {
                square.innerHTML = '';
                const piece = board[i][j];
                if (piece !== ' ') {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = PIECES[piece];
                    pieceElement.draggable = true;
                    pieceElement.addEventListener('dragstart', drag);
                    square.appendChild(pieceElement);
                }
                square.style.backgroundColor = ''; // Reset background color
            }
        }
    }
    document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
    
    highlightCheck();

    if (isInCheck(isWhiteTurn) && !hasLegalMoves()) {
        alert(isWhiteTurn ? "Checkmate! Black wins!" : "Checkmate! White wins!");
    } else if (!isInCheck(isWhiteTurn) && !hasLegalMoves()) {
        alert("Stalemate! The game is a draw.");
    }

    console.log("Board updated");
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.parentNode.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const fromSquareId = event.dataTransfer.getData("text");
    const toSquareId = event.target.closest('.square').id;
    const move = `${fromSquareId}-${toSquareId}`;
    
    if (isValidMove(move)) {
        makeMove(move);
        isWhiteTurn = !isWhiteTurn;
        updateBoard();
        
        if (isInCheck(!isWhiteTurn)) {
            debug(isWhiteTurn ? "Black is in check!" : "White is in check!");
            alert(isWhiteTurn ? "Black is in check!" : "White is in check!");
        }
    } else {
        debug("Invalid move");
        alert("Invalid move. Please try again.");
    }
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
                if (isValidMove(`${String.fromCharCode(97 + file)}${8 - rank}-${String.fromCharCode(97 + king.file)}${8 - king.rank}`, false)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function hasLegalMoves() {
    for (let fromRank = 0; fromRank < BOARD_SIZE; fromRank++) {
        for (let fromFile = 0; fromFile < BOARD_SIZE; fromFile++) {
            const piece = board[fromRank][fromFile];
            if (piece !== ' ' && (isWhiteTurn === (piece === piece.toUpperCase()))) {
                for (let toRank = 0; toRank < BOARD_SIZE; toRank++) {
                    for (let toFile = 0; toFile < BOARD_SIZE; toFile++) {
                        const move = `${String.fromCharCode(97 + fromFile)}${8 - fromRank}-${String.fromCharCode(97 + toFile)}${8 - toRank}`;
                        if (isValidMove(move)) {
                            return true;
                        }
                    }
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

function makeMove(move) {
    console.log(`Making move: ${move}`);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';
}

window.onload = function() {
    debug("Window loaded");
    const boardElement = document.getElementById('board');
    if (boardElement) {
        debug("Board element found");
    } else {
        debug("Board element not found");
    }
    createBoardDOM();
    initializeBoard();
    updateBoard();
    debug("Initialization complete");
};
