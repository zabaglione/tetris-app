const COLS = 10;          // ボードの列数
const ROWS = 20;          // ボードの行数
const BLOCK_SIZE = 30;    // ブロックのサイズ（ピクセル）
const COLORS = [
    'none',               // 0: 空のセル
    '#00FFFF',           // 1: I - シアン
    '#0000FF',           // 2: J - ブルー
    '#FF8000',           // 3: L - オレンジ
    '#FFFF00',           // 4: O - イエロー
    '#00FF00',           // 5: S - グリーン
    '#800080',           // 6: T - パープル
    '#FF0000'            // 7: Z - レッド
];

const SHAPES = [
    [],                   // 空の配列（インデックス0は使用しない）
    [                     // I
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [                     // J
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [                     // L
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [                     // O
        [4, 4],
        [4, 4]
    ],
    [                     // S
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [                     // T
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [                     // Z
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

let board = [];           // ゲームボード
let currentPiece = null;  // 現在のピース
let nextPiece = null;     // 次のピース
let score = 0;            // スコア
let level = 1;            // レベル
let lines = 0;            // 消去したライン数
let gameOver = false;     // ゲームオーバーフラグ
let isPaused = false;     // 一時停止フラグ
let dropInterval = null;  // ドロップインターバル
let dropSpeed = 1000;     // 初期ドロップ速度（ミリ秒）

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    
    updateScore();
    
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    dropSpeed = 1000;
    dropInterval = setInterval(drop, dropSpeed);
    
    draw();
    drawNextPiece();
}

function getRandomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    
    const piece = {
        type: type,                       // テトロミノの種類
        shape: SHAPES[type],              // テトロミノの形状
        x: Math.floor(COLS / 2) - 1,      // 初期X位置（中央）
        y: 0                              // 初期Y位置（上部）
    };
    
    return piece;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
    
    if (currentPiece) {
        drawPiece(ctx, currentPiece);
    }
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
    }
    
    if (isPaused && !gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('一時停止中', canvas.width / 2, canvas.height / 2);
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
        const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x] !== 0) {
                    nextCtx.fillStyle = COLORS[nextPiece.shape[y][x]];
                    nextCtx.fillRect(
                        (offsetX + x) * BLOCK_SIZE,
                        (offsetY + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    
                    nextCtx.strokeStyle = 'black';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(
                        (offsetX + x) * BLOCK_SIZE,
                        (offsetY + y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            }
        }
    }
}

function drawBlock(context, x, y, type) {
    context.fillStyle = COLORS[type];
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.beginPath();
    context.moveTo(x * BLOCK_SIZE, y * BLOCK_SIZE);
    context.lineTo((x + 1) * BLOCK_SIZE, y * BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE, (y + 1) * BLOCK_SIZE);
    context.fill();
}

function drawPiece(context, piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                drawBlock(context, piece.x + x, piece.y + y, piece.shape[y][x]);
            }
        }
    }
}

function drop() {
    if (gameOver || isPaused) return;
    
    if (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
        draw();
    } else {
        lockPiece();
        
        clearLines();
        
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        drawNextPiece();
        
        if (!canMove(currentPiece, 0, 0)) {
            gameOver = true;
            clearInterval(dropInterval);
            draw();
        }
    }
}

function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] !== 0) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.shape[y][x];
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        const isLineFull = board[y].every(cell => cell !== 0);
        
        if (isLineFull) {
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < COLS; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }
            
            for (let x = 0; x < COLS; x++) {
                board[0][x] = 0;
            }
            
            linesCleared++;
            
            y++;
        }
    }
    
    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        
        lines += linesCleared;
        
        level = Math.floor(lines / 10) + 1;
        
        dropSpeed = Math.max(100, 1000 - (level - 1) * 100);
        clearInterval(dropInterval);
        dropInterval = setInterval(drop, dropSpeed);
        
        updateScore();
    }
}

function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

function canMove(piece, moveX, moveY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const newX = piece.x + x + moveX;
                const newY = piece.y + y + moveY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }
                
                if (newY >= 0 && board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function rotate() {
    if (gameOver || isPaused) return;
    
    const originalShape = currentPiece.shape;
    
    const newShape = [];
    for (let i = 0; i < originalShape[0].length; i++) {
        newShape.push([]);
        for (let j = originalShape.length - 1; j >= 0; j--) {
            newShape[i].push(originalShape[j][i]);
        }
    }
    
    currentPiece.shape = newShape;
    
    if (!canMove(currentPiece, 0, 0)) {
        const kicks = [1, -1, 2, -2]; // 試す移動量
        let canKick = false;
        
        for (const kick of kicks) {
            if (canMove(currentPiece, kick, 0)) {
                currentPiece.x += kick;
                canKick = true;
                break;
            }
        }
        
        if (!canKick) {
            currentPiece.shape = originalShape;
        }
    }
    
    draw();
}

function hardDrop() {
    if (gameOver || isPaused) return;
    
    while (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2; // ハードドロップのボーナス
    }
    
    lockPiece();
    clearLines();
    updateScore();
    
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    if (!canMove(currentPiece, 0, 0)) {
        gameOver = true;
        clearInterval(dropInterval);
    }
    
    draw();
}

document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    
    if (!isPaused) {
        switch (event.key) {
            case 'ArrowLeft':
                if (canMove(currentPiece, -1, 0)) {
                    currentPiece.x--;
                    draw();
                }
                break;
            case 'ArrowRight':
                if (canMove(currentPiece, 1, 0)) {
                    currentPiece.x++;
                    draw();
                }
                break;
            case 'ArrowDown':
                if (canMove(currentPiece, 0, 1)) {
                    currentPiece.y++;
                    score += 1; // ソフトドロップのボーナス
                    updateScore();
                    draw();
                }
                break;
            case 'ArrowUp':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
        }
    }
    
    if (event.key === 'p' || event.key === 'P') {
        togglePause();
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});

function togglePause() {
    if (gameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(dropInterval);
        pauseButton.textContent = 'レジューム';
    } else {
        dropInterval = setInterval(drop, dropSpeed);
        pauseButton.textContent = '一時停止';
    }
    
    draw();
}

startButton.addEventListener('click', () => {
    init();
    startButton.textContent = 'リスタート';
    pauseButton.textContent = '一時停止';
    isPaused = false;
});

pauseButton.addEventListener('click', togglePause);

ctx.fillStyle = '#111';
ctx.fillRect(0, 0, canvas.width, canvas.height);
nextCtx.fillStyle = '#111';
nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

ctx.fillStyle = 'white';
ctx.font = '20px Arial';
ctx.textAlign = 'center';
ctx.fillText('スタートボタンを押して', canvas.width / 2, canvas.height / 2 - 20);
ctx.fillText('ゲームを開始', canvas.width / 2, canvas.height / 2 + 20);
