let div1;
let div2;
let squads;
const lbButtonsArray = [];

const proxyURL = ["https://polyproxy.polymodloader.com/v6/leaderboard?version=0.6.0&trackId=", "&skip=0&amount=200&onlyVerified=false"]
const numberOfTracks = 16;
const lockedTracks = 16;
const leaderboardTabs = ["Div 1", "Div 2", "Squads", "Unregistered"]
const githubBase = "https://raw.githubusercontent.com/DoraChad/SeasonalSpring1/refs/heads/main/"
const trackData = {
    names: [
        "Star Bound",
        "Chicken Itza",
        "Amberbound",
        "Fisherman's Dream",
        "Sabakawa",
        "Forgotten Act",
        "Frozen Palaces",
        "Devil's Factory",
        "Pyx",
        "Marble Valley",
        "Apostle",
        "Dragon's Boneyard",
        "Castle Lake",
        "Snowpeak Ruins",
        "Calico Quarry",
        "Asphodel"
    ],
    author: [
        "By Skrdh & Zihcx",
        "By qwertyuiop",
        "By Raylee",
        "By Ziggy",
        "By DJPHILR",
        "By HummusHere",
        "By Blu3bolt",
        "By Herny",
        "By xav_au, hwadz & Hiksi",
        "By Blu3bolt & Bruther",
        "By BonnieBeans",
        "By Drought",
        "By Selver & imracer",
        "By HummusHere",
        "By Kiki",
        "By Bruther"
    ],
    ids: [
        "76e1920a3ca015033a0b21156848def2c248c95d97ccf4aab2312a0302beefe0",
        "2c4361f36368d4c170d0a4391dca5f81e25e437c3ee35b762db2c34078129b07",
        "4058e3616fbd79b848e70037adde4f12b4413011050aaf1c9d875cdbe2e33d68",
        "e65c13f972d370cae9c61c5c7dd53708c9328377b7db32000ebefeb64c9687d6",
        "dd7b5489ba2dc8691e713d7da5e25ea631d96183a7b9919556122898badda291",
        "3aa3612c79907e98105d9930b28172d25df7a0930ccaf0c3f096eb4d8e42400c",
        "064b75893da97ced0c44841f4ef2197c4c4e8c70fe75006e7fa538dbf37feccb",
        "b09369279a5e461eb03e69fbeb48d43586bcbc68888936417ac751147a446431",
        "aa421a6e2097e73cd34c3f580a6a68793aa927c7ade5520601879c6fb25b3b4e",
        "8ba04773833d77c33733fad05fdfc88b238bafe6013e1377238054a19ceab7bc",
        "5159a8dac6a1f397407a7b5233ad570613531f6609f7dc897490c28c9f2c7a4e",
        "61ed688473112f5faf428bf354f687b965bcc3045e2a0bb755c832be8581e11c",
        "07ad4a5815d810fc2b6b2709c364b0cacc88cd5e89eb7d8b2b665bbe5307a82e",
        "1b3e57642a4cc4d73fa7222df4c22e4b0a13bfd7e045c9d6adc41cd7c27c399a",
        "7b82ed12e0ea318b9eed43ce367b587b5f7f7bc93b89d6e3acd314d402e7397a",
        "f82229cee55d5c8ca1fc4026e6bdee37e08a30a0a32ea02bafeee6868916fc20"
    ]

};
const calculationConstants = {
    maxPoints: 100,
}

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
    const response = await fetch(githubBase + url);

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
    url = `${githubBase}tracks/${trackNum}.track`;
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
    const url = `${proxyURL[0]}${trackData.ids[trackNumber]}${proxyURL[1]}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
}

async function getFullLeaderboards(totalTracks = lockedTracks) {
    const promises = [];
    for (let trackIndex = 0; trackIndex < totalTracks; trackIndex++) {
        promises.push(fetchLeaderboard(trackIndex));
    }

    const leaderboards = await Promise.all(promises);

    const playerData = {};
    const WRs = {};

    leaderboards.forEach((lb, trackIndex) => {
        lb.entries.forEach((entry, pos) => {
            if (!playerData[entry.userId]) {
                playerData[entry.userId] = {
                    nickname: entry.nickname,
                    times: Array(totalTracks).fill(null),
                    placements: Array(totalTracks).fill(null)
                };
            }
            playerData[entry.userId].times[trackIndex] = entry.frames;
            playerData[entry.userId].placements[trackIndex] = pos + 1;

            if (pos === 0) {
                WRs[trackIndex] = entry.frames;
            }
        });
    });
    return { playerData, WRs };
}

function filterPlayers(playerArray, playerIds) {
    const idSet = new Set(playerIds);
    return playerArray.filter(player => idSet.has(player.userId));
}


function pointFormula(place, time, WR) {
    let points;

    if (place === 1) {
        return calculationConstants.maxPoints * 1.1;
    }

    points = calculationConstants.maxPoints * ((1/((Math.E) ** (500/(Math.sqrt(WR))))) ** ((time - WR)/(WR)))

    if (points <= 0) points = 0;

    return points;
}

function calculatePoints(data) {
    const playerMap = data.playerData;
    const WRs = data.WRs;

    const playersWithPoints = [];

    for (const userId in playerMap) {
        const player = playerMap[userId];

        let points = 0;
        player.placements.forEach((place, pos) => {
            if (place === null) return;
            points += pointFormula(place, player.times[pos], WRs[pos]);
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

function switchTab(tab) {
    if (tab === "Div 1") {
        leaderboardDiv1.classList.remove("hidden");
        leaderboardDiv2.classList.add("hidden");
        leaderboardSquads.classList.add("hidden");
        leaderboardAll.classList.add("hidden");

        lbButtonsArray[0].classList.add("selected");
        lbButtonsArray[1].classList.remove("selected");
        lbButtonsArray[2].classList.remove("selected");
        lbButtonsArray[3].classList.remove("selected");
    } else if (tab === "Div 2") {
        leaderboardDiv1.classList.add("hidden");
        leaderboardDiv2.classList.remove("hidden");
        leaderboardSquads.classList.add("hidden");
        leaderboardAll.classList.add("hidden");

        lbButtonsArray[0].classList.remove("selected");
        lbButtonsArray[1].classList.add("selected");
        lbButtonsArray[2].classList.remove("selected");
        lbButtonsArray[3].classList.remove("selected");
    } else if (tab === "Squads") {
        leaderboardDiv1.classList.add("hidden");
        leaderboardDiv2.classList.add("hidden");
        leaderboardSquads.classList.remove("hidden");
        leaderboardAll.classList.add("hidden");

        lbButtonsArray[0].classList.remove("selected");
        lbButtonsArray[1].classList.remove("selected");
        lbButtonsArray[2].classList.add("selected");
        lbButtonsArray[3].classList.remove("selected");
    } else {
        leaderboardDiv1.classList.add("hidden");
        leaderboardDiv2.classList.add("hidden");
        leaderboardSquads.classList.add("hidden");
        leaderboardAll.classList.remove("hidden");

        lbButtonsArray[0].classList.remove("selected");
        lbButtonsArray[1].classList.remove("selected");
        lbButtonsArray[2].classList.remove("selected");
        lbButtonsArray[3].classList.add("selected");
    }
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

const lbButtonDiv = document.createElement("div");
lbButtonDiv.className = "tab-div"
lbDiv.appendChild(lbButtonDiv);

for (let i = 0; i < leaderboardTabs.length; i++) {
    const lbButton = document.createElement("button");
    lbButton.className = "leaderboard-tab-button";
    if (i === 0) {
        lbButton.classList.add("selected")
    }
    lbButton.appendChild(document.createTextNode(leaderboardTabs[i]));
    lbButton.addEventListener("click", () => {
        switchTab(leaderboardTabs[i])
    })
    lbButtonsArray.push(lbButton);
    lbButtonDiv.appendChild(lbButton);
}

const leaderboardDiv1 = document.createElement("div");
leaderboardDiv1.className = "leaderboard";
lbDiv.appendChild(leaderboardDiv1);

const leaderboardDiv2 = document.createElement("div");
leaderboardDiv2.className = "leaderboard hidden";
lbDiv.appendChild(leaderboardDiv2);

const leaderboardSquads = document.createElement("div");
leaderboardSquads.className = "leaderboard hidden";
lbDiv.appendChild(leaderboardSquads);

const leaderboardAll = document.createElement("div");
leaderboardAll.className = "leaderboard hidden";
lbDiv.appendChild(leaderboardAll);

let doubleDiv;
for (let i = 1; i <= numberOfTracks; i++) {

    if ((i - 1) % 2 === 0) {
        doubleDiv = document.createElement("div");
        doubleDiv.className = "double-div";
    }

    const trackDiv = document.createElement("div");
    trackDiv.className = "entry-div";

    const track = document.createElement("button");

    trackDiv.appendChild(track);

    track.className = "track";
    if (i > lockedTracks) {
        track.style.backgroundImage = `url("${githubBase}images/WireFrames_MapTile_Locked.jpg")`;
    } else {
        track.addEventListener("click", () => {
            copyFileToClipboard(i);
        });
        track.style.backgroundImage = `url("${githubBase}images/WireFrames_MapTile_${i}.jpg")`;

        const title = document.createElement("p");
        title.textContent = trackData["names"][i-1];
        title.style.position = "absolute";
        title.style.fontSize = "40px";
        title.style.margin = "0";
        title.style.left = "2%";
        title.style.top = "2%";

        trackDiv.appendChild(title);

        const subTitle = document.createElement("p");
        subTitle.textContent = trackData["author"][i-1];
        subTitle.style.position = "absolute";
        subTitle.style.fontSize = "20px";
        subTitle.style.margin = "0";
        subTitle.style.left = "2%";
        subTitle.style.top = "12%";

        trackDiv.appendChild(subTitle);
    }

    doubleDiv.appendChild(trackDiv);

    if (i % 2 === 0 || i === numberOfTracks) {
        tracksDiv.appendChild(doubleDiv);
    }
}

(async () => {
    div1 = await loadVariableFromGitHub("ids/div1.json");
    div2 = await loadVariableFromGitHub("ids/div2.json");
    squads = await loadVariableFromGitHub("ids/teams.json");


    const fullData = calculatePoints(await getFullLeaderboards())

    Object.values(filterPlayers(fullData, div1)).forEach((player, placement) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        name.textContent = `${placement + 1}. ${player.nickname}`;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(player.points * 1000) / 1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboardDiv1.appendChild(entry);
    });

    Object.values(filterPlayers(fullData, div2)).forEach((player, placement) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        name.textContent = `${placement + 1}. ${player.nickname}`;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(player.points * 1000) / 1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboardDiv2.appendChild(entry);
    });

    fullData.forEach((player, placement) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        name.textContent = `${placement + 1}. ${player.nickname}`;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(player.points * 1000) / 1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboardAll.appendChild(entry);
    });


    const teamsWithPoints = Object.values(squads).map(team => {
        const teamPoints = team.members.reduce((sum, userId) => {
            const player = fullData.find(p => p.userId === userId);
            return sum + (player ? player.points : 0);
        }, 0);

        return { team, teamPoints };
    });

    teamsWithPoints.sort((a, b) => b.teamPoints - a.teamPoints);

        teamsWithPoints.forEach(({ team, teamPoints }, index) => {
        const entry = document.createElement("div");
        entry.className = "leaderboard-entry";

        const name = document.createElement("p");
        const teamName = Object.keys(squads).find(k => squads[k] === team);
        name.textContent = `${index + 1}. ${teamName}`;
        name.style.color = team.color;
        name.style.fontSize = "25px";
        name.style.marginLeft = "10px";
        entry.appendChild(name);

        const points = document.createElement("p");
        points.textContent = Math.round(teamPoints * 1000) / 1000;
        points.style.fontSize = "25px";
        points.style.marginLeft = "auto";
        points.style.marginRight = "10px";
        entry.appendChild(points);

        leaderboardSquads.appendChild(entry);
    });

})();
