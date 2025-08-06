const baseWeightLimit = 100;
const deathCount = parseInt(localStorage.getItem("deathCount") || "0");
const weightLimit = baseWeightLimit + deathCount * 10;
let currentWeight = 0;
document.getElementById("weight-limit").textContent = weightLimit;
//最大積載量をリセットするときに使う（このコードがあったら110kgから120kg,130kgと増えない）
//localStorage.removeItem("deathCount");


// --- 効果音の読み込み ---
const selectSound = new Audio('image/select.mp3'); // ① 効果音ファイルを読み込む
const shuppatsuSound = new Audio('image/出発.mp3'); // ① 出発.mp3 ファイルを読み込む
const rocketSound = new Audio('image/ロケット.mp3');

// 必要であれば音量調整
//アイテムの定義
const items = [
    { name: '加水食品', weight: 2, quantity: 0, image: "image/food.png"},
    { name: '缶詰', weight: 5, quantity: 0, image: "image/can.jpg" },
    { name: '半乾燥食品', weight: 3, quantity: 0, image: "image/food2.png" },
    { name: '酸素ボンベ', weight: 10, quantity: 0, image: "image/oxygenCylinder.png" },
    { name: '修理キット', weight: 5, quantity: 0, image: "image/repairKit.png"},
    { name: '燃料缶', weight: 10, quantity: 0, image:"image/fuelcan.png" },
    { name: '水', weight: 1, quantity: 0, image: "image/water.png"},
]




const itemDescriptions = {
    '加水食品': '加水してすぐ食べられる便利な食品。ご飯類や麺類空腹が10回復する',
    '缶詰': '長期保存が可能な栄養食品。空腹が20回復する',
    '半乾燥食品': '軽量で保存性の高い食品。ドライフルーツ、ビーフジャーキーなど空腹が15回復するがストレスが5増える',
    '酸素ボンベ': '呼吸用の酸素を供給。酸素供給装置が壊れた時に役立つ',
    '修理キット': '緊急時に設備を修理するための工具。船体、通信機、水生成装置を直すのに役立つ。',
    '燃料缶': '移動や発電に使う燃料。燃料タンクが壊れた時に役立つ。',
    '水': '飲料水。水生成装置が壊れた時に役立つ'
};


const itemList = document.getElementById("item-list");//htmlファイルのitem-listブロックに表示
const currentWeightText = document.getElementById("current-weight");//htmlファイルのcurrent-weightブロックに表示

//資源の増減を管理
function renderItems() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="item-image" title="${itemDescriptions[item.name] || ''}">
        <span title="${itemDescriptions[item.name] || ''}">${item.name} (${item.weight}kg)× ${item.quantity} 個</span>   
        <div>
            <button class="minus" onclick="changeItem(${index}, -1)">−</button>
            <button class="plus" onclick="changeItem(${index}, 1)">＋</button>
        </div>
    `;
        itemList.appendChild(div);
    });
}

//renderItemsの変化を適応・描画
function changeItem(index, delta) {
    const item = items[index];
    const newQuantity = item.quantity + delta;
    const newWeight = currentWeight + item.weight * delta;

    if (newQuantity < 0) return;
    if (newWeight > weightLimit) {
        alert("重量オーバーです！");
        return;
    }

    item.quantity = newQuantity;
    currentWeight = newWeight;
    currentWeightText.textContent = currentWeight;

    // --- 効果音の再生 ---
    if (delta > 0) { // ② '+'ボタンが押されたときのみ再生
        selectSound.currentTime = 0; // ③ 再生位置をリセット（連続で鳴らすため）
        selectSound.play().catch(e => console.error("効果音再生エラー:", e)); // ④ 効果音を再生
    }
    if (delta > 0) {
        selectSound.currentTime = 0;
        selectSound.play().catch(e => console.error("効果音再生エラー:", e));
    }
    renderItems();
}


//次の場面に移行
function startMission() {
    // 「出発」ボタンの効果音を再生
    shuppatsuSound.currentTime = 0;
    shuppatsuSound.play().catch(e => console.error("出発効果音再生エラー:", e));

    const summary = items.map(item => `${item.name}×${item.quantity}`).join(', ');

    // alertが閉じられた直後にロケット効果音を再生するために、alertの後に配置
    alert("出発準備完了！\n選んだ物資:\n" + summary + `\n合計重量: ${currentWeight}kg`);

    //  alertが閉じられた直後にロケット効果音を再生するように移動
    rocketSound.currentTime = 0;
    rocketSound.play().catch(e => console.error("ロケット効果音再生エラー:", e));

    //：次の画面にデータを渡したい場合
    localStorage.setItem('cargo', JSON.stringify(items));
    document.querySelectorAll('h1,p,#item-list, .summary').forEach(el => {
        el.style.display = "none";
    });
    const backgroundEl = document.querySelector(".background");
    let positionY = 0;
    const interval = setInterval(() => {
        positionY -= 5;
        backgroundEl.style.backgroundPosition = `center ${positionY}px`;
        if (positionY <= -1024) {
            clearInterval(interval);
            location.href = "flying.html" //game.htmlに移る
        }
    }, 30);
}

renderItems();