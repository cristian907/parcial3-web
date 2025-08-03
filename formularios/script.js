// Listas globales de datos 
// Esto se cambiaría se nos decidimos por el local storage
const personalList = [];
const materialList = [];
const otrosCostosList = [];
const tareasList = [];

// Selecciones temporales para formularios
// También se cambiaría si se coloca localStorage
const materialesSeleccionados = [];
const otrosCostosSeleccionados = [];
const personalSeleccionado = [];

// Clases de modelo
class Personal {
    static ultimoId = 1;
    constructor(nombre, costoPorHora) {
        this.id = Personal.ultimoId++;
        this.nombre = nombre;
        this.costoPorHora = costoPorHora;
    }
}

class Material {
    static ultimoId = 1;
    constructor(nombre, costoPorUnidad) {
        this.id = Material.ultimoId++;
        this.nombre = nombre;
        this.costoPorUnidad = costoPorUnidad;
    }
}

class OtroCosto {
    static ultimoId = 1;
    constructor(nombre, costoPorUnidad) {
        this.id = OtroCosto.ultimoId++;
        this.nombre = nombre;
        this.costoPorUnidad = costoPorUnidad;
    }
}

class Tarea {
    static ultimoId = 1;
    constructor(nombre, tiempoEstimado, personalAsignado, materialUsado, otrosCostosAsociados) {
        this.id = Tarea.ultimoId++;
        this.nombre = nombre;
        this.estado = "Pendiente";
        this.tiempoEstimado = tiempoEstimado;
        this.tiempoReal = null;
        this.personalAsignado = personalAsignado;
        this.materialUsado = materialUsado;
        this.otrosCostosAsociados = otrosCostosAsociados;
        this.costoEstimado = this.calcularCostoEstimado();
        this.costoReal = null;
    }
    
    calcularCostoEstimado() {
        const costoPersonal = this.calcularCostoPersonal();
        const costoMaterial = this.calcularCostoMaterial();
        const costoOtros = this.calcularOtrosCostos();
        this.costoEstimado = costoPersonal + costoMaterial + costoOtros;
        return this.costoEstimado;
    }
    
    calcularCostoPersonal(tiempo = this.tiempoEstimado) {
        let total = 0;
        this.personalAsignado.forEach(idPersona => {
            const persona = personalList.find(p => p.id === idPersona);
            if (persona) total += persona.costoPorHora * tiempo;
        });
        return total;
    }
    
    calcularCostoMaterial() {
        let total = 0;
        this.materialUsado.forEach(mat => {
            const material = materialList.find(m => m.id === mat.idMaterial);
            if (material) total += material.costoPorUnidad * mat.cantidad;
        });
        return total;
    }
    
    calcularOtrosCostos() {
        let total = 0;
        this.otrosCostosAsociados.forEach(oc => {
            const otro = otrosCostosList.find(o => o.id === oc.idCosto);
            if (otro) total += otro.costoPorUnidad * oc.cantidad;
        });
        return total;
    }
    
    terminarTarea({tiempoReal, materialesExtra = [], otrosCostosExtra = []}) {
        this.estado = "Terminada";
        this.tiempoReal = tiempoReal;
        const costoPersonal = this.calcularCostoPersonal(tiempoReal);
        const costoMaterial = this.calcularCostoMaterialReal(materialesExtra);
        const costoOtros = this.calcularOtrosCostosReales(otrosCostosExtra);
        this.costoReal = costoPersonal + costoMaterial + costoOtros;
    }
    
    calcularCostoMaterialReal(materialesExtra = []) {
        let total = this.calcularCostoMaterial();
        materialesExtra.forEach(mat => {
            const material = materialList.find(m => m.id === mat.idMaterial);
            if (material) total += material.costoPorUnidad * mat.cantidad;
        });
        return total;
    }
    
    calcularOtrosCostosReales(otrosCostosExtra = []) {
        let total = this.calcularOtrosCostos();
        otrosCostosExtra.forEach(oc => {
            const otro = otrosCostosList.find(o => o.id === oc.idCosto);
            if (otro) total += otro.costoPorUnidad * oc.cantidad;
        });
        return total;
    }
}

// Funciones utilitarias
function mostrarElementoHTML(id) {
    document.getElementById(id).style.display = 'flex';
}

function ocultarElementoHTML(id) {
    document.getElementById(id).style.display = 'none';
}

// funciones para limpiar formularios
function clearFormPersonal() {
    document.getElementById('personalNombre').value = '';
    document.getElementById('personalCosto').value = '';
}

function clearFormMaterial() {
    document.getElementById('materialNombre').value = '';
    document.getElementById('materialCosto').value = '';
}

function clearFormOtroCosto() {
    document.getElementById('otroNombre').value = '';
    document.getElementById('otroCosto').value = '';
}

function clearFormTarea() {
    clearFormSelection();
    document.getElementById('tareaNombre').value = '';
    document.getElementById('tareaTiempo').value = '';
    document.getElementById('buscar-personal').value = '';
    document.getElementById('buscar-material').value = '';
    document.getElementById('buscar-otro').value = '';
}

