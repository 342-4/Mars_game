let day = 1;
let health = 100;
let hunger = 100;
let thirst = 100;
let training = 0;
let stress = 0;  // ← 追加

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

function nextDay() {
    day++;

    const hungerLoss = getRandomInt(10, 15);
    const thirstLoss = getRandomInt(5, 10);
    hunger -= hungerLoss;
    thirst -= thirstLoss;

    if (hunger < 0) hunger = 0;
    if (thirst < 0) thirst = 0;

    if (hunger === 0 || thirst === 0) {
        health -= 10;
        if (health < 0) health = 0;
    }

    updateDisplay();
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
        alert("体力・空腹・水分が足りません！");
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
