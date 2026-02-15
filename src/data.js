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
    { id: 'door', label: 'ドア', x: 14.9, y: 33, w: 44.9, h: 95.1, condition: null, action: 'examineDoor' },
    { id: 'poster', label: 'ポスター', x: 0, y: 46, w: 9, h: 24, condition: null, action: 'examinePoster' },
    { id: 'card-reader', label: 'カード読取機', x: 62, y: 65, w: 8, h: 12, condition: null, action: 'examineCardReader' },
  ],
  east: [
    { id: 'drawer', label: '引き出し', x: 10, y: 105, w: 25, h: 15, condition: null, action: 'examineDrawer' },
    { id: 'computer', label: 'PC', x: 38.9, y: 57.5, w: 39, h: 36.8, condition: null, action: 'examineComputer' },
    { id: 'pen-holder', label: 'ペン立て', x: 29.8, y: 77.1, w: 5.5, h: 12.5, condition: null, action: 'examinePenHolder' },
    { id: 'papers', label: '資料', x: 13.3, y: 87.7, w: 19.7, h: 7.3, condition: null, action: 'examinePapers' },
  ],
  south: [
    { id: 'book-red', label: '赤い本', x: 9, y: 37, w: 5, h: 17, condition: null, action: 'examineBookRed' },
    { id: 'book-blue', label: '青い本', x: 20, y: 38, w: 11, h: 16, condition: null, action: 'examineBookBlue' },
    { id: 'plant', label: '観葉植物', x: 80.7, y: 117.7, w: 13.6, h: 15.4, condition: null, action: 'examinePlant' },
  ],
  west: [
    { id: 'safe', label: '金庫', x: 5.4, y: 100.2, w: 27.5, h: 34, condition: null, action: 'examineSafe' },
    { id: 'cabinet', label: 'キャビネット', x: 75.3, y: 41.7, w: 24.7, h: 92.1, condition: null, action: 'examineCabinet' },
    { id: 'window', label: '窓', x: 14, y: 22, w: 70.8, h: 46.8, condition: null, action: 'examineWindow' },
  ],
};

// アイテム定義
export const items = {
  smallKey: { id: 'smallKey', name: '小さな鍵', emoji: '🔑' },
  memo: { id: 'memo', name: 'メモ', emoji: '📝' },
  screwdriver: { id: 'screwdriver', name: 'ドライバー', emoji: '🪛' },
  cardKey: { id: 'cardKey', name: 'カードキー', emoji: '💳' },
};
