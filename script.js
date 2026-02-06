const input = document.getElementById('my_edit_text');
const btnTraducir = document.getElementById('my_button');
const btnExportar = document.getElementById('btnExportar');
const historial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

let datosHistorial = []; // Equivalente al ViewModel

// TRADUCIR (MainActivity.kt -> btnTraducir)
btnTraducir.onclick = async () => {
    const texto = input.value.trim();
    if (!texto) return;

    btnTraducir.disabled = true;
    btnTraducir.innerText = "...";

    try {
        // API Gratuita de Google
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(texto)}`;
        const response = await fetch(url);
        const data = await response.json();
        const traducido = data[0][0][0];

        const item = { original: texto, japones: traducido };
        datosHistorial.push(item);
        renderizarCard(item);

        input.value = "";
    } catch (e) {
        alert("Error de conexión");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

// RENDERIZAR (TraduccionAdapter equivalente)
function renderizarCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                                                                                                                                                            <div>
                                                                                                                                                                        <p class="tv-original">${item.original}</p>
                                                                                                                                                                                    <p class="tv-japones">${item.japones}</p>
                                                                                                                                                                                            </div>
                                                                                                                                                                                                    <div class="actions">
                                                                                                                                                                                                                <button onclick="hablar('${item.japones}')">🔊</button>
                                                                                                                                                                                                                            <button onclick="copiar('${item.japones}')">📋</button>
                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                        `;
    historial.prepend(card);
}

// VOZ (fun speak en Kotlin)
function hablar(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'ja-JP';
    synth.speak(utterance);
}

// COPIAR (copyToClipboard en Kotlin)
function copiar(texto) {
    navigator.clipboard.writeText(texto);
    alert("Copiado");
}

// EXPORTAR (saveCsv en Kotlin)
btnExportar.onclick = () => {
    if (datosHistorial.length === 0) return;
    let csv = "\uFEFFOriginal,Japones\n";
    datosHistorial.forEach(i => csv += `"${i.original}","${i.japones}"\n`);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Estudio_Japones.csv";
    link.click();
};
