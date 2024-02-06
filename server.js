const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");

let numeroclientes = 0;
var players = [];
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

    io.on("connection", async (socket) => {
        var usuarioId = socket.id;
        var listaPersonagens = await pegarPersonagens();
        var numeroAleatorio = Math.floor(Math.random() * listaPersonagens.length);
        const personagem =  listaPersonagens.splice( numeroAleatorio, 1)[0];
        
        socket.on("meu-nome", async (nome) => {
            socket.nome = nome; 
            players.push({ mySocket : socket, personagem: personagem })
            if(players.length  == 2){
                const jogador1 = players[0];
                jogador1.mySocket.emit("loadChar", jogador1.mySocket.nome, jogador1.personagem);
                const jogador2 =players[1];
                jogador2.mySocket.emit("loadChar", jogador2.mySocket.nome, jogador2.personagem);

                jogador2.mySocket.emit("loadOponent", jogador1.mySocket.nome, jogador1.personagem, jogador1.mySocket.nome);
                jogador1.mySocket.emit("loadOponent", jogador2.mySocket.nome, jogador2.personagem, jogador2.mySocket.nome);
            }
        });

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

function pegarNumeroDeJogadores(io){
    const numJogadores = Object.keys(io.sockets.sockets).length;
    return numJogadores;
}


main();