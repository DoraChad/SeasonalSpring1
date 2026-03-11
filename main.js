const proxyURL = ["https://polyproxy.orangywastaken.workers.dev/leaderboard?version=0.6.0&trackId=", "&skip=0&amount=200&onlyVerified=false"]
const trackIds = ["76e1920a3ca015033a0b21156848def2c248c95d97ccf4aab2312a0302beefe0", "a8132c5e2df877f86572476a14b24fedc5da0892d3136b1e8f0fad33013e829a", "4058e3616fbd79b848e70037adde4f12b4413011050aaf1c9d875cdbe2e33d68", "e65c13f972d370cae9c61c5c7dd53708c9328377b7db32000ebefeb64c9687d6", "dd7b5489ba2dc8691e713d7da5e25ea631d96183a7b9919556122898badda291", "3aa3612c79907e98105d9930b28172d25df7a0930ccaf0c3f096eb4d8e42400c", "064b75893da97ced0c44841f4ef2197c4c4e8c70fe75006e7fa538dbf37feccb", "c033a1a0805db87e0f040a12af1c387dda9b86611274fc82a88d7768ac168ef3", "aa421a6e2097e73cd34c3f580a6a68793aa927c7ade5520601879c6fb25b3b4e", "8ba04773833d77c33733fad05fdfc88b238bafe6013e1377238054a19ceab7bc`"]
const numberOfTracks = 10

const saveVariableToFile = function(data, filename = "data.json") {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

async function loadVariableFromGitHub(url) {
    const response = await fetch(`https://raw.githubusercontent.com/DoraChad/SeasonalSpring1/refs/heads/main/${url}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const text = await response.text();
    return JSON.parse(text);
}

function popup(message) {
    const msg = document.createElement('div');
    msg.className = 'popup';
    msg.textContent = message;
    document.body.appendChild(msg);

    requestAnimationFrame(() => {
        msg.style.opacity = 1;
    });

    setTimeout(() => {
        msg.style.opacity = 0;
        msg.addEventListener('transitionend', () => msg.remove(), { once: true });
    }, 1000);
}

async function copyFileToClipboard(trackNum) {
    url = `https://raw.githubusercontent.com/DoraChad/SeasonalSpring1/refs/heads/main/tracks/${trackNum}.track`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch file');

        const text = await res.text();
        await navigator.clipboard.writeText(text);

        popup("Track Code Copied To Clipboard");
    } catch (err) {
        console.error(err);
    }
}


async function fetchLeaderboard(trackNumber) {
    const url = `${proxyURL[0]}${trackIds[trackNumber]}${proxyURL[1]}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
}

async function getFullLeaderboards(totalTracks = numberOfTracks) {
    const leaderboards = [];

    for (let trackIndex = 0; trackIndex < totalTracks; trackIndex++) {
        const lb = await fetchLeaderboard(trackIndex);
        leaderboards.push(lb);
    }

    const playerData = {};

    leaderboards.forEach((lb, trackIndex) => {
        lb.entries.forEach((entry, pos) => {
            if (!playerData[entry.userId]) {
            playerData[entry.userId] = {
                nickname: entry.nickname,
                placements: Array(totalTracks).fill(null)
            };
            }
            playerData[entry.userId].placements[trackIndex] = pos + 1;
        });
    });

    return playerData;
}

function calculatePoints(playerMap) {
    const playersWithPoints = [];

    for (const userId in playerMap) {
    const player = playerMap[userId];

    let points = 0;
    player.placements.forEach(place => {
        if (place === null) return;
        points += 100 / Math.sqrt(place);
    });

    playersWithPoints.push({
        userId,
        nickname: player.nickname,
        points
    });
    }

    playersWithPoints.sort((a, b) => b.points - a.points);

    return playersWithPoints;
}

const UI = document.createElement("div");
UI.className = "ui";
document.body.appendChild(UI)

const headDiv = document.createElement("div");
headDiv.className = "head-div";
UI.appendChild(headDiv)

const tracksDiv = document.createElement("div");
tracksDiv.className = "tracks-div";
UI.appendChild(tracksDiv);

const lbDiv = document.createElement("div");
lbDiv.className = "lb-div";
UI.appendChild(lbDiv);


const subTitle = document.createElement("p")
subTitle.textContent = "Seasonal Tournament";
subTitle.style.fontSize = "30px";
subTitle.style.margin = "15px";
headDiv.appendChild(subTitle);

const title = document.createElement("p")
title.textContent = "Spring 1";
title.style.fontSize = "60px";
title.style.margin = "0";
headDiv.appendChild(title);

const lbTitle = document.createElement("p")
lbTitle.textContent = "Leaderboard";
lbTitle.style.fontSize = "40px";
lbTitle.style.margin = "20px";
lbDiv.appendChild(lbTitle);

const leaderboard = document.createElement("div");
leaderboard.className = "leaderboard";
lbDiv.appendChild(leaderboard);

let doubleDiv;
for (let i = 1; i <= numberOfTracks; i++) {

    if ((i - 1) % 2 === 0) {
        doubleDiv = document.createElement("div");
        doubleDiv.className = "double-div";
    }

    const track = document.createElement("button");
    track.addEventListener("click", () => {
        copyFileToClipboard(i);
    });

    track.className = "track";
    track.style.backgroundImage = `url("https://raw.githubusercontent.com/DoraChad/SeasonalSpring1/refs/heads/main/images/WireFrames_MapTile_${i}.jpg")`;

    doubleDiv.appendChild(track);

    if (i % 2 === 0 || i === numberOfTracks) {
        tracksDiv.appendChild(doubleDiv);
    }
}

(async () => {
    calculatePoints(await getFullLeaderboards()).forEach((player, placement) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        name.textContent = `${placement + 1}. ${player.nickname}`;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(player.points*1000)/1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboard.appendChild(entry);
    });
})();
