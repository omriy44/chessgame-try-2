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
    console.log("Current board state:");
    printBoard();
    
    const possibleMoves = getAllPossibleMoves(false);
    console.log("All possible moves:", possibleMoves);
    
    if (possibleMoves.length === 0) {
        console.log("No valid moves for computer");
        if (isInCheck(false)) {
            alert("Checkmate! You win!");
        } else {
            alert("Stalemate! The game is a draw.");
        }
        return;
    }

    // Evaluate all moves
    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
        const [from, to] = move.split('-');
        const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
        const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];
        
        const movingPiece = board[fromRank][fromFile];
        const capturedPiece = board[toRank][toFile];

        console.log(`Evaluating move: ${move}`);
        console.log(`Moving piece: ${movingPiece}, Captured piece: ${capturedPiece}`);

        const oldBoard = JSON.parse(JSON.stringify(board));
        makeMove(move);
        
        const score = evaluatePosition();
        console.log(`Score for move ${move}: ${score}`);

        board = oldBoard;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
            console.log(`New best move: ${bestMove} with score ${bestScore}`);
        }
    }

    if (!bestMove) {
        bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        console.log("No best move found. Choosing random move:", bestMove);
    }

    console.log(`Computer chooses move: ${bestMove} with score ${bestScore}`);
    makeMove(bestMove);
    isPlayerTurn = true;
    updateBoard();

    console.log("Final board state after computer move:");
    printBoard();
}

function evaluatePosition() {
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j].toLowerCase();
            if (piece !== ' ') {
                const value = getPieceValue(piece);
                score += board[i][j] === board[i][j].toUpperCase() ? -value : value;
            }
        }
    }
    return score;
}

function getPieceValue(piece) {
    const values = {
        'p': 1,
        'n': 3,
        'b': 3,
        'r': 5,
        'q': 9,
        'k': 0
    };
    return values[piece] || 0;
}

function printBoard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        console.log(board[i].join(' '));
    }
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
