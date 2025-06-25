window.onload = function () {
  const bg = document.getElementById("main-bg");
  let positionY = -300; // 少し上から始めて画面内でスムーズに登場
  const targetY = 0;
  const step = 4;

  const interval = setInterval(() => {
    positionY += step;
    bg.style.backgroundPosition = `center ${positionY}px`;

    if (positionY >= targetY) {
      clearInterval(interval);

      // 0.5秒後に背景切り替え＆テキスト表示（完全に降りた感を出す）
      setTimeout(() => {
        bg.classList.add("arrived");
        document.getElementById("success-content").style.display = "block";

        // 結果表示
        const day = localStorage.getItem("finalDay");
        document.getElementById("day-result").textContent = `到達日数: ${day} 日目`;

        const ijyou = localStorage.getItem("abnormalStatus");
        if (ijyou) {
          const statusArray = JSON.parse(ijyou);
          document.getElementById("status-result").textContent =
            statusArray.length > 0 ? `異常状態：${statusArray.join("、")}` : "異常状態なし";
        } else {
          document.getElementById("status-result").textContent = "異常状態なし";
        }
      }, 3000); // ← 着陸完了後、0.5秒演出を空ける
    }
  }, 30);
};
