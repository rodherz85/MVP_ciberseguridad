const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    edad: {
        type: Number,
        required: true,
        min: 18,
        max: 99
    },
    genero: {
        type: String,
        enum: ["mujer", "hombre", "otro"],
        required: true
    },
    experiencia: {  
        type: String,
        enum: ["alto", "medio", "bajo"],
        required: true
    },
        
    consentimiento: {type: Boolean, default: false},
    fechaInicio: {type: Date, default: Date.now},
        fechaFin: Date,

        pretest: {
            respuestas: Object
        },

        simulador: {
    
            estadoAsunto: {type: String, default: "no_visto"},
            estadoRemitente: {type: String, default: "no_visto"},
            estadoSoporte: {type: String, default: "no_visto"},
            estadoSaludo: {type: String, default: "no_visto"},
            estadoOrtografia: {type: String, default: "no_visto"},
            estadoUrgencia: {type: String, default: "no_visto"},
            estadoBoton: {type: String, default: "no_visto"},
            estadoFooter: {type: String, default: "no_visto"},

            puntajeTotal: {
                type: Number, 
                default: 0
            }

        },

        posttest: {
            respuestas: Object
        },

        encuestaSatisfaccion: {
            interes: String,
            utilidad: String,
            claridadRetro: String,
            satisfaccion: String    
        },
            
        
}); 

module.exports = mongoose.model("Usuario", usuarioSchema);