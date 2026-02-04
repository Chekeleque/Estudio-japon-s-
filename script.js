// CONFIGURACIÓN
const DEEPL_API_KEY = 'TU_API_KEY_AQUÍ'; // Pon tu clave aquí
const synth = window.speechSynthesis;

// REFERENCIAS
const input = document.getElementById('etInput');
const btnTraducir = document.getElementById('btnTraducir');
const btnExportar = document.getElementById('btnExportar');
const historialContainer = document.getElementById('rvHistorial');

let historialData = []; // Simula el ViewModel

// FUNCIÓN TRADUCIR (Equivalente a viewModel.traducir)
btnTraducir.onclick = async () => {
    const texto = input.value.trim();
    if (!texto) return;

    btnTraducir.disabled = true;
    btnTraducir.innerText = "Cargando...";

    try {
        const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `auth_key=${DEEPL_API_KEY}&text=${encodeURIComponent(texto)}&target_lang=JA`
        });

        const data = await response.json();
        const textoJapones = data.translations[0].text;

        const nuevoItem = { original: texto, japones: textoJapones };
        historialData.push(nuevoItem);

        agregarCardAlUI(nuevoItem);
        input.value = "";
    } catch (e) {
        alert("Error al conectar con DeepL");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

// RENDERIZAR ITEM (Equivalente a TraduccionAdapter)
function agregarCardAlUI(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                                                                                                                                                                                        <div>
                                                                                                                                                                                                    <div class="tv-original">${item.original}</div>
                                                                                                                                                                                                                <div class="tv-japones">${item.japones}</div>
                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                <div class="actions">
                                                                                                                                                                                                                                            <button onclick="hablar('${item.japones}')">🔊</button>
                                                                                                                                                                                                                                                        <button onclick="copiar('${item.japones}')">📋</button>
                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                    `;
    historialContainer.prepend(card);
}

// VOZ (Equivalente a fun speak)
function hablar(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'ja-JP';
    synth.speak(utterance);
}

// COPIAR (Equivalente a copyToClipboard)
function copiar(texto) {
    navigator.clipboard.writeText(texto);
    alert("Copiado al portapapeles");
}

// EXPORTAR (Equivalente a saveCsv)
btnExportar.onclick = () => {
    if (historialData.length === 0) return alert("Historial vacío");

    let csv = "Original,Japones\n";
    historialData.forEach(i => csv += `"${i.original}","${i.japones}"\n`);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Estudio_Japones.csv';
    a.click();
};
