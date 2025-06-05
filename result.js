document.addEventListener("DOMContentLoaded", () => {
    const result = JSON.parse(localStorage.getItem("resultData"));

    if (result) {
        document.getElementById("result-day").textContent = result.day;
        document.getElementById("result-health").textContent = result.health;
        document.getElementById("result-hunger").textContent = result.hunger;
        document.getElementById("result-thirst").textContent = result.thirst;
        document.getElementById("result-training").textContent = result.training;
        document.getElementById("result-stress").textContent = result.stress;

        const msg = document.getElementById("result-message");

        if (result.health <= 0) {
            msg.textContent = "💀 体力が尽きてしまいました...";
        } else if (result.training >= 80) {
            msg.textContent = "💪 あなたは最高の訓練成果をあげました！";
        } else if (result.stress >= 80) {
            msg.textContent = "😖 ストレスが限界に達しました...";
        } else {
            msg.textContent = "🚀 無事に火星ミッションを終えました！";
        }
    } else {
        document.querySelector(".result-box").innerHTML =
            "<p>結果データが見つかりませんでした。</p>";
    }
});
  