function clearFormSelection() {
    personalSeleccionado.length = 0;
    materialesSeleccionados.length = 0;
    otrosCostosSeleccionados.length = 0;
    document.getElementById('personal-seleccionado').innerHTML = '';
    document.getElementById('material-seleccionado').innerHTML = '';
    document.getElementById('otro-seleccionado').innerHTML = '';
}

// Eventos del formulario para nuevo Personal
document.getElementById('btnPersonal').onclick = () => mostrarElementoHTML('formPersonal');
document.getElementById('cancelPersonal').onclick = () => {
    ocultarElementoHTML('formPersonal');
    clearFormPersonal();
};
document.getElementById('submitPersonal').onclick = () => {
    const name = document.getElementById('personalNombre').value;
    const cost = Number(document.getElementById('personalCosto').value);
    personalList.push(new Personal(name, cost));
    ocultarElementoHTML('formPersonal');
    clearFormPersonal();
};

// Eventos del formulario para nuevo Material
document.getElementById('btnMaterial').onclick = () => mostrarElementoHTML('formMaterial');
document.getElementById('cancelMaterial').onclick = () => {
    ocultarElementoHTML('formMaterial');
    clearFormMaterial();
};
document.getElementById('submitMaterial').onclick = () => {
    const nombre = document.getElementById('materialNombre').value;
    const costo = Number(document.getElementById('materialCosto').value);
    materialList.push(new Material(nombre, costo));
    ocultarElementoHTML('formMaterial');
    clearFormMaterial();
};

// Eventos del formulario para nuevo otro costo
document.getElementById('btnOtroCosto').onclick = () => mostrarElementoHTML('formOtroCosto');
document.getElementById('cancelOtro').onclick = () => {  
    ocultarElementoHTML('formOtroCosto');
    clearFormOtroCosto();
};
document.getElementById('submitOtro').onclick = () => {
    const nombre = document.getElementById('otroNombre').value;
    const costo = Number(document.getElementById('otroCosto').value);
    otrosCostosList.push(new OtroCosto(nombre, costo));
    ocultarElementoHTML('formOtroCosto');
    clearFormOtroCosto()
};

// Eventos del formulario para nueva tarea
document.getElementById('btnTarea').onclick = () => mostrarElementoHTML('formTarea');
document.getElementById('cancelTareaBtn').onclick = () => {
    ocultarElementoHTML('formTarea');
    clearFormTarea();
};
document.getElementById('submitTareaBtn').onclick = () => {
    const nombre = document.getElementById('tareaNombre').value;
    const tiempo = Number(document.getElementById('tareaTiempo').value);
    // No se coloca directamente cada arreglo, sino que se crea una copia de cada uno
    const personalAsignado = [...personalSeleccionado]; 
    const materiales = materialesSeleccionados.map(item => ({ idMaterial: item.idMaterial, cantidad: item.cantidad }));
    const otrosCostos = otrosCostosSeleccionados.map(item => ({ idCosto: item.idCosto, cantidad: item.cantidad }));
    tareasList.push(new Tarea(nombre, tiempo, personalAsignado, materiales, otrosCostos));
    ocultarElementoHTML('formTarea');
    clearFormSelection();
    clearFormTarea();
    console.log(tareasList)
};

// Inicializadores de la búsqueda en el formulario para agregar una tarea
// Coloqué inicializadores por si acaso hay que cambiar la lógica para búsqueda
inicializarBuscadorDePersonalEnFormularioTareas();
inicializarBuscadorDeMaterialesEnFormularioTareas();
inicializarBuscadorDeOtrosCostosEnFormularioTareas();

// Busqueda de Personal en formulario Tareas
function inicializarBuscadorDePersonalEnFormularioTareas() {
    document.getElementById('buscar-personal').addEventListener('input', entrada => {
        const termino = entrada.target.value.toLowerCase();
        const resultados = personalList.filter(p => p.nombre.toLowerCase().includes(termino));
        mostrarResultadosPersonas(resultados);
    });
}

function mostrarResultadosPersonas(personas) {
    const elementoResultados = document.getElementById('resultados-personal');
    if (!personas.length || !document.getElementById('buscar-personal').value) {
        elementoResultados.style.display = 'none';
        return;
    }
    elementoResultados.innerHTML = personas.map(
        p => `<div class="persona-resultado" data-id="${p.id}" onclick="seleccionarPersona(${p.id})">${p.nombre} ($${p.costoPorHora}/hora)</div>`).join('');
    elementoResultados.style.display = 'block';
}

function seleccionarPersona(id) {
    if (personalSeleccionado.includes(id)) {
        return;
    }
    personalSeleccionado.push(id);
    actualizarTagsPersonas();
    document.getElementById('buscar-personal').value = '';
    document.getElementById('resultados-personal').style.display = 'none';
}

