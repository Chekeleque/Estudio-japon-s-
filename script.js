const etInput = document.getElementById('my_edit_text');
const btnTraducir = document.getElementById('my_button');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

// Inicialización de Kuroshiro para Furigana dinámico
let kuroshiro = null;
let kuroshiroListo = false;
let promesaKuroshiro = null; // Variable para controlar la carga en progreso

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

        // Guardamos la promesa de inicialización
        promesaKuroshiro = kuroshiro.init(analyzer);
        promesaKuroshiro.then(() => {
            kuroshiroListo = true;
            btnTraducir.innerText = "Traducir"; // Restauramos el texto cuando termine
            console.log("Furigana listo");
        }).catch(e => {
            console.error("Error cargando Furigana:", e);
            btnTraducir.innerText = "Traducir (Sin Furigana)";
        });
        
    } catch (e) {
        console.warn("Fallo al cargar Furigana (modo texto):", e);
    } finally {
        // Habilitamos el botón inmediatamente para permitir traducir (aunque sea sin Furigana al principio)
        btnTraducir.disabled = false;
        // Avisamos al usuario si el Furigana aún está cargando en segundo plano
        if (!kuroshiroListo) btnTraducir.innerText = "Traducir (Cargando Furigana...)";
    }
}

initKuroshiro();

let historialData = [];

// Función para generar Furigana real usando Kuroshiro
async function aplicarFurigana(texto) {
    // Si la librería se está cargando, esperamos a que termine en lugar de saltarnos el paso
    if (!kuroshiroListo && promesaKuroshiro) {
        console.log("Esperando a que termine la carga de Furigana...");
        try {
            await promesaKuroshiro;
        } catch (e) {
            console.warn("No se pudo cargar Furigana tras esperar.");
        }
    }

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
    btnTraducir.innerText = "Traduciendo...";

    let textoJapones = "";

    try {
        // ESTRATEGIA ROBUSTA: Intento 1 (MyMemory) -> Fallo -> Intento 2 (Google Proxy)
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoOriginal)}&langpair=es|ja`;
            const response = await fetch(url);
            const data = await response.json();
            if(data.responseStatus !== 200) throw new Error("MyMemory limit/error");
            textoJapones = data.responseData.translatedText;
        } catch (errMyMemory) {
            console.warn("Fallo MyMemory, intentando Google (Proxy)...", errMyMemory);
            
            // Fallback: Google Translate vía AllOrigins (Raw)
            // Usamos 'raw' para obtener el JSON directo sin problemas de parseo
            const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=ja&dt=t&q=${encodeURIComponent(textoOriginal)}`;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;
            
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("Google Proxy falló");
            
            const data = await response.json();
            // Parseamos la respuesta de Google: [[["texto", "original", ...], ...], ...]
            textoJapones = data[0].map(s => s[0]).join('');
        }

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
        // Mantenemos el estado del botón correcto
        btnTraducir.innerText = kuroshiroListo ? "Traducir" : "Traducir (Cargando Furigana...)";
    }
};

function agregarCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    const safeText = item.japonesLimpio.replace(/'/g, "\\'");
    card.innerHTML = `
        <div>
            <p class="tv-original">${item.original}</p>
            <p class="tv-japones">${item.japonesHTML}</p>
        </div>
        <div class="actions">
            <button onclick="hablar('${safeText}')">🔊</button>
            <button onclick="copiar('${safeText}')">📋</button>
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
