const BOARD_SIZE = 8;
let board = [];
let isPlayerTurn = true;

const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const PIECE_VALUES = {
    'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': -100,
    'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100
};

// Add this global variable at the top of your file
let moveCount = 0;

const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

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
    isPlayerTurn = true;
    console.log("Board initialized:", JSON.stringify(board));
    console.log("It's the player's turn to move. isPlayerTurn is:", isPlayerTurn);
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
            square.addEventListener('dragover', allowDrop);
            square.addEventListener('drop', drop);
            boardElement.appendChild(square);
        }
    }
}

function updateBoard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const squareId = `${String.fromCharCode(97 + j)}${8 - i}`;
            const square = document.getElementById(squareId);
            square.innerHTML = '';
            const piece = board[i][j];
            if (piece !== ' ') {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = PIECES[piece];
                pieceElement.draggable = piece === piece.toUpperCase();
                pieceElement.addEventListener('dragstart', drag);
                square.appendChild(pieceElement);
            }
        }
    }
    document.getElementById('turn').textContent = isPlayerTurn ? "Your turn" : "Computer's turn";

    if (!checkBoardIntegrity()) {
        console.error("Board integrity check failed. Reinitializing the board.");
        initializeBoard();
        // Update the visual representation again with the reinitialized board
        // ...
    }
}

