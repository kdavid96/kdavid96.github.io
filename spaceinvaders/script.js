var state = "start";
var score = 0;
var shipPosition = 119;
var width = 14;
var direction = -1;
var jobbra = true;
const grid = document.getElementById("grid");
let aliensRemoved = [];
var backgroundMusic;
var laserSound;
var laserCollisionSound;
var heroDeathSound;
var alienMovement = 1;
var laserSoundTick = 0;
var speed = 0;
var gameResult = "";

var aliens = [
    3,4,5,6,7,8,9,10,
    17,18,19,20,21,22,23,24,
    31,32,33,34,35,36,37,38,
    45,46,47,48,49,50,51,52,
    59,60,61,62,63,64,65,66
];

function stateChange(st){
    state = st;
    if(st == "restart"){
        restart();
    }
    screenShow(state);
}

function getAliens(){
    return aliens;
}

function screenShow(st){
    if(st == "start" || st == "restart"){
        document.getElementById("start").style.display = 'block';
    }else{
        document.getElementById("start").style.display = 'none';
    }
    document.getElementById("won").style.display = st == "won" ? 'block' : 'none';
    document.getElementById("lost").style.display = st == "lost" ? 'block' : 'none';
    document.getElementById("game").style.display = st == "game" ? 'block' : 'none';
    document.getElementById("game-screen").style.display = st == "game" ? 'flex' : 'none';
}


window.onload = function() {
    stateChange(state);
    screenShow(state);
    loadLeaderboard();
}

function moveAliens(squares, aliens) {
    alienMovement += speed;
    const leftEdge = aliens[0] % width === 0;
    const rightEdge = aliens[aliens.length - 1] % width === width - 1;
    removeAliens(squares);
    
    if (rightEdge && jobbra) {
        for( let i = 0; i < aliens.length; i++){
            if(aliens[i] + width + alienMovement < rightEdge){
                aliens[i] += width + alienMovement; 
            }else{
            direction = 1;
            jobbra = false;
            for( let i = 0; i < aliens.length; i++){
                    aliens[i] += width + 1;
            }
            speed += 0.5;
            break;   
            }
        }
    }
    
    if (leftEdge && !jobbra) {
        for( let i = 0; i < aliens.length; i++){
            if(aliens[i] + width + alienMovement < leftEdge){
                aliens[i] += width + alienMovement; 
            }else{                        
                direction = -1;
                jobbra = true;
                for( let i = 0; i < aliens.length; i++){
                    aliens[i] += width - 1;
                }
                speed += 0.5;
                break;
            }
        }
    }
    
    for ( let i = 0; i < aliens.length; i++ ) {
        aliens[i] -= direction;
    }
    
    drawAliens(squares);

    if (squares[shipPosition].classList.contains('ship' && 'alien')){
        if(gameResult == ""){
            stateChange("lost");
            clearInterval(invadersId);
            if(score > 0){
                lost();
            }   
        }
    }

    for(let i = 0; i < squares.length; i++){
        if(aliens[i] > shipPosition){
            if(gameResult == ""){
                stateChange("lost");
                clearInterval(invadersId);
                if(score > 0){
                    lost();
                }   
            }
        }
    }

    var hajok = 0;
    for (let i = 0; i < squares.length; i++){
        if(squares[i].classList.contains('alien')){
            hajok++;
        }
    }

    if(!hajok){
        if(gameResult == ""){
            stateChange("won");
            clearInterval(invadersId);
            won();
        }
    }
}

function moveShip(e, squares){
    squares[shipPosition].classList.remove('ship');
    switch(e.key){
        case 'ArrowLeft':
            if (shipPosition % width !== 0) shipPosition -= 1;
            break;
        case 'ArrowRight':
            if (shipPosition % width < width - 1) shipPosition += 1;
            break;
    }
    squares[shipPosition].classList.add('ship');
}

function drawAliens(squares){
    for(let i = 0; i < aliens.length; i++){
        if(!aliensRemoved.includes(i)){
        squares[aliens[i]].classList.add('alien');
        }
    }
}

function removeAliens(squares){
    for(let i = 0; i < aliens.length; i++){
        squares[aliens[i]].classList.remove('alien');
    }
}

function drawShip(squares){
    squares[shipPosition].classList.add('ship');
}

function addLeaderboard() {
    if ( score != 0){
        var person = prompt("Adja meg a nevét:", "");
        switch(person){
        case '':
            loadLeaderboard();
            restart();
            break;
        case null:
            break;
            restart();
        default:
            localStorage.setItem(person, score);
            loadLeaderboard();
            restart();
        }
    }
}

