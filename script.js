//const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYA4kCfTqPqWpvm3FRr6pMz2Rq1_dZCvxuy0dA7DzyWirG6ono2mDNGHAK7QEc8ZfC83fWNlkJ1eIt/pub?output=csv&gid=1252344065";
//const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYA4kCfTqPqWpvm3FRr6pMz2Rq1_dZCvxuy0dA7DzyWirG6ono2mDNGHAK7QEc8ZfC83fWNlkJ1eIt/export?format=csv&edit?gid=1252344065#gid=1252344065";
//const SHEET_URL = "https://docs.google.com/spreadsheets/d//pub?output=csv&sheet=Linaje";
const SPREADSHEET_ID = "2PACX-1vRYA4kCfTqPqWpvm3FRr6pMz2Rq1_dZCvxuy0dA7DzyWirG6ono2mDNGHAK7QEc8ZfC83fWNlkJ1eIt";

const SHEETS = {
    sendas: 0,
    linaje: 1252344065,
    talentos: 818595627,
    especiales: 1088837536
};

let dotesData = [];
let currentSheet = "sendas";

init();

async function init() {
    //await loadSheet(currentSheet);
    await loadAllSheets();

    setupSheetSelector();
}
/*
async function loadSheet(sheetKey) {
    const gid = SHEETS[sheetKey];

    const url = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?output=csv&gid=${gid}`;

    const response = await fetch(url);
    const csvText = await response.text();

    dotesData = csvToJson(csvText);
    render();
} */

async function loadAllSheets() {
    dotesData = [];

    for (const key in SHEETS) {
        const gid = SHEETS[key];
         const url = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?output=csv&gid=${gid}`;
        //const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;

        const response = await fetch(url);
        const csvText = await response.text();
        const data = csvToJson(csvText);

        dotesData = dotesData.concat(data);
    }

    render();
}


function setupSheetSelector() {
    const selector = document.getElementById("sheetSelector");

    if (!selector) return;

    selector.addEventListener("change", async (e) => {
        currentSheet = e.target.value;
        await loadSheet(currentSheet);
    });
}

function csvToJson(csv) {
    const lines = csv.split("\n").filter(l => l.trim() !== "");init

    return lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());

        return {
            nivel: values[0],
            nombre: values[1],
            descripcion: values[2],
            coste: values[3],
            requisito: values[4],
            etiquetas: values.slice(5).filter(v => v !== "")
        };
    });
}

document.getElementById("searchName").addEventListener("input", render);
document.getElementById("searchName").addEventListener("input", render);
document.getElementById("searchTags").addEventListener("input", render);

function render() {
    const container = document.getElementById("kanban");
    container.innerHTML = "";

    const nameFilter = document.getElementById("searchName").value.trim().toLowerCase();
    const tagFilterRaw = document.getElementById("searchTags").value.trim().toLowerCase();

    // Convertimos las etiquetas escritas en array
    const tagFilters = tagFilterRaw === ""
        ? []
        : tagFilterRaw.split(",").map(t => t.trim()).filter(t => t !== "");

    const filtered = dotesData
        .filter(d => {

            // FILTRO POR NOMBRE
            const matchesName =
                nameFilter === "" ||
                d.nombre.toLowerCase().startsWith(nameFilter);

            // FILTRO POR ETIQUETAS
            const matchesTags =
                tagFilters.length === 0 ||
                tagFilters.every(filterTag =>
                    d.etiquetas.some(tag =>
                        tag.toLowerCase().includes(filterTag)
                    )
                );

            return matchesName && matchesTags;
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

    const costeVisual = renderCoste(dote.coste);
    const etiquetasHTML = renderEtiquetas(dote.etiquetas);

    card.innerHTML = `
        <div class="dote-header">
            <div class="dote-name">${dote.nombre}</div>
            <div class="coste">${costeVisual}</div>
        </div>
        <div class="meta">
            Nivel ${dote.nivel}<br>
            Requisito: ${dote.requisito || "Ninguno"}
        </div>
        <div class="description">${dote.descripcion}</div>
        <div class="etiquetas">${etiquetasHTML}</div>
    `;

    return card;
}

function renderCoste(coste) {
    if (!coste) return "";

    const lower = coste.toLowerCase();

    if (!isNaN(coste)) {
        return "■ ".repeat(parseInt(coste));
    }

    if (lower === "reaccion")
        return `<span class="badge reaccion">Reacción</span>`;

    if (lower === "intervencion")
        return `<span class="badge intervencion">Intervención</span>`;

    return "";
}

function renderEtiquetas(etiquetas) {
    if (!etiquetas || etiquetas.length === 0) return "";

    return etiquetas
        .map(tag => `<span class="tag">${tag}</span>`)
        .join("");
}
