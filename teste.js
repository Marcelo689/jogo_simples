var listaPersonagens = [
    {
        nome : "alguem",
        id: 20,
        idade : 23,
    },{
        nome : "Maria",
        id: 44,
        idade : 11,
    },{
        nome : "Joao",
        id: 11,
        idade : 44,
    },
]

// var retorno = listaPersonagens.find( e => e.id == 11);
// console.log(retorno);
// console.log(listaPersonagens);


function criaCloneArray(listaPersonagens){
    if(listaPersonagens < 1)
        return;

    var chaves = Object.keys(listaPersonagens[0])

    var listaSaida = [];

    listaPersonagens.forEach( elemento => {
        var objetoCriado = {};
        chaves.forEach( chave => {
            var valor = elemento[chave];
            objetoCriado[chave]= valor;
        });
        listaSaida. push(objetoCriado);
    });

    return listaSaida;
}

console.log(criaCloneArray(listaPersonagens));