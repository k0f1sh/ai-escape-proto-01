import { directions, directionLabels, hotspots, items } from './data.js';

// --- ゲーム状態 ---
let state = createInitialState();

function createInitialState() {
  return {
    dirIndex: 0, // 0=north
    selectedItem: null,
    inventory: [],
    flags: {},
  };
}

// --- DOM参照 ---
const sceneEl = document.getElementById('scene');
const textWindowLabel = document.getElementById('text-window-label');
const textWindowBody = document.getElementById('text-window-body');
const textWindowInput = document.getElementById('text-window-input');
const twInput = document.getElementById('tw-input');
const twSubmit = document.getElementById('tw-submit');
const inventorySlots = document.getElementById('inventory-slots');
const arrowLeft = document.getElementById('arrow-left');
const arrowRight = document.getElementById('arrow-right');
const endingOverlay = document.getElementById('ending-overlay');
const endingRestart = document.getElementById('ending-restart');
const itemModal = document.getElementById('item-modal');
const itemModalEmoji = document.getElementById('item-modal-emoji');
const itemModalName = document.getElementById('item-modal-name');

// --- 現在の入力コールバック ---
let inputCallback = null;

// --- メッセージ表示 ---
function showMessage(text, label) {
  textWindowBody.textContent = text;
  if (label !== undefined) {
    textWindowLabel.textContent = label;
  }
  hideInput();
}

// --- 入力付きメッセージ表示 ---
function showInput(text, placeholder, callback) {
  textWindowBody.textContent = text;
  twInput.value = '';
  twInput.placeholder = placeholder || '';
  twInput.maxLength = placeholder === '0000' ? 4 : 20;
  twInput.inputMode = placeholder === '0000' ? 'numeric' : 'text';
  textWindowInput.classList.remove('hidden');
  inputCallback = callback;
  setTimeout(() => twInput.focus(), 50);
}

function hideInput() {
  textWindowInput.classList.add('hidden');
  inputCallback = null;
  twInput.value = '';
}

// 入力決定
twSubmit.addEventListener('click', () => {
  if (inputCallback) {
    inputCallback(twInput.value.trim());
  }
});

twInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && inputCallback) {
    inputCallback(twInput.value.trim());
  }
});

// --- 座標変換 ---
// data.js の座標は「w=10, h=10 が正方形に見える」仮想グリッド。
// 実際のコンテナのアスペクト比に合わせて h をピクセル換算で補正する。
function getHeightRatio() {
  const rect = sceneEl.getBoundingClientRect();
  if (rect.height === 0) return 1;
  return rect.width / rect.height;
}

function applyPosition(el, x, y, w, h) {
  const r = getHeightRatio();
  el.style.left = x + '%';
  el.style.top = (y * r) + '%';
  el.style.width = w + '%';
  el.style.height = (h * r) + '%';
}

// --- シーン描画 ---
function renderScene() {
  const dir = directions[state.dirIndex];
  sceneEl.innerHTML = '';

  // 背景画像
  sceneEl.style.backgroundImage = `url(${import.meta.env.BASE_URL}img/rooms/${dir}.webp)`;
  sceneEl.style.backgroundColor = '#1a1a2e';

  // ホットスポット描画
  const spots = hotspots[dir] || [];
  for (const spot of spots) {
    if (spot.condition && !spot.condition(state.flags)) continue;
    const el = document.createElement('div');
    el.className = 'hotspot';
    applyPosition(el, spot.x, spot.y, spot.w, spot.h);
    el.addEventListener('click', () => handleAction(spot.action));

    const hint = document.createElement('span');
    hint.className = 'hotspot-hint';
    hint.textContent = spot.label;
    el.appendChild(hint);

    sceneEl.appendChild(el);
  }

  // 方向ラベル更新
  textWindowLabel.textContent = directionLabels[dir];
}

