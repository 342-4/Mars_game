//ステータスの初期化と表示
let day = 1;//日付
let health = 100;//体力
let hunger = 100;//空腹度
let thirst = 100;//水分量
let training = 50;//筋肉量
let stress = 0;//ストレス値
let eventype = []; //イベントの種類判別
let malfunctions = {
  comms: false,
  oxygen: false,
  waterGen: false,
  waste: false,
  hullDamaged: false
};

let malfunctionsDay = {
  comms: false,
  oxygen: false,
  waterGen: false,
  waste: false,
  hullDamaged: false
};


const weightLimit = 100;//最大積載量
let currentWeight = 0;//所持している合計重量保持
const goalDay = getRandomInt(8, 12); // 28〜32日目のどこかでクリア
localStorage.setItem("goalDay", goalDay);

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



//ゲームオーバー判定
function checkGameOver() {
    checkAbnormalStatus();  //異常状態を記録
    localStorage.setItem("finalDay", day);  //日数を保存

     const goalDay = parseInt(localStorage.getItem("goalDay") || "30");

    if (health <= 0) location.href = "result2.html";//結果ページ(失敗ver)に移行
    else if(day >= goalDay) location.href = "result1.html";//結果ページ（成功ver）に移行
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
    const astronaut = document.getElementById("astronaut");
    const fade = document.getElementById("screen-fade");

    astronaut.classList.remove("walking"); // 連続クリック対策
    void astronaut.offsetWidth; // 強制再描画でアニメーション再発火
    astronaut.classList.add("walking");

    setTimeout(() => {
        fade.classList.add("active"); // 暗転開始
    
        // アニメーション終了後にステータス処理を実行
        setTimeout(() => {
            day++; // 日付を進める

             if (malfunctions.hullDamaged && malfunctionsDay.hullDamaged) {
                health -= 15;
                hunger -= 10;
                thirst -= 10;
                addEvent("☄️ 船体損傷が続いています。修理が必要です！");
            }
            if (malfunctions.comms && malfunctionsDay.comms) {
                stress += 15;
                addEvent("📡 通信機器の故障が続いています。");
            }
            if (malfunctions.oxygen && malfunctionsDay.oxygen) {
                health -= 10;
                addEvent("🔧 酸素供給装置の故障が続いています。");
            }
            if (malfunctions.waterGen && malfunctionsDay.waterGen) {
                thirst -= 15;
                addEvent("🚱 水生成装置の故障が続いています。");
            }
            if (malfunctions.waste && malfunctionsDay.waste) {
                stress += 10;
                addEvent("💩 汚水タンクの故障が続いています。");
            }

            checkAbnormalStatus(); // 異常状態の確認
            const abnormalStatusJSON = localStorage.getItem("abnormalStatus");
            const abnormalStatus = abnormalStatusJSON ? JSON.parse(abnormalStatusJSON) : [];

            // 条件により体力回復
            if (hunger >= 50 && thirst >= 50) {
                const healthpls = getRandomInt(20, 25);
                health = Math.min(100, health + healthpls);
            }

            // ステータスの減少
            hunger -= getRandomInt(10, 15);
            thirst -= getRandomInt(5, 10);
            training -= getRandomInt(5, 10);
            stress += getRandomInt(2, 5);

            hunger = Math.max(0, hunger);
            thirst = Math.max(0, thirst);
            training = Math.max(0, training);

            if (hunger === 0 || thirst === 0 || training === 0) {
                health -= 10;
                if (health < 0) health = 0;
            }

            triggerRandomEvent(abnormalStatus, day); // イベント発生
            updateDisplay(); // 画面表示更新

            astronaut.classList.remove("walking"); // 歩行停止

            setTimeout(() => {
                fade.classList.remove("active");
                checkGameOver();
                
                malfunctionsDay = { ...malfunctions };
            }, 1000);

        }, 500); // 1秒後にステータス処理
    }, 3000); // 3秒アニメーション完了後に明転
}


