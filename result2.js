window.onload = function () {
    const day = localStorage.getItem("finalDay");
    document.getElementById("day-result").textContent = `到達日数: ${day} 日目`;
    const ijyou = localStorage.getItem("abnormalStatus");
    if (ijyou){
        document.getElementById("status-result").textContent = `異常状態：${ijyou}`;
    }else{
        document.getElementById("status-result").textContent = `異常状態なし`;
    }
    
}
