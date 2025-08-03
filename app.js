const personalList = [];
const materialList = [];
const otrosCostosList = [];


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
            const persona = personalList.find(persona => persona.id === idPersona);
            if (persona) {
                total += persona.costoPorHora * tiempo;
            }});
        return total;
    }

    calcularCostoMaterial() {
        let total = 0;
        this.materialUsado.forEach(mat => {
            const material = materialList.find(material => material.id === mat.idMaterial);
            if (material) {
                total += material.costoPorUnidad * mat.cantidad;
            };
        });
        return total;
    }

    calcularOtrosCostos() {
        let total = 0;
        this.otrosCostosAsociados.forEach(otroCostoAsociado => {
            const otro = otrosCostosList.find(otroCosto => otroCosto.id === otroCostoAsociado.idCosto);
            if (otro) {
                total += otro.costoPorUnidad * otroCostoAsociado.cantidad;
            }
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
        let total = 0;
        total += this.calcularCostoMaterial()

        materialesExtra.forEach(mat => {
            const material = materialList.find(material => material.id === mat.idMaterial);
            if (material) {
                total += material.costoPorUnidad * mat.cantidad;
            }
        });
        return total;
    }

    calcularOtrosCostosReales(otrosCostosExtra = []) {
        let total = 0;
        total += this.calcularOtrosCostos()

        otrosCostosExtra.forEach(otroCostoExtra => {
            const otro = otrosCostosList.find(otroCosto => otroCosto.id === otroCostoExtra.idCosto);
            if (otro) {
                total += otro.costoPorUnidad * otroCostoExtra.cantidad;
            }
        });
        return total;
    }
}
