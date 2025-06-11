//ステータスの初期化と表示
let day = 1;//日付
let health = 100;//体力
let hunger = 100;//空腹度
let thirst = 100;//水分量
let training = 50;//筋肉量
let stress = 0;//ストレス値
let eventype = []; //イベントの種類判別

const weightLimit = 100;//最大積載量
let currentWeight = 0;//所持している合計重量保持

//画面表示更新関数
function updateDisplay() {
    document.getElementById("day").textContent = day;
    document.getElementById("health").textContent = health;
    document.getElementById("hunger").textContent = hunger;
    document.getElementById("thirst").textContent = thirst;
    document.getElementById("training").textContent = training;
    document.getElementById("stress").textContent = stress;

    document.getElementById("health-bar").style.width = `${health}%`;
    document.getElementById("hunger-bar").style.width = `${hunger}%`;
    document.getElementById("thirst-bar").style.width = `${thirst}%`;
    document.getElementById("training-bar").style.width = `${training}%`;
    document.getElementById("stress-bar").style.width = `${stress}%`;

    updateHealthHighlight();
}

//指定した範囲からランダムな数を生成する関数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//異常状態の管理（飢餓、水分不足、ストレス過多）
function checkAbnormalStatus() {
    const status = []
    if (hunger <= 20) status.push("🥣 飢餓");
    if (thirst <= 20) status.push("🚱 水不足");
    if (stress >= 35) status.push("😵 ストレス");
    // 保存（カンマ区切りの文字列として）
    localStorage.setItem("abnormalStatus", JSON.stringify(status));

    const statusDiv = document.getElementById("abnormal-status");
    if (statusDiv) {
        statusDiv.textContent = status.length > 0 ? `${status.join(" ")}` : "";
    }
}

function checkGameOver() {
    checkAbnormalStatus();  // ← 異常状態を記録
    localStorage.setItem("finalDay", day);  // ← 日数を保存
    if (health <= 0) location.href = "result.html";
}

//ゲームオーバー判定
function checkGameOver() {
    checkAbnormalStatus();  //異常状態を記録
    localStorage.setItem("finalDay", day);  //日数を保存
    if (health <= 0) location.href = "result.html";//結果ページに移行
}

//体力バーの枠線を制御する関数追加
function updateHealthHighlight() {
  const hunger = parseInt(document.getElementById("hunger").textContent);
  const thirst = parseInt(document.getElementById("thirst").textContent);
  const healthBar = document.getElementById("health-bar");

  if (hunger >= 50 && thirst >= 50) {
    healthBar.classList.add("health-highlight");
  } else {
    healthBar.classList.remove("health-highlight");
  }
}


//次の日に進める処理
function nextDay() {
    day++;//日付を一日進める

    checkAbnormalStatus();//異常状態の管理
    const abnormalStatusJSON = localStorage.getItem("abnormalStatus");
    const abnormalStatus = abnormalStatusJSON ? JSON.parse(abnormalStatusJSON) : [];

    //体力の増加
    if(hunger >= 50 && thirst >= 50){
        const healthpls = getRandomInt(20, 25);
        health += healthpls;
        if(health > 100){
            health = 100;
        }
    }
    

    //空腹・水分・筋力の減少
    const hungerLoss = getRandomInt(10, 15);
    const thirstLoss = getRandomInt(5, 10);
    const trainingLoss = getRandomInt(5, 10);
    const stressPlus = getRandomInt(2,5);
    hunger -= hungerLoss;
    thirst -= thirstLoss;
    training -= trainingLoss;
    //0未満にならないようにする    stress += stressPlus

    if (hunger < 0) hunger = 0;
    if (thirst < 0) thirst = 0;
    if (training < 0) training = 0;

    // 空腹/水分/筋力のいずれかがゼロで体力減少
    if (hunger === 0 || thirst === 0 || training == 0) {
        health -= 10;
        //0未満にならないようにする
        if (health < 0) health = 0;
    }

    //イベント処理
    triggerRandomEvent(abnormalStatus,day);

    updateDisplay();
    //宇宙飛行士を歩かせる処理
    const astronaut = document.getElementById("astronaut");
    astronaut.classList.remove("walking"); // 連続クリック対策で一度削除
    void astronaut.offsetWidth; // 強制再描画（アニメーション再発火用）
    astronaut.classList.add("walking");

    //ゲームオーバー判定
    checkGameOver();
}

