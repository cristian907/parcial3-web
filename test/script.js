// Estructuras de datos
const empleados = [];
const materiales = [];
const otrosCostos = [];
const tareas = [];

// Estado de la vista
let vistaActual = 'dashboard';
let configTab = 'empleados';

// Utilidades
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return document.querySelectorAll(sel); }

// Render principal
function render() {
    $('#dashboardBtn').classList.toggle('active', vistaActual === 'dashboard');
    $('#tasksBtn').classList.toggle('active', vistaActual === 'tasks');
    $('#configBtn').classList.toggle('active', vistaActual === 'config');
    if (vistaActual === 'dashboard') renderDashboard();
    else if (vistaActual === 'tasks') renderTasks();
    else renderConfig();
}

// Dashboard
function renderDashboard() {
    const totalEstimado = tareas.reduce((acc, t) => acc + (t.costoEstimado||0), 0);
    const totalReal = tareas.filter(t => t.concluida).reduce((acc, t) => acc + (t.costoReal||0), 0);
    const totalPersonalEstimado = tareas.reduce((acc, t) => acc + t.costoPersonal, 0);
    const totalPersonalReal = tareas.filter(t => t.concluida).reduce((acc, t) => acc + t.costoPersonalReal, 0);
    const totalMaterialesEstimado = tareas.reduce((acc, t) => acc + t.costoMateriales, 0);
    const totalMaterialesReal = tareas.filter(t => t.concluida).reduce((acc, t) => acc + t.costoMaterialesReal, 0);
    const totalOtrosEstimado = tareas.reduce((acc, t) => acc + t.costoOtros, 0);
    const totalOtrosReal = tareas.filter(t => t.concluida).reduce((acc, t) => acc + t.costoOtrosReal, 0);
    // Sobreutilización
    let sobreutilizados = [];
    empleados.forEach(emp => {
        let horas = 0;
        tareas.forEach(t => {
            if (t.personal.includes(emp.id)) horas += t.tiempo;
        });
        if (horas > 8) sobreutilizados.push(emp.nombre);
    });
    $('#mainView').innerHTML = `
        <div class="dashboard-card fade-in">
            <h2>Avance del Proyecto</h2>
            <div>Progreso: <b>${(totalReal/totalEstimado*100||0).toFixed(1)}%</b></div>
            <div>Costo Estimado Total: <b>$${totalEstimado.toFixed(2)}</b></div>
            <div>Costo Real Total: <b>$${totalReal.toFixed(2)}</b></div>
        </div>
        <div class="dashboard-card fade-in">
            <h3>Costos por Categoría</h3>
            <div>Personal: Estimado $${totalPersonalEstimado.toFixed(2)} | Real $${totalPersonalReal.toFixed(2)}</div>
            <div>Materiales: Estimado $${totalMaterialesEstimado.toFixed(2)} | Real $${totalMaterialesReal.toFixed(2)}</div>
            <div>Otros: Estimado $${totalOtrosEstimado.toFixed(2)} | Real $${totalOtrosReal.toFixed(2)}</div>
        </div>
        <div class="dashboard-card fade-in">
            <h3>Personal sobreutilizado (&gt;8h)</h3>
            <div>${sobreutilizados.length ? sobreutilizados.join(', ') : 'Ninguno'}</div>
        </div>
    `;
}

