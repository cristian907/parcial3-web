// Data arrays
const empleados = [];
const materiales = [];
const otrosCostos = [];
const tareas = [];

// Classes
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

        this.costoPersonal = this.calcularCostoPersonal();
        this.costoMateriales = this.calcularCostoMaterial();
        this.costoOtros = this.calcularOtrosCostos();
        this.costoEstimado = this.costoPersonal + this.costoMateriales + this.costoOtros;

        this.costoPersonalReal = null;
        this.costoMaterialesReal = null;
        this.costoOtrosReal = null;
        this.costoReal = null;
    }
    
    calcularCostoEstimado() {
        const costoPersonal = this.calcularCostoPersonal();
        const costoMateriales = this.calcularCostoMaterial();
        const costoOtros = this.calcularOtrosCostos();
        return costoPersonal + costoMateriales + costoOtros;
    }

    calcularCostoPersonal(tiempo = this.tiempoEstimado) {
        let total = 0;
        this.personalAsignado.forEach(idPersona => {
            const persona = empleados.find(p => p.id === idPersona);
            if (persona) total += persona.costoPorHora * tiempo;
        });
        return total;
    }
    
    calcularCostoMaterial() {
        let total = 0;
        this.materialUsado.forEach(mat => {
            const material = materiales.find(m => m.id === mat.idMaterial);
            if (material) total += material.costoPorUnidad * mat.cantidad;
        });
        return total;
    }
    
    calcularOtrosCostos() {
        let total = 0;
        this.otrosCostosAsociados.forEach(oc => {
            const otro = otrosCostos.find(o => o.id === oc.idCosto);
            if (otro) total += otro.costoPorUnidad * oc.cantidad;
        });
        return total;
    }
    
    terminarTarea(tiempoReal) {
        this.estado = "Terminada";
        this.tiempoReal = tiempoReal;
        // Calcular real desglosado
        const costoPersonal = this.calcularCostoPersonal(tiempoReal);
        const costoMaterial = this.calcularCostoMaterial();
        const costoOtros = this.calcularOtrosCostos();
        this.costoPersonalReal = costoPersonal;
        this.costoMaterialesReal = costoMaterial;
        this.costoOtrosReal = costoOtros;
        this.costoReal = costoPersonal + costoMaterial + costoOtros;
    }
}

class Buscador {
    constructor(config) {
        this.inputId = config.inputId;
        this.resultadosId = config.resultadosId;
        this.seleccionadosId = config.seleccionadosId;
        this.listaGlobal = config.lista;
        this.listaSeleccionados = config.seleccionados;
        this.generarHtmlResultado = config.generarHtmlResultado;
        this.generarHtmlTag = config.generarHtmlTag;
        this.validarSeleccion = config.validarSeleccion;
        this.accionSeleccion = config.accionSeleccion;
        this.inicializar();
    }
    inicializar() {
        const input = document.getElementById(this.inputId);
        const elementoSeleccionados = document.getElementById(this.seleccionadosId);
        input.addEventListener('input', (entrada) => {
            this.buscar(entrada.target.value);
        });
        elementoSeleccionados.addEventListener('click', (evento) => {
            if (evento.target.tagName === 'BUTTON') {
                const id = parseInt(evento.target.dataset.id);
                this.remover(id);
            }
        });
        elementoSeleccionados.addEventListener('change', (entrada) => {
            if (entrada.target.tagName === 'INPUT' && entrada.target.type === 'number') {
                const id = parseInt(entrada.target.dataset.id);
                const valor = parseInt(entrada.target.value);
                this.actualizarCantidad(id, valor);
            }
        });
    }
    buscar(termino) {
        termino = termino.toLowerCase();
        const resultados = this.listaGlobal.filter(item =>
            item.nombre.toLowerCase().includes(termino)
        );
        this.mostrarResultados(resultados);
    }
    mostrarResultados(resultados) {
        const contenedor = document.getElementById(this.resultadosId);
        if (!resultados.length || !document.getElementById(this.inputId).value) {
            contenedor.style.display = 'none';
            return;
        }
        contenedor.innerHTML = resultados.map(item => this.generarHtmlResultado(item)).join('');
        contenedor.style.display = 'block';
        contenedor.querySelectorAll('.search-results').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.seleccionar(id);
            });
        });
    }
    seleccionar(id) {
        if (this.validarSeleccion(id)) {
            return;
        }
        this.accionSeleccion(id);
        this.actualizarTags();
        document.getElementById(this.inputId).value = '';
        document.getElementById(this.resultadosId).style.display = 'none';

        const contenedorSeleccionados = document.getElementById(this.seleccionadosId);
        contenedorSeleccionados.innerHTML = this.listaSeleccionados.map(item => this.generarHtmlTag(item)).join('');
    }
    remover(id) {
        const index = this.listaSeleccionados.findIndex(item =>
            item === id ||
            (item.id === id) ||
            (item.idMaterial === id) ||
            (item.idCosto === id)
        );
        if (index > -1) {
            this.listaSeleccionados.splice(index, 1);
        }
        this.actualizarTags();
    }
    actualizarCantidad(id, cantidad) {
        const item = this.listaSeleccionados.find(i =>
            i.idMaterial === id || i.idCosto === id
        );
        if (item) {
            item.cantidad = cantidad;
        }
    }
    actualizarTags() {
        const contenedor = document.getElementById(this.seleccionadosId);
        contenedor.innerHTML = this.listaSeleccionados.map(item =>
            this.generarHtmlTag(item)
        ).join('');
    }
}

