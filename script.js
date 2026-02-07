const etInput = document.getElementById('my_edit_text');
const btnTraducir = document.getElementById('my_button');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

// Inicialización de Kuroshiro para Furigana dinámico
let kuroshiro = null;
let kuroshiroListo = false;

async function initKuroshiro() {
    btnTraducir.disabled = true;
    btnTraducir.innerText = "Cargando recursos...";

    try {
        // Verificamos que las librerías existan antes de usarlas para evitar crashes
        if (typeof Kuroshiro === 'undefined' || typeof KuroshiroAnalyzerKuromoji === 'undefined') {
            throw new Error("Librerías no cargadas");
        }

        kuroshiro = new Kuroshiro();
        const analyzer = new KuroshiroAnalyzerKuromoji({
            dictPath: "https://takuyaa.github.io/kuromoji.js/dict/"
        });

        // Iniciamos la carga en segundo plano sin bloquear el botón
        kuroshiro.init(analyzer).then(() => {
            kuroshiroListo = true;
            console.log("Furigana cargado correctamente");
        }).catch(e => console.error("Error cargando Furigana:", e));
        
    } catch (e) {
        console.warn("Fallo al cargar Furigana (modo texto):", e);
    } finally {
        // Habilitamos el botón inmediatamente para permitir traducir (aunque sea sin Furigana al principio)
        btnTraducir.disabled = false;
        btnTraducir.innerText = "Traducir";
    }
}

initKuroshiro();

let historialData = [];

// Función para generar Furigana real usando Kuroshiro
async function aplicarFurigana(texto) {
    if (kuroshiroListo && kuroshiro) {
        try {
            return await kuroshiro.convert(texto, { to: "hiragana", mode: "furigana" });
        } catch (e) {
            console.error(e);
        }
    } else {
        console.warn("Furigana no aplicado: La librería aún se está cargando o falló.");
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
        // Cambiamos a api.allorigins.win/get que es más confiable para evitar bloqueos CORS
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=ja&dt=t&q=${encodeURIComponent(textoOriginal)}`;
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(googleUrl)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // allorigins devuelve la respuesta real dentro de la propiedad 'contents' como texto
        const respuestaGoogle = JSON.parse(data.contents);
        
        // Unimos todos los segmentos traducidos (Google divide por oraciones)
        const textoJapones = respuestaGoogle[0].map(segmento => segmento[0]).join('');

        const item = {
            original: textoOriginal,
            japonesHTML: await aplicarFurigana(textoJapones),
            japonesLimpio: textoJapones
        };

        historialData.push(item);
        agregarCard(item);
        etInput.value = "";
    } catch (e) {
        console.error(e);
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
