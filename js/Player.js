class Player {
  constructor() {
    this.name= null;
    this.index= null;
    this.positionX= 0;
    this.positionY= 0;
    this.rank=0;
    this.score=0;
    this.fuel= 185;
    this.life= 185;
  }

  addPlayer(){
    var playerIndex= "players/player"+this.index;

    if(this.index==1){
      this.positionX= width/2-100;
    }
    else{
      this.positionX= width/2+100;
    }

    //atualiza o indice dos jogadores no banco de dados
    database.ref(playerIndex).set({
      name:this.name,
      positionX:this.positionX,
      positionY:this.positionY,
      rank:this.rank,
      score:this.score
    });
  }

  //obtendo os valores atualizados das posições dos jogadores do bd
  getDistance(){
    var playerDistanceRef= database.ref("players/player" + this.index);
    playerDistanceRef.on("value",data =>{
      var data= data.val();
      this.positionX= data.positionX;
      this.positionY= data.positionY;
    })
  }

  //função que lê a quantidade de jogadores
  getCount(){
    var playerCountRef= database.ref("playerCount");
    playerCountRef.on("value",data => {
      playerCount= data.val();
    });
  }

  //armazena a quntidade de jogadores de acordo com o banco de dados
  updateCount(count){
    database.ref("/").update({
      playerCount:count
    });
  }

  //metodo para atualizar a posição do jogador no bd
  update(){
    var playerIndex= "players/player" + this.index;
      database.ref(playerIndex).update({
        positionX: this.positionX,
        positionY: this.positionY,
        rank: this.rank,
        score: this.score,
        life: this.life
      });
  }

  //metodo para buscar as informações dos jogadores no banco de dados--static:função generalizada
  static getPlayersInfo(){
    var playerInfoRef= database.ref("players");
    playerInfoRef.on("value", data => {
      allPlayers= data.val();
    });
  }

  //metodo para ler o valor do nó: carsAtEnd do bd
  getCarsAtEnd(){
    database.ref("carsAtEnd").on("value", data => {
      this.rank= data.val();
    });
  }

  //metodo para atualizar o campo carsAtEnd com o número de carros que terminaram a corrida
  static updateCarsAtEnd(rank){
    database.ref("/").update({
      carsAtEnd: rank
    });
  }
}