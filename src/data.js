// ゲームデータ定義
// 方向の順序: north → east → south → west → north ...

export const directions = ['north', 'east', 'south', 'west'];

export const directionLabels = {
  north: '北の壁',
  east: '東の壁',
  south: '南の壁',
  west: '西の壁',
};

// 座標系の説明:
// x, y, w, h は全て 0〜100 の数値で指定する。
// 幅(w)と高さ(h)は同じ値なら見た目が正方形になる。
// 描画時に h をコンテナのアスペクト比で自動補正するため、
// データ定義時にアスペクト比を意識する必要はない。

export const hotspots = {
  north: [
    { id: 'clock', label: '時計', x: 75, y: 23, w: 20, h: 20, condition: null, action: 'examineClock' },
    { id: 'door', label: 'ドア', x: 14, y: 27, w: 47, h: 99, condition: null, action: 'examineDoor' },
    { id: 'poster', label: 'ポスター', x: 0, y: 46, w: 9, h: 24, condition: null, action: 'examinePoster' },
  ],
  east: [
    { id: 'drawer', label: '引き出し', x: 10, y: 105, w: 25, h: 15, condition: null, action: 'examineDrawer' },
    { id: 'computer', label: 'PC', x: 39, y: 58, w: 42, h: 37, condition: null, action: 'examineComputer' },
  ],
  south: [
    { id: 'book-red', label: '赤い本', x: 9, y: 37, w: 5, h: 17, condition: null, action: 'examineBookRed' },
    { id: 'plant', label: '観葉植物', x: 65, y: 68, w: 37, h: 71, condition: null, action: 'examinePlant' },
  ],
  west: [
    { id: 'safe', label: '金庫', x: 2, y: 95, w: 36, h: 44, condition: null, action: 'examineSafe' },
    { id: 'cabinet', label: 'キャビネット', x: 68, y: 37, w: 34, h: 102, condition: null, action: 'examineCabinet' },
  ],
};

// アイテム定義
export const items = {
  smallKey: { id: 'smallKey', name: '小さな鍵', emoji: '🔑' },
  memo: { id: 'memo', name: 'メモ', emoji: '📝' },
  screwdriver: { id: 'screwdriver', name: 'ドライバー', emoji: '🪛' },
  cardKey: { id: 'cardKey', name: 'カードキー', emoji: '💳' },
};