function actualizarTagsPersonas() {
    const elementoSeleccionados = document.getElementById('personal-seleccionado');
    elementoSeleccionados.innerHTML = personalSeleccionado.map(id => `<div class="tag">${personalList.find(p => p.id === id).nombre}<button onclick="removerPersona(${id})">×</button></div>`).join('');
}

function removerPersona(id) {
    const index = personalSeleccionado.findIndex(idPersona => idPersona === id);
    if (index > -1) {
        personalSeleccionado.splice(index, 1);
    }
    actualizarTagsPersonas();
}

// Busqueda de Materiales en formulario Tareas
function inicializarBuscadorDeMaterialesEnFormularioTareas() {
    document.getElementById('buscar-material').addEventListener('input', entrada => {
        const termino = entrada.target.value.toLowerCase();
        const resultados = materialList.filter(material => material.nombre.toLowerCase().includes(termino));
        mostrarResultadosMateriales(resultados);
    });
}

function mostrarResultadosMateriales(materiales) {
    const elementoResultados = document.getElementById('resultados-material');
    if (!materiales.length || !document.getElementById('buscar-material').value){
        elementoResultados.style.display = 'none';
        return;
    }    
    elementoResultados.innerHTML = materiales.map(m => `<div class="persona-resultado" data-id="${m.id}" onclick="seleccionarMaterial(${m.id})">${m.nombre} ($${m.costoPorUnidad}/unidad)</div>`).join('');
    elementoResultados.style.display = 'block';
}

function seleccionarMaterial(id) {
    if (materialesSeleccionados.some(item => item.idMaterial === id)){
        return;
    } 
    materialesSeleccionados.push({ idMaterial: id, cantidad: 1 });
    actualizarTagsMateriales();
    document.getElementById('buscar-material').value = '';
    document.getElementById('resultados-material').style.display = 'none';
}

function actualizarTagsMateriales() {
    const elementoSeleccionados = document.getElementById('material-seleccionado');
    elementoSeleccionados.innerHTML = materialesSeleccionados.map(item => {
        const m = materialList.find(x => x.id === item.idMaterial);
        return `<div class="selected-item">${m.nombre}<input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidadMaterial(${item.idMaterial}, this.value)"><button onclick="removerMaterial(${item.idMaterial})">×</button></div>`;
    }).join('');
}

function actualizarCantidadMaterial(id, cantidad) {
    const item = materialesSeleccionados.find(material => material.idMaterial === id);
    if (item) {
        item.cantidad = parseInt(cantidad) || 1;
    }
}

function removerMaterial(id) {
    const indice = materialesSeleccionados.findIndex(x => x.idMaterial === id);
    if (indice > -1) {
        materialesSeleccionados.splice(indice, 1);
    }    
    actualizarTagsMateriales();
}

// Busqueda de otros costos en formulario Tareas
function inicializarBuscadorDeOtrosCostosEnFormularioTareas() {
    document.getElementById('buscar-otro').addEventListener('input', entrada => {
        const termino = entrada.target.value.toLowerCase();
        const resultados = otrosCostosList.filter(otro => otro.nombre.toLowerCase().includes(termino));
        mostrarResultadosOtros(resultados);
    });
}

function mostrarResultadosOtros(costos) {
    const elementoResultados = document.getElementById('resultados-otro');
    if (!costos.length || !document.getElementById('buscar-otro').value) {
        elementoResultados.style.display = 'none';
        return;
    }

    elementoResultados.innerHTML = costos.map(o => `<div class="persona-resultado" data-id="${o.id}" onclick="seleccionarOtro(${o.id})">${o.nombre} ($${o.costoPorUnidad}/unidad)</div>`).join('');
    elementoResultados.style.display = 'block';
}

function seleccionarOtro(id) {
    if (otrosCostosSeleccionados.some(x => x.idCosto === id)) {
        return;
    }
    otrosCostosSeleccionados.push({ idCosto: id, cantidad: 1 });
    actualizarTagsOtros();
    document.getElementById('buscar-otro').value = '';
    document.getElementById('resultados-otro').style.display = 'none';
}

function actualizarTagsOtros() {
    const elementoSeleccionados = document.getElementById('otro-seleccionado');
    elementoSeleccionados.innerHTML = otrosCostosSeleccionados.map(item => {
        const o = otrosCostosList.find(x => x.id === item.idCosto);
        return `<div class="selected-item">${o.nombre}<input type="number" value="${item.cantidad}" min="1" onchange="actualizarCantidadOtro(${item.idCosto}, this.value)"><button onclick="removerOtro(${item.idCosto})">×</button></div>`;
    }).join('');
}

function actualizarCantidadOtro(id, cantidad) {
    const item = otrosCostosSeleccionados.find(x => x.idCosto === id);
    if (item) {
        item.cantidad = parseInt(cantidad) || 1;
    }
}

function removerOtro(id) {
    const indice = otrosCostosSeleccionados.findIndex(x => x.idCosto === id);
    if (indice > -1) {
        otrosCostosSeleccionados.splice(indice, 1);
    }
    actualizarTagsOtros();
}
