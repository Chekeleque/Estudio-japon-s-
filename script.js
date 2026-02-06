const etInput = document.getElementById('etInput');
const btnTraducir = document.getElementById('btnTraducir');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

let historialData = [];

// Función para traducir (Google Translate API Free)
btnTraducir.onclick = async () => {
    const texto = etInput.value.trim();
    if (!texto) return;

    btnTraducir.disabled = true;
    btnTraducir.innerText = "...";

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(texto)}`;
        const response = await fetch(url);
        const data = await response.json();
        const traducido = data[0][0][0];

        const item = { original: texto, japones: traducido };
        historialData.push(item);

        // Recrea el comportamiento de submitList del Adapter
        renderizarCard(item);
        etInput.value = "";
    } catch (e) {
        alert("Error al traducir");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

// Reemplaza el TraduccionAdapter
function renderizarCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                                                                                                                                                            <div>
                                                                                                                                                                        <p class="tv-original">${item.original}</p>
                                                                                                                                                                                    <p class="tv-japones">${item.japones}</p>
                                                                                                                                                                                            </div>
                                                                                                                                                                                                    <div class="actions">
                                                                                                                                                                                                                <button onclick="speak('${item.japones}')">🔊</button>
                                                                                                                                                                                                                            <button onclick="copyToClipboard('${item.japones}')">📋</button>
                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                        `;
    rvHistorial.prepend(card);
}

// Equivalente a fun speak(text: String)
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    synth.speak(utterance);
}

// Equivalente a fun copyToClipboard(text: String)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
}

// Equivalente a fun saveCsv(uri: android.net.Uri)
btnExportar.onclick = () => {
    if (historialData.length === 0) return;
    let csv = "\uFEFFOriginal,Japones\n";
    historialData.forEach(i => csv += `"${i.original}","${i.japones}"\n`);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Estudio_Japones.csv";
    link.click();
};
