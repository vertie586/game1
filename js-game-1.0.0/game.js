'use strict';

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if ((vector instanceof Vector)) {
            return new Vector(this.x + vector.x, this.y  + vector.y);
        }
        throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }

    times(n) {
        return new Vector(this.x * n, this.y * n);
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if ((pos instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector)) {
            this.pos = pos;
            this.size = size;
            this.speed = speed;
        } else {
            throw new Error('не Vector');
        }
    }

    act() {}

    get left() {
        return this.pos.x;
    }

    get top() {
        return this.pos.y;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get bottom() {
        return this.pos.y + this.size.y;
    }

    get type() {
        return 'actor';
    }

    isIntersect(actor) {
        if (actor instanceof Actor) {
            if (this.pos === actor.pos) {
                return false;
            }
            if ((this.left < actor.right) && (this.right > actor.left) && (this.top < actor.bottom) && (this.bottom > actor.top)) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('argument is not an Actor');
        }
    }
}

class Player extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super();
        this.pos.x = pos.x;
        this.pos.y = pos.y - 0.5;
        this.size = new Vector(0.8, 1.5);
        this.speed = new Vector(0, 0);
    }

    get type() {
        return 'player';
    }
}

class Level {
    constructor(grid , actors) {
        this.grid = grid;
        this.actors = actors;
        if ((grid === undefined)||(grid.length === 0)) {
            this.height = 0 ;
            this.width = 0 ;
        } else {
            if (grid[0] === undefined) {
                this.width = 1;
                this.height = grid.length
            } else {
                this.height = grid.length;
                let arrHelp = grid.slice();
                arrHelp.sort(function (a, b) {
                    return (b.length - a.length)
                });
                this.width = arrHelp[0].length;
            }
        }
        this.status = null;
        this.finishDelay = 1;
    }

    get player() {
        for (let actor of this.actors) {
            if (actor.type == 'player') {
                return actor;
            }
        }
    }

    isFinished() {
        if ((this.status !== null) && (this.finishDelay < 0)) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(act){
        if(this.actors == undefined) {
            return undefined;
        }
        for (let i = 0; i < this.actors.length; i++) {
            if (this.actors[i].isIntersect(act)) {
                return this.actors[i]
            }
        }
    }

    obstacleAt(position, size) {
        if ((position instanceof Vector) && (size instanceof Vector)) {
            let lev = new Level(this.grid)
            let left = Math.floor(position.x);
            let right = Math.ceil(position.x + size.x);
            let top = Math.floor(position.y);
            let bottom = Math.ceil(position.y + size.y);

            if (left < 0) {
                return 'wall';
            }
            if (right > lev.width) {
                return 'wall';
            }
            if (top < 0) {
                return 'wall';
            }
            if (bottom > lev.height) {
                return 'lava';
            }

            for (let i = left; i < right; i++) {
                for (let j = top; j < bottom; j++) {
                    if (lev.grid[j][i]) {
                        return lev.grid[j][i]
                    }
                }
            }
        } else {
            throw 'один из аргументов не Vector';
        }
    }

    removeActor(actor) {
        let index = this.actors.indexOf(actor);
        this.actors.splice(index,1);
    }

    noMoreActors(type) {
        let arrTypes = [];
        if (this.actors == undefined) {
            return true;
        }
        for(let act of this.actors) {
            arrTypes.push(act.type)
        }
        if (arrTypes.indexOf(type)) {
            return true;
        } else {
            return false;
        }
    }

    playerTouched(obstacle, coin) {
        if (this.status != null) {
        } else {
            if ((obstacle == 'lava') || (obstacle == 'fireball')) {
                this.status = 'lost'
                return;
            }
            if ((obstacle == 'coin') && (coin.type == 'coin')) {
                let arrOfTypes = [];
                let index = this.actors.indexOf(coin);
                this.actors.splice(index,1);

                if (this.noMoreActors(obstacle)) {
                    this.status = 'won'
                }
            }
        }
    }
}

class LevelParser {
    constructor(object) {
        this.object = object;
    }
    actorFromSymbol(symb) {
        if (symb == undefined) {
            return undefined;
        }
        if (symb in this.object) {

            return  this.object[symb];

        } else {
            return undefined;
        }
    }
    obstacleFromSymbol(symbol) {
        let objects = this.object
        if (symbol == 'x'){
            return 'wall';
        } else if (symbol == '!'){
            return 'lava';
        } else if (symbol == undefined){
            return undefined;
        }
        for(let sym in objects) {
            if (sym == symbol) {
                return (new this.object[symbol]).type ;
            }
        }
    }
    createGrid(plan) {
        let arr = []
        for (var col of plan) {
            let elem = col.split('')
            for (var i = 0; i< elem.length; i++) {
                if (elem[i] === 'x') {
                    elem.splice(i,1,'wall');
                } else if (elem[i] === '!') {
                    elem.splice(i,1,'lava');
                }
                else if (elem[i] === ' ') {
                    elem.splice(i,1,undefined);
                } else if ( elem[i] === undefined) {
                    elem.splice(i,1,undefined);
                } else if((this.object !== undefined) ) {
                    elem.splice(i,1,undefined);
                } else {
                    elem.splice(i,1,undefined);
                }
            }
            arr.push(elem)
        }
        return arr;
    }

