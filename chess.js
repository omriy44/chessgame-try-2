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
    console.log("It's the player's turn to move.");
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
    if (!isPlayerTurn) {
        console.log("It's not the player's turn yet.");
        return;
    }

    const fromSquareId = event.dataTransfer.getData("text");
    const toSquareId = event.target.closest('.square').id;
    const move = `${fromSquareId}-${toSquareId}`;
    
    console.log(`Player attempting move: ${move}`);
    console.log("Board state before move:", JSON.stringify(board));

    if (isValidMove(move, true)) {
        makeMove(move);
        isPlayerTurn = false;
        updateBoard();
        console.log("Board state after player move:", JSON.stringify(board));
        
        // Call computerMove directly after the player's move
        computerMove();
    } else {
        alert("Invalid move. Please try again.");
    }
}

function isValidMove(move, isPlayerTurn) {
    console.log(`Checking if move ${move} is valid for ${isPlayerTurn ? 'player' : 'computer'}`);
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
    if (piece === ' ' || isPieceWhite !== isPlayerTurn) {
        console.log(`Invalid move: No piece or wrong color at ${from}`);
        return false;
    }

    const targetPiece = board[toRank][toFile];
    console.log(`Target piece: ${targetPiece}`);

    // Check if the target square is empty or contains an opponent's piece
    if (targetPiece !== ' ' && (targetPiece === targetPiece.toUpperCase()) === isPlayerTurn) {
        console.log(`Invalid move: Cannot capture own piece at ${to}`);
        return false;
    }

    // For simplicity, we'll allow any move that's not to the same square
    // You can add more specific move validation for each piece type here
    if (from === to) {
        console.log(`Invalid move: Cannot move to the same square`);
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

function computerMove() {
    console.log("Starting computer move");
    console.log("Current board state:", JSON.stringify(board));

    if (isPlayerTurn) {
        console.log("It's not the computer's turn yet.");
        return;
    }

    const possibleMoves = getAllPossibleMoves(false);
    console.log(`Possible moves: ${possibleMoves.length}`);

    if (possibleMoves.length === 0) {
        console.log("No valid moves for computer");
        if (isInCheck(false)) {
            alert("Checkmate! You win!");
        } else {
            alert("Stalemate! The game is a draw.");
        }
        return;
    }

    // Choose a random move
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const chosenMove = possibleMoves[randomIndex];

    console.log(`Computer chooses move: ${chosenMove}`);
    makeMove(chosenMove);
    isPlayerTurn = true;
    updateBoard();

    console.log("Board after computer move:", JSON.stringify(board));
    console.log("Waiting for player's move...");
}

function getAllPossibleMoves(isWhite) {
    const moves = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const piece = board[i][j];
            if (piece !== ' ' && (piece === piece.toUpperCase()) !== isWhite) {
                const from = `${String.fromCharCode(97 + j)}${8 - i}`;
                for (let x = 0; x < BOARD_SIZE; x++) {
                    for (let y = 0; y < BOARD_SIZE; y++) {
                        const to = `${String.fromCharCode(97 + y)}${8 - x}`;
                        const move = `${from}-${to}`;
                        if (isValidMove(move, isWhite)) {
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

window.onload = function() {
    initializeBoard();
    createBoardDOM();
    updateBoard();
};
