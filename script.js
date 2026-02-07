const etInput = document.getElementById('my_edit_text');
const btnTraducir = document.getElementById('my_button');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

// Inicialización de Kuroshiro para Furigana dinámico
const kuroshiro = new Kuroshiro();
let kuroshiroListo = false;

// Deshabilitamos el botón mientras carga el diccionario de Furigana
btnTraducir.disabled = true;
btnTraducir.innerText = "Cargando recursos...";

// Promesa de inicialización con la ruta corregida (necesita la barra al final)
const initKuroshiro = kuroshiro.init(new KuroshiroAnalyzerKuromoji({
    dictPath: "https://takuyaa.github.io/kuromoji.js/dict/"
}));

// Timeout de seguridad (10s) por si la red es lenta o falla la carga
const timeoutCarga = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Tiempo de espera agotado")), 10000)
);

Promise.race([initKuroshiro, timeoutCarga])
    .then(() => {
        kuroshiroListo = true;
    })
    .catch((e) => {
        console.warn("Fallo al cargar Furigana, funcionando en modo solo texto:", e);
    })
    .finally(() => {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    });

let historialData = [];

// Función para generar Furigana real usando Kuroshiro
async function aplicarFurigana(texto) {
    if (kuroshiroListo) {
        return await kuroshiro.convert(texto, { to: "hiragana", mode: "furigana" });
    }
    return texto;
}

// Lógica de traducción
btnTraducir.onclick = async () => {
    const textoOriginal = etInput.value.trim();
    if (!textoOriginal) return;

    btnTraducir.disabled = true;
    btnTraducir.innerText = "...";

    try {
        // Usamos un proxy (allorigins) para evitar el error de CORS al llamar a Google Translate
        const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(textoOriginal)}`)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Unimos todos los segmentos traducidos (Google divide por oraciones)
        const textoJapones = data[0].map(segmento => segmento[0]).join('');

        const item = {
            original: textoOriginal,
            japonesHTML: await aplicarFurigana(textoJapones),
            japonesLimpio: textoJapones
        };

        historialData.push(item);
        agregarCard(item);
        etInput.value = "";
    } catch (e) {
        alert("Error al traducir");
    } finally {
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
};

function agregarCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                <p class="tv-original">${item.original}</p>
                                                                                                                                                                                                                                                            <p class="tv-japones">${item.japonesHTML}</p>
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                            <div class="actions">
                                                                                                                                                                                                                                                                                        <button onclick="hablar('${item.japonesLimpio}')">🔊</button>
                                                                                                                                                                                                                                                                                                    <button onclick="copiar('${item.japonesLimpio}')">📋</button>
                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                `;
    rvHistorial.prepend(card);
}

// Funciones de MainActivity.kt adaptadas
function hablar(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'ja-JP';
    synth.speak(utterance); // Implementación de speak
}

function copiar(texto) {
    navigator.clipboard.writeText(texto); // Implementación de copyToClipboard
    alert("Copiado al portapapeles");
}

btnExportar.onclick = () => {
    if (historialData.length === 0) return;
    let csv = "\uFEFFOriginal,Japones\n";
    historialData.forEach(i => csv += `"${i.original}","${i.japonesLimpio}"\n`);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Estudio_Japones.csv"; // Implementación de saveCsv
    link.click();
};
