const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYA4kCfTqPqWpvm3FRr6pMz2Rq1_dZCvxuy0dA7DzyWirG6ono2mDNGHAK7QEc8ZfC83fWNlkJ1eIt/pub?output=csv";

let dotesData = [];

init();

async function init() {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    dotesData = csvToJson(csvText);
    render();
}

function csvToJson(csv) {
    const lines = csv.split("\n").filter(l => l.trim() !== "");
    const headers = lines[0].split(",");

    return lines.slice(1).map(line => {
        const values = line.split(",");

        let obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim();
        });

        return {
            nombre: obj["Nombre"],
            nivel: parseInt(obj["Nivel"]),
            requisito: obj["Requisito"],
            tipo: obj["Tipo"],
            coste: parseInt(obj["Coste"]),
            senda: obj["Senda"],
            descripcion: obj["Descripcion"]
        };
    });
}

document.getElementById("searchName").addEventListener("input", render);
document.getElementById("searchSenda").addEventListener("input", render);

function render() {
    const container = document.getElementById("kanban");
    container.innerHTML = "";

    const nameFilter = searchName.value.trim().toLowerCase();
    const sendaFilter = searchSenda.value.trim().toLowerCase();

    const filtered = dotesData
        .filter(d => {
            const matchName =
                nameFilter === "" ||
                d.nombre.toLowerCase().startsWith(nameFilter);

            const matchSenda =
                sendaFilter === "" ||
                d.senda.toLowerCase().startsWith(sendaFilter);

            return matchName && matchSenda;
        })
        .sort((a, b) => a.nivel - b.nivel);

    let currentLevel = null;

    filtered.forEach(dote => {
        if (dote.nivel !== currentLevel) {
            currentLevel = dote.nivel;

            const sep = document.createElement("div");
            sep.className = "level-separator";
            sep.textContent = `Nivel ${currentLevel}`;
            container.appendChild(sep);
        }

        container.appendChild(createCard(dote));
    });
}

function createCard(dote) {
    const card = document.createElement("div");
    card.className = "dote-card";

    card.innerHTML = `
        <div class="dote-header">
            <div class="dote-name">${dote.nombre}</div>
            <div class="stars">${"★".repeat(dote.coste)}</div>
        </div>
        <div class="meta">
            Nivel ${dote.nivel} | ${dote.tipo} | Senda: ${dote.senda}<br>
            Requisito: ${dote.requisito}
        </div>
        <div class="description">${dote.descripcion}</div>
    `;

    return card;
}
