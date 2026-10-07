// データを保持する配列（ブラウザのLocalStorageから読み込むか初期化）
let rentals = JSON.parse(localStorage.getItem('rentals')) || [
  { id: 1, equipment: 'プロジェクター', borrower: '山田 太郎', date: '2026/10/01 10:00', status: '貸出中' },
  { id: 2, equipment: 'モバイルWi-Fi', borrower: '佐藤 花子', date: '2026/10/05 14:30', status: '貸出中' }
];

// DOM要素の取得
const rentalForm = document.getElementById('rentalForm');
const equipmentInput = document.getElementById('equipmentName');
const borrowerInput = document.getElementById('borrowerName');
const rentalTableBody = document.getElementById('rentalTableBody');

// 初期表示
renderTable();

// 登録フォームの送信イベント
rentalForm.addEventListener('submit', function(e) {
  e.preventDefault(); // 画面リロードを防止

  const equipmentName = equipmentInput.value.trim();
  const borrowerName = borrowerInput.value.trim();

  if (!equipmentName || !borrowerName) return;

  // 現在日時の取得
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 新しい貸出データの作成
  const newRental = {
    id: Date.now(), // ユニークなID
    equipment: equipmentName,
    borrower: borrowerName,
    date: dateStr,
    status: '貸出中'
  };

  // 配列の先頭に追加
  rentals.unshift(newRental);

  // 保存と再描画
  saveData();
  renderTable();

  // フォームのリセット
  rentalForm.reset();
});

// 一覧を表示する関数
function renderTable() {
  rentalTableBody.innerHTML = '';

  if (rentals.length === 0) {
    rentalTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-message">現在、貸出データはありません。</td>
      </tr>
    `;
    return;
  }

  rentals.forEach(item => {
    const tr = document.createElement('tr');

    const isBorrowed = item.status === '貸出中';
    const badgeClass = isBorrowed ? 'badge-borrowed' : 'badge-returned';

    tr.innerHTML = `
      <td><strong>${escapeHtml(item.equipment)}</strong></td>
      <td>${escapeHtml(item.borrower)}</td>
      <td>${item.date}</td>
      <td><span class="badge ${badgeClass}">${item.status}</span></td>
      <td>
        ${isBorrowed ? `<button class="btn btn-return" onclick="returnEquipment(${item.id})">返却する</button>` : '返却完了'}
      </td>
    `;

    rentalTableBody.appendChild(tr);
  });
}

// 返却処理を行う関数
function returnEquipment(id) {
  const target = rentals.find(item => item.id === id);
  if (target) {
    target.status = '返却済み';
    saveData();
    renderTable();
  }
}

// LocalStorageに保存する関数（ページを閉じてもデータが残る）
function saveData() {
  localStorage.setItem('rentals', JSON.stringify(rentals));
}

// XSS防止用HTMLエスケープ関数
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(match) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return escapeMap[match];
  });
}