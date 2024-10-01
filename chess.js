let isWhiteTurn = true;

function initializeGame() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear the board

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((i + j) % 2 === 0 ? 'light' : 'dark');
            square.id = `${String.fromCharCode(97 + j)}${8 - i}`;
            
            if (i < 2 || i > 5) {
                const piece = document.createElement('div');
                piece.className = 'piece ' + (i < 2 ? 'black' : 'white');
                piece.textContent = '♟'; // Using pawn for all pieces for simplicity
                piece.draggable = true;
                piece.addEventListener('dragstart', dragStart);
                square.appendChild(piece);
            }
            
            square.addEventListener('dragover', dragOver);
            square.addEventListener('drop', drop);
            board.appendChild(square);
        }
    }
    updateTurnDisplay();
}

function dragStart(e) {
    const piece = e.target;
    if ((isWhiteTurn && piece.classList.contains('white')) || 
        (!isWhiteTurn && piece.classList.contains('black'))) {
        e.dataTransfer.setData('text/plain', e.target.id);
    } else {
        e.preventDefault();
    }
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const pieceId = e.dataTransfer.getData('text');
    const piece = document.getElementById(pieceId);
    
    if (piece && e.target.classList.contains('square')) {
        e.target.innerHTML = '';
        e.target.appendChild(piece);
        isWhiteTurn = !isWhiteTurn;
        updateTurnDisplay();
    }
}

function updateTurnDisplay() {
    const turnDisplay = document.getElementById('turn');
    turnDisplay.textContent = isWhiteTurn ? "White's turn" : "Black's turn";
}

window.onload = initializeGame;
