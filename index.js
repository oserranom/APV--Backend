import express from "express"; //Ojo para habilitar esta sintaxis se requiere "type": "module" en package.json
import dotenv from "dotenv"; //Dependencia para acceder a .env
import conectarDB from "./config/db.js";
import veterinarioRoutes from "./routes/veterinarioRoutes.js"; 
import pacienteRoutes from "./routes/pacienteRoutes.js"
import cors from "cors"; 


const app = express(); //se levanta express en la variable app

app.use(express.json()); //Instrucción necesaria para recibir data json con req.body

dotenv.config(); //Se leen las variables de entorno con dotenv

conectarDB(); //Se crea la conexión a la DB con esta function importada de ./config/db.js

//Permitiendo dominios que pueden enviar datos a url de backend con dependencia "cors"
//Ver doc de cors para entender configuración 
const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function(origin, callback){
        if(!origin || dominiosPermitidos.indexOf(origin) !== -1) {
            //El Origen del request está permitido 
            callback(null, true); 
        }else{
            callback(new Error("No permitido por CORS")); 
        }
    }
}

app.use(cors(corsOptions)); 


app.use('/api/veterinarios', veterinarioRoutes); 
app.use('/api/pacientes', pacienteRoutes); 

const PORT = process.env.PORT || 4000; 

app.listen(PORT, ()=>{
    console.log(`Servidor funcionando en el puerto ${PORT}`);
}); 