    createActors(plan) {
        if (this.object == undefined) {
            return []
        }
        if (plan.length == 0) {
            return [];
        }
        let arr = [];
        let arrActors = [];
        for (let col of plan) {
            let elem = col.split('');
            arr.push(elem);
        }
        for (var j = 0; j < plan[0].length; j++) {
            for (var i = 0; i < arr.length; i++) {
                if ( (arr[i][j] in this.object) && (typeof  this.object[arr[i][j]] == 'function') && ( new this.object[arr[i][j]] instanceof Actor)) {
                    arrActors.push(new this.object[arr[i][j]](new Vector(j, i)))
                }
            }
        }
        return arrActors;
    }

    parse(plan) {
        return new Level(this.createGrid(plan),this.createActors(plan))
    }
}


class Fireball extends Actor {
    constructor(pos,speed) {
        super(pos);
        this.speed = speed;
        this.size = new Vector(1, 1);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
    }

    handleObstacle() {
        this.speed.x = this.speed.x*(-1);
        this.speed.y = this.speed.y*(-1);
    }

    act(time, level) {
        let nextPos = this.getNextPosition(time);
        let obstacle = level.obstacleAt(nextPos, this.size)
        if (obstacle) {
            //console.log(obstacle)
            this.handleObstacle()
        } else {
            // console.log('не врезался')
            this.pos = this.getNextPosition(time);
        }
    }
}

class HorizontalFireball extends Fireball{
    constructor(pos) {
        super(pos);
        this.speed = new Vector(2, 0);
        this.size = new Vector(1, 1);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos);
        this.speed = new Vector(0, 2);
        this.size = new Vector(1, 1);
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos);
        this.speed = new Vector(0, 3);
        this.size = new Vector(1, 1);
        this.firstPos = pos;
    }

    handleObstacle() {
        this.pos = this.firstPos;
    }
}


class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {

        super();
        this.size = new Vector(0.6, 0.6);
        this.pos.x = pos.x + 0.2;
        this.pos.y = pos.y + 0.1;
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random(0, 2 * Math.PI);
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        let newSpringVec = this.getSpringVector();
        //console.log(newSpringVec)
        this.pos.y = this.pos.y + newSpringVec.y
        return new Vector(this.pos.x ,  this.pos.y + newSpringVec.y)
    }

    act(time) {
        this.getNextPosition(time)
    }
}
const schemas = [
    [
        '         ',
        '         ',
        '         ',
        '        o',
        '     !xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));
