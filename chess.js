const BOARD_SIZE = 8;
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
let isPlayerTurn = true;

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
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    const piece = board[fromRank][fromFile];
    if (piece === ' ' || piece !== piece.toUpperCase()) return false;

    const targetPiece = board[toRank][toFile];
    if (targetPiece !== ' ' && targetPiece === targetPiece.toUpperCase()) return false;

    return from !== to;
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
    const depth = 3;
    const bestMove = findBestMove(depth);
    if (bestMove) {
        makeMove(bestMove);
        isPlayerTurn = true;
        updateBoard();
    } else {
        alert("Game over. No more moves for the computer.");
    }
}

function findBestMove(depth) {
    let bestScore = -Infinity;
    let bestMove = null;
    const moves = getAllPossibleMoves(false);
    
    for (const move of moves) {
        const capturedPiece = makeMove(move);
        const score = minimax(depth - 1, false, -Infinity, Infinity);
        undoMove(move, capturedPiece);
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function minimax(depth, isMaximizingPlayer, alpha, beta) {
    if (depth === 0) {
        return evaluateBoard();
    }
    
    const moves = getAllPossibleMoves(isMaximizingPlayer);
    
    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const capturedPiece = makeMove(move);
            const eval = minimax(depth - 1, false, alpha, beta);
            undoMove(move, capturedPiece);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const capturedPiece = makeMove(move);
            const eval = minimax(depth - 1, true, alpha, beta);
            undoMove(move, capturedPiece);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateBoard() {
    const pieceValues = {
        'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': -100,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100
    };
    
    let score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ') {
                score += pieceValues[piece];
            }
        }
    }
    return score;
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
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ' && (piece === piece.toUpperCase()) === isWhite) {
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

window.onload = function() {
    createBoardDOM();
    initializeBoard();
    updateBoard();
};