// Tareas
function renderTasks() {
    let search = '';
    $('#mainView').innerHTML = `
        <div class="search-bar fade-in">
            <input type="text" id="searchTask" placeholder="Buscar tarea...">
            <button class="add-btn" id="addTaskBtn">Agregar Tarea</button>
        </div>
        <div id="taskList"></div>
    `;
    renderTaskList(search);
    $('#searchTask').addEventListener('input', e => {
        search = e.target.value.toLowerCase();
        renderTaskList(search);
    });
    $('#addTaskBtn').onclick = () => showTaskModal();
}
function renderTaskList(search) {
    const filtered = tareas.filter(t => t.nombre.toLowerCase().includes(search));
    $('#taskList').innerHTML = filtered.map((t, i) => `
        <div class="list">
            <b>${t.nombre}</b> (${t.concluida ? 'Concluida' : 'Pendiente'})<br>
            <small>Personal: ${t.personal.map(id => empleados.find(e => e.id===id)?.nombre).join(', ')}</small><br>
            <small>Tiempo: ${t.tiempo}h</small><br>
            <small>Materiales: ${t.materiales.map(id => materiales.find(m => m.id===id)?.nombre).join(', ')}</small><br>
            <small>Otros Costos: ${t.otros.map(id => otrosCostos.find(o => o.id===id)?.nombre).join(', ')}</small><br>
            <button onclick="editTask(${i})">Editar</button>
            <button onclick="toggleTask(${i})">${t.concluida ? 'Marcar como pendiente' : 'Marcar como concluida'}</button>
        </div>
    `).join('') || '<div>No hay tareas</div>';
}
function showTaskModal(editIdx) {
    const tarea = typeof editIdx === 'number' ? tareas[editIdx] : {};
    $('#modalOverlay').classList.remove('hidden');
    $('#modalOverlay').innerHTML = `
        <div class="modal">
            <h2>${editIdx !== undefined ? 'Editar' : 'Agregar'} Tarea</h2>
            <form id="taskForm">
                <input type="text" name="nombre" placeholder="Nombre" value="${tarea.nombre||''}" required>
                <label>Personal:</label>
                <input type="text" id="searchPersonal" placeholder="Buscar personal..." autocomplete="off">
                <div id="personalList" class="search-list"></div>
                <label>Tiempo (horas):</label>
                <input type="number" name="tiempo" min="1" value="${tarea.tiempo||''}" required>
                <label>Materiales:</label>
                <input type="text" id="searchMateriales" placeholder="Buscar materiales..." autocomplete="off">
                <div id="materialesList" class="search-list"></div>
                <label>Otros Costos:</label>
                <input type="text" id="searchOtros" placeholder="Buscar otros costos..." autocomplete="off">
                <div id="otrosList" class="search-list"></div>
                <label>Costo Estimado:</label>
                <input type="number" name="costoEstimado" min="0" value="${tarea.costoEstimado||''}" required>
                <label>Costo Real:</label>
                <input type="number" name="costoReal" min="0" value="${tarea.costoReal||''}" ${tarea.concluida ? '' : 'disabled'}>
                <div class="modal-btns">
                    <button type="submit" class="btn-green">${editIdx !== undefined ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" class="btn-red" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    // Inicializar listas seleccionadas
    let seleccionPersonal = tarea.personal ? [...tarea.personal] : [];
    let seleccionMateriales = tarea.materiales ? [...tarea.materiales] : [];
    let seleccionOtros = tarea.otros ? [...tarea.otros] : [];
    // Renderizar listas solo si input tiene focus
    function renderLista(arr, seleccion, containerId, searchId, tipo) {
        const search = $(searchId).value.toLowerCase();
        const lista = arr.filter(e => e.nombre.toLowerCase().includes(search));
        $(containerId).innerHTML = lista.map(e => {
            if (tipo === 'materiales' || tipo === 'otros') {
                const sel = seleccion.find(s => s.id === e.id);
                let removeBtn = sel ? `<button class='remove-btn' data-id='${e.id}' title='Quitar' style='margin-left:8px;background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;vertical-align:middle;'>×</button>` : '';
                return `<div class="search-item" data-id="${e.id}" style="padding:5px 10px;cursor:pointer;background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;${sel?'font-weight:bold;background:#e6f7ff;':''}">
                    <span style='flex:1;'>${e.nombre}</span>
                    ${sel ? `<input type='number' min='1' value='${sel.cantidad}' style='width:50px;margin-left:10px;' class='cantidad-input' data-id='${e.id}'>` : ''}
                    ${removeBtn}
                </div>`;
            } else {
                let removeBtn = seleccion.includes(e.id) ? `<button class='remove-btn' data-id='${e.id}' title='Quitar' style='margin-left:8px;background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;vertical-align:middle;'>×</button>` : '';
                return `<div class="search-item" data-id="${e.id}" style="padding:5px 10px;cursor:pointer;background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;${seleccion.includes(e.id)?'font-weight:bold;background:#e6f7ff;':''}">
                    <span style='flex:1;'>${e.nombre}</span>
                    ${removeBtn}
                </div>`;
            }
        }).join('') || '<div style="color:#888;">No hay resultados</div>';
        // Selección por click y cantidad
        $all(containerId+' .search-item').forEach(item => {
            item.onclick = function(e) {
                // Si se hace click en el botón de eliminar, no seleccionar
                if (e.target.classList.contains('remove-btn')) return;
                const id = item.getAttribute('data-id');
                if (tipo === 'materiales' || tipo === 'otros') {
                    let sel = seleccion.find(s => s.id === id);
                    if (!sel) {
                        seleccion.push({id, cantidad: 1});
                        renderLista(arr, seleccion, containerId, searchId, tipo);
                    }
                } else {
                    if (!seleccion.includes(id)) seleccion.push(id);
                    else seleccion = seleccion.filter(sid => sid !== id);
                    renderLista(arr, seleccion, containerId, searchId, tipo);
                }
                // Mantener la lista abierta (no ocultar)
                $(containerId).style.display = 'block';
            };
        });
        // Eliminar elemento de la selección
        $all(containerId+' .remove-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (tipo === 'materiales' || tipo === 'otros') {
                    const idx = seleccion.findIndex(s => s.id === id);
                    if (idx !== -1) seleccion.splice(idx, 1);
                } else {
                    seleccion = seleccion.filter(sid => sid !== id);
                }
                renderLista(arr, seleccion, containerId, searchId, tipo);
            };
        });
        // Cambiar cantidad
        $all(containerId+' .cantidad-input').forEach(input => {
            input.onchange = function(e) {
                const id = input.getAttribute('data-id');
                let sel = seleccion.find(s => s.id === id);
                if (sel) sel.cantidad = Math.max(1, Number(input.value));
            };
        });
    }
    // Mostrar/ocultar lista según focus
    function setupFocus(inputId, listId, arr, seleccion) {
        const input = $(inputId);
        const list = $(listId);
        input.onfocus = () => {
            list.style.display = 'block';
            renderLista(arr, seleccion, listId, inputId);
        };
        input.oninput = () => {
            list.style.display = 'block';
            renderLista(arr, seleccion, listId, inputId);
        };
        input.onblur = () => {
            setTimeout(()=>{ list.style.display = 'none'; }, 150);
        };
    }
    // Inicializar listas ocultas
    $('#personalList').style.display = 'none';
    $('#materialesList').style.display = 'none';
    $('#otrosList').style.display = 'none';
    function renderAllLists() {
        renderLista(empleados, seleccionPersonal, '#personalList', '#searchPersonal', 'personal');
        renderLista(materiales, seleccionMateriales, '#materialesList', '#searchMateriales', 'materiales');
        renderLista(otrosCostos, seleccionOtros, '#otrosList', '#searchOtros', 'otros');
    }
    renderAllLists();
    // Mostrar lista solo cuando el input tiene foco
    function setupListFocus(inputId, listId) {
        const input = $(inputId);
        const list = $(listId);
        input.onfocus = () => { list.style.display = 'block'; };
        input.onblur = () => { setTimeout(()=>{ list.style.display = 'none'; }, 150); };
        input.oninput = renderAllLists;
    }
    setupListFocus('#searchPersonal', '#personalList');
    setupListFocus('#searchMateriales', '#materialesList');
    setupListFocus('#searchOtros', '#otrosList');
    // Indicador permanente en el input
    $('#searchPersonal').placeholder = 'Seleccione personal...';
    $('#searchMateriales').placeholder = 'Seleccione materiales...';
    $('#searchOtros').placeholder = 'Seleccione otros costos...';
    // Mostrar seleccionados debajo del input SIEMPRE
    function renderSeleccionados(arr, seleccion, containerId, tipo) {
        let names;
        if (tipo === 'materiales' || tipo === 'otros') {
            names = seleccion.map(s => {
                const n = arr.find(e=>e.id===s.id)?.nombre;
                return n ? `${n} (x${s.cantidad})` : null;
            }).filter(Boolean);
        } else {
            names = seleccion.map(id => arr.find(e=>e.id===id)?.nombre).filter(Boolean);
        }
        // Eliminar tags previos SOLO si están justo después del input
        const input = $(containerId).previousElementSibling;
        if (input && input.nextElementSibling && input.nextElementSibling.classList.contains('selected-tags')) {
            input.nextElementSibling.remove();
        }
        // Insertar los tags justo después del input
        input.insertAdjacentHTML('afterend', `<div class="selected-tags">${names.map(n=>`<span>${n}</span>`).join('')}</div>`);
    }
    // Renderizar los tags seleccionados al inicio y cada vez que cambie la selección
    function renderAllTags() {
        renderSeleccionados(empleados, seleccionPersonal, '#personalList', 'personal');
        renderSeleccionados(materiales, seleccionMateriales, '#materialesList', 'materiales');
        renderSeleccionados(otrosCostos, seleccionOtros, '#otrosList', 'otros');
    }
    renderAllTags();
    // Actualizar tags al seleccionar/des-seleccionar
    const updateTags = () => setTimeout(renderAllTags, 0);
    $('#searchPersonal').oninput = () => { renderAllLists(); updateTags(); };
    $('#searchMateriales').oninput = () => { renderAllLists(); updateTags(); };
    $('#searchOtros').oninput = () => { renderAllLists(); updateTags(); };
    $('#taskForm').onsubmit = function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        const nombre = fd.get('nombre');
        const tiempo = Number(fd.get('tiempo'));
        const costoEstimado = Number(fd.get('costoEstimado'));
        let costoReal = Number(fd.get('costoReal'));
        if (!tarea.concluida) costoReal = 0;
        // Usar las listas seleccionadas
        const personal = [...seleccionPersonal];
        const materialesSel = [...seleccionMateriales];
        const otrosSel = [...seleccionOtros];
        // Calcular costos
        let costoPersonal = personal.reduce((acc, id) => acc + (empleados.find(e=>e.id===id)?.costoHora||0)*tiempo, 0);
        let costoMateriales = materialesSel.reduce((acc, id) => acc + (materiales.find(m=>m.id===id)?.costoUnidad||0), 0);
        let costoOtros = otrosSel.reduce((acc, id) => acc + (otrosCostos.find(o=>o.id===id)?.costoUnidad||0), 0);
        let costoTotal = costoPersonal + costoMateriales + costoOtros;
        const tareaObj = {
            nombre,
            personal,
            tiempo,
            materiales: materialesSel,
            otros: otrosSel,
            costoPersonal,
            costoMateriales,
            costoOtros,
            costoTotal,
            costoEstimado,
            costoReal,
            concluida: tarea?.concluida || false,
            costoPersonalReal: tarea?.costoPersonalReal || 0,
            costoMaterialesReal: tarea?.costoMaterialesReal || 0,
            costoOtrosReal: tarea?.costoOtrosReal || 0
        };
        if (editIdx !== undefined) tareas[editIdx] = tareaObj;
        else tareas.push(tareaObj);
        closeModal();
        render();
    };
}
function editTask(idx) { showTaskModal(idx); }
function toggleTask(idx) {
    const t = tareas[idx];
    t.concluida = !t.concluida;
    if (t.concluida) {
        t.costoPersonalReal = t.costoPersonal;
        t.costoMaterialesReal = t.costoMateriales;
        t.costoOtrosReal = t.costoOtros;
        t.costoReal = t.costoTotal;
    }
    render();
}
function closeModal() {
    $('#modalOverlay').classList.add('hidden');
    $('#modalOverlay').innerHTML = '';
}

// Configuración
function renderConfig() {
    $('#mainView').innerHTML = `
        <div class="tabs fade-in">
            <button class="${configTab==='empleados'?'active':''}" id="tabEmpleados">Empleados</button>
            <button class="${configTab==='materiales'?'active':''}" id="tabMateriales">Materiales</button>
            <button class="${configTab==='otros'?'active':''}" id="tabOtros">Otros Costos</button>
        </div>
        <div id="configList"></div>
        <button class="add-btn" id="addConfigBtn" style="margin-top:10px;">Agregar</button>
    `;
    renderConfigList();
    $('#tabEmpleados').onclick = () => { configTab='empleados'; render(); };
    $('#tabMateriales').onclick = () => { configTab='materiales'; render(); };
    $('#tabOtros').onclick = () => { configTab='otros'; render(); };
    $('#addConfigBtn').onclick = () => showConfigModal();
}
function renderConfigList() {
    let arr, label, extra;
    if (configTab==='empleados') {
        arr = empleados;
        label = 'Empleado';
        extra = e => `Costo/h: $${e.costoHora}`;
    } else if (configTab==='materiales') {
        arr = materiales;
        label = 'Material';
        extra = m => `Costo/u: $${m.costoUnidad}`;
    } else {
        arr = otrosCostos;
        label = 'Otro Costo';
        extra = o => `Costo/u: $${o.costoUnidad}`;
    }
    $('#configList').innerHTML = arr.map((el, i) => `
        <div class="list" style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
            <div>
                <b>${el.nombre}</b> <small>${extra(el)}</small>
            </div>
            <div style="display:flex;gap:8px;">
                <button class="delete-btn" data-idx="${i}" style="background:#dc3545;color:#fff;border:none;border-radius:5px;padding:6px 14px;cursor:pointer;font-weight:600;">Eliminar</button>
            </div>
        </div>
    `).join('') || `<div style='margin-bottom:12px;'>No hay ${label.toLowerCase()}s</div>`;
    // Asignar evento al botón eliminar
    $all('#configList .delete-btn').forEach(btn => {
        btn.onclick = function() {
            deleteConfig(Number(btn.getAttribute('data-idx')));
        };
    });
}
function showConfigModal(editIdx) {
    let obj = {};
    let title = '';
    if (configTab==='empleados') {
        obj = typeof editIdx==='number' ? empleados[editIdx] : {};
        title = editIdx!==undefined ? 'Editar Empleado' : 'Agregar Empleado';
    } else if (configTab==='materiales') {
        obj = typeof editIdx==='number' ? materiales[editIdx] : {};
        title = editIdx!==undefined ? 'Editar Material' : 'Agregar Material';
    } else {
        obj = typeof editIdx==='number' ? otrosCostos[editIdx] : {};
        title = editIdx!==undefined ? 'Editar Otro Costo' : 'Agregar Otro Costo';
    }
    $('#modalOverlay').classList.remove('hidden');
    $('#modalOverlay').innerHTML = `
        <div class="modal">
            <h2>${title}</h2>
            <form id="configForm">
                <input type="text" name="nombre" placeholder="Nombre" value="${obj.nombre||''}" required>
                <input type="number" name="costo" min="0" placeholder="Costo por unidad${configTab==='empleados'?' (por hora)':''}" value="${obj.costoHora||obj.costoUnidad||''}" required>
                <div class="modal-btns">
                    <button type="submit" class="btn-green">${editIdx!==undefined?'Guardar':'Agregar'}</button>
                    <button type="button" class="btn-red" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    $('#configForm').onsubmit = function(e) {
        e.preventDefault();
        const fd = new FormData(this);
        const nombre = fd.get('nombre');
        const costo = Number(fd.get('costo'));
        if (costo < 0) {
            alert('El costo no puede ser negativo.');
            return;
        }
        if (configTab==='empleados') {
            const obj = { id: genId(), nombre, costoHora: costo };
            if (editIdx!==undefined) empleados[editIdx]=obj;
            else empleados.push(obj);
        } else if (configTab==='materiales') {
            const obj = { id: genId(), nombre, costoUnidad: costo };
            if (editIdx!==undefined) materiales[editIdx]=obj;
            else materiales.push(obj);
        } else {
            const obj = { id: genId(), nombre, costoUnidad: costo };
            if (editIdx!==undefined) otrosCostos[editIdx]=obj;
            else otrosCostos.push(obj);
        }
        closeModal();
        render();
    };
}
// Eliminar elemento de configuración
function deleteConfig(idx) {
    if (configTab==='empleados') empleados.splice(idx,1);
    else if (configTab==='materiales') materiales.splice(idx,1);
    else otrosCostos.splice(idx,1);
    render();
}

// Navegación
$('#dashboardBtn').onclick = () => { vistaActual='dashboard'; render(); };
$('#tasksBtn').onclick = () => { vistaActual='tasks'; render(); };
$('#configBtn').onclick = () => { vistaActual='config'; render(); };

// Utilidad para IDs
function genId() { return '_' + Math.random().toString(36).substr(2, 9); }

// Inicializar
render();
window.closeModal = closeModal;
window.editTask = editTask;
window.toggleTask = toggleTask;
window.editConfig = editConfig;