function clearFormTarea() {
    const nombreInput = document.getElementById('tareaNombre');
    const tiempoInput = document.getElementById('tareaTiempo');
    if (nombreInput) nombreInput.value = '';
    if (tiempoInput) tiempoInput.value = '';
    personalSeleccionado.length = 0;
    materialesSeleccionados.length = 0;
    otrosCostosSeleccionados.length = 0;
    const persSel = document.getElementById('personal-seleccionado');
    if (persSel) persSel.innerHTML = '';
    const matSel = document.getElementById('material-seleccionado');
    if (matSel) matSel.innerHTML = '';
    const otroSel = document.getElementById('otro-seleccionado');
    if (otroSel) otroSel.innerHTML = '';
}

function clearFormSelection() {
    personalSeleccionado.length = 0;
    materialesSeleccionados.length = 0;
    otrosCostosSeleccionados.length = 0;
}

function mostrarElementoHTML(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function ocultarElementoHTML(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
    }
}

function genId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}


// variables encargadas de las vistas
let vistaActual = "dashboard";
let configTab = "empleados"

// Render principal
function render() {
    const dashboardBtn = document.getElementById('dashboardBtn');
    const tasksBtn = document.getElementById('tasksBtn');
    const configBtn = document.getElementById('configBtn');

    if (dashboardBtn) {
        if (vistaActual === 'dashboard') {
            dashboardBtn.classList.add('active');
        } else {
            dashboardBtn.classList.remove('active');
        }
    }

    if (tasksBtn) {
        if (vistaActual === 'tasks') {
            tasksBtn.classList.add('active');
        } else {
            tasksBtn.classList.remove('active');
        }
    }

    if (configBtn) {
        if (vistaActual === 'config') {
            configBtn.classList.add('active');
        } else {
            configBtn.classList.remove('active');
        }
    }

   // Renderizar la vista correspondiente
    if (vistaActual === 'dashboard') {
        renderDashboard();
    } else if (vistaActual === 'tasks') {
        renderTareas();
    } else {
        renderConfiguracion();
    }
}

