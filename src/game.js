import { directions, directionLabels, hotspots, items } from './data.js';

const DEBUG_MODE = new URLSearchParams(window.location.search).get('debug') === '1';
const MAX_GRID_Y = 100 / (9 / 16);
const MIN_SPOT_SIZE = 2;
const debugHotspots = createDebugHotspots();
const debugUi = {
  panel: null,
  dirLabel: null,
  output: null,
};

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
const twKeypad = document.getElementById('tw-keypad');
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
let activeInputConfig = null;
const PASSWORD_KEYS = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
const PIN_KEYS = '1234567890'.split('');

// --- メッセージ表示 ---
function showMessage(text, label) {
  textWindowBody.textContent = text;
  if (label !== undefined) {
    textWindowLabel.textContent = label;
  }
  hideInput();
}

// --- 入力付きメッセージ表示 ---
function showInput(text, options, callback) {
  const config = {
    type: options?.type || 'password',
    maxLength: options?.maxLength || 20,
    placeholder: options?.placeholder || '',
  };
  config.keys = config.type === 'pin' ? PIN_KEYS : PASSWORD_KEYS;

  textWindowBody.textContent = text;
  twInput.value = '';
  twInput.placeholder = config.placeholder;
  twInput.maxLength = config.maxLength;
  activeInputConfig = config;
  renderKeypad(config);
  textWindowInput.classList.remove('hidden');
  inputCallback = callback;
}

function hideInput() {
  textWindowInput.classList.add('hidden');
  inputCallback = null;
  activeInputConfig = null;
  twInput.value = '';
  twKeypad.innerHTML = '';
  twKeypad.className = '';
}