// --- インベントリ描画 ---
function renderInventory() {
  inventorySlots.innerHTML = '';
  for (const itemId of state.inventory) {
    const item = items[itemId];
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    if (state.selectedItem === itemId) slot.classList.add('selected');
    slot.textContent = item.emoji;
    slot.addEventListener('click', () => {
      if (state.selectedItem === itemId) {
        state.selectedItem = null;
        showMessage('アイテムの選択を解除した。');
      } else {
        state.selectedItem = itemId;
        showMessage(getItemDescription(itemId));
      }
      renderInventory();
    });

    const label = document.createElement('span');
    label.className = 'inv-slot-label';
    label.textContent = item.name;
    slot.appendChild(label);

    inventorySlots.appendChild(slot);
  }
}

// --- アイテム説明 ---
function getItemDescription(itemId) {
  switch (itemId) {
    case 'smallKey': return '小さな鍵を選択した。\nどこかの鍵穴に合いそうだ。';
    case 'memo': return 'メモを選択した。\nメモにはこう書いてある──\n「パスワード: ESCAPE」';
    case 'screwdriver': return 'ドライバーを選択した。\nネジを外せそうだ。';
    case 'cardKey': return 'カードキーを選択した。\nどこかにかざして使うのだろう。';
    default: return `${items[itemId].name}を選択した。`;
  }
}

// --- アイテム追加 ---
function addItem(itemId) {
  if (!state.inventory.includes(itemId)) {
    state.inventory.push(itemId);
    renderInventory();
    showItemModal(itemId);
  }
}

// --- アイテム入手モーダル ---
let itemModalTimer = null;

function showItemModal(itemId) {
  const item = items[itemId];
  itemModalEmoji.textContent = item.emoji;
  itemModalName.textContent = item.name;
  itemModal.classList.remove('hidden');
  clearTimeout(itemModalTimer);
  itemModalTimer = setTimeout(hideItemModal, 2000);
}

function hideItemModal() {
  itemModal.classList.add('hidden');
  clearTimeout(itemModalTimer);
}

itemModal.addEventListener('click', hideItemModal);

// --- アクション処理 ---
function handleAction(action) {
  const actions = {
    examineClock,
    examineDoor,
    examinePoster,
    examineDrawer,
    examineComputer,
    examineBookRed,
    examinePlant,
    examineSafe,
    examineCabinet,
  };
  if (actions[action]) actions[action]();
}

function examinePlant() {
  if (state.flags.plantChecked) {
    showMessage('観葉植物。もう何もなさそうだ。');
    return;
  }
  state.flags.plantChecked = true;
  addItem('smallKey');
  showMessage('観葉植物の鉢の裏に何かが落ちている……\n小さな鍵を手に入れた！');
}

function examineDrawer() {
  if (state.flags.drawerOpen) {
    if (!state.flags.memoTaken) {
      state.flags.memoTaken = true;
      addItem('memo');
      showMessage('引き出しの中にメモがある。\nメモを手に入れた！');
    } else {
      showMessage('引き出しは空だ。');
    }
    return;
  }
  if (state.selectedItem === 'smallKey') {
    state.flags.drawerOpen = true;
    state.selectedItem = null;
    state.inventory = state.inventory.filter(i => i !== 'smallKey');
    state.flags.memoTaken = true;
    addItem('memo');
    renderScene();
    showMessage('小さな鍵で引き出しを開けた！\n中にメモが入っている。メモを手に入れた！');
  } else {
    showMessage('引き出しには鍵がかかっている。');
  }
}

function examineComputer() {
  if (state.flags.computerSolved) {
    showMessage('画面にメッセージが表示されている。\n「時計を見よ」');
    return;
  }
  if (state.inventory.includes('memo')) {
    showInput(
      'PCのログイン画面だ。\nパスワードを入力しよう。',
      'パスワード',
      (val) => {
        if (val.toUpperCase() === 'ESCAPE') {
          state.flags.computerSolved = true;
          hideInput();
          showMessage('ログイン成功！\n画面にメッセージが表示された──\n「時計を見よ」');
          renderScene();
        } else {
          showMessage('パスワードが違うようだ……');
          hideInput();
        }
      }
    );
  } else {
    showMessage('PCのログイン画面だ。パスワードが必要みたいだ。');
  }
}

