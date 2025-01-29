import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js"; 
import emailOlvidePass from "../helpers/emailOlvidePass.js";

const registrar = async (req, res)=>{
    const { email, nombre } = req.body;

    //Validar que no se registre usuario duplicado
    const existeUsuario = await Veterinario.findOne({email});

    if(existeUsuario){
        const error = new Error ('Email ya registrado'); 
        return res.status(400).json({msg: error.message}); 
    }

    try {
        //Guardar nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        //Enviar email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        }); 

        res.json(veterinarioGuardado); 
        
    } catch (error) {
        console.log(error); 
    }
    
}; 

const perfil = (req, res)=>{
    const { veterinario } = req;
    res.json({perfil: veterinario}); 
}

const confirmar = async (req, res)=>{
    //req.body para recuperar el cuerpo de un form, etc...
    //req.params para recuperar data de la url
    const { token } = req.params; 

    const usuarioConfirmado = await Veterinario.findOne({token});

    if(!usuarioConfirmado){
        const error = new Error("Token no encontrado");
        return res.status(404).json({msg: error.message}); 
    }

    try {
        usuarioConfirmado.token = null; //Se confirma usuario por lo que el token se elimina por seguridad: null
        usuarioConfirmado.confirmado = true; //Se cambia en la DB el estado del usuario
        await usuarioConfirmado.save(); //Se guardan cambios en la DB
        res.json({msg: "Usuario confirmado"}); //Mensaje de confirmación 
    } catch (error) {
        console.log(error); 
    }

}

const autenticar = async (req, res)=>{
    const { email, password } = req.body; 

    //Comprobar si el user existe
    const usuario = await Veterinario.findOne({email}); 

    if(!usuario){
        const error = new Error ('No existe usuario'); 
        return res.status(404).json({msg: error.message}); 
    }

    //Comprobar si el usuario está confirmado 
    if(!usuario.confirmado){
        const error = new Error ("El usuario no ha confirmado la cuenta");
        return res.status(403).json({msg: error.message}); 
    }

    //Autenticar usuario
    if(await usuario.comprobarPassword(password)){
        //JWT
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id),
        }); 
    }else{
        const error = new Error("El password no es correcto")
        return res.status(403).json({msg: error.message}); 
    }
}

const olvidePassword = async (req, res)=>{
    const { email } = req.body; 

    const existeVeterinario = await Veterinario.findOne({email});

    if(!existeVeterinario){
        const error = new Error("El usuario no existe");
        return res.status(400).json({msg: error.message}); 
    }

    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar mail con instrucciones
        emailOlvidePass({
           email,
           nombre: existeVeterinario.nombre,
           token: existeVeterinario.token 
        });  

        res.json({msg: "Hemos enviado un email con las instrucciones"}); 
    } catch (error) {
        console.log(error); 
    }
}

const comprobarToken = async (req, res)=>{
    const { token } = req.params; 
    
    const tokenValido = await Veterinario.findOne({token}); 

    if(tokenValido){
        //El token es válido, el user exists 
        res.json({msg: "Token validado"}); 
    }else{
        const error = new Error ("Token no es válido");
        return res.status(400).json({msg: error.message}); 
    }
}


const nuevoPassword = async (req, res)=>{
    const { token } = req.params;
    const { password } = req.body; 

    const veterinario = await Veterinario.findOne({ token });

    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message}); 
    }

    try {
        veterinario.token = null;
        veterinario.password = password; 
        await veterinario.save();
        res.json({msg: "El password ha sido modificado"}); 
    } catch (error) {
        console.log(error); 
    }

}

const actualizarPerfil = async (req, res) =>{
    const veterinario = await Veterinario.findById(req.params.id);

    if(!veterinario){
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message}); 
    }

    const { email } = req.body;
    if(veterinario.email !== req.body.email){
        const existeEmail = await Veterinario.findOne({email});
        if(existeEmail){
            const error = new Error("Email ya registrado");
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        veterinario.nombre = req.body.nombre; 
        veterinario.web = req.body.web; 
        veterinario.email = req.body.email; 
        veterinario.telefono = req.body.telefono; 

        const veterinarioActualizado = await veterinario.save(); 
        res.json(veterinarioActualizado); 

    } catch (error) {
        console.log(error); 
    }
}


const actualizarPassword = async (req, res) =>{
    //Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    //Comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id);
    if(!veterinario){
        const error = new Error ("Usuario no encontrado en la BBDD");
        return res.status(400).json({msg: error.message});
    }

    //Comprobar password
    if(await veterinario.comprobarPassword(pwd_actual)){
        //Almacenar nuevo password 
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        return res.json({msg: "El password ha sido modificado"}); 
    }else{
        const error = new Error ("El password actual es incorrecto");
        return res.status(400).json({msg: error.message});
    }

}


export{
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}