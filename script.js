const etInput = document.getElementById('my_edit_text');
const btnTraducir = document.getElementById('my_button');
const btnExportar = document.getElementById('btnExportar');
const rvHistorial = document.getElementById('rvHistorial');
const synth = window.speechSynthesis;

let historialData = [];

// Función para simular el "textoJaponesRuby" del ViewModel
function aplicarFurigana(texto) {
    const diccionario = {
        "来る": "<ruby>来<rt>く</rt></ruby>る",
        "指示": "<ruby>指<rt>し</rt>示<rt>じ</rt></ruby>",
        "今": "<ruby>今<rt>いま</rt></ruby>",
        "食べる": "<ruby>食<rt>た</rt></ruby>べる"
    };
    return diccionario[texto] || texto;
}

// Lógica de traducción
btnTraducir.onclick = async () => {
    const textoOriginal = etInput.value.trim();
    if (!textoOriginal) return;

    btnTraducir.disabled = true;
    btnTraducir.innerText = "...";

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(textoOriginal)}`;
        const response = await fetch(url);
        const data = await response.json();
        const textoJapones = data[0][0][0];

        const item = {
            original: textoOriginal,
            japonesHTML: aplicarFurigana(textoJapones),
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
