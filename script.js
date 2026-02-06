// REFERENCIAS A LA INTERFAZ
const etInput = document.getElementById('etInput');
const btnTraducir = document.getElementById('btnTraducir');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

let historialData = [];

// FUNCIÓN PRINCIPAL DE TRADUCCIÓN (Google Translate Free)
btnTraducir.onclick = async () => {
    const textoOriginal = etInput.value.trim();

    if (!textoOriginal) {
        alert("Por favor, escribe algo.");
        return;
    }

    btnTraducir.disabled = true;
    btnTraducir.innerText = "Traduciendo...";

    try {
        // Usamos el endpoint gratuito de Google Translate
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(textoOriginal)}`;

        const response = await fetch(url);
        const data = await response.json();

        // El formato de Google es un array complejo, el texto traducido está en data[0][0][0]
        const textoJapones = data[0][0][0];

        const nuevoItem = {
            id: Date.now(),
            original: textoOriginal,
            japones: textoJapones
        };

        historialData.push(nuevoItem);
        renderizarCard(nuevoItem);

        etInput.value = "";
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servicio de traducción.");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

// FUNCIÓN PARA RENDERIZAR
function renderizarCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                                                                                                                                                                                                                                                                <div class="texto-container">
                                                                                                                                                                                                                                                                            <p class="tv-original">${item.original}</p>
                                                                                                                                                                                                                                                                                        <p class="tv-japones">${item.japones}</p>
                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                        <div class="actions">
                                                                                                                                                                                                                                                                                                                    <button title="Escuchar" onclick="reproducirVoz('${item.japones}')">🔊</button>
                                                                                                                                                                                                                                                                                                                                <button title="Copiar" onclick="copiarTexto('${item.japones}')">📋</button>
                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                            `;
    rvHistorial.prepend(card);
}

// VOZ (Text To Speech)
function reproducirVoz(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'ja-JP';
    synth.speak(utterance);
}

// COPIAR
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        alert("Texto copiado");
    });
}

// EXPORTAR A CSV
btnExportar.onclick = () => {
    if (historialData.length === 0) return alert("No hay datos para exportar.");

    let csvContent = "\uFEFFOriginal,Japones\n";
    historialData.forEach(item => {
        csvContent += `"${item.original}","${item.japones}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Estudio_Japones.csv");
    link.click();
};