function examineClock() {
  if (state.flags.computerSolved) {
    showMessage('壁掛け時計。\n針は 3時00分 で止まっている。\n……これがヒントか？');
    state.flags.clockChecked = true;
  } else {
    showMessage('壁掛け時計。3時00分で止まっている。');
  }
}

function examineSafe() {
  if (state.flags.safeOpen) {
    showMessage('金庫は空だ。');
    return;
  }
  showInput(
    '金庫がある。\n4桁の暗証番号を入力しよう。',
    '0000',
    (val) => {
      if (val === '0300') {
        state.flags.safeOpen = true;
        hideInput();
        addItem('screwdriver');
        showMessage('金庫が開いた！\n中にドライバーが入っていた。ドライバーを手に入れた！');
        renderScene();
      } else {
        showMessage('……開かない。番号が違うようだ。');
        hideInput();
      }
    }
  );
}

function examineCabinet() {
  if (state.flags.cabinetOpen) {
    showMessage('キャビネットは空だ。');
    return;
  }
  if (state.selectedItem === 'screwdriver') {
    state.flags.cabinetOpen = true;
    state.selectedItem = null;
    state.inventory = state.inventory.filter(i => i !== 'screwdriver');
    addItem('cardKey');
    renderScene();
    showMessage('ドライバーでネジを外して\nキャビネットを開けた！\n中にカードキーがあった。カードキーを手に入れた！');
  } else {
    showMessage('キャビネット。ネジで固定されていて開かない。');
  }
}

function examineDoor() {
  if (state.selectedItem === 'cardKey') {
    state.flags.doorOpen = true;
    state.selectedItem = null;
    renderScene();
    renderInventory();
    showMessage('カードキーをかざすと、ロックが解除された……！');
    setTimeout(() => {
      endingOverlay.classList.remove('hidden');
    }, 1500);
  } else {
    showMessage('出口のドアだ。カードキーが必要みたいだ。');
  }
}

function examinePoster() {
  showMessage('壁に貼られたポスター。\n「KEEP CALM and ESCAPE」と書いてある。');
}

function examineBookRed() {
  if (!state.flags.bookChecked) {
    state.flags.bookChecked = true;
    showMessage('赤い本を引き抜いてみた。\n……特に何もなかった。\nでも本の間に挟まっていたメモ書きを見つけた──\n「PCのパスワードはポスターに書いてある」');
  } else {
    showMessage('赤い本に挟まっていたメモ書き──\n「PCのパスワードはポスターに書いてある」');
  }
}

// --- 方向切り替え ---
arrowLeft.addEventListener('click', () => {
  state.dirIndex = (state.dirIndex + 3) % 4;
  renderScene();
  hideInput();
});

arrowRight.addEventListener('click', () => {
  state.dirIndex = (state.dirIndex + 1) % 4;
  renderScene();
  hideInput();
});

// スワイプ対応
let touchStartX = 0;
sceneEl.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

sceneEl.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 60) {
    if (diff > 0) {
      state.dirIndex = (state.dirIndex + 3) % 4;
    } else {
      state.dirIndex = (state.dirIndex + 1) % 4;
    }
    renderScene();
    hideInput();
  }
});

// --- リスタート ---
endingRestart.addEventListener('click', () => {
  endingOverlay.classList.add('hidden');
  state = createInitialState();
  renderScene();
  renderInventory();
  showMessage('気がつくとオフィスに閉じ込められていた。\nあたりを調べて脱出しよう。');
});

// --- 画像プリロード ---
function preloadImages() {
  return Promise.all(
    directions.map(dir => new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // エラーでも止めない
      img.src = `${import.meta.env.BASE_URL}img/rooms/${dir}.webp`;
    }))
  );
}

// --- 初期化 ---
export function init() {
  showMessage('読み込み中……');
  preloadImages().then(() => {
    renderScene();
    renderInventory();
    showMessage('気がつくとオフィスに閉じ込められていた。\nあたりを調べて脱出しよう。');
  });
}