// Dashboard
function renderDashboard() {
    // Renderizar el dashboard de hola.html dentro de #mainView
    // Calcular totales dinámicamente
    const totalEstimado = tareas.reduce((acumulado, tarea) => acumulado + (tarea.costoEstimado), 0);
    const totalReal = tareas.filter(tarea => tarea.estado === "Terminada").reduce((acumulado, tarea) => acumulado + (tarea.costoReal), 0);
    // Calcular personal sobreutilizado (>8h)
    let sobreutilizados = empleados.reduce((list, empleado) => {
        const horas = tareas.reduce((sum, tarea) =>
            tarea.estado === "Pendiente" && tarea.personalAsignado.includes(empleado.id) ? sum + tarea.tiempoEstimado : sum
        , 0);
        if (horas > 8) list.push({ nombre: empleado.nombre, horas });
        return list;
    }, []);
    let sobreutilizadosHtml = sobreutilizados.length
        ? sobreutilizados.map(empleado => `${empleado.nombre} - ${empleado.horas} horas`).join('<br>')
        : 'Ninguno';
    // Calcular tareas pendientes y completadas
    const tareasPendientes = tareas.filter(tarea => tarea.estado === "Pendiente").length;
    const tareasCompletadas = tareas.filter(tarea => tarea.estado === "Terminada").length;
    // Calcular progreso (porcentaje de tareas completadas)
    const progreso = tareas.length > 0 ? (tareasCompletadas / tareas.length * 100) : 0;
    // Calcular ángulo para el círculo de progreso
    const deg = Math.round(progreso * 3.6); // 100% = 360deg
    const progressCircleStyle = `background: conic-gradient(#facc15 ${deg}deg, #334155 ${deg}deg 360deg);`;
    // Calcular totales dinámicos para flip-back de cada card
    const completadas = tareas.filter(t => t.estado === "Terminada");
    // Tareas
    const totalEstimadoTareas = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoEstimado), 0);
    const totalRealTareas = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoReal), 0);
    // Personal
    const totalEstimadoPersonal = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoPersonal), 0);
    const totalRealPersonal = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoPersonalReal), 0);
    // Materiales
    const totalEstimadoMateriales = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoMateriales||0), 0);
    const totalRealMateriales = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoMaterialesReal||0), 0);
    // Otros
    const totalEstimadoOtros = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoOtros||0), 0);
    const totalRealOtros = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoOtrosReal||0), 0);

    // Mensaje si no hay tareas completadas
    const noCompletadasMsg = '<div style="color:#888;text-align:center;padding:18px 0 8px 0;">Aún no se ha completado ninguna tarea</div>';

    document.getElementById('mainView').innerHTML = `
    <div class="dashboard">
        <div class="card">
            <h3>Costo Total Estimado</h3>
            <p>$${totalEstimado.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
        </div>
        <div class="card">
            <h3>Costo Real Actual</h3>
            <p>$${totalReal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
        </div>
        <div class="card" style="grid-column: span 2;">
            <h3>Progreso</h3>
            <div class="progress-circle" style="${progressCircleStyle}">${progreso.toFixed(0)}%</div>
            <p>${tareasPendientes} Tareas Pendientes</p>
            <p>${tareasCompletadas} Tareas Completadas</p>
        </div>
        <!-- Flip Cards -->
        <div class="flip-container">
            <div class="flip-inner">
                <div class="flip-front card">
                    <h3>Costos de Tareas</h3>
                    <canvas id="chartTareas"></canvas>
                    <div class="chart-label">Estimado / Real</div>
                </div>
                <div class="flip-back">
                    <h3>Costos de Tareas</h3>
                    ${completadas.length === 0 ? noCompletadasMsg : `
                    <p>Costo Estimado: $${totalEstimadoTareas.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    <p>Costo Real: $${totalRealTareas.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    `}
                </div>
            </div>
        </div>
        <div class="flip-container">
            <div class="flip-inner">
                <div class="flip-front card">
                    <h3>Costo de Personal</h3>
                    <canvas id="chartPersonal"></canvas>
                    <div class="chart-label">Estimado / Real</div>
                </div>
                <div class="flip-back">
                    <h3>Costo de Personal</h3>
                    ${completadas.length === 0 ? noCompletadasMsg : `
                    <p>Costo Estimado: $${totalEstimadoPersonal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    <p>Costo Real: $${totalRealPersonal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    `}
                </div>
            </div>
        </div>
        <div class="flip-container">
            <div class="flip-inner">
                <div class="flip-front card">
                    <h3>Costo de Materiales</h3>
                    <canvas id="chartMateriales"></canvas>
                    <div class="chart-label">Estimado / Real</div>
                </div>
                <div class="flip-back">
                    <h3>Costo de Materiales</h3>
                    ${completadas.length === 0 ? noCompletadasMsg : `
                    <p>Costo Estimado: $${totalEstimadoMateriales.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    <p>Costo Real: $${totalRealMateriales.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    `}
                </div>
            </div>
        </div>
        <div class="flip-container">
            <div class="flip-inner">
                <div class="flip-front card">
                    <h3>Costo de Otros Gastos</h3>
                    <canvas id="chartOtros"></canvas>
                    <div class="chart-label">Estimado / Real</div>
                </div>
                <div class="flip-back">
                    <h3>Costo de Otros Gastos</h3>
                    ${completadas.length === 0 ? noCompletadasMsg : `
                    <p>Costo Estimado: $${totalEstimadoOtros.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    <p>Costo Real: $${totalRealOtros.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    `}
                </div>
            </div>
        </div>
        <div class="card full-width">
            <h3>Personal Sobreutilizado</h3>
            <p>${sobreutilizadosHtml}</p>
        </div>
    </div>
    `;

    function loadChartsAndRender() {
        function mostrarMensajeSinDatos(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const canvasContext = canvas.getContext('2d');
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.save();
            const cx = canvas.width/2;
            const cy = canvas.height/2;

            canvasContext.font = 'bold 18px Segoe UI, Arial';
            canvasContext.fillStyle = '#facc15';
            canvasContext.textAlign = 'center';
            canvasContext.textBaseline = 'middle';
            canvasContext.fillText('¡Sin datos aún!', cx, cy-8);

            canvasContext.font = '14px Segoe UI, Arial';
            canvasContext.fillStyle = '#94a3b8';
            canvasContext.fillText('Aún no se han completado tareas', cx, cy+16);
            canvasContext.restore();
        }
        function crearGraficaTareas() {
            const completadas = tareas.filter(tarea => tarea.estado === "Terminada");
            if (!completadas.length) {
                mostrarMensajeSinDatos('chartTareas');
                return;
            }
            const totalEstimado = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoEstimado||0), 0);
            const totalReal = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoReal||0), 0);
            const canvasContext = document.getElementById('chartTareas')?.getContext('2d');
            if (!canvasContext) return;
            new Chart(canvasContext, {
                type: 'bar',
                data: {
                    labels: ['Tareas'],
                    datasets: [
                        { label: 'Estimado', data: [totalEstimado], backgroundColor: '#2456a4' },
                        { label: 'Real', data: [totalReal], backgroundColor: '#800020' }
                    ]
                }
            });
        }
        function crearGraficaPersonal() {
            const completadas = tareas.filter(tarea => tarea.estado === "Terminada");
            if (!completadas.length) {
                mostrarMensajeSinDatos('chartPersonal');
                return;
            }
            const estimado = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoPersonal||0), 0);
            const real = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoPersonalReal||0), 0);
            const canvasContext = document.getElementById('chartPersonal')?.getContext('2d');
            if (!canvasContext) return;
            new Chart(canvasContext, {
                type: 'bar',
                data: {
                    labels: ['Personal'],
                    datasets: [
                        { label: 'Estimado', data: [estimado], backgroundColor: '#2456a4' },
                        { label: 'Real', data: [real], backgroundColor: '#800020' }
                    ]
                }
            });
        }
        function crearGraficaMateriales() {
            const completadas = tareas.filter(tarea => tarea.estado === "Terminada");
            if (!completadas.length) {
                mostrarMensajeSinDatos('chartMateriales');
                return;
            }
            const estimado = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoMateriales||0), 0);
            const real = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoMaterialesReal||0), 0);
            const canvasContext = document.getElementById('chartMateriales')?.getContext('2d');
            if (!canvasContext) return;
            new Chart(canvasContext, {
                type: 'bar',
                data: {
                    labels: ['Materiales'],
                    datasets: [
                        { label: 'Estimado', data: [estimado], backgroundColor: '#2456a4' },
                        { label: 'Real', data: [real], backgroundColor: '#800020' }
                    ]
                }
            });
        }
        function crearGraficaOtros() {
            const completadas = tareas.filter(tarea => tarea.estado === "Terminada");
            if (!completadas.length) {
                mostrarMensajeSinDatos('chartOtros');
                return;
            }
            const estimado = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoOtros||0), 0);
            const real = completadas.reduce((acumulado, tarea) => acumulado + (tarea.costoOtrosReal||0), 0);
            const canvasContext = document.getElementById('chartOtros')?.getContext('2d');
            if (!canvasContext) return;
            new Chart(canvasContext, {
                type: 'bar',
                data: {
                    labels: ['Otros Costos'],
                    datasets: [
                        { label: 'Estimado', data: [estimado], backgroundColor: '#2456a4' },
                        { label: 'Real', data: [real], backgroundColor: '#800020' }
                    ]
                }
            });
        }
        crearGraficaTareas();
        crearGraficaPersonal();
        crearGraficaMateriales();
        crearGraficaOtros();
    }
    loadChartsAndRender()
}

