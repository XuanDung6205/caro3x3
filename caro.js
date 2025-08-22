let allCell = document.querySelectorAll('.row div');
let showInformationDiv = document.querySelector('.showInfo'); // lấy thẻ div hiển thị thông tin
allCell.forEach((cell) => {
    cell.addEventListener('click', Clicked); // thêm sự kiện click vào từng ô
});

let didWin = false; // biến kiểm tra xem đã có người thắng chưa
let color = 1; // 1 là xanh, 0 là đỏ

function Clicked(event) {
    if (didWin) return; // nếu đã có người thắng thì không cho click nữa
    if (event.target.innerHTML === 'X' || event.target.innerHTML === 'O') return; // nếu ô đã có quân thì không cho click nữa
    let cell = event.target; // lấy ô được click
    cell.classList.add('clickedGreen'); // thêm class clickedGreen khi click vào ô
    cell.innerHTML = 'X' // gán vào ô là quân O

    showInformationDiv.innerHTML = 'Lượt của AI...'; // hiển thị thông tin lượt của AI

    let overlay = document.getElementById("overlay");
    overlay.style.display = "block"; // hiển thị overlay

    setTimeout(() => {
        chooseBestCell();
        if (!didWin) {
            let val = checkWin(getBoardFromDOM()); // kiểm tra xem có ai thắng không
            if (val === 'O') {
                showInformationDiv.innerHTML = 'AI thắng!'; // hiển thị thông tin AI thắng
                didWin = true;
            } else if (val === 'X') {
                showInformationDiv.innerHTML = 'Bạn thắng!'; // hiển thị thông tin người thắng
                didWin = true;
            } else {
                showInformationDiv.innerHTML = 'Lượt của bạn'; // hiển thị thông tin lượt của người chơi
            }

        }
        overlay.style.display = "none"; // ẩn overlay sau khi AI đã đi
    }, 1100);

}

// hàm tạo bảng ảo từ DOM
// Nếu ô có nội dung là 'X' hoặc 'O' thì trả về giá trị đó, nếu không thì trả về chỉ số của ô
function getBoardFromDOM() {
    return Array.from(allCell).map((cell, i) => {
        let val = cell.innerHTML;
        return (val === 'X' || val === 'O') ? val : '';
    });
}

// hàm cập nhật DOM từ bảng ảo
function updateDOMFromBoard(board) {
    for (let i = 0; i < 9; i++) {
        allCell[i].innerHTML = board[i];
    }
}

function checkWin(cells) {
    // kiểm tra hàng ngang
    for (let i = 0; i < 3; i++) {
        if (cells[i * 3] === cells[i * 3 + 1] && cells[i * 3] === cells[i * 3 + 2] && cells[i * 3] !== '') {
            return cells[i * 3];
        }
    }

    // kiểm tra hàng dọc
    for (let i = 0; i < 3; i++) {
        if (cells[i] === cells[i + 3] && cells[i] === cells[i + 6] && cells[i] !== '') {

            return cells[i];
        }
    }

    if (cells[0] === cells[4] && cells[0] === cells[8] && cells[0] !== '') {

        return cells[0]; // đường chéo từ trên trái xuống dưới phải
    }

    if (cells[2] === cells[4] && cells[2] === cells[6] && cells[2] !== '') {

        return cells[2]; // đường chéo từ trên phải xuống dưới trái
    }

    for (let x of cells) {
        if (x === '') {
            return 'N'; // vẫn tiếp tục
        }
    }
    return 'D'; // hòa
}

function reload() {
    color = 1; // reset lại lượt chơi về quân O
    didWin = false; // reset lại trạng thái thắng
    allCell.forEach((cell) => {
        cell.classList.remove('clickedGreen'); // xóa bỏ class clicked
        cell.classList.remove('clickedRed'); // xóa bỏ class clicked
        cell.innerHTML = ''; // cập nhật lại nội dung ô
    })
    showInformationDiv.innerHTML = 'Lượt của bạn'; // xóa thông tin hiển thị
}


function minimax(board, depth, isAIturn) {
    let final = checkWin(board);

    if (final === 'O') return 10 - depth;   // AI thắng
    else if (final === 'X') return -10 + depth; // Người thắng
    else if (final === 'D') return 0; // Hòa

    if (isAIturn) {
        let bestValue = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O'; // AI thử đi 'O'
                bestValue = Math.max(bestValue, minimax(board, depth + 1, false));
                board[i] = '';
            }
        }
        return bestValue;
    } else {
        let bestValue = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X'; // Người thử đi 'X'
                bestValue = Math.min(bestValue, minimax(board, depth + 1, true));
                board[i] = '';
            }
        }
        return bestValue;
    }
}

function chooseBestCell() {
    let bestValue = -Infinity, pos = -1;
    let cells = getBoardFromDOM();

    for (let i = 0; i < 9; i++) {
        if (cells[i] === '') {
            cells[i] = 'O'; // test AI đi 'O'
            let tmp = minimax(cells, 0, false); // false: lượt người
            if (bestValue < tmp) {
                bestValue = tmp;
                pos = i;
            }
            cells[i] = '';
        }
    }

    if (pos === -1) {
        // alert('Hòa! Không còn nước đi nào.');
        showInformationDiv.innerHTML = 'Hòa! Không còn nước đi nào.'; // hiển thị thông tin hòa
        didWin = true; // đánh dấu là đã hòa
        updateDOMFromBoard(cells); // cập nhật lại DOM
        return;
    }

    cells[pos] = 'O'; // AI đánh thật
    allCell[pos].classList.add('clickedRed');
    updateDOMFromBoard(cells);

    let isWin = checkWin(cells);
    if (isWin === 'O') {
        showInformationDiv.innerHTML = 'AI thắng!'; // hiển thị thông tin AI thắng
        didWin = true;
    } else if (isWin === 'X') {
        alert('Bạn thắng!');
        showInformationDiv.innerHTML = 'Bạn thắng!'; // hiển thị thông tin người thắng
        didWin = true;
    }
}