//ランダムイベント発生関数
function triggerRandomEvent(abnormalStatus,day) {
    const rand = Math.random();//ランダムな小数値
    const bg = document.querySelector('.background'); // 背景要素を取得

    if (rand < 0.03||day==2) {
        // 宇宙酔い（3%）または、2日目に強制発生
        addEvent("🚨 宇宙酔いが発生！めまいや嘔吐で体調不良。操作ミスが発生しやすくなります。");
        health -= 5;
        stress += 10;
        if(bg){
            bg.style.backgroundImage = "url('image/spaceShip_Drunk.png')";
        }
    }else{
        if(bg){
            bg.style.backgroundImage = "url('image/spaceShip.png')";
        }
        if (rand < 0.8) {
            // 隕石衝突（5%）
            addEvent("☄️ 隕石が船体に衝突！酸素漏れと物資の一部喪失。修理が必要です！");
            health -= 15;
            thirst -= 10;
            hunger -= 10;
            malfunctions.hullDamaged = true;
        } else if (rand < 0.8) {
            // 機器の故障（15%）
            const type = getRandomInt(1, 4);
            if (type === 1) {
                addEvent("📡 通信機器が故障！交信不能でストレス上昇。");
                stress += 15;
                malfunctions.comms = true;
            } else if (type === 2) {
                addEvent("🔧 酸素供給装置が故障！体調悪化に注意。");
                health -= 10;
                malfunctions.oxygen = true;
            } else if (type === 3) {
                addEvent("🚱 水生成装置が故障！水分確保が困難に。");
                thirst -= 15;
                malfunctions.waterGen = true;
            } else {
                addEvent("💩 汚水タンク故障！衛生状態が悪化しストレスが増大。");
                stress += 10;
                malfunctions.waste = true;
            }
        }else{
            addEvent("✅ 今日は特に異常なし。");
        }
    }

function repairSystem(part) {
  const cargo = JSON.parse(localStorage.getItem('cargo')) || [];
  const kit = cargo.find(i => i.name === '修理キット');

  if (!kit || kit.quantity <= 0) {
    alert("修理キットがありません！");
    return;
  }

  if (!malfunctions[part]) {
    alert("この部分は故障していません！");
    return;
  }

  // 修理実行
  kit.quantity--;
  localStorage.setItem('cargo', JSON.stringify(cargo));
  malfunctions[part] = false;

  let message = "";
  switch (part) {
    case "hullDamaged":
      message = "☄️ 船体を修理しました。";
      break;
    case "comms":
      message = "📡 通信機を修理しました。";
      break;
    case "waste":
      message = "💩 汚水タンクを修理しました。";
      break;
    case "waterGen":
      message = "🚱 水生成装置を修理しました。";
      break;
  }

  addEvent(message);
  updateDisplay();
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

function eat(n) {
    const cargo = JSON.parse(localStorage.getItem('cargo')) || [];

    // 食料種類と名前の対応表
    const foodMap = {
        1: "加水食品",
        2: "缶詰",
        3: "半乾燥食品",
        4: "水"
    };

    const itemName = foodMap[n];
    const item = cargo.find(i => i.name === itemName);

    if (!item || item.quantity <= 0) {
        alert(`${itemName} がありません`);
        return;
    }

    // 数量を減らす
    item.quantity--;
    localStorage.setItem('cargo', JSON.stringify(cargo));
    updateMealQuantities();

    // 空腹・水分を変化させる
    switch(n){
        case 1: // 加水食品
            hunger += 10;
            break;
        case 2: // 缶詰
            hunger += 20;
            break;
        case 3: // 半乾燥食品
            hunger += 15;
            stress += 5;
            break;
        case 4: //水
            thirst += 10;
    }

    // 上限・下限を調整
    if (hunger > 100) hunger = 100;
    if (thirst > 100) thirst = 100;
    if (thirst < 0) thirst = 0;

    const savedCargo = JSON.parse(localStorage.getItem("cargo") || "[]");

    // savedCargo の内容を items に反映
    savedCargo.forEach(savedItem => {
    const match = items.find(item => item.name === savedItem.name);
    if (match) {
        match.quantity = savedItem.quantity;
    }
    })

    updateDisplay();         // ステータス更新
    updateMealQuantities(); // 食事モーダル更新
    renderItems();           // 所持品モーダル更新

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
  { name: '缶詰', weight: 10, quantity: 0, image: "image/can.jpg" },
  { name: '半乾燥食品', weight: 5, quantity: 0, image: "image/food.png" },
  { name: '酸素ボンベ', weight: 20, quantity: 0, image: "image/oxygenCylinder.png" },
  { name: '修理キット', weight: 8, quantity: 0, image: "image/repairKit.png" },
  { name: '燃料缶', weight: 20, quantity: 0, image: "image/fuelcan.png" },
  { name: '水', weight: 5, quantity: 0, image: "image/water.png" }
];
// chooseItem.js から cargo データを取得
const savedCargo = JSON.parse(localStorage.getItem("cargo") || "[]");

// savedCargo の内容を items に反映
savedCargo.forEach(savedItem => {
  const match = items.find(item => item.name === savedItem.name);
  if (match) {
    match.quantity = savedItem.quantity;
  }
});


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

function resizeBackground() {
    const bg = document.querySelector('.background');
    bg.style.width = `${window.innerWidth}px`;
    bg.style.height = `${window.innerHeight}px`;
}

window.addEventListener('resize', resizeBackground);
window.addEventListener('load', resizeBackground);


// モーダル(所持品リスト)表示・非表示
document.getElementById("bag-button").addEventListener("click", () => {
  renderItems();
  document.getElementById("bag-modal").classList.remove("hidden");
});

//所持品モーダルを閉じる
function closeBag() {
  document.getElementById("bag-modal").classList.add("hidden");
}

// 食事モーダル表示
function openMeal() {
    document.getElementById("meal-modal").classList.remove("hidden");
    updateMealQuantities();  // ← これを必ず呼ぶ
}


// 食事モーダル非表示
function closeMeal() {
  document.getElementById("meal-modal").classList.add("hidden");
}

//食事モーダルにおける残数管理、表示
function updateMealQuantities() {
    const cargo = JSON.parse(localStorage.getItem('cargo')) || [];

    const food = cargo.find(item => item.name === '加水食品');
    const can = cargo.find(item => item.name === '缶詰');
    const dry = cargo.find(item => item.name === '半乾燥食品');
    const water = cargo.find(item => item.name === '水');

    document.getElementById("amount-food").textContent = `残り: ${food?.quantity || 0}個`;
    document.getElementById("amount-can").textContent = `残り: ${can?.quantity || 0}個`;
    document.getElementById("amount-dry").textContent = `残り: ${dry?.quantity || 0}個`;
    document.getElementById("amount-water").textContent = `残り: ${water?.quantity || 0}個`;
}
//修理ボタンの開け閉め
function openRepairModal() {
  document.getElementById("repair-modal").classList.remove("hidden");
}
function closeRepairModal() {
  document.getElementById("repair-modal").classList.add("hidden");
}



//初期表示更新
updateDisplay();