function renderKeypad(config) {
  twKeypad.innerHTML = '';
  twKeypad.className = `keypad keypad-${config.type}`;

  const grid = document.createElement('div');
  grid.className = 'tw-key-grid';
  for (const key of config.keys) {
    const keyBtn = document.createElement('button');
    keyBtn.type = 'button';
    keyBtn.className = 'tw-key';
    keyBtn.dataset.key = key;
    keyBtn.textContent = key;
    grid.appendChild(keyBtn);
  }
  twKeypad.appendChild(grid);

  const actions = document.createElement('div');
  actions.className = 'tw-key-actions';
  const actionDefs = [
    { label: 'C', key: 'CLEAR' },
    { label: 'DEL', key: 'BACKSPACE' },
    { label: 'OK', key: 'SUBMIT' },
  ];
  for (const action of actionDefs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tw-key tw-key-action tw-key-${action.key.toLowerCase()}`;
    btn.dataset.key = action.key;
    btn.textContent = action.label;
    actions.appendChild(btn);
  }
  twKeypad.appendChild(actions);
}

function appendInputChar(char) {
  if (!activeInputConfig) return;
  if (twInput.value.length >= activeInputConfig.maxLength) return;
  twInput.value += char;
}

function submitInput() {
  if (inputCallback) {
    inputCallback(twInput.value.trim());
  }
}

function handleInputKey(key) {
  if (!activeInputConfig) return;
  if (key === 'CLEAR') {
    twInput.value = '';
    return;
  }
  if (key === 'BACKSPACE') {
    twInput.value = twInput.value.slice(0, -1);
    return;
  }
  if (key === 'SUBMIT') {
    submitInput();
    return;
  }

  const char = key.toUpperCase();
  if (activeInputConfig.type === 'pin') {
    if (!/^[0-9]$/.test(char)) return;
  } else if (!/^[A-Z0-9]$/.test(char)) {
    return;
  }
  appendInputChar(char);
}

twKeypad.addEventListener('click', (e) => {
  const keyBtn = e.target.closest('button[data-key]');
  if (!keyBtn || !textWindowInput.contains(keyBtn)) return;
  handleInputKey(keyBtn.dataset.key);
});

window.addEventListener('keydown', (e) => {
  if (!activeInputConfig || textWindowInput.classList.contains('hidden')) return;
  if (e.key === 'Enter') {
    e.preventDefault();
    handleInputKey('SUBMIT');
    return;
  }
  if (e.key === 'Backspace') {
    e.preventDefault();
    handleInputKey('BACKSPACE');
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    handleInputKey('CLEAR');
    return;
  }
  if (e.key.length === 1) {
    const char = e.key.toUpperCase();
    handleInputKey(char);
  }
});

// --- 座標変換 ---
// data.js の座標は「w=10, h=10 が正方形に見える」仮想グリッド。
// コンテナは 9:16 固定なので比率も定数で持つ。
const HEIGHT_RATIO = 9 / 16;

function createDebugHotspots() {
  if (!DEBUG_MODE) return null;
  return Object.fromEntries(
    Object.entries(hotspots).map(([dir, spots]) => [dir, spots.map(spot => ({ ...spot }))])
  );
}

function applyPosition(el, x, y, w, h) {
  const r = HEIGHT_RATIO;
  el.style.left = x + '%';
  el.style.top = (y * r) + '%';
  el.style.width = w + '%';
  el.style.height = (h * r) + '%';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundCoord(value) {
  return Math.round(value * 10) / 10;
}

function formatSpot(spot) {
  return `    { id: '${spot.id}', label: '${spot.label}', x: ${roundCoord(spot.x)}, y: ${roundCoord(spot.y)}, w: ${roundCoord(spot.w)}, h: ${roundCoord(spot.h)}, condition: null, action: '${spot.action}' },`;
}

function updateDebugPanel() {
  if (!DEBUG_MODE || !debugUi.output || !debugUi.dirLabel) return;
  const dir = directions[state.dirIndex];
  debugUi.dirLabel.textContent = `dir: ${dir}`;
  const blocks = directions.map((d) => {
    const spots = debugHotspots[d] || [];
    return `${d}: [\n${spots.map(formatSpot).join('\n')}\n],`;
  });
  debugUi.output.value = blocks.join('\n');
}

function createDebugPanel() {
  if (!DEBUG_MODE || debugUi.panel) return;
  document.body.classList.add('debug-mode');
  const panel = document.createElement('aside');
  panel.id = 'debug-panel';
  panel.innerHTML = `
    <div class="debug-panel-head">
      <strong>DEBUG Hotspots</strong>
      <span id="debug-current-dir"></span>
    </div>
    <p class="debug-panel-help">ドラッグ: 移動 / 右下ハンドル: リサイズ</p>
    <textarea id="debug-output" readonly></textarea>
    <button id="debug-copy" type="button">コピー</button>
  `;
  document.body.appendChild(panel);

  debugUi.panel = panel;
  debugUi.dirLabel = panel.querySelector('#debug-current-dir');
  debugUi.output = panel.querySelector('#debug-output');
  const copyBtn = panel.querySelector('#debug-copy');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(debugUi.output.value);
      copyBtn.textContent = 'コピー済み';
      setTimeout(() => {
        copyBtn.textContent = 'コピー';
      }, 1000);
    } catch {
      copyBtn.textContent = '失敗';
      setTimeout(() => {
        copyBtn.textContent = 'コピー';
      }, 1000);
    }
  });
}

function setupDebugSpotInteractions(el, spot) {
  const resizeHandle = document.createElement('span');
  resizeHandle.className = 'hotspot-resize-handle';
  el.appendChild(resizeHandle);

  const beginPointerEdit = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();

    const sceneRect = sceneEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSpot = { x: spot.x, y: spot.y, w: spot.w, h: spot.h };

    el.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const dxPct = ((ev.clientX - startX) / sceneRect.width) * 100;
      const dyPct = ((ev.clientY - startY) / sceneRect.height) * 100 / HEIGHT_RATIO;

      if (mode === 'move') {
        spot.x = clamp(startSpot.x + dxPct, 0, 100 - spot.w);
        spot.y = clamp(startSpot.y + dyPct, 0, MAX_GRID_Y - spot.h);
      } else {
        spot.w = clamp(startSpot.w + dxPct, MIN_SPOT_SIZE, 100 - spot.x);
        spot.h = clamp(startSpot.h + dyPct, MIN_SPOT_SIZE, MAX_GRID_Y - spot.y);
      }

      applyPosition(el, spot.x, spot.y, spot.w, spot.h);
      updateDebugPanel();
    };

    const onEnd = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onEnd);
      el.removeEventListener('pointercancel', onEnd);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onEnd);
    el.addEventListener('pointercancel', onEnd);
  };

  el.addEventListener('pointerdown', (e) => {
    if (e.target === resizeHandle) return;
    beginPointerEdit(e, 'move');
  });
  resizeHandle.addEventListener('pointerdown', (e) => beginPointerEdit(e, 'resize'));
}

// --- シーン描画 ---
function renderScene() {
  const dir = directions[state.dirIndex];
  sceneEl.innerHTML = '';

  // 背景画像
  sceneEl.style.backgroundImage = `url(${import.meta.env.BASE_URL}img/rooms/${dir}.webp)`;

  // ホットスポット描画
  const spots = (DEBUG_MODE ? debugHotspots[dir] : hotspots[dir]) || [];
  for (const spot of spots) {
    if (spot.condition && !spot.condition(state.flags)) continue;
    const el = document.createElement('div');
    el.className = DEBUG_MODE ? 'hotspot hotspot-debug' : 'hotspot';
    applyPosition(el, spot.x, spot.y, spot.w, spot.h);
    if (DEBUG_MODE) {
      setupDebugSpotInteractions(el, spot);
    } else {
      el.addEventListener('click', () => handleAction(spot.action));
    }

    const hint = document.createElement('span');
    hint.className = 'hotspot-hint';
    hint.textContent = spot.label;
    el.appendChild(hint);

    sceneEl.appendChild(el);
  }

  // 方向ラベル・コンパス更新
  textWindowLabel.textContent = directionLabels[dir];
  document.querySelectorAll('.compass-wall').forEach(el => {
    el.classList.toggle('active', el.dataset.dir === dir);
  });
  const arrow = document.getElementById('compass-arrow');
  arrow.className = dir;
  updateDebugPanel();
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
    case 'memo': return 'メモを選択した。\nメモにはこう書いてある──\n「答えは壁にある。最後の一語を入力せよ。」';
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
    examineCardReader,
    examineDrawer,
    examineComputer,
    examinePenHolder,
    examinePapers,
    examineBookRed,
    examineBookBlue,
    examinePlant,
    examineSafe,
    examineCabinet,
    examineWindow,
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
      showMessage('引き出しの中に古びたメモがある。\nメモを手に入れた！');
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
    showMessage('小さな鍵で引き出しを開けた！\n中に古びたメモが入っている。メモを手に入れた！');
  } else {
    showMessage('引き出しには鍵がかかっている。');
  }
}

function examineComputer() {
  if (state.flags.computerSolved) {
    showMessage('画面にメッセージが表示されている。\n「時は金なり。金庫の答えは、時計がもう語っている。」');
    return;
  }
  showInput(
    'PCのログイン画面だ。\nパスワードを入力しよう。',
    { type: 'password', placeholder: 'パスワード', maxLength: 12 },
    (val) => {
      if (val === 'OPEN') {
        state.flags.computerSolved = true;
        hideInput();
        showMessage('ログイン成功！\n画面にメッセージが表示された──\n「時は金なり。金庫の答えは、時計がもう語っている。」');
        renderScene();
      } else {
        showMessage('パスワードが違うようだ……');
        hideInput();
      }
    }
  );
}

function examineClock() {
  if (state.flags.computerSolved) {
    showMessage('壁掛け時計。\n針は 3時00分 で止まっている。');
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
    { type: 'pin', placeholder: '0000', maxLength: 4 },
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
  if (state.flags.doorOpen) {
    showMessage('ドアのロックは解除されている。\n……でもまだ開かない？');
  } else {
    showMessage('出口のドアだ。電子ロックがかかっている。');
  }
}

function examinePoster() {
  showMessage('壁に額装されたポスターがある。\n英語でこう書かれている──\n\n"The door to success\n  is always OPEN."');
}

function examineBookRed() {
  if (!state.flags.bookChecked) {
    state.flags.bookChecked = true;
    showMessage('赤い本の端に小さな走り書きがある──\n「引き出しを開ける鍵は、緑の足元に眠る」');
  } else {
    showMessage('赤い本の走り書き──\n「引き出しを開ける鍵は、緑の足元に眠る」');
  }
}

// --- フレーバーテキスト ---
function examineCardReader() {
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
    showMessage('ドアの横にカードリーダーがある。\nカードキーをかざす場所のようだ。');
  }
}

function examinePenHolder() {
  showMessage('ペン立て。ボールペンが数本入っている。\n特に変わったところはない。');
}

function examinePapers() {
  showMessage('デスクに置かれた資料。\n数字やグラフがびっしり並んでいるが、\n脱出には関係なさそうだ。');
}

function examineBookBlue() {
  showMessage('青い本。パラパラめくってみたが、\n特に手がかりはなさそうだ。');
}

function examineWindow() {
  showMessage('窓だが、しっかりロックされていて開かない。\n外は暗くてよく見えない。');
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
if (!DEBUG_MODE) {
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
}

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
  createDebugPanel();
  showMessage('読み込み中……');
  preloadImages().then(() => {
    renderScene();
    renderInventory();
    showMessage('気がつくとオフィスに閉じ込められていた。\nあたりを調べて脱出しよう。');
  });
}
