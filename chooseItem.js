const weightLimit = 100;
let currentWeight = 0;

const items = [
    { name: '加水食品', weight: 5, quantity: 0, image: "image/food.png"},
    { name: '缶詰', weight: 10, quantity: 0, image: "image/food.png" },
    { name: '半乾燥食品', weight: 5, quantity: 0, image: "image/food.png" },
    { name: '酸素ボンベ', weight: 20, quantity: 0, image: "image/oxygenCylinder.png" },
    { name: '修理キット', weight: 8, quantity: 0, image: "image/repairKit.png"},
    { name: '燃料缶', weight: 20, quantity: 0 },
    { name: '水', weight: 5, quantity: 0, image: "image/water.png"},
];

const itemList = document.getElementById("item-list");//htmlファイルのitem-listブロックに表示
const currentWeightText = document.getElementById("current-weight");//htmlファイルのcurrent-weightブロックに表示

//資源の増減を管理
function renderItems() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="item-image">
        <span>${item.name} (${item.weight}kg)× ${item.quantity} 個</span>   
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
    renderItems();
}

//次の場面に移行
function startMission() {
    const summary = items.map(item => `${item.name}×${item.quantity}`).join(', ');
    alert("出発準備完了！\n選んだ物資:\n" + summary + `\n合計重量: ${currentWeight}kg`);

    // 例：次の画面にデータを渡したい場合
    localStorage.setItem('cargo', JSON.stringify(items));
    document.querySelectorAll('h1,p,#item-list, .summary').forEach(el => {
        el.style.display = "none";
    });
    const backgroundEl = document.querySelector(".background");
    let positionY = 0;
    const interval = setInterval(() => {
        positionY -= 5;
        backgroundEl.style.backgroundPosition = `center ${positionY}px`;
        if (positionY <= -1024){
            clearInterval(interval);
            location.href = "flying.html" //game.htmlに移る
        }
    }, 30);
}

renderItems();
