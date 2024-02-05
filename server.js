const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");

async function main(){

    const app = express();
    const server = createServer(app);
    const io = new Server(server);

    app.get("/", (req,res) => {
        res.sendFile(join(__dirname, "index.html"));
    });

    app.get("/personagens", (req,res) =>{
        res.sendFile(join(__dirname, "personagens.json"));
    })

    var listaPersonagens = pegarPersonagens();
    io.on("connection", async (socket) => {
        var usuarioId = socket.id;

        var numeroAleatorio = Math.random() * listaPersonagens.length;
        const personagem = listaPersonagens.splice(numeroAleatorio, 1)[0];
        socket.emit("loadChar", personagem);

    });

    const port = 3000;
    server.listen(port, () => {
        console.log('server running http://localhost:' + port);
    });
}

async function pegarPersonagens(){
    var caminho = "http://localhost:3000/personagens/";
    var retorno = await fetch(caminho)
        .then((response) => response.json())
        .then( (json) => json);

    return retorno.personages;
}

main();