//ランダムイベント発生関数
function triggerRandomEvent(abnormalStatus,day) {
    const rand = Math.random();//ランダムな小数値
    if (rand < 0.03||day==2) {
        // 宇宙酔い（3%）または、2日目に強制発生
        addEvent("🚨 宇宙酔いが発生！めまいや嘔吐で体調不良。操作ミスが発生しやすくなります。");
        health -= 5;
        stress += 10;
    } else if (rand < 0.08) {
        // 隕石衝突（5%）
        addEvent("☄️ 隕石が船体に衝突！酸素漏れと物資の一部喪失。修理が必要です！");
        health -= 15;
        thirst -= 10;
        hunger -= 10;
    } else if (rand < 0.23) {
        // 機器の故障（15%）
        const type = getRandomInt(1, 4);
        if (type === 1) {
            addEvent("📡 通信機器が故障！交信不能でストレス上昇。");
            stress += 15;
        } else if (type === 2) {
            addEvent("🔧 酸素供給装置が故障！体調悪化に注意。");
            health -= 10;
        } else if (type === 3) {
            addEvent("🚱 水生成装置が故障！水分確保が困難に。");
            thirst -= 15;
        } else {
            addEvent("💩 汚水タンク故障！衛生状態が悪化しストレスが増大。");
            stress += 10;
        }
    }else{
        addEvent("✅ 今日は特に異常なし。");
    }

    // ステータスの限界値チェック
    if (health < 0) health = 0;
    if (thirst < 0) thirst = 0;
    if (hunger < 0) hunger = 0;
    if (stress > 100) stress = 100;
}

//イベントログ作成
function toggleLog() {
    const log = document.getElementById("event-log");//ログ本体
    const button = document.getElementById("toggle-log");//拡大縮小のボタン
    log.classList.toggle("expanded");
    if (log.classList.contains("expanded")) {
        button.textContent = "▲";
    } else {
        button.textContent = "▼";
    }
}

//イベントログにイベントを追加
function addEvent(message) {
    const eventLog = document.getElementById("event-messages");
    if (eventLog) {
        const li = document.createElement("li");//リストの追加
        li.textContent = `【${day}日目】${message}`;//日数を追加
        eventLog.prepend(li);//作成した上記のリストをログの先頭に追加
    }
}

function toggleLog() {
    const log = document.getElementById("event-log");
    const button = document.getElementById("toggle-log");
    log.classList.toggle("expanded");
    if (log.classList.contains("expanded")) {
        button.textContent = "▲";
    } else {
        button.textContent = "▼";
    }
}



function eat() {
    hunger += 20;
    thirst += 10;
    if (hunger > 100) hunger = 100;
    if (thirst > 100) thirst = 100;
    updateDisplay();//表示更新
}

//トレーニング処理
function train() {
    //トレーニングにするのに十分な状態であるかの確認
    if (hunger < 20 || thirst < 20 || health < 10) {
        alert("体力・空腹・水分が足りません！！！");
        alert("体力・空腹・水分が足りません！！！");
        return;
    }
    health -= 5;
    hunger -= 10;
    thirst -= 10;
    training += 5;
    if (training > 50) training = 50;
    updateDisplay();
}
function toggleLogSize() {
    const logSection = document.getElementById("event-log");
    logSection.classList.toggle("collapsed");
}


const items = [
  { name: '加水食品', weight: 5, quantity: 0, image: "image/food.png" },
  { name: '缶詰', weight: 10, quantity: 0, image: "image/food.png" },
  { name: '半乾燥食品', weight: 5, quantity: 0, image: "image/food.png" },
  { name: '酸素ボンベ', weight: 20, quantity: 0, image: "image/oxygenCylinder.png" },
  { name: '修理キット', weight: 8, quantity: 0, image: "image/repairKit.png" },
  { name: '燃料缶', weight: 20, quantity: 0, image: "image/fuel.png" },
  { name: '水', weight: 5, quantity: 0, image: "image/water.png" }
];

const itemList = document.getElementById("item-list");
const currentWeightText = document.getElementById("current-weight");


//イベントログのサイズを切り替える処理
function toggleLogSize() {
    const logSection = document.getElementById("event-log");//イベントログの枠所得
    logSection.classList.toggle("collapsed");//縮小表示と通常表示の切り替え
}


// 所持品の描画
function renderItems() {
  itemList.innerHTML = '';
  currentWeight = 0;

  items.forEach((item) => {//全アイテムについて一つずつ処理を行う
    currentWeight += item.weight * item.quantity;//重さ×個数

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="item-image">
      <span>${item.name} (${item.weight}kg) × ${item.quantity} 個</span>
    `;
    itemList.appendChild(div);
  });
  //現在の合計重量を画面に表示
  currentWeightText.textContent = currentWeight;
}

// モーダル(所持品リスト)表示・非表示
document.getElementById("bag-button").addEventListener("click", () => {
  renderItems();
  document.getElementById("bag-modal").classList.remove("hidden");
});

//所持品モーダルを閉じる
function closeBag() {
  document.getElementById("bag-modal").classList.add("hidden");
}

//初期表示更新
updateDisplay();