// ゲームデータ定義
// 方向の順序: north → east → south → west → north ...

export const directions = ['north', 'east', 'south', 'west'];

export const directionLabels = {
  north: '北の壁',
  east: '東の壁',
  south: '南の壁',
  west: '西の壁',
};

// 部屋の各方向に配置するオブジェクト（CSS仮描画用）
export const roomObjects = {
  north: [
    { id: 'door', label: 'ドア', x: '30%', y: '10%', w: '40%', h: '75%', color: '#5c3d2e', borderRadius: '4px 4px 0 0' },
    { id: 'door-knob', label: '', x: '60%', y: '45%', w: '6%', h: '6%', color: '#aaa', borderRadius: '50%' },
    { id: 'clock', label: '時計', x: '78%', y: '12%', w: '14%', h: '18%', color: '#2a2a3a', borderRadius: '50%' },
    { id: 'poster', label: 'ポスター', x: '5%', y: '15%', w: '18%', h: '25%', color: '#3a6b5a' },
  ],
  east: [
    { id: 'desk', label: '机', x: '15%', y: '55%', w: '55%', h: '30%', color: '#8b6914' },
    { id: 'drawer', label: '引き出し', x: '20%', y: '72%', w: '20%', h: '12%', color: '#7a5c10', border: '1px solid #5a4510' },
    { id: 'computer', label: 'PC', x: '35%', y: '40%', w: '22%', h: '20%', color: '#2a2a3a' },
    { id: 'computer-screen', label: '', x: '36%', y: '41%', w: '20%', h: '15%', color: '#1a3a5a' },
    { id: 'chair', label: '椅子', x: '72%', y: '60%', w: '18%', h: '28%', color: '#333' },
  ],
  south: [
    { id: 'bookshelf', label: '本棚', x: '10%', y: '10%', w: '45%', h: '70%', color: '#6b4226' },
    { id: 'book-red', label: '赤い本', x: '14%', y: '15%', w: '8%', h: '18%', color: '#c0392b' },
    { id: 'book-blue', label: '青い本', x: '24%', y: '15%', w: '7%', h: '18%', color: '#2980b9' },
    { id: 'book-green', label: '緑の本', x: '33%', y: '15%', w: '8%', h: '18%', color: '#27ae60' },
    { id: 'plant', label: '観葉植物', x: '70%', y: '50%', w: '20%', h: '35%', color: '#2d6a4f', borderRadius: '50% 50% 10% 10%' },
    { id: 'plant-pot', label: '', x: '73%', y: '75%', w: '14%', h: '14%', color: '#8b4513', borderRadius: '4px' },
  ],
  west: [
    { id: 'safe', label: '金庫', x: '15%', y: '25%', w: '25%', h: '22%', color: '#4a4a5a', border: '2px solid #6a6a7a' },
    { id: 'safe-dial', label: '', x: '22%', y: '32%', w: '10%', h: '10%', color: '#2a2a3a', borderRadius: '50%' },
    { id: 'cabinet', label: 'キャビネット', x: '55%', y: '30%', w: '30%', h: '50%', color: '#7a7a8a' },
    { id: 'cabinet-screws', label: 'ネジ', x: '80%', y: '35%', w: '4%', h: '4%', color: '#aaa', borderRadius: '50%' },
    { id: 'window', label: '窓', x: '25%', y: '5%', w: '30%', h: '15%', color: '#87CEEB', border: '3px solid #555' },
  ],
};

// ホットスポット定義
// condition: 表示条件（flagsのチェック）、nullなら常時表示
// action: タップ時の処理名
export const hotspots = {
  north: [
    {
      id: 'clock',
      label: '時計',
      x: '75%', y: '8%', w: '20%', h: '24%',
      condition: null,
      action: 'examineClock',
    },
    {
      id: 'door',
      label: 'ドア',
      x: '28%', y: '8%', w: '44%', h: '80%',
      condition: null,
      action: 'examineDoor',
    },
    {
      id: 'poster',
      label: 'ポスター',
      x: '3%', y: '12%', w: '22%', h: '30%',
      condition: null,
      action: 'examinePoster',
    },
  ],
  east: [
    {
      id: 'drawer',
      label: '引き出し',
      x: '18%', y: '68%', w: '24%', h: '18%',
      condition: null,
      action: 'examineDrawer',
    },
    {
      id: 'computer',
      label: 'PC',
      x: '33%', y: '36%', w: '26%', h: '28%',
      condition: null,
      action: 'examineComputer',
    },
  ],
  south: [
    {
      id: 'book-red',
      label: '赤い本',
      x: '12%', y: '12%', w: '12%', h: '22%',
      condition: null,
      action: 'examineBookRed',
    },
    {
      id: 'plant',
      label: '観葉植物',
      x: '65%', y: '45%', w: '28%', h: '45%',
      condition: null,
      action: 'examinePlant',
    },
  ],
  west: [
    {
      id: 'safe',
      label: '金庫',
      x: '12%', y: '22%', w: '32%', h: '28%',
      condition: null,
      action: 'examineSafe',
    },
    {
      id: 'cabinet',
      label: 'キャビネット',
      x: '52%', y: '26%', w: '34%', h: '56%',
      condition: null,
      action: 'examineCabinet',
    },
  ],
};

// アイテム定義
export const items = {
  smallKey: { id: 'smallKey', name: '小さな鍵', emoji: '🔑' },
  memo: { id: 'memo', name: 'メモ', emoji: '📝' },
  screwdriver: { id: 'screwdriver', name: 'ドライバー', emoji: '🪛' },
  cardKey: { id: 'cardKey', name: 'カードキー', emoji: '💳' },
};
