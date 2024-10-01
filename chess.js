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
    console.log("Board initialized:", board);
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
    if (!isPlayerTurn) return;

    const fromSquareId = event.dataTransfer.getData("text");
    const toSquareId = event.target.closest('.square').id;
    const move = `${fromSquareId}-${toSquareId}`;
    
    if (isValidMove(move)) {
        makeMove(move);
        isPlayerTurn = false;
        updateBoard();
        setTimeout(computerMove, 500);
    } else {
        alert("Invalid move. Please try again.");
    }
}

function isValidMove(move) {
    console.log("Checking move:", move);
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    const piece = board[fromRank][fromFile];
    console.log("Piece:", piece);

    if (piece === ' ' || piece !== piece.toUpperCase()) return false;

    const targetPiece = board[toRank][toFile];
    if (targetPiece !== ' ' && targetPiece === targetPiece.toUpperCase()) return false;

    // Piece-specific move validation
    switch (piece.toLowerCase()) {
        case 'p': return isValidPawnMove(fromFile, fromRank, toFile, toRank, piece === 'P');
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
    if (fromFile === toFile || fromRank === toRank || Math.abs(fromFile - toFile) === Math.abs(fromRank - toRank)) {
        return isPathClear(fromFile, fromRank, toFile, toRank);
    }
    return false;
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
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    const capturedPiece = board[toRank][toFile];
    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';
    return capturedPiece;
}

function computerMove() {
    if (!isBoardValid()) {
        console.error("Invalid board state. Reinitializing the board.");
        initializeBoard();
        updateBoard();
        return;
    }
    
    const depth = 3;
    const bestMove = findBestMove(depth);
    if (bestMove) {
        makeMove(bestMove);
        isPlayerTurn = true;
        updateBoard();
    } else {
        if (isInCheck(false)) {
            alert("Checkmate! You win!");
        } else {
            alert("Stalemate! The game is a draw.");
        }
    }
}

function findBestMove(depth) {
    let bestMove = null;
    let bestScore = -Infinity;
    const moves = getAllPossibleMoves(false);

    for (const move of moves) {
        makeMove(move);
        const score = minimax(depth - 1, -Infinity, Infinity, true);
        undoMove(move);

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function minimax(depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard();
    }

    const moves = getAllPossibleMoves(isMaximizingPlayer);

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            makeMove(move);
            const eval = minimax(depth - 1, alpha, beta, false);
            undoMove(move);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            makeMove(move);
            const eval = minimax(depth - 1, alpha, beta, true);
            undoMove(move);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}

function evaluateBoard() {
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ') {
                score += PIECE_VALUES[piece];
                // Add positional bonuses
                score += getPositionalBonus(piece, i, j);
            }
        }
    }
    return score;
}

function getPositionalBonus(piece, rank, file) {
    const pawnPositionBonus = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    const knightPositionBonus = [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ];

    // Add more positional bonuses for other pieces as needed

    if (piece.toLowerCase() === 'p') {
        return pawnPositionBonus[rank][file];
    } else if (piece.toLowerCase() === 'n') {
        return knightPositionBonus[rank][file];
    } else {
        return 0;
    }
}

function undoMove(move, capturedPiece) {
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    board[fromRank][fromFile] = board[toRank][toFile];
    board[toRank][toFile] = capturedPiece;
}

function getAllPossibleMoves(isWhite) {
    const moves = [];
    if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
        console.error("Invalid board state");
        return moves;
    }
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (!Array.isArray(board[i]) || board[i].length !== BOARD_SIZE) {
            console.error(`Invalid board row at index ${i}`);
            continue;
        }
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece && piece !== ' ' && (piece.toUpperCase() === piece) === isWhite) {
                const from = `${String.fromCharCode(97 + j)}${8 - i}`;
                for (let x = 0; x < BOARD_SIZE; x++) {
                    for (let y = 0; y < BOARD_SIZE; y++) {
                        const to = `${String.fromCharCode(97 + y)}${8 - x}`;
                        const move = `${from}-${to}`;
                        if (isValidMove(move)) {
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

window.onload = function() {
    createBoardDOM();
    initializeBoard();
    updateBoard();
};