function drag(event) {
    if (!isPlayerTurn) {
        event.preventDefault();
        return false;
    }
    event.dataTransfer.setData("text", event.target.parentNode.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    console.log(`Current turn: ${isPlayerTurn ? 'Player' : 'Computer'}`);
    if (!isPlayerTurn) {
        console.log("It's not the player's turn yet.");
        return;
    }

    const fromSquareId = event.dataTransfer.getData("text");
    const toSquareId = event.target.closest('.square').id;
    const move = `${fromSquareId}-${toSquareId}`;
    
    console.log(`Player attempting move: ${move}`);
    console.log("Board state before move:", JSON.stringify(board));

    if (isValidMove(move, true)) { // Changed to true here
        makeMove(move);
        console.log("Board state after player move:", JSON.stringify(board));
        
        isPlayerTurn = false;
        console.log("Switching turn to computer. isPlayerTurn is now:", isPlayerTurn);
        
        updateBoard();
        
        setTimeout(() => {
            computerMove();
        }, 100);
    } else {
        alert("Invalid move. Please try again.");
    }
}

function isValidMove(move, isPlayerMove) {
    console.log(`Checking if move ${move} is valid for ${isPlayerMove ? 'player' : 'computer'}`);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    console.log(`From: [${fromRank}, ${fromFile}], To: [${toRank}, ${toFile}]`);

    if (fromRank < 0 || fromRank >= BOARD_SIZE || fromFile < 0 || fromFile >= BOARD_SIZE ||
        toRank < 0 || toRank >= BOARD_SIZE || toFile < 0 || toFile >= BOARD_SIZE) {
        console.log(`Invalid move: Out of bounds`);
        return false;
    }

    const piece = board[fromRank][fromFile];
    console.log(`Piece at from position: ${piece}`);

    // Check if the piece belongs to the current player
    const isPieceWhite = piece === piece.toUpperCase();
    console.log(`Is piece white: ${isPieceWhite}, Is player move: ${isPlayerMove}`);
    if (piece === ' ' || isPieceWhite !== isPlayerMove) {
        console.log(`Invalid move: No piece or wrong color at ${from}`);
        return false;
    }

    const targetPiece = board[toRank][toFile];
    console.log(`Target piece: ${targetPiece}`);

    // Check if the target square is empty or contains an opponent's piece
    const isCapture = targetPiece !== ' ';
    if (isCapture && (targetPiece === targetPiece.toUpperCase()) === isPieceWhite) {
        console.log(`Invalid move: Cannot capture own piece at ${to}`);
        return false;
    }

    // Piece-specific move validation
    const pieceType = piece.toLowerCase();
    let isValidPieceMove;

    switch (pieceType) {
        case 'p':
            isValidPieceMove = isPawnMove(fromRank, fromFile, toRank, toFile, isPieceWhite, isCapture);
            break;
        case 'r':
            isValidPieceMove = isRookMove(fromRank, fromFile, toRank, toFile);
            break;
        case 'n':
            isValidPieceMove = isKnightMove(fromRank, fromFile, toRank, toFile);
            break;
        case 'b':
            isValidPieceMove = isBishopMove(fromRank, fromFile, toRank, toFile);
            break;
        case 'q':
            isValidPieceMove = isQueenMove(fromRank, fromFile, toRank, toFile);
            break;
        case 'k':
            isValidPieceMove = isKingMove(fromRank, fromFile, toRank, toFile);
            break;
        default:
            console.log(`Invalid piece type: ${pieceType}`);
            return false;
    }

    console.log(`Is valid ${pieceType} move: ${isValidPieceMove}`);

    if (!isValidPieceMove) {
        console.log(`Invalid move for ${pieceType}`);
        return false;
    }

    console.log(`Move ${move} is valid`);
    return true;
}

function makeMove(move) {
    console.log(`Making move: ${move}`);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    console.log(`Moving from [${fromRank}, ${fromFile}] to [${toRank}, ${toFile}]`);
    console.log(`Piece being moved: ${board[fromRank][fromFile]}`);
    console.log(`Piece at destination before move: ${board[toRank][toFile]}`);

    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';

    console.log("Board after move:", JSON.stringify(board));
}

function undoMove(move) {
    console.log(`Undoing move: ${move}`);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    if (fromRank < 0 || fromRank >= BOARD_SIZE || fromFile < 0 || fromFile >= BOARD_SIZE ||
        toRank < 0 || toRank >= BOARD_SIZE || toFile < 0 || toFile >= BOARD_SIZE) {
        console.error(`Invalid move to undo: ${move}`);
        return;
    }

    console.log(`Moving piece from [${toRank}, ${toFile}] back to [${fromRank}, ${fromFile}]`);
    console.log(`Piece being moved back: ${board[toRank][toFile]}`);

    board[fromRank][fromFile] = board[toRank][toFile];
    board[toRank][toFile] = ' ';

    console.log("Board after undo:", JSON.stringify(board));
}

function orderMoves(moves) {
    return moves.sort((a, b) => {
        const pieceA = board[8 - parseInt(a[1])][a.charCodeAt(0) - 97];
        const pieceB = board[8 - parseInt(b[1])][b.charCodeAt(0) - 97];
        return PIECE_VALUES[pieceB] - PIECE_VALUES[pieceA];
    });
}

let isTimeUp = false;

function computerMove() {
    console.log("Starting computer move");
    
    const startTime = Date.now();
    const timeLimit = 5000; // 5 seconds time limit

    const possibleMoves = getAllPossibleMoves(false);
    
    if (possibleMoves.length === 0) {
        console.log("No valid moves for computer");
        if (isInCheck(false)) {
            alert("Checkmate! You win!");
        } else {
            alert("Stalemate! The game is a draw.");
        }
        return;
    }

    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
        const oldBoard = JSON.parse(JSON.stringify(board));
        makeMove(move);
        const score = evaluatePosition(false);
        board = oldBoard;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }

        if (Date.now() - startTime > timeLimit) {
            console.log("Time limit reached");
            break;
        }
    }

    if (!bestMove) {
        bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        console.log("Choosing random move");
    }

    console.log(`Computer chooses move: ${bestMove} with score ${bestScore}`);
    makeMove(bestMove);
    isPlayerTurn = true;
    updateBoard();

    console.log(`Move calculation took ${Date.now() - startTime} ms`);
}

function evaluatePosition(isPlayerTurn) {
    let score = 0;

    // Material score
    score += evaluateMaterial();

    // Piece development and center control
    score += evaluateDevelopmentAndCenter(isPlayerTurn);

    // King safety
    score += evaluateKingSafety(isPlayerTurn);

    // Pawn structure
    score += evaluatePawnStructure(isPlayerTurn);

    return isPlayerTurn ? -score : score;
}

function evaluateMaterial() {
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j].toLowerCase();
            if (piece !== ' ') {
                const value = pieceValues[piece];
                score += board[i][j] === board[i][j].toUpperCase() ? value : -value;
            }
        }
    }
    return score * 100; // Prioritize material gain
}

