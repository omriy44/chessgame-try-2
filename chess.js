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

    if (isValidMove(move, true)) {
        makeMove(move);
        console.log("Board state after player move:", JSON.stringify(board));
        
        // Update isPlayerTurn before calling computerMove
        isPlayerTurn = false;
        console.log("Switching turn to computer. isPlayerTurn is now:", isPlayerTurn);
        
        updateBoard();
        
        // Call computerMove after a short delay
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

function computerMove() {
    console.log("Starting computer move");
    console.log("Current board state:", JSON.stringify(board));
    console.log(`Is player turn: ${isPlayerTurn}`);

    if (isPlayerTurn) {
        console.error("It's not the computer's turn yet. This shouldn't happen.");
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
    console.log("Switching turn to player. isPlayerTurn is now:", isPlayerTurn);
    updateBoard();

    console.log("Board after computer move:", JSON.stringify(board));
    console.log("Waiting for player's move...");
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
            const isValidDoubleMove = board[fromRank + direction][fromFile] === ' ';
            console.log(`Is valid pawn double move: ${isValidDoubleMove}`);
            return isValidDoubleMove;
        }
        const isValidSingleMove = toRank === fromRank + direction && fromFile === toFile;
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

window.onload = function() {
    initializeBoard();
    createBoardDOM();
    updateBoard();
};
