class Game {
  constructor() {
    //criando o botão
    this.resetTitle= createElement("h2");
    this.resetButton= createButton("");
    //criando o placar
    this.leadboardTitle= createElement("h2");
    this.leader1= createElement("h2");
    this.leader2= createElement("h2");
    //verificando o movimento do jogador-incialmente começa parado
    this.playerMoving= false;
    //metodo auxiliar para movimento do carro
    this.leftKeyActive= false;
    //verifica status da explosão: iniciamos como false
    this.blast= false;
  }

  //função que lê o estado do jogo do banco de dados
  getState(){
    var gameStateRef= database.ref("gameState");
    gameStateRef.on("value",function(data){
      gameState=data.val();
    });
  }

  //atualiza o gameState
  update(state){
    database.ref("/").update({
      gameState:state
    });
  }

  start() {
    player = new Player();
    playerCount= player.getCount();

    form = new Form();
    form.display();

    //criando os sprites dos carros
    car1=createSprite(width/2-50,height-100);
    car1.addImage(car1_img);
    car1.scale= 0.07;
    car1.addImage("blast", blastImage);

    car2=createSprite(width/2+100,height-100);
    car2.addImage(car2_img);
    car2.scale= 0.07;
    car2.addImage("blast", blastImage);

    cars=[car1,car2];

    //criando os grupos das recompenças
    fuels= new Group();
    powerCoins= new Group();
    obstacles= new Group();

    //matriz de posições fixas para os obstaculos: garantindo um padrão para os dois jogadores
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    //adicionar sprite de combustivel no jogo
    this.addSprites(fuels,4,fuel,0.02);

    //adicionar sprite de moeda no jogo
    this.addSprites(powerCoins,18,powerCoin,0.09);

    //adicionar sprites de obstaculos
    this.addSprites(obstacles,obstaclesPositions.length,obstacle1Image,0.04,obstaclesPositions);
  }

  //metodo comum para criar as recompenças
  addSprites(spriteGroup,numberOfSprites,spriteImage,scale,positions=[]){
    for(var i=0; i<numberOfSprites; i++){
      var x,y;

      //verifica o comprimento de positions e atribui as imagens(condição dos obstaculos)
      if(positions.length>0){
        x= positions[i].x;
        y= positions[i].y;
        spriteImage= positions[i].image;
      } else{//condição para as recompenças
        x= random(width/2+150,width/2-150);
        y= random(-height*4.5,height-400);
      }
    
      var sprite= createSprite(x,y);
      sprite.addImage("sprite",spriteImage);

      sprite.scale=scale;
      spriteGroup.add(sprite);
    }
  }
  
  //metodo para aparecer a pista:retirar o formulario e depois add a pista
  handleElements(){
    form.hide();
    form.titleImg.position(40,50);
    form.titleImg.class("gameTitleAfterEffect");

    //tornando o botão e o titulo visiveis, ou seja, elementos HTML
    this.resetTitle.html("Reiniciar jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2+200,100);

    this.resetButton.class("resetButton");
    this.resetButton.position(width/2+230,60);

    //tornando o placar visivel
    this.leadboardTitle.html("Placar");
    this.leadboardTitle.class("resetText");
    this.leadboardTitle.position(width/3-60,40);

    this.leader1.class("leadersText");
    this.leader1.position(width/3-50,80);
    this.leader2.class("leadersText");
    this.leader2.position(width/3-50,130);
  }

  //metodo para chamar o inicio do jogo
  play(){
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if(allPlayers !== undefined){
      image(track,0,-height*5,width,height*6);

      this.showLife();
      this.showFuelBar();
      this.showLeaderboard();

      //loopfor para dar posição a cada carro
      var index=0;
      for(var plr in allPlayers){//for-in: extrai informações do objeto allPlayers
        index+= 1;//atualiza o indice dos jogadores
        var x= allPlayers[plr].positionX;
        var y= height-allPlayers[plr].positionY;

        //salvar o valor de player.life na variavel currentLife, para analisar as vidas
        var currentLife= allPlayers[plr].life;

        if(currentLife<=0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale= 0.3;
        }

        cars[index-1].position.x=x;
        cars[index-1].position.y=y;

        //marcando o jogador
        if(index== player.index){
          stroke(10);//stroke dá largura a borda
          fill("red");
          ellipse(x,y,60,60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleCarACollisionWithCarB(index);
          this.handleObstacleCollision(index);

          //desativa o movimento se player.life for 0
          if(player.life<=0){
            this.blast=true;
            this.playerMoving= false;
          }

          //camera de jogo na direção Y
          camera.position.x= cars[index-1].position.x;
          camera.position.y= cars[index-1].position.y;
        }

      }

      //if(this.playerMoving){
      // player.positionY+=5;
      //  player.update();
      //}

      this.handlePlayerControls();

      //criando a linha de chegada
      const finishLine= height*6-100;
      if(player.positionY>finishLine){
        gameState=2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }

  }

  //função para a lógica do vencedor e exibi-lo na tela
  showLeaderboard(){
    var leader1,leader2;
    var players= Object.values(allPlayers);

    //primeria condição: verifica se o jogador 1 tem a classificação 1
    if(players[0].rank==0 && players[1].rank==0 || players[0].rank==1){
      //&emsp;= uma etiqueta que exibe quatro espaços em HTML
      leader1= players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader2= players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }
    //segunda condição: jogador 2 tem a classificação 1
    if(players[1].rank==1){
      leader1= players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
      leader2= players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
    }
    //passando leader1 e leader2 para HTML para ser exibido na tela
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  //metodo para resetar o banco de dados
  handleResetButton(){
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        carsAtEnd:0,
        playerCount:0,
        gameState:0,
        players:{}
      });
      //função que recarrega a tela
      window.location.reload();
    });
  }

