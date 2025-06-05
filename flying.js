let day = 1;
let health = 100;
let hunger = 100;
let thirst = 100;
let training = 0;
let stress = 0;  // ← 追加
let eventype = []; //イベントの種類判別

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
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//異常状態の管理（飢餓、水分不足、ストレス過多）
function checkAbnormalStatus() {
    const status = []
    if (hunger <= 20) status.push("🥣 飢餓状態");
    if (thirst <= 20) status.push("🚱 水分不足");
    if (stress >= 60) status.push("😵 ストレス過多");
    // 保存（カンマ区切りの文字列として）
    localStorage.setItem("abnormalStatus", JSON.stringify(status));
}

function checkGameOver() {
    checkAbnormalStatus();  // ← 異常状態を記録
    localStorage.setItem("finalDay", day);  // ← 日数を保存
    if (health <= 0) location.href = "result.html";
}

function nextDay() {
    day++;

    checkAbnormalStatus();
    const abnormalStatusJSON = localStorage.getItem("abnormalStatus");
    const abnormalStatus = abnormalStatusJSON ? JSON.parse(abnormalStatusJSON) : [];

    // 空腹・水分の減少
    const hungerLoss = getRandomInt(10, 15);
    const thirstLoss = getRandomInt(5, 10);
    hunger -= hungerLoss;
    thirst -= thirstLoss;

    if (hunger < 0) hunger = 0;
    if (thirst < 0) thirst = 0;

    // 空腹または水分がゼロで体力減少
    if (hunger === 0 || thirst === 0) {
        health -= 10;
        if (health < 0) health = 0;
    }

    // 🔽 イベント処理をここで呼び出す
    triggerRandomEvent(abnormalStatus,day);

    updateDisplay();
    // 宇宙飛行士を歩かせる処理 // 変更点
    const astronaut = document.getElementById("astronaut");
    astronaut.classList.remove("walking"); // 連続クリック対策で一度削除
    void astronaut.offsetWidth; // 強制再描画（アニメーション再発火用）
    astronaut.classList.add("walking");

    checkGameOver();
}

function triggerRandomEvent(abnormalStatus,day) {
    const rand = Math.random();
    if (rand < 0.03||day==2) {
        // 宇宙酔い（3%）2日目に強制発生
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
    } else if (abnormalStatus.length > 0){
        abnormalStatus.forEach(status =>{
            switch (status){
                case "🥣 飢餓状態" :
                    addEvent("⚠️ 【緊急】空腹です！食事を摂ってください。");
                    break;
                case "🚱 水分不足":
                    addEvent("⚠️ 【緊急】水分不足です！水を取ってください");
                    break;
                case "😵 ストレス過多":
                    addEvent("⚠️ 【緊急】ストレスが限界に近づいています！コミュニケーションをとってください。");
                    break;
                default : 
                    addEvent(`⚠️ 異常状態: ${status}`);
            }
        })
    } else{
        addEvent("✅ 今日は特に異常なし。");
    }

    // ステータスの限界値チェック
    if (health < 0) health = 0;
    if (thirst < 0) thirst = 0;
    if (hunger < 0) hunger = 0;
    if (stress > 100) stress = 100;
}

function addEvent(message) {
    const eventLog = document.getElementById("event-messages");
    if (eventLog) {
        const li = document.createElement("li");
        li.textContent = `【${day}日目】${message}`;  // ← 日数を追加
        eventLog.prepend(li);
    }
}


function eat() {
    hunger += 20;
    thirst += 10;
    if (hunger > 100) hunger = 100;
    if (thirst > 100) thirst = 100;
    updateDisplay();
}

function train() {
    if (hunger < 20 || thirst < 20 || health < 10) {
        alert("体力・空腹・水分が足りません！！！");
        return;
    }
    health -= 5;
    hunger -= 10;
    thirst -= 10;
    training += 5;
    if (training > 100) training = 100;
    updateDisplay();
}

updateDisplay();
