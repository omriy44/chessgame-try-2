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
    console.log("Board DOM created");
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
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', drag);
                square.appendChild(pieceElement);
            }
        }
    }
    document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
    console.log("Board updated, current turn:", isWhiteTurn ? "White" : "Black");
}

function drag(event) {
    const square = event.target.parentNode;
    const [file, rank] = [square.id.charCodeAt(0) - 97, 8 - parseInt(square.id[1])];
    const piece = board[rank][file];
    const isWhitePiece = piece === piece.toUpperCase();
    
    console.log("Drag attempt:", square.id, "Piece:", piece, "Is white piece:", isWhitePiece, "Is white turn:", isWhiteTurn);
    
    if (isWhitePiece !== isWhiteTurn) {
        console.log("Drag prevented: wrong turn");
        event.preventDefault();
        return false;
    }
    event.dataTransfer.setData("text", square.id);
    console.log("Drag allowed");
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const fromSquareId = event.dataTransfer.getData("text");
    const toSquareId = event.target.closest('.square').id;
    const move = `${fromSquareId}-${toSquareId}`;
    
    console.log("Drop attempt:", move);
    
    if (isValidMove(move)) {
        makeMove(move);
        isWhiteTurn = !isWhiteTurn;
        updateBoard();
        console.log("Move made:", move);
    } else {
        console.log("Invalid move:", move);
        alert("Invalid move. Please try again.");
    }
}

function isValidMove(move) {
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    const piece = board[fromRank][fromFile];
    if (piece === ' ') {
        console.log("Invalid move: no piece at start position");
        return false;
    }

    const isWhitePiece = piece === piece.toUpperCase();
    if (isWhitePiece !== isWhiteTurn) {
        console.log("Invalid move: wrong turn");
        return false;
    }

    const targetPiece = board[toRank][toFile];
    if (targetPiece !== ' ' && isWhitePiece === (targetPiece === targetPiece.toUpperCase())) {
        console.log("Invalid move: cannot capture own piece");
        return false;
    }

    // Add piece-specific move validation here
    // For now, we'll allow any move that's not to the same square
    if (from === to) {
        console.log("Invalid move: same square");
        return false;
    }

    console.log("Move validated");
    return true;
}

function makeMove(move) {
    const [from, to] = move.split('-');
    const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
    const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

    board[toRank][toFile] = board[fromRank][fromFile];
    board[fromRank][fromFile] = ' ';
    console.log("Move made on board:", move);
}

window.onload = function() {
    createBoardDOM();
    initializeBoard();
    updateBoard();
    console.log("Chess game initialized");
};
