// CONFIGURACIÓN - IMPORTANTE: Reemplaza con tu clave real
const DEEPL_API_KEY = 'TU_API_KEY_AQUI';
const synth = window.speechSynthesis;

// REFERENCIAS A LA INTERFAZ
const etInput = document.getElementById('etInput');
const btnTraducir = document.getElementById('btnTraducir');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');

let historialData = []; // Nuestra "Base de datos" temporal

// FUNCIÓN PRINCIPAL DE TRADUCCIÓN
btnTraducir.onclick = async () => {
    const textoOriginal = etInput.value.trim();

    if (!textoOriginal) {
        alert("Por favor, escribe algo.");
        return;
    }

    // Estado de carga (Equivalente a mostrar un ProgressBar en Android)
    btnTraducir.disabled = true;
    btnTraducir.innerText = "Traduciendo...";

    try {
        const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `auth_key=${DEEPL_API_KEY}&text=${encodeURIComponent(textoOriginal)}&target_lang=JA`
        });

        const data = await response.json();
        const textoJapones = data.translations[0].text;

        const nuevoItem = {
            id: Date.now(),
            original: textoOriginal,
            japones: textoJapones
        };

        historialData.push(nuevoItem);
        renderizarCard(nuevoItem);

        etInput.value = ""; // Limpiar el input
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con la API de DeepL.");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

// FUNCIÓN PARA RENDERIZAR (Equivalente al Adapter de Android)
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
    // Insertamos al principio de la lista (como un RecyclerView con LayoutManager invertido)
    rvHistorial.prepend(card);
}

// TEXT TO SPEECH (Equivalente a TextToSpeech.OnInitListener)
function reproducirVoz(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'ja-JP';
    synth.speak(utterance);
}

// COPIAR AL PORTAPAPELES (Equivalente a ClipboardManager)
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        alert("Texto copiado");
    });
}

// EXPORTAR A CSV (Equivalente a tu función saveCsv)
btnExportar.onclick = () => {
    if (historialData.length === 0) return alert("No hay datos para exportar.");

    let csvContent = "\uFEFFOriginal,Japones\n"; // \uFEFF ayuda con los caracteres japoneses en Excel
    historialData.forEach(item => {
        csvContent += `"${item.original}","${item.japones}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Estudio_Japones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
