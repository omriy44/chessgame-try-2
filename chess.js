(function() {
    const BOARD_SIZE = 8;
    let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
    let isWhiteTurn = true;

    const PIECES = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    function initializeBoard() {
        board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        board[6] = Array(8).fill('P');
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board[1] = Array(8).fill('p');
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

        if (isWhitePiece !== isWhiteTurn) {
            console.log("Wrong color piece for current turn");
            return false;
        }

        const targetPiece = board[toRank][toFile];
        if (targetPiece !== ' ' && isWhitePiece === (targetPiece === targetPiece.toUpperCase())) {
            console.log("Cannot capture own piece");
            return false;
        }

        switch (piece.toLowerCase()) {
            case 'p': return isValidPawnMove(fromFile, fromRank, toFile, toRank, isWhitePiece);
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
        if (Math.abs(fromFile - toFile) === 1 && toRank === fromRank + direction && board[toRank][toFile] !== ' ') {
            return true;
        }

        // TODO: Implement en passant

        return false;
    }

    function isValidRookMove(fromFile, fromRank, toFile, toRank) {
        if (fromFile !== toFile && fromRank !== toRank) return false;
        return !isPathBlocked(fromFile, fromRank, toFile, toRank);
    }

    function isValidKnightMove(fromFile, fromRank, toFile, toRank) {
        const fileDiff = Math.abs(fromFile - toFile);
        const rankDiff = Math.abs(fromRank - toRank);
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

        // Move
    }

    window.handleMove = function() {
        const moveInput = document.getElementById('move');
        const move = moveInput.value.toLowerCase();
        if (isValidMove(move)) {
            makeMove(move);
            isWhiteTurn = !isWhiteTurn;
            updateBoard();
            moveInput.value = '';
        } else {
            alert('Illegal move. Try again.');
            moveInput.value = '';  // Clear the input field after an illegal move
        }
    };

    window.onload = function() {
        createBoardDOM();
        initializeBoard();
        updateBoard();
    };
})();
