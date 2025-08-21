let workbookGlobal = null;
let preguntas = [];
let preguntaActual = null;
let respuestaElegida = null;
let respuestasCorrectas = 0;
let respuestasIncorrectas=0;
let temporizadorID = null;
let cont=0;

function leerArchivo(event) {
  const archivo = event.target.files[0];
  const lector = new FileReader();

  lector.onload = function(e) {
    const datos = new Uint8Array(e.target.result);
    const workbook = XLSX.read(datos, { type: 'array' });
    workbookGlobal = workbook;

    const selector = document.getElementById('selectorHoja');
    selector.innerHTML = "";
    workbook.SheetNames.forEach(nombre => {
      const opcion = document.createElement('option');
      opcion.value = nombre;
      opcion.textContent = nombre;
      selector.appendChild(opcion);
    });
    selector.style.display = "inline-block";
  };

  lector.readAsArrayBuffer(archivo);
}

function cargarHoja() {
  const hojaSeleccionada = document.getElementById('selectorHoja').value;
  const hoja = workbookGlobal.Sheets[hojaSeleccionada];
  preguntas = XLSX.utils.sheet_to_json(hoja);
  document.getElementById('contador').textContent = `👍Respuestas correctas: ${respuestasCorrectas}`;
  document.getElementById('contador2').textContent = `👍Respuestas Incorrectas: ${respuestasIncorrectas}`;
  nuevaPregunta();
}

function nuevaPregunta() {
  if (preguntas.length === 0) return;

  const indice = Math.floor(Math.random() * preguntas.length);
  preguntaActual = preguntas[indice];
  respuestaElegida = null;
    cont++;
  document.getElementById('pregunta').textContent =` ${cont}` + preguntaActual.Pregunta;
  document.getElementById('btnA').textContent = `A: ${preguntaActual.OpcionA}`;
  document.getElementById('btnB').textContent = `B: ${preguntaActual.OpcionB}`;
  document.getElementById('btnC').textContent = `C: ${preguntaActual.OpcionC}`;

  ['A','B','C'].forEach(letra => {
    const btn = document.getElementById('btn' + letra);
    btn.classList.remove('correcta', 'incorrecta', 'seleccionada');
    btn.disabled = false;
  });

  document.getElementById('resultado').textContent = "";
  document.getElementById('temporizador').textContent = "⏳ 20s";

  iniciarTemporizador(20);
}

function seleccionar(opcion) {
  respuestaElegida = opcion;

  ['A','B','C'].forEach(letra => {
    const btn = document.getElementById('btn' + letra);
    btn.disabled = true;
    btn.classList.remove('correcta', 'incorrecta', 'seleccionada');
  });

  document.getElementById('btn' + opcion).classList.add('seleccionada');
  document.getElementById('resultado').textContent = "⏳ Esperando evaluación...";
}

function iniciarTemporizador(segundos) {
  let tiempo = segundos;
  const temporizador = document.getElementById('temporizador');
  temporizador.textContent = `⏳ ${tiempo}s`;

  clearInterval(temporizadorID);
  temporizadorID = setInterval(() => {
    tiempo--;
    temporizador.textContent = `⏳ ${tiempo}s`;
    if (tiempo <= 0) {
      clearInterval(temporizadorID);
      evaluar();
    }
  }, 1000);
}

function evaluar() {
  const correcta = preguntaActual.Correcta.trim().toUpperCase();
  const resultado = document.getElementById('resultado');

  if (respuestaElegida === null) {
    resultado.textContent = "⏰ No se seleccionó ninguna opción.";
    respuestasIncorrectas++;
  } else if (respuestaElegida === correcta) {
    resultado.textContent = "✅ ¡Respuesta correcta!";
    document.getElementById('btn' + respuestaElegida).classList.remove('seleccionada');
    document.getElementById('btn' + respuestaElegida).classList.add('correcta');
    respuestasCorrectas++;
  } else {
    respuestasIncorrectas++;
    resultado.textContent = `❌ Incorrecto. La correcta era: ${correcta}`;
    document.getElementById('btn' + respuestaElegida).classList.remove('seleccionada');
    document.getElementById('btn' + respuestaElegida).classList.add('incorrecta');
    document.getElementById('btn' + correcta).classList.add('correcta');
  }

  document.getElementById('contador').textContent = `👍Respuestas correctas: ${respuestasCorrectas}`;
  document.getElementById('contador2').textContent = `👍Respuestas Incorrectas: ${respuestasIncorrectas}`;
}