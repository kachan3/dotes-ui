let dotesData = [];

fetch("dotes.xml")
    .then(res => res.text())
    .then(str => new DOMParser().parseFromString(str, "text/xml"))
    .then(xml => {
        const dotes = [...xml.getElementsByTagName("Dote")];

        dotesData = dotes.map(d => ({
            nombre: d.getElementsByTagName("Nombre")[0].textContent,
            nivel: parseInt(d.getElementsByTagName("Nivel")[0].textContent),
            requisito: d.getElementsByTagName("Requisito")[0].textContent,
            tipo: d.getElementsByTagName("Tipo")[0].textContent,
            coste: parseInt(d.getElementsByTagName("Coste")[0].textContent),
            senda: d.getElementsByTagName("Senda")[0].textContent,
            descripcion: d.getElementsByTagName("Descripcion")[0].textContent
        }));

        render();
    });

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
            <div class="dote-name"> ${dote.nombre} <div class="stars">${"■".repeat(dote.coste)}</div>
            </div>
        </div>
        <div class="meta">
            Nivel ${dote.nivel} | ${dote.tipo} | Senda: ${dote.senda}<br>
            Requisito: ${dote.requisito}
        </div>
        <div class="description">${dote.descripcion}</div>
    `;

    return card;
}
