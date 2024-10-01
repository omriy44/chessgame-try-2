(function() {
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
        console.log("Initial board state:", board);
        logBoardState();
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
    }

    function updateBoard() {
        console.log("Updating board...");
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const squareId = `${String.fromCharCode(97 + j)}${8 - i}`;
                const square = document.getElementById(squareId);
                if (square) {
                    const piece = board[i][j];
                    square.textContent = PIECES[piece] || '';
                    console.log(`Square ${squareId}: ${piece} (${PIECES[piece] || 'empty'})`);
                } else {
                    console.error(`Square element not found: ${squareId}`);
                }
            }
        }
        document.getElementById('turn').textContent = isWhiteTurn ? "White's turn" : "Black's turn";
        console.log("Board update complete");
    }

    function isValidMove(move) {
        console.log("Checking move:", move);
        const [from, to] = move.split('-');
        if (!from || !to || from.length !== 2 || to.length !== 2) {
            console.log("Invalid move format");
            return false;
        }

        const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
        const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

        console.log("From:", fromFile, fromRank, "To:", toFile, toRank);

        if (fromFile < 0 || fromFile > 7 || fromRank < 0 || fromRank > 7 ||
            toFile < 0 || toFile > 7 || toRank < 0 || toRank > 7) {
            console.log("Out of board bounds");
            return false;
        }

        const piece = board[fromRank][fromFile];
        console.log("Piece:", piece);

        if (piece === ' ') {
            console.log("No piece at start position");
            return false;
        }

        const isWhitePiece = piece === piece.toUpperCase();
        console.log("Is white piece:", isWhitePiece, "Is white turn:", isWhiteTurn);

        if (isWhitePiece !== isWhiteTurn) return false;

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

        if (validMove && doesMoveputPlayerInCheck(move, isWhitePiece)) {
            return false;
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
        if (Math.abs(toFile - fromFile) === 1 && toRank === fromRank + direction) {
            const targetPiece = board[toRank][toFile];
            if (targetPiece !== ' ' && isWhite !== (targetPiece === targetPiece.toUpperCase())) {
                return true;
            }
        }

        return false;
    }

    function isValidRookMove(fromFile, fromRank, toFile, toRank) {
        if (fromFile !== toFile && fromRank !== toRank) return false;
        return !isPathBlocked(fromFile, fromRank, toFile, toRank);
    }

    function isValidKnightMove(fromFile, fromRank, toFile, toRank) {
        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);
        return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1);
    }

    function isValidBishopMove(fromFile, fromRank, toFile, toRank) {
        if (Math.abs(fromFile - toFile) !== Math.abs(fromRank - toRank)) return false;
        return !isPathBlocked(fromFile, fromRank, toFile, toRank);
    }

    function isValidQueenMove(fromFile, fromRank, toFile, toRank) {
        return isValidRookMove(fromFile, fromRank, toFile, toRank) || isValidBishopMove(fromFile, fromRank, toFile, toRank);
    }

    function isValidKingMove(fromFile, fromRank, toFile, toRank) {
        const fileDiff = Math.abs(fromFile - toFile);
        const rankDiff = Math.abs(fromRank - toRank);
        return fileDiff <= 1 && rankDiff <= 1;
        // TODO: Implement castling
    }

    function isPathBlocked(fromFile, fromRank, toFile, toRank) {
        const fileStep = Math.sign(toFile - fromFile);
        const rankStep = Math.sign(toRank - fromRank);

        let file = fromFile + fileStep;
        let rank = fromRank + rankStep;

        while (file !== toFile || rank !== toRank) {
            if (board[rank][file] !== ' ') return true;
            file += fileStep;
            rank += rankStep;
        }

        return false;
    }

    function makeMove(move) {
        const [from, to] = move.split('-');
        const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
        const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

        console.log(`Moving piece from [${fromRank},${fromFile}] to [${toRank},${toFile}]`);
        console.log(`Piece being moved: ${board[fromRank][fromFile]}`);

        // Move the piece
        board[toRank][toFile] = board[fromRank][fromFile];
        board[fromRank][fromFile] = ' ';

        console.log("Board state after move:");
        board.forEach((row, index) => {
            console.log(`${8 - index}: ${row.join(' ')}`);
        });
    }

    function logBoardState() {
        console.log("Current board state:");
        board.forEach((row, index) => {
            console.log(`${8 - index}: ${row.join(' ')}`);
        });
    }

    function isInCheck(isWhiteKing) {
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
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function doesMoveputPlayerInCheck(move, isWhitePlayer) {
        const [from, to] = move.split('-');
        const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
        const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

        // Make the move temporarily
        const capturedPiece = board[toRank][toFile];
        board[toRank][toFile] = board[fromRank][fromFile];
        board[fromRank][fromFile] = ' ';

        // Check if the player is in check after the move
        const inCheck = isInCheck(isWhitePlayer);

        // Undo the move
        board[fromRank][fromFile] = board[toRank][toFile];
        board[toRank][toFile] = capturedPiece;

        return inCheck;
    }

    window.handleMove = function() {
        const moveInput = document.getElementById('move');
        const move = moveInput.value.toLowerCase();
        console.log("Attempting move:", move);
        if (isValidMove(move)) {
            makeMove(move);
            isWhiteTurn = !isWhiteTurn;
            updateBoard();
            moveInput.value = '';
            console.log("Move made successfully");
            
            if (isInCheck(isWhiteTurn)) {
                alert(isWhiteTurn ? "White is in check!" : "Black is in check!");
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
})();