// Tareas
function renderTareas() {
    let busqueda = '';
    document.getElementById('mainView').innerHTML = `
        <div class="search-bar fade-in">
            <input type="text" id="searchTask" placeholder="Buscar tarea...">
            <button class="add-btn" id="addTaskBtn">Agregar Tarea</button>
        </div>
        <div id="taskList"></div>
    `;
    renderListaDeTareas(busqueda);
    document.getElementById('searchTask').addEventListener('input', entrada => {
        busqueda = entrada.target.value.toLowerCase();
        renderListaDeTareas(busqueda);
    });
    document.getElementById('addTaskBtn').onclick = () => mostrarFormularioTareas();
}
function renderListaDeTareas(search) {
    const filtered = tareas.filter(tarea => tarea.nombre.toLowerCase().includes(search));
    document.getElementById('taskList').innerHTML = filtered.map((tarea, i) => `
        <div class="list" style="display:flex;align-items:center;justify-content:space-between;">
            <div>
                <b>${tarea.nombre}</b> (${tarea.estado})<br>
                <small>Tiempo estimado: ${tarea.tiempoEstimado}h</small><br>
                ${tarea.tiempoReal !== null ? `<small>Tiempo real: ${tarea.tiempoReal}h</small><br>` : ''}
                <small>Personal: ${tarea.personalAsignado.map(id => empleados.find(e => e.id === id)?.nombre).join(', ')}</small><br>
                <small>Materiales: ${tarea.materialUsado.map(mu => {
                    const m = materiales.find(mat => mat.id === mu.idMaterial);
                    return m ? `${m.nombre} (x${mu.cantidad})` : '';
                }).join(', ')}</small><br>
                <small>Otros Costos: ${tarea.otrosCostosAsociados.map(oc => {
                    const o = otrosCostos.find(ot => ot.id === oc.idCosto);
                    return o ? `${o.nombre} (x${oc.cantidad})` : '';
                }).join(', ')}</small><br>
                <small>Costo estimado: $${(tarea.costoEstimado || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small><br>
                ${tarea.costoReal != null ? `<small>Costo real: $${(tarea.costoReal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small><br>` : ''}
            </div>
            <div class="task-actions">
                ${tarea.estado === 'Pendiente'
                    ? `<button class="edit-btn" onclick="editarTarea(${i})">Editar</button><button class="finish-btn" onclick="terminarTarea(${i})">Terminar</button><button class="delete-btn" onclick="borrarTarea(${i})">Eliminar</button>`
                    : ''}
            </div>
        </div>
    `).join('') || '<div>No hay tareas</div>';
}

// Arrays auxiliares para selección
const personalSeleccionado = [];
const materialesSeleccionados = [];
const otrosCostosSeleccionados = [];

function mostrarFormularioTareas(indiceDeTareaAEditar) {
    // Renderizar el modal como antes
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalOverlay').innerHTML = `
    <div id="formTarea" class="modal" style="display:block;">
        <div class="form-content">
        <h2>${typeof indiceDeTareaAEditar === 'number' ? 'Editar Tarea' : 'Agregar Tarea'}</h2>
            <div class="form-group">
                <label for="tareaNombre">Nombre:</label>
                <input required id="tareaNombre" type="text">
            </div>
            <div class="form-group">
                <label for="tareaTiempo">Tiempo estimado (hrs):</label>
                <input required id="tareaTiempo" type="number" step="0.01">
            </div>
            <div class="form-group">
                <label>Asignar personal:</label>
                <input type="text" id="buscar-personal" placeholder="Buscar personal..." class="search-input">
                <div id="resultados-personal" class="search-results"></div>
                <div id="personal-seleccionado" class="selected-tags"></div>
            </div>
            <div class="form-group">
                <label>Materiales necesarios:</label>
                <input type="text" id="buscar-material" placeholder="Buscar material..." class="search-input">
                <div id="resultados-material" class="search-results"></div>
                <div id="material-seleccionado" class="selected-items"></div>
            </div>
            <div class="form-group">
                <label>Otros costos asociados:</label>
                <input type="text" id="buscar-otro" placeholder="Buscar otro costo..." class="search-input">
                <div id="resultados-otro" class="search-results"></div>
                <div id="otro-seleccionado" class="selected-items"></div>
            </div>
            <div class="form-actions">
                <button id="cancelTareaBtn" class="btn">Cancelar</button>
                <button id="submitTareaBtn" class="btn">Guardar</button>
            </div>
        </div>
    </div>
    `;

    // Vaciar arrays auxiliares correctamente
    personalSeleccionado.length = 0;
    materialesSeleccionados.length = 0;
    otrosCostosSeleccionados.length = 0;

    // Instanciar buscadores
    new Buscador({
        inputId: 'buscar-personal',
        resultadosId: 'resultados-personal',
        seleccionadosId: 'personal-seleccionado',
        lista: empleados,
        seleccionados: personalSeleccionado,
        generarHtmlResultado: personal => `<div data-id="${personal.id}" class="search-results persona-resultado">${personal.nombre} ($${personal.costoPorHora}/hora)</div>`,
        generarHtmlTag: id => {
            const persona = empleados.find(x => x.id === id);
            return `<span class="tag">${persona ? persona.nombre : ''}<button data-id="${id}">×</button></span>`;
        },
        validarSeleccion: id => personalSeleccionado.includes(id),
        accionSeleccion: id => personalSeleccionado.push(id)
    });
    new Buscador({
        inputId: 'buscar-material',
        resultadosId: 'resultados-material',
        seleccionadosId: 'material-seleccionado',
        lista: materiales,
        seleccionados: materialesSeleccionados,
        generarHtmlResultado: m => `<div data-id="${m.id}" class="search-results">${m.nombre} ($${m.costoPorUnidad}/unidad)</div>`,
        generarHtmlTag: item => {
            const m = materiales.find(x => x.id === item.idMaterial);
            return `<div class="selected-item">${m ? m.nombre : ''}<input type="number" value="${item.cantidad}" min="1" data-id="${item.idMaterial}"><button data-id="${item.idMaterial}">×</button></div>`;
        },
        validarSeleccion: id => materialesSeleccionados.some(x => x.idMaterial === id),
        accionSeleccion: id => materialesSeleccionados.push({ idMaterial: id, cantidad: 1 })
    });
    new Buscador({
        inputId: 'buscar-otro',
        resultadosId: 'resultados-otro',
        seleccionadosId: 'otro-seleccionado',
        lista: otrosCostos,
        seleccionados: otrosCostosSeleccionados,
        generarHtmlResultado: o => `<div data-id="${o.id}" class="search-results">${o.nombre} ($${o.costoPorUnidad}/unidad)</div>`,
        generarHtmlTag: item => {
            const o = otrosCostos.find(x => x.id === item.idOtrosCostos);
            return `<div class="selected-item">${o ? o.nombre : ''}<input type="number" value="${item.cantidad}" min="1" data-id="${item.idOtrosCostos}"><button data-id="${item.idOtrosCostos}">×</button></div>`;
        },
        validarSeleccion: id => otrosCostosSeleccionados.some(x => x.idOtrosCostos === id),
        accionSeleccion: id => otrosCostosSeleccionados.push({ idOtrosCostos: id, cantidad: 1 })
    });

    // Botón cancelar
    document.getElementById('cancelTareaBtn').onclick = () => {
        ocultarElementoHTML('formTarea');
        clearFormTarea();
    };
    // Botón guardar
    document.getElementById('submitTareaBtn').onclick = () => {
        const nombre = document.getElementById('tareaNombre').value.trim();
        const tiempo = Number(document.getElementById('tareaTiempo').value);
        if (personalSeleccionado.length === 0) {
            alert('Debe asignar al menos una persona a la tarea');
            return;
        }
        const personalAsignado = [...personalSeleccionado];
        const materiales = materialesSeleccionados.map(item => ({ idMaterial: item.idMaterial, cantidad: item.cantidad }));
        const otrosCostos = otrosCostosSeleccionados.map(item => ({ idCosto: item.idOtrosCostos, cantidad: item.cantidad }));
        const tareaObj = new Tarea(nombre, tiempo, personalAsignado, materiales, otrosCostos);
        tareas.push(tareaObj);
        renderListaDeTareas("")
        ocultarElementoHTML('formTarea');
        clearFormSelection();
        clearFormTarea();
    };
}
function editarTarea(indiceDeTareaAEditar) {
    const tarea = tareas[indiceDeTareaAEditar];
    mostrarFormularioTareas(indiceDeTareaAEditar);

    document.getElementById('tareaNombre').value = tarea.nombre;
    document.getElementById('tareaTiempo').value = tarea.tiempoEstimado;

    personalSeleccionado.length = 0;
    personalSeleccionado.push(...tarea.personalAsignado);
    const persSel = document.getElementById('personal-seleccionado');
    persSel.innerHTML = personalSeleccionado.map(id => {
        const persona = empleados.find(e => e.id === id);
        return `<span class="tag">${persona ? persona.nombre : ''}<button data-id="${id}">×</button></span>`;
    }).join('');

    materialesSeleccionados.length = 0;
    materialesSeleccionados.push(...tarea.materialUsado);
    const matSel = document.getElementById('material-seleccionado');
    matSel.innerHTML = materialesSeleccionados.map(item => {
        const material = materiales.find(m => m.id === item.idMaterial);
        return `<div class="selected-item">${material ? material.nombre : ''}<input type="number" value="${item.cantidad}" min="1" data-id="${item.idMaterial}"><button data-id="${item.idMaterial}">×</button></div>`;
    }).join('');

    otrosCostosSeleccionados.length = 0;
    otrosCostosSeleccionados.push(...tarea.otrosCostosAsociados);
    const otroSel = document.getElementById('otro-seleccionado');
    otroSel.innerHTML = otrosCostosSeleccionados.map(item => {
        const costo = otrosCostos.find(o => o.id === item.idCosto);
        return `<div class="selected-item">${costo ? costo.nombre : ''}<input type="number" value="${item.cantidad}" min="1" data-id="${item.idCosto}"><button data-id="${item.idCosto}">×</button></div>`;
    }).join('');

    document.getElementById('submitTareaBtn').onclick = () => {
        const nombre = document.getElementById('tareaNombre').value.trim();
        const tiempo = Number(document.getElementById('tareaTiempo').value);
        if (personalSeleccionado.length === 0) {
            alert('Debe asignar al menos una persona a la tarea');
            return;
        }
        tarea.nombre = nombre;
        tarea.tiempoEstimado = tiempo;
        tarea.personalAsignado = [...personalSeleccionado];
        tarea.materialUsado = materialesSeleccionados.map(item => ({ idMaterial: item.idMaterial, cantidad: item.cantidad }));
        tarea.otrosCostosAsociados = otrosCostosSeleccionados.map(item => ({ idCosto: item.idCosto, cantidad: item.cantidad }));
        tarea.costoEstimado = tarea.calcularCostoEstimado();
        tarea.costoReal = null;
        tarea.estado = 'Pendiente';
        tarea.tiempoReal = null;
        renderListaDeTareas("");
        ocultarElementoHTML('formTarea');
        clearFormSelection();
        clearFormTarea();
    };
}

function terminarTarea(indiceDeTareaATerminar) {
    const tarea = tareas[indiceDeTareaATerminar];
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalOverlay').innerHTML = `
    <div id="formTarea" class="modal" style="display:block;">
      <div class="form-content">
        <h2>Terminar Tarea</h2>
        <div class="form-group">
          <label for="tareaTiempoReal">Tiempo real (hrs):</label>
          <input required id="tareaTiempoReal" type="number" step="0.01" value="${tarea.tiempoReal != null ? tarea.tiempoReal : tarea.tiempoEstimado}">
        </div>
        <div class="form-group">
          <label>Materiales utilizados:</label>
          <input type="text" id="buscar-material-real" placeholder="Buscar material..." class="search-input">
          <div id="resultados-material-real" class="search-results"></div>
          <div id="material-real-seleccionados" class="selected-items"></div>
        </div>
        <div class="form-group">
          <label>Otros costos utilizados:</label>
          <input type="text" id="buscar-otro-real" placeholder="Buscar otro costo..." class="search-input">
          <div id="resultados-otro-real" class="search-results"></div>
          <div id="otro-real-seleccionados" class="selected-items"></div>
        </div>
        <div class="form-actions">
          <button id="cancelTareaBtn" class="btn">Cancelar</button>
          <button id="submitTareaBtn" class="btn">Guardar</button>
        </div>
      </div>
    </div>
    `;

    const materialRealSeleccionado = [...tarea.materialUsado];
    const otrosRealSeleccionado = [...tarea.otrosCostosAsociados];
    const buscadorMaterial = new Buscador({
        inputId: 'buscar-material-real',
        resultadosId: 'resultados-material-real',
        seleccionadosId: 'material-real-seleccionados',
        lista: materiales,
        seleccionados: materialRealSeleccionado,
        generarHtmlResultado: m => `<div data-id="${m.id}" class="search-results">${m.nombre} ($${m.costoPorUnidad}/unidad)</div>`,
        generarHtmlTag: item => {
            const m = materiales.find(x => x.id === item.idMaterial);
            return `<div class="selected-item">${m ? m.nombre : ''}<input type="number" value="${item.cantidad}" min="0" data-id="${item.idMaterial}"><button data-id="${item.idMaterial}">×</button></div>`;
        },
        validarSeleccion: id => materialRealSeleccionado.some(x => x.idMaterial === id),
        accionSeleccion: id => materialRealSeleccionado.push({ idMaterial: id, cantidad: 0 })
    });
    const buscadorOtros = new Buscador({
        inputId: 'buscar-otro-real',
        resultadosId: 'resultados-otro-real',
        seleccionadosId: 'otro-real-seleccionados',
        lista: otrosCostos,
        seleccionados: otrosRealSeleccionado,
        generarHtmlResultado: o => `<div data-id="${o.id}" class="search-results">${o.nombre} ($${o.costoPorUnidad}/unidad)</div>`,
        generarHtmlTag: item => {
            const o = otrosCostos.find(x => x.id === item.idOtrosCostos);
            return `<div class="selected-item">${o ? o.nombre : ''}<input type="number" value="${item.cantidad}" min="0" data-id="${item.idOtrosCostos}"><button data-id="${item.idOtrosCostos}">×</button></div>`;
        },
        validarSeleccion: id => otrosRealSeleccionado.some(x => x.idOtrosCostos === id),
        accionSeleccion: id => otrosRealSeleccionado.push({ idOtrosCostos: id, cantidad: 0 })
    });

    const matSel = document.getElementById('material-real-seleccionados');
    if (matSel && materialRealSeleccionado.length > 0) {
        matSel.innerHTML = materialRealSeleccionado.map(item => {
            const m = materiales.find(x => x.id === item.idMaterial);
            return `<div class="selected-item">${m ? m.nombre : ''}<input type="number" value="${item.cantidad}" min="0" data-id="${item.idMaterial}"><button data-id="${item.idMaterial}">×</button></div>`;
        }).join('');
    }
    const otroSel = document.getElementById('otro-real-seleccionados');
    if (otroSel && otrosRealSeleccionado.length > 0) {
        otroSel.innerHTML = otrosRealSeleccionado.map(item => {
            const id = item.idOtrosCostos !== undefined ? item.idOtrosCostos : item.idCosto;
            const o = otrosCostos.find(x => x.id === id);
            return `<div class="selected-item">${o ? o.nombre : ''}<input type="number" value="${item.cantidad}" min="0" data-id="${id}"><button data-id="${id}">×</button></div>`;
        }).join('');
    }
    // Cancelar
    document.getElementById('cancelTareaBtn').onclick = () => {
        ocultarElementoHTML('formTarea');
        clearFormTarea();
    };
    // Guardar
    document.getElementById('submitTareaBtn').onclick = () => {
        const tiempoReal = Number(document.getElementById('tareaTiempoReal').value);
        // Leer cantidades reales desde inputs
        document.querySelectorAll('#material-real-seleccionados input').forEach(inp => {
            const id = Number(inp.getAttribute('data-id'));
            const cant = Number(inp.value);
            const item = materialRealSeleccionado.find(x => x.idMaterial === id);
            if (item) item.cantidad = cant;
        });
        document.querySelectorAll('#otro-real-seleccionados input').forEach(inp => {
            const id = Number(inp.getAttribute('data-id'));
            const cant = Number(inp.value);
            const item = otrosRealSeleccionado.find(x => x.idOtrosCostos === id);
            if (item) item.cantidad = cant;
        });
        // Actualizar tarea
        tarea.tiempoReal = tiempoReal;
        tarea.materialUsado = materialRealSeleccionado;
        tarea.otrosCostosAsociados = otrosRealSeleccionado;
        // Terminar tarea y recalcular costos
        tarea.terminarTarea(tiempoReal);
        // Cerrar modal completamente
        closeModal();
        // Re-renderizar lista de tareas con estado actualizado
        render();
    };
}

function borrarTarea(indiceDeTareaABorrar) {
    tareas.splice(indiceDeTareaABorrar, 1);
    renderListaDeTareas("");
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.getElementById('modalOverlay').innerHTML = '';
}

// Configuración
function renderConfiguracion() {
    document.getElementById('mainView').innerHTML = `
        <div class="tabs fade-in">
            <button class="${configTab==='empleados'?'active':''}" id="tabEmpleados">Empleados</button>
            <button class="${configTab==='materiales'?'active':''}" id="tabMateriales">Materiales</button>
            <button class="${configTab==='otros'?'active':''}" id="tabOtros">Otros Costos</button>
        </div>
        <div id="configList"></div>
        <button class="add-btn" id="addConfigBtn" style="margin-top:10px;">Agregar</button>
    `;
    renderListaConfiguracion();
    document.getElementById('tabEmpleados').onclick = () => { configTab='empleados'; render(); };
    document.getElementById('tabMateriales').onclick = () => { configTab='materiales'; render(); };
    document.getElementById('tabOtros').onclick = () => { configTab='otros'; render(); };
    document.getElementById('addConfigBtn').onclick = () => mostrarFormularioDeConfiguracion();
}
function renderListaConfiguracion() {
    let arr, label, extra;
    if (configTab === 'empleados') {
        arr = empleados;
        label = 'Empleado';
        extra = empleado => `Costo/h: $${empleado.costoPorHora}`;
    } else if (configTab === 'materiales') {
        arr = materiales;
        label = 'Material';
        extra = material => `Costo/u: $${material.costoPorUnidad}`;
    } else {
        arr = otrosCostos;
        label = 'Otro Costo';
        extra = otroCosto => `Costo/u: $${otroCosto.costoPorUnidad}`;
    }

    document.getElementById('configList').innerHTML = arr.map(elemento => `
        <div class="list" style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
            <div>
                <b>${elemento.nombre}</b> <small>${extra(elemento)}</small>
            </div>
            <div style="display:flex;gap:8px;">
                <button class="delete-btn" data-idx="${elemento.id}" style="background:#dc3545;color:#fff;border:none;border-radius:5px;padding:6px 14px;cursor:pointer;font-weight:600;">Eliminar</button>
            </div>
        </div>
    `).join('') || `<div style='margin-bottom:12px;'>No hay ningún ${label.toLowerCase()}</div>`;

    // Asignar evento al botón eliminar
    document.querySelectorAll('#configList .delete-btn').forEach(btn => {
        btn.onclick = function() {
            deleteConfig(btn.getAttribute('data-idx'));
        };
    });
}
function mostrarFormularioDeConfiguracion(editIdx) {
    const isEdit = typeof editIdx === 'number';
    const obj = isEdit ? getObjetoDeConfiguracion(editIdx) : {};
    const title = isEdit ? `Editar ${getConfigLabel()}` : `Agregar ${getConfigLabel()}`;

    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('modalOverlay').innerHTML = `
        <div class="modal">
            <h2>${title}</h2>
            <form id="configForm">
                <input type="text" name="nombre" placeholder="Nombre" value="${obj.nombre || ''}" required>
                <input type="number" name="costo" min="0" step="0.01" placeholder="Costo por unidad${configTab === 'empleados' ? ' (por hora)' : ''}" value="${obj.costo || ''}" required>
                <div class="modal-btns">
                    <button type="submit" class="btn-green">${isEdit ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" class="btn-red" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('configForm').onsubmit = handleConfigFormSubmit(editIdx);
}

function getObjetoDeConfiguracion(indiceDelObjeto) {
    if (configTab === 'empleados') return empleados[indiceDelObjeto];
    if (configTab === 'materiales') return materiales[indiceDelObjeto];
    return otrosCostos[indiceDelObjeto];
}

function getConfigLabel() {
    if (configTab === 'empleados') return 'Empleado';
    if (configTab === 'materiales') return 'Material';
    return 'Otro Costo';
}

function handleConfigFormSubmit(indiceDelObjeto) {
    return function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const nombre = formData.get('nombre');
        const costo = Number(formData.get('costo'));

        if (costo < 0) {
            alert('El costo no puede ser negativo.');
            return;
        }

        const newObj = createConfigObject(nombre, costo);

        if (typeof indiceDelObjeto === 'number') {
            updateConfigObject(indiceDelObjeto, newObj);
        } else {
            addConfigObject(newObj);
        }

        closeModal();
        render();
    };
}

function createConfigObject(nombre, costo) {
    if (configTab === 'empleados') return new Personal(nombre, costo);
    if (configTab === 'materiales') return new Material(nombre, costo);
    return new OtroCosto(nombre, costo);
}

function updateConfigObject(editIdx, newObj) {
    if (configTab === 'empleados') empleados[editIdx] = newObj;
    else if (configTab === 'materiales') materiales[editIdx] = newObj;
    else otrosCostos[editIdx] = newObj;
}

function addConfigObject(newObj) {
    if (configTab === 'empleados') empleados.push(newObj);
    else if (configTab === 'materiales') materiales.push(newObj);
    else otrosCostos.push(newObj);
}

// Eliminar elemento de configuración
function deleteConfig(id) {
    if (configTab === 'empleados') {
        const index = empleados.findIndex(e => e.id == id);
        if (index > -1) empleados.splice(index, 1);
    } else if (configTab === 'materiales') {
        const index = materiales.findIndex(m => m.id == id);
        if (index > -1) materiales.splice(index, 1);
    } else {
        const index = otrosCostos.findIndex(o => o.id == id);
        if (index > -1) otrosCostos.splice(index, 1);
    }
    render();
}

// Navegación
document.getElementById('dashboardBtn').onclick = () => { vistaActual='dashboard'; render(); };
document.getElementById('tasksBtn').onclick = () => { vistaActual='tasks'; render(); };
document.getElementById('configBtn').onclick = () => { vistaActual='config'; render(); };

// Utilidad para IDs
// Función genId importada desde helpers.js

// Inicializar
render();

// Advertencia al recargar o cerrar la página
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});
