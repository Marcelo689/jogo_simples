const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require("sqlite3");
const {open} = require("sqlite");

let numeroclientes = 0;
var listaIntocada;
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
        listaIntocada = [...listaPersonagens];
        var numeroAleatorio = Math.floor(Math.random() * listaPersonagens.length);
        const personagem =  listaPersonagens.splice( numeroAleatorio, 1)[0];
        
        socket.on("meu-nome", async (nome) => {
            socket.nome = nome; 
            socket.vida = 10000;
            players.push({ mySocket : socket, personagem: personagem })
            if(players.length  == 2){
                
                const jogador1 = players[0];
                jogador1.cardsMao = listaPersonagens;
                jogador1.mySocket.emit("loadChar", jogador1.mySocket.nome, jogador1.mySocket.vida, jogador1.personagem, jogador1.cardsMao);
                
                const jogador2 = players[1];
                jogador2.cardsMao = listaPersonagens;
                jogador2.mySocket.emit("loadChar", jogador2.mySocket.nome, jogador2.mySocket.vida, jogador2.personagem, jogador2.cardsMao);

                jogador2.mySocket.emit("loadOponent", jogador1.mySocket.vida, jogador1.personagem, jogador1.mySocket.nome);
                jogador1.mySocket.emit("loadOponent", jogador2.mySocket.vida, jogador2.personagem, jogador2.mySocket.nome);
            }
        });

        socket.on("batalhar", async (card1, card2) => {
            
            var uid1 = card1.uid;
            var personagemEncontrado1 = listaIntocada.find( e => e.uid == uid1);

            var uid2 = card2.uid;
            var personagemEncontrado2 = listaIntocada.find( e => e.uid == uid2);

            const jogador1 = players[0];
            const jogador2 = players[1];

            if(personagemEncontrado1.alive == false){
                jogador1.mySocket.emit("escolherNovoCard", "selecione um novo card!");
            }

            if(personagemEncontrado2.alive == false){
                jogador2.mySocket.emit("escolherNovoCard", "selecione um novo card!");
            }

            if(personagemEncontrado2.alive == false || personagemEncontrado1.alive == false){
                return;
            }

            calculateDamage(jogador1,jogador2, personagemEncontrado1, personagemEncontrado2);
            
            card2 = personagemEncontrado2;
            card1 = personagemEncontrado1;

            jogador1.mySocket.emit("reloadBoard", personagemEncontrado2, jogador2.mySocket.vida, personagemEncontrado1, jogador1.mySocket.vida);
            jogador2.mySocket.emit("reloadBoard", personagemEncontrado1, jogador1.mySocket.vida, personagemEncontrado2, jogador2.mySocket.vida);
        });

        socket.on("reloadPlayers", (card1, card2) => {  
            var uid1 = card1.uid;
            var personagemEncontrado1 = listaIntocada.find( e => e.uid == uid1);

            var uid2 = card2.uid;
            var personagemEncontrado2 = listaIntocada.find( e => e.uid == uid2);

            const jogador1 = players[0];
            const jogador2 = players[1];

            jogador1.mySocket.emit("reloadBoard", personagemEncontrado2, jogador2.mySocket.vida, personagemEncontrado1, jogador1.mySocket.vida);
            jogador2.mySocket.emit("reloadBoard", personagemEncontrado1, jogador1.mySocket.vida, personagemEncontrado2, jogador2.mySocket.vida);
        })
        
    });

    const port = 3000;
    server.listen(port, () => {
        console.log('server running http://localhost:' + port);
    });
}

function calculateDamage(jogador1, jogador2, personagemEncontrado1, personagemEncontrado2){
    personagemEncontrado2.defense = personagemEncontrado2.defense - personagemEncontrado1.attack;
    personagemEncontrado1.defense = personagemEncontrado1.defense - personagemEncontrado2.attack;

    if(personagemEncontrado1.defense < 0){
        personagemEncontrado1.alive = false;
        jogador1.mySocket.vida += personagemEncontrado1.defense;
    }
    
    if(personagemEncontrado2.defense < 0){
        personagemEncontrado2.alive = false;
        jogador2.mySocket.vida += personagemEncontrado2.defense;
    }

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