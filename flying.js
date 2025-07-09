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
    fuel: false,
    hullDamaged: false
};
const maxFuel = 100;
const maxOxygen = 100;

// 現在の燃料と酸素も100スタート（変化させる場合は変数で管理）
let currentFuel = 100;
let currentOxygen = 100;

let malfunctionsDay = {
    comms: false,
    oxygen: false,
    waterGen: false,
    fuel: false,
    hullDamaged: false
};

const spaceYDay = 27;
let lastSpaceYLogDay = 0;

//ゲームオーバーになったら上限を10kgずつ増やすようにする
const baseWeightLimit = 100;
const deathCount = parseInt(localStorage.getItem("deathCount") || "0");
const weightLimit = baseWeightLimit + deathCount * 10;

let currentWeight = 0;//所持している合計重量保持
const goalDay = getRandomInt(15, 19); // 28〜32日目のどこかでクリア // 修正点: 目標日数を15〜19日に変更
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

    if (health <= 0) {
        // 失敗 → deathCount を1増やす
        const count = parseInt(localStorage.getItem("deathCount") || "0");
        localStorage.setItem("deathCount", count + 1);

        location.href = "result2.html"; // 結果ページ(失敗ver)
    } else if (day >= goalDay) {
        location.href = "result1.html"; // 成功時は deathCount を増やさない
    }
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

        if (day <= spaceYDay && (day - lastSpaceYLogDay) % 3 === 0) {
                if (day === spaceYDay) {
                    addSpaceYEvent("🚨 SpaceY社のロケットが火星に到達しました！");
                } else {
                    // 達成度を計算 (現在の日にち / 到達目標日) * 100
                    const progressPercentage = Math.min(100, Math.floor((day / spaceYDay) * 100));
                    let message = `火星到達まで ${progressPercentage}%`;

                    if (progressPercentage < 20) {
                        message = "SpaceY社のロケット：\n火星への長旅が始まりました。";
                    } else if (progressPercentage < 50) {
                        message = "SpaceY社のロケット：\n順調に飛行中、中間地点に接近。";
                    } else if (progressPercentage < 80) {
                        message = "SpaceY社のロケット：\n火星軌道への最終調整段階に入りました。";
                    } else if (progressPercentage < 100) {
                        message = "SpaceY社のロケット：\n火星大気圏突入準備中、緊張が高まります。";
                    }
                    addSpaceYEvent(message); // 表示を改行とパーセンテージに変更
                }
                lastSpaceYLogDay = day; // Update the last SpaceY log day
            }

        // アニメーション終了後にステータス処理を実行
        setTimeout(() => {
            day++; // 日付を進める
            
            // 故障中は燃料・酸素を20ずつ減らす
            if (malfunctions.fuel && malfunctionsDay.fuel) {
                currentFuel -= 20;
                if (currentFuel < 0) currentFuel = 0;
            }
            if (malfunctions.oxygen && malfunctionsDay.oxygen) {
                currentOxygen -= 20;
                if (currentOxygen < 0) currentOxygen = 0;
            }

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
            if (malfunctions.fuel && malfunctionsDay.fuel) {
                stress += 10;
                addEvent("⛽️ 燃料タンクの故障が続いています。");
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
            updateResourceBars();

            astronaut.classList.remove("walking"); // 歩行停止

            setTimeout(() => {
                fade.classList.remove("active");
                checkGameOver();

                malfunctionsDay = { ...malfunctions };
            }, 1000);

        }, 500); // 1秒後にステータス処理
    }, 3000); // 3秒アニメーション完了後に明転
}

// グローバルスコープに移動した修理関連の関数 // 変更点: ここから修理関連関数
let selectedRepairPart = null;

function getRepairMessage(part) {
    switch (part) {
        case "fuel": return "燃料缶を使いますか？";
        case "oxygen": return "酸素ボンベを使いますか？";
        default: return "修理キットを使いますか？";
    }
}

function getRepairLabel(part) {
    const labels = {
        hullDamaged: "☄️ 船体",
        comms: "📡 通信機",
        oxygen: "🔧 酸素供給装置",
        waterGen: "🚱 水生成装置",
        fuel: "⛽️ 燃料タンク"
    };
    return labels[part] || part;
}

