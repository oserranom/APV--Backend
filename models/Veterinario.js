import mongoose from "mongoose";
import bcrypt from "bcrypt"; 
import generarId from "../helpers/generarId.js";

const veterinarioSchema = mongoose.Schema({
    nombre:{
        type: String, 
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono:{
        type: String,
        default: null,
        trim: true
    },
    web:{
        type: String,
        default: null
    },
    token:{
        type: String,
        default: generarId()
    },
    confirmado:{
        type: Boolean,
        default: false
    }
});

//Método para hashear passwords:
//usa el hook de la API de mongoose pre
//Se utiliza declaración function() y no arrow function por un tema de scope, arrow funct = global window

veterinarioSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next(); 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); 
});

veterinarioSchema.methods.comprobarPassword = async function (passwordForm){
    return await bcrypt.compare(passwordForm, this.password); 
}

const Veterinario = mongoose.model('Veterinario', veterinarioSchema); 
export default Veterinario; 