function loadLeaderboard() {
    var data = [];

    for (let i = 0; i < localStorage.length; i++){
        data[i] = [localStorage.key(i), parseInt(localStorage.getItem(localStorage.key(i)))];
    }

    if(data.length == 0){
        var lista = document.getElementById("lista");
        lista.innerHTML = "";
        var nev = document.createElement('p');
        nev.appendChild(document.createTextNode("A lista még üres :)"));
        lista.appendChild(nev);
    }else{
        data.sort(function (a, b){
            return b[1] - a[1];
        });

        var i = 0;
        for (let act_data of data.keys()) {
            if(i < 5 && data[act_data][0] != "null"){
                var lista = document.getElementById("lista");
                var nev = document.createElement('li');
                nev.appendChild(document.createTextNode(data[act_data]));
                lista.appendChild(nev);
                i++;
            }
        }
    }
}

function shoot(e){
    laserSoundTick += 1;
    if(laserSoundTick%2 == 0){
        laserSound = new Audio("sounds/laser.wav");
        laserSound.play();
    }

    let laserId;
    let currentLaserIndex = shipPosition;
    function moveLaser() {
        try{
            if(typeof squares[currentLaserIndex] !== 'undefined'){
                squares[currentLaserIndex].classList.remove('laser');
                currentLaserIndex -= width;
                
                squares[currentLaserIndex].classList.add('laser');

                if(squares[currentLaserIndex].classList.contains('laser' && 'alien')){
                    squares[currentLaserIndex].classList.remove('alien');
                    squares[currentLaserIndex].classList.remove('laser');
                    squares[currentLaserIndex].classList.add('explosion');
                    score += 10 - speed;
                    document.getElementById('score').innerHTML = "";
                    $('#score').append("Pontszám: " + Number(score).toFixed(2));
                    setTimeout(()=> squares[currentLaserIndex].classList.remove('explosion'), 300);
                    clearInterval(laserId);
                }

                if(0 < currentLaserIndex > 14){
                    clearInterval(laserId);
                }

                const alienRemoved = aliens.indexOf(currentLaserIndex);
                aliensRemoved.push(alienRemoved);
            }
        }catch(e){}
    }

    switch(e.code){
        case 'Space':
            laserId = setInterval(moveLaser, 100);
    }
}

function game(){
    stateChange("game");
    backgroundMusic = new Audio("sounds/spaceinvaders1.mpeg");
    backgroundMusic.play();

    for(let i = 0; i < 126;i++){
        $('#game-screen').append("<div></div>");
    }
    
    squares = Array.from(document.querySelectorAll('[id="game-screen"] div'));
    
    if(aliens.length == 0){
        backgroundMusic.pause();
        stateChange("won");
        clearInterval(invadersId);
        won();
    }

    drawAliens(squares);
    
    drawShip(squares);

    invadersId = setInterval(function (){
        moveAliens(squares, aliens)
    }, 750);
    
    document.addEventListener('keydown', function(e,squares = Array.from(document.querySelectorAll('[id="game-screen"] div'))) {
        moveShip(e, squares);
    });

    document.addEventListener('keydown', shoot);
    
    $('#score').append("Pontszám: " + score);

    speed += 0.1;
}

function start(){
    stateChange("start");
    jobbra = true;
    aliens = []
    aliens.push(3,4,5,6,7,8,9,10,
        17,18,19,20,21,22,23,24,
        31,32,33,34,35,36,37,38,
        45,46,47,48,49,50,51,52,
        59,60,61,62,63,64,65,66
    );

    aliensRemoved = [];

    shipPosition = 119;
    score = 0;

    document.getElementById("game-screen").innerHTML="";
    document.getElementById("score").innerHTML="";

    for(let i = 0; i < 126;i++){
        $('#game-screen').append("<div></div>");
    }

    squares = Array.from(document.querySelectorAll('[id="game-screen"] div'));

    drawAliens(squares);

    game();
}

function restart(){
    backgroundMusic.play();
    jobbra = true;
    aliens = []
    aliens.push(3,4,5,6,7,8,9,10,
        17,18,19,20,21,22,23,24,
        31,32,33,34,35,36,37,38,
        45,46,47,48,49,50,51,52,
        59,60,61,62,63,64,65,66
    );

    aliensRemoved = [];

    shipPosition = 119;
    score = 0;

    document.getElementById("game-screen").innerHTML="";
    document.getElementById("score").innerHTML="";

    for(let i = 0; i < 126;i++){
        $('#game-screen').append("<div></div>");
    }

    squares = Array.from(document.querySelectorAll('[id="game-screen"] div'));

    drawAliens(squares);

    game();

}

function won(){
    aliensRemoved = [];
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    addLeaderboard();
}

function lost(){
    aliensRemoved = [];
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    addLeaderboard();
}