  //função para exibir a barra de progresso para a vida
  showLife(){
    push();
    image(lifeImage,width/2-130,height-player.positionY-350,20,20);
    fill("white");
    rect(width/2-100,height-player.positionY-350,185,20);
    fill("#f50057");
    rect(width/2-100,height-player.positionY-350,player.life,20);
    pop();
  }

  //função para exibir a barra de progresso para o combustivel
  showFuelBar(){
    push();
    image(fuel,width/2-130,height-player.positionY-300,20,20);
    fill("white");
    rect(width/2-100,height-player.positionY-300,185,20);
    fill("#ffc400");
    rect(width/2-100,height-player.positionY-300,player.fuel,20);
    pop();
  }  

  //função para controlar os jogadores
  handlePlayerControls(){
    //condição para mover os jogadore se NÃO HAVER COLISÃO
    if(!this.blast){
      if(keyIsDown(UP_ARROW)){
        this.playerMoving= true;
        player.positionY+=10;
        player.update();
      }
      //movimento pra a esquerda && limitando para não sair da tela
      if(keyIsDown(LEFT_ARROW) && player.positionX>width/2-330){
        this.leftKeyActive= true;
        player.positionX-= 5;
        player.update();
      }
      //movimento pra a direita && limitando para não sair da tela
      if(keyIsDown(RIGHT_ARROW) && player.positionX<width/2+300){
        this.leftKeyActive= false;
        player.positionX+= 5;
        player.update();
      }
    }
  }

  //metodo para coletar a gasolina
  handleFuel(index){
    cars[index-1].overlap(fuels,function(collector,collected){
      player.fuel=185;
      //o sprite é coletado no grupo de combsutiveis
      collected.remove();
    });

    //reduzindo o combustivel do carro
    if(player.fuel>0 && this.playerMoving){
      player.fuel -= 0.3;
    }

    //condição para alterar o gamestate se o combustivel acabar
    if(player.fuel<=0){
      gameState= 2;
      this.gameOver();
    }
  }

  //metodo para coletar as moedas
   handlePowerCoins(index){
    cars[index-1].overlap(powerCoins,function(collector,collected){
      player.score+=5;
      //o sprite é coletado no grupo das moedas
      collected.remove();
    });
  }

  //função para lidar com a colisão
  handleObstacleCollision(index){
    if(cars[index-1].collide(obstacles)){
      if(this.leftKeyActive){
        player.positionX+= 100;
      } else{
        player.positionX-= 100;
      }

      if(player.life>0){
        player.life-= 185/4;
      }
      player.update();
    }
  }

  //função para analisar a colisão entre os carros
  handleCarACollisionWithCarB(index){
    if(index==1){
      //verifica se o carro[0] colide carro[1]
      if(cars[index-1].collide(cars[1])){
        if(this.leftKeyActive){
          player.positionX+= 100;
        } else{
          player.positionX-= 100;
        }
  
        if(player.life>0){
          player.life-= 185/4;
        }
        player.update();
      }
    }

    if(index==2){
      //verifica se o carro[1] colide com o carro[0]
      if(cars[index-1].collide(cars[0])){
        if(this.leftKeyActive){
          player.positionX+= 100;
        } else{
          player.positionX-= 100;
        }
  
        if(player.life>0){
          player.life-= 185/4;
        }
        player.update();
      }
    }
  }

  //função usando sweetAlert para informar a classificação
  showRank() {
    swal({
      //title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      title: `Incrível!${"\n"}${player.rank}º lugar`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Oops você perdeu a corrida!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }
}