function evaluateDevelopmentAndCenter(isPlayerTurn) {
    const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j].toLowerCase();
            if (piece !== ' ' && piece !== 'p' && piece !== 'k') {
                // Encourage piece development
                score += (isPlayerTurn ? -1 : 1) * (piece === board[i][j].toUpperCase() ? 1 : -1);
                
                // Encourage controlling the center
                if (centerSquares.some(([x, y]) => x === i && y === j)) {
                    score += (isPlayerTurn ? -1 : 1) * (piece === board[i][j].toUpperCase() ? 2 : -2);
                }
            }
        }
    }
    return score;
}

function evaluateKingSafety(isPlayerTurn) {
    // Simplified king safety evaluation
    const kingPos = findKing(isPlayerTurn);
    if (!kingPos) return 0;

    let score = 0;
    const [kx, ky] = kingPos;

    // Penalize king in the center
    if (kx > 2 && kx < 6 && ky > 1 && ky < 6) {
        score -= 5;
    }

    // Encourage castling
    if ((kx === 0 || kx === 7) && (ky === 2 || ky === 6)) {
        score += 10;
    }

    return score;
}

function evaluatePawnStructure(isPlayerTurn) {
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        let pawnCount = 0;
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[j][i].toLowerCase() === 'p') {
                pawnCount++;
                // Penalize doubled pawns
                if (pawnCount > 1) {
                    score -= 5;
                }
                // Encourage pawn advancement
                score += (isPlayerTurn ? -1 : 1) * (board[j][i] === 'P' ? j : 7 - j);
            }
        }
    }
    return score;
}

function findKing(isPlayerTurn) {
    const kingPiece = isPlayerTurn ? 'K' : 'k';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === kingPiece) {
                return [i, j];
            }
        }
    }
    return null;
}

function getAllPossibleMoves(isPlayerMove) {
    const moves = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ' && (piece === piece.toUpperCase()) === isPlayerMove) {
                const from = `${String.fromCharCode(97 + j)}${8 - i}`;
                for (let x = 0; x < BOARD_SIZE; x++) {
                    for (let y = 0; y < BOARD_SIZE; y++) {
                        const to = `${String.fromCharCode(97 + y)}${8 - x}`;
                        const move = `${from}-${to}`;
                        if (isValidMove(move, isPlayerMove)) {
                            moves.push(move);
                        }
                    }
                }
            }
        }
    }
    return moves;
}

// Add this function to check if a king is in check
function isInCheck(isWhiteKing) {
    // Find the king's position
    let kingPos;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === (isWhiteKing ? 'K' : 'k')) {
                kingPos = { rank: i, file: j };
                break;
            }
        }
        if (kingPos) break;
    }

    // Check if any opponent's piece can attack the king
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ' && (piece === piece.toUpperCase()) !== isWhiteKing) {
                const move = `${String.fromCharCode(97 + j)}${8 - i}-${String.fromCharCode(97 + kingPos.file)}${8 - kingPos.rank}`;
                if (isValidMove(move)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Add this function to check the board state
function isBoardValid() {
    if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
        console.error("Invalid board structure");
        return false;
    }
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (!Array.isArray(board[i]) || board[i].length !== BOARD_SIZE) {
            console.error(`Invalid board row at index ${i}`);
            return false;
        }
    }
    return true;
}

// Add these logging functions at the top of your chess.js file
function logBoard() {
    console.log("Current board state:");
    for (let i = 0; i < BOARD_SIZE; i++) {
        console.log(board[i].join(' '));
    }
}

function logMove(move, message) {
    console.log(`${message}: ${move}`);
}

function checkBoardIntegrity() {
    console.log("Checking board integrity");
    if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
        console.error("Invalid board structure");
        return false;
    }
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (!Array.isArray(board[i]) || board[i].length !== BOARD_SIZE) {
            console.error(`Invalid row at index ${i}`);
            return false;
        }
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (typeof board[i][j] !== 'string') {
                console.error(`Invalid piece at [${i}, ${j}]: ${board[i][j]}`);
                return false;
            }
        }
    }
    console.log("Board integrity check passed");
    return true;
}

