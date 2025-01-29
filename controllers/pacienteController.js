import Paciente from "../models/Paciente.js"

const agregarPaciente = async (req, res) =>{
    const paciente = new Paciente(req.body);
    paciente.veterinario = req.veterinario._id;
    
    try {
        const pacienteSaved = await paciente.save();
        res.json(pacienteSaved); 
    } catch (error) {
        console.log(error);
    }
}

const obtenerPacientes = async (req, res) =>{
    const pacientes = await Paciente.find().where('veterinario').equals(req.veterinario); 
    res.json(pacientes); 
}

const obtenerPaciente = async (req, res)=>{
    const { id } = req.params; 
    const paciente = await Paciente.findById(id); 
    
    if(!paciente){
        return res.status(404).json({msg: "No encontrado"}); 
    }

    //Se requiere parsear a String debido a qué como ObjectIds siempre son diferentes a pesar de ser el mismo 
    //Comprueba que el veterinario logeado matchea con el paciente que desea obtener con veterinario._id
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
        return res.json({msg: "Acción no permitida"}); 
    }

    res.json(paciente); 
}

const actualizarPaciente = async (req, res)=>{
    const { id } = req.params; 
    const paciente = await Paciente.findById(id); 

    if(!paciente){
        return res.status(404).json({msg: "No encontrado"}); 
    }

    //Se requiere parsear a String debido a qué como ObjectIds siempre son diferentes a pesar de ser el mismo 
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
        return res.json({msg: "Acción no permitida"}); 
    }

    //Actualizar paciente
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.email = req.body.email || paciente.email;
    paciente.fecha = req.body.fecha || paciente.fecha;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;

    try {
        const pacienteUpdated = await paciente.save();
        res.json(pacienteUpdated); 
    } catch (error) {
        console.log(error); 
    }

}

const eliminarPaciente = async (req, res)=>{
    const { id } = req.params; 
    const paciente = await Paciente.findById(id); 

    if(!paciente){
        return res.status(404).json({msg: "No encontrado"}); 
    }

    //Se requiere parsear a String debido a qué como ObjectIds siempre son diferentes a pesar de ser el mismo 
    if(paciente.veterinario._id.toString() !== req.veterinario._id.toString()){
        return res.json({msg: "Acción no permitida"}); 
    }

    try {
        await paciente.deleteOne();
        res.json({msg: `El paciente ${paciente.nombre} ha sido eliminado de la base de datos`}); 
    } catch (error) {
        console.log(error); 
    }
}

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
}