// 游戏配置
const BOARD_SIZE = 15; // 15x15 棋盘
const CELL_SIZE = 40; // 每个格子的大小
const STONE_RADIUS = 18; // 棋子半径

// 游戏状态
let board = []; // 棋盘状态：0=空，1=黑棋，2=白棋
let currentPlayer = 1; // 1=黑棋，2=白棋
let gameOver = false;

// 获取canvas元素
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const resetBtn = document.getElementById('resetBtn');
const messageDisplay = document.getElementById('message');

// 初始化游戏
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1;
    gameOver = false;
    messageDisplay.textContent = '';
    messageDisplay.classList.remove('winner');
    updatePlayerDisplay();
    drawBoard();
}

// 绘制棋盘
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        const pos = CELL_SIZE / 2 + i * CELL_SIZE;
        
        // 横线
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE / 2, pos);
        ctx.lineTo(canvas.width - CELL_SIZE / 2, pos);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(pos, CELL_SIZE / 2);
        ctx.lineTo(pos, canvas.height - CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // 绘制天元和星位
    const starPositions = [
        [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
    ];
    
    ctx.fillStyle = '#333';
    starPositions.forEach(([row, col]) => {
        const x = CELL_SIZE / 2 + col * CELL_SIZE;
        const y = CELL_SIZE / 2 + row * CELL_SIZE;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制已下的棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== 0) {
                drawStone(row, col, board[row][col]);
            }
        }
    }
}

// 绘制棋子
function drawStone(row, col, player) {
    const x = CELL_SIZE / 2 + col * CELL_SIZE;
    const y = CELL_SIZE / 2 + row * CELL_SIZE;
    
    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制棋子
    const gradient = ctx.createRadialGradient(
        x - 5, y - 5, 0,
        x, y, STONE_RADIUS
    );
    
    if (player === 1) {
        // 黑棋
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        // 白棋
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = player === 1 ? '#333' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// 更新当前玩家显示
function updatePlayerDisplay() {
    currentPlayerDisplay.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
    currentPlayerDisplay.style.color = currentPlayer === 1 ? '#000' : '#666';
}

// 将鼠标坐标转换为棋盘坐标
function getBoardPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.round((x - CELL_SIZE / 2) / CELL_SIZE);
    const row = Math.round((y - CELL_SIZE / 2) / CELL_SIZE);
    
    return { row, col };
}

// 检查位置是否有效
function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && 
           col >= 0 && col < BOARD_SIZE && 
           board[row][col] === 0;
}

// 下棋
function placeStone(row, col) {
    if (gameOver || !isValidPosition(row, col)) {
        return false;
    }
    
    board[row][col] = currentPlayer;
    drawBoard();
    
    // 检查是否获胜
    if (checkWin(row, col)) {
        gameOver = true;
        const winner = currentPlayer === 1 ? '黑棋' : '白棋';
        messageDisplay.textContent = `🎉 ${winner}获胜！`;
        messageDisplay.classList.add('winner');
        return true;
    }
    
    // 切换玩家
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerDisplay();
    
    return true;
}

// 检查是否获胜（五子连珠）
function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // 横向
        [[1, 0], [-1, 0]],   // 纵向
        [[1, 1], [-1, -1]],  // 主对角线
        [[1, -1], [-1, 1]]   // 副对角线
    ];
    
    for (let dir of directions) {
        let count = 1; // 包括当前棋子
        
        // 检查两个方向
        for (let [dx, dy] of dir) {
            let r = row + dx;
            let c = col + dy;
            
            while (r >= 0 && r < BOARD_SIZE && 
                   c >= 0 && c < BOARD_SIZE && 
                   board[r][c] === currentPlayer) {
                count++;
                r += dx;
                c += dy;
            }
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// 鼠标点击事件
canvas.addEventListener('click', (event) => {
    const { row, col } = getBoardPosition(event);
    placeStone(row, col);
});

// 鼠标移动事件（显示预览）
canvas.addEventListener('mousemove', (event) => {
    if (gameOver) return;
    
    const { row, col } = getBoardPosition(event);
    
    if (isValidPosition(row, col)) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }
});

// 重新开始按钮
resetBtn.addEventListener('click', () => {
    initGame();
});

// 初始化游戏
initGame();