function isPawnMove(fromRank, fromFile, toRank, toFile, isWhite, isCapture) {
    console.log(`Checking pawn move: fromRank=${fromRank}, fromFile=${fromFile}, toRank=${toRank}, toFile=${toFile}, isWhite=${isWhite}, isCapture=${isCapture}`);
    const direction = isWhite ? -1 : 1;
    const startRank = isWhite ? 6 : 1;
    
    if (isCapture) {
        const isValidCapture = toRank === fromRank + direction && Math.abs(toFile - fromFile) === 1;
        console.log(`Is valid pawn capture: ${isValidCapture}`);
        return isValidCapture;
    } else {
        if (fromRank === startRank && toRank === fromRank + 2 * direction && fromFile === toFile) {
            const isValidDoubleMove = board[fromRank + direction][fromFile] === ' ' && board[toRank][toFile] === ' ';
            console.log(`Is valid pawn double move: ${isValidDoubleMove}`);
            return isValidDoubleMove;
        }
        const isValidSingleMove = toRank === fromRank + direction && fromFile === toFile && board[toRank][toFile] === ' ';
        console.log(`Is valid pawn single move: ${isValidSingleMove}`);
        return isValidSingleMove;
    }
}

function isRookMove(fromRank, fromFile, toRank, toFile) {
    return (fromRank === toRank || fromFile === toFile) && isPathClear(fromRank, fromFile, toRank, toFile);
}

function isKnightMove(fromRank, fromFile, toRank, toFile) {
    const rankDiff = Math.abs(toRank - fromRank);
    const fileDiff = Math.abs(toFile - fromFile);
    return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
}

function isBishopMove(fromRank, fromFile, toRank, toFile) {
    return Math.abs(toRank - fromRank) === Math.abs(toFile - fromFile) && isPathClear(fromRank, fromFile, toRank, toFile);
}

function isQueenMove(fromRank, fromFile, toRank, toFile) {
    return (isRookMove(fromRank, fromFile, toRank, toFile) || isBishopMove(fromRank, fromFile, toRank, toFile));
}

function isKingMove(fromRank, fromFile, toRank, toFile) {
    return Math.abs(toRank - fromRank) <= 1 && Math.abs(toFile - fromFile) <= 1;
}

function isPathClear(fromRank, fromFile, toRank, toFile) {
    const rankStep = Math.sign(toRank - fromRank);
    const fileStep = Math.sign(toFile - fromFile);
    let currentRank = fromRank + rankStep;
    let currentFile = fromFile + fileStep;

    while (currentRank !== toRank || currentFile !== toFile) {
        if (board[currentRank][currentFile] !== ' ') {
            return false;
        }
        currentRank += rankStep;
        currentFile += fileStep;
    }
    return true;
}

function evaluateBoard() {
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ') {
                // Material score
                score += PIECE_VALUES[piece] * (piece.toUpperCase() === piece ? 1 : -1);
                
                // Position score
                switch (piece.toLowerCase()) {
                    case 'p':
                        score += (piece === 'P' ? PAWN_TABLE[i][j] : -PAWN_TABLE[7-i][j]) * 0.1;
                        break;
                    case 'n':
                        score += (piece === 'N' ? KNIGHT_TABLE[i][j] : -KNIGHT_TABLE[7-i][j]) * 0.1;
                        break;
                    case 'b':
                        score += (piece === 'B' ? BISHOP_TABLE[i][j] : -BISHOP_TABLE[7-i][j]) * 0.1;
                        break;
                    case 'r':
                        score += (piece === 'R' ? ROOK_TABLE[i][j] : -ROOK_TABLE[7-i][j]) * 0.1;
                        break;
                    case 'q':
                        score += (piece === 'Q' ? QUEEN_TABLE[i][j] : -QUEEN_TABLE[7-i][j]) * 0.1;
                        break;
                    case 'k':
                        score += (piece === 'K' ? KING_TABLE[i][j] : -KING_TABLE[7-i][j]) * 0.1;
                        break;
                }
            }
        }
    }
    return score;
}

window.onload = function() {
    initializeBoard();
    createBoardDOM();
    updateBoard();
};