function addSpaceYEvent(message) {
    const spaceyLog = document.getElementById("spacey-messages");
    if (spaceyLog) {
        const li = document.createElement("li");
        li.textContent = `【${day}日目】${message}`;
        spaceyLog.prepend(li); // ログの先頭に追加
    }
}

function promptRepair(part) {
    selectedRepairPart = part;
    document.getElementById("repair-message").textContent = getRepairLabel(part) + "を修理しますか？";
    document.getElementById("repair-confirm").classList.remove("hidden");
}

function confirmRepair(doRepair) {
    document.getElementById("repair-confirm").classList.add("hidden");
    if (doRepair && selectedRepairPart) {
        repairSystem(selectedRepairPart);
    }
    selectedRepairPart = null; // リセット
}

function repairSystem(part) {
    const cargo = JSON.parse(localStorage.getItem('cargo')) || [];
    let toolName = "修理キット";
    if (part === "fuel") toolName = "燃料缶";
    if (part === "oxygen") toolName = "酸素ボンベ";

    const tool = cargo.find(i => i.name === toolName);

    if (!tool || tool.quantity <= 0) {
        alert(`${toolName} がありません！`);
        return;
    }

    if (!malfunctions[part]) {
        alert("この部分は故障していません！");
        return;
    }

    // 修理実行
    tool.quantity--;
    localStorage.setItem('cargo', JSON.stringify(cargo));
    malfunctions[part] = false;
    malfunctionsDay[part] = false;

    // 修理時に酸素・燃料を全回復 // 変更点: ここで酸素・燃料を全回復
    if (part === "oxygen") {
        currentOxygen = 100;
    }
    if (part === "fuel") {
        currentFuel = 100;
    }

    let message = "";
    switch (part) {
        case "hullDamaged":
            message = "☄️ 船体を修理しました。";
            break;
        case "comms":
            message = "📡 通信機を修理しました。";
            break;
        case "oxygen":
            message = "🔧 酸素供給装置を修理しました。";
            break;
        case "fuel":
            message = "⛽️ 燃料タンクを修理しました。";
            break;
        case "waterGen":
            message = "🚱 水生成装置を修理しました。";
            break;
    }

    addEvent(message);
    updateDisplay();
    updateResourceBars(); // 変更点: リソースバーの更新を呼び出し
} // 変更点: ここまで修理関連関数

//ランダムイベント発生関数
function triggerRandomEvent(abnormalStatus, day) {
    const rand = Math.random();//ランダムな小数値
    const bg = document.querySelector('.background'); // 背景要素を取得

    if (rand < 0.03 || day == 2) {
        // 宇宙酔い（3%）または、2日目に強制発生
        addEvent("🚨 宇宙酔いが発生！めまいや嘔吐で体調不良。操作ミスが発生しやすくなります。");
        health -= 5;
        stress += 10;
        if (bg) {
            bg.style.backgroundImage = "url('image/spaceShip_Drunk.png')";
        }
    } else {
        if (bg) {
            bg.style.backgroundImage = "url('image/spaceShip.png')";
        }
        if (rand < 0.05) {
            // 隕石衝突（5%）
            addEvent("☄️ 隕石が船体に衝突！酸素漏れと物資の一部喪失。修理が必要です！");
            health -= 15;
            thirst -= 10;
            hunger -= 10;
            if (bg) {
                bg.style.backgroundImage = "url(image/spaceShip_meteo.png)"
            }
        } else if (rand < 0.23) {
            malfunctions.hullDamaged = true;
        } else if (rand < 0.8) {
            // 機器の故障（15%）
            const type = getRandomInt(1, 4); // 1から4に変更 // 修正点: getRandomIntの範囲を1〜4に変更
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
                addEvent("⛽️ 燃料タンク故障！このままだと火星にたどり着けるかわからない、、");
                stress += 10;
                malfunctions.fuel = true;
            }
        } else {
            addEvent("✅ 今日は特に異常なし。");
        }
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
    switch (n) {
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

function updateResourceBars() {
    // currentFuel, currentOxygenに合わせてバーと数値を更新
    document.getElementById("fuel-bar").style.width = `${currentFuel}%`;
    document.getElementById("oxygen-bar").style.width = `${currentOxygen}%`;
    document.getElementById("fuel").textContent = currentFuel;
    document.getElementById("oxygen").textContent = currentOxygen;
}

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
updateResourceBars();