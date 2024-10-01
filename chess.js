<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Game</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
        }

        #game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #board {
            display: grid;
            grid-template-columns: repeat(9, auto);
            grid-template-rows: repeat(9, auto);
            gap: 1px;
            background-color: #000;
            padding: 1px;
            border: 2px solid #333;
        }

        .square {
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 40px;
            user-select: none;
        }

        .light { background-color: #f0d9b5; }
        .dark { background-color: #b58863; }

        .coordinate {
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            background-color: #f0f0f0;
        }

        .piece {
            cursor: grab;
        }

        .piece:active {
            cursor: grabbing;
        }

        #turn {
            margin-top: 20px;
            font-size: 24px;
            text-align: center;
        }

        #debug {
            margin-top: 20px;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <div id="board"></div>
        <div id="turn"></div>
    </div>
    <div id="debug"></div>
    <script>
        const BOARD_SIZE = 8;
        let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(' '));
        let isWhiteTurn = true;

        const PIECES = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        function debug(message) {
            console.log(message);
            const debugElement = document.getElementById('debug');
            if (debugElement) {
                debugElement.innerHTML += message + '<br>';
            }
        }

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
            debug("Board initialized");
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
            debug("Updating board...");
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
            const turnElement = document.getElementById('turn');
            if (turnElement) {
                turnElement.textContent = isWhiteTurn ? "White's turn" : "Black's turn";
            }
            debug("Board updated");
        }

        function drag(event) {
            const piece = event.target.textContent;
            const isWhitePiece = piece === piece.toUpperCase();
            if (isWhitePiece !== isWhiteTurn) {
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
            const fromSquareId = event.dataTransfer.getData("text");
            const toSquareId = event.target.closest('.square').id;
            const move = `${fromSquareId}-${toSquareId}`;
            
            if (isValidMove(move)) {
                makeMove(move);
                isWhiteTurn = !isWhiteTurn;
                updateBoard();
            } else {
                debug("Invalid move");
                alert("Invalid move. Please try again.");
            }
        }

        function isValidMove(move) {
            const [from, to] = move.split('-');
            const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
            const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

            const piece = board[fromRank][fromFile];
            if (piece === ' ') return false;

            const isWhitePiece = piece === piece.toUpperCase();
            if (isWhitePiece !== isWhiteTurn) return false;

            const targetPiece = board[toRank][toFile];
            if (targetPiece !== ' ' && isWhitePiece === (targetPiece === targetPiece.toUpperCase())) return false;

            // Implement piece-specific move validation here
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

        function makeMove(move) {
            const [from, to] = move.split('-');
            const [fromFile, fromRank] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
            const [toFile, toRank] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];

            board[toRank][toFile] = board[fromRank][fromFile];
            board[fromRank][fromFile] = ' ';
            debug(`Move made: ${move}`);
        }

        window.onload = function() {
            debug("Window loaded");
            createBoardDOM();
            initializeBoard();
            updateBoard();
            debug("Initialization complete");
        };
    </script>
</body>
</html>
