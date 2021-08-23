import Phaser from 'phaser'
import { socket } from '../api/socket'
import { WINDOW_HEIGHT, WINDOW_WIDTH, player } from '../helpers/constants'

class playGame extends Phaser.Scene {
    constructor() {
        super("Playgame");
        this.WORLD_SIZE = { w: 800, h: 600 };
        this.ASSET_URL = '../assets/';
        this.fighters = [];
        this.bulletArray = [];
        this.otherPlayers = {};
        this.player = player;

    }



    preload() {

        // this.load.crossOrigin = "Anonymous";

        this.load.image('player', '/assets/player1.png')

        // this.load.image('player', this.ASSET_URL + `player1.png`);
        this.load.image('bullet', '/assets/cannon_ball.png');
        this.load.image('water', '/assets/water_tile.png');
    }
    create() {
        // for (let i = 0; i <= this.WORLD_SIZE.w / 64 + 1; i++) {
        //     for (let j = 0; j <= this.WORLD_SIZE.h / 64 + 1; j++) {
        //         let tileSprite = this.add.sprite(i * 64, j * 64, 'water');

        //         tileSprite.alpha = 0.5;
        //         this.fighters.push(tileSprite);
        //     }
        // }
        // this.stage.backgroundColor = "#4488AA";
        this.add.image('player');

        this.player.sprite = this.add.sprite(Math.random() * this.WORLD_SIZE.w / 2 + this.WORLD_SIZE.w / 2, Math.random() * this.WORLD_SIZE.h / 2 + this.WORLD_SIZE.h / 2, 'player');

        socket.emit('new-player', {
            x: this.player.sprite.x,
            y: this.player.sprite.y,
            angle: this.player.sprite.rotation,
            type: 1
        })

        socket.on('update-players', (players_data) => {
            const players_found = {};

            for (let id in players_data) {

                if (this.otherPlayers[id] === undefined && id !== socket.id) {
                    const data = players_data[id];
                    const p = this.createCharacter(data.type, data.x, data.y, data.angle);
                    this.otherPlayers[id] = p;
                    console.log("Created new player at (" + data.x + ", " + data.y + ")");
                }
                players_found[id] = true;


                if (id !== socket.id) {
                    this.otherPlayers[id].target_x = players_data[id].x;
                    this.otherPlayers[id].target_y = players_data[id].y;
                    this.otherPlayers[id].target_rotation = players_data[id].angle;
                }


            }

            for (let id in this.otherPlayers) {
                if (!players_found[id]) {
                    this.otherPlayers[id].destroy();
                    delete this.otherPlayers[id];
                }
            }

        })

        socket.on('bullets-update', (server_bullet_array) => {

            for (let i = 0; i < server_bullet_array.length; i++) {
                if (this.bulletArray[i] === undefined) {
                    this.bulletArray[i] = this.add.sprite(server_bullet_array[i].x, server_bullet_array[i].y, 'bullet');
                } else {

                    this.bulletArray[i].x = server_bullet_array[i].x;
                    this.bulletArray[i].y = server_bullet_array[i].y;
                }
            }

            for (let i = server_bullet_array.length; i < this.bulletArray.length; i++) {
                this.bulletArray[i].destroy();
                this.bulletArray.splice(i, 1);
                i--;
            }

        })
        socket.on('player-hit', (id) => {
            if (id === socket.id) {
                this.player.sprite.alpha = 0;
            } else {
                this.otherPlayers[id].alpha = 0;
            }
        })
    }

    update() {
        if (this.player.sprite.x > WINDOW_WIDTH) {
            this.player.sprite.x = WINDOW_WIDTH
        }
        if (this.player.sprite.x < 0) {
            this.player.sprite.x = 0
        }
        if (this.player.sprite.y > WINDOW_HEIGHT) {
            this.player.sprite.y = WINDOW_HEIGHT
        }
        if (this.player.sprite.y < 0) {
            this.player.sprite.y = 0
        }


        if (this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('UP').isDown) {
            this.player.sprite.y -= 2
            this.player.sprite.rotation = 1.5
            this.player.sprite.angle = 180

        }
        if (this.input.keyboard.addKey('S').isDown || this.input.keyboard.addKey('DOWN').isDown) {
            this.player.sprite.y += 2
            this.player.sprite.angle = 0
            this.player.sprite.rotation = 0

        }
        if (this.input.keyboard.addKey('A').isDown || this.input.keyboard.addKey('LEFT').isDown) {
            this.player.sprite.x -= 2
            this.player.sprite.angle = 90
            this.player.sprite.rotation = 1.57
        }
        if (this.input.keyboard.addKey('D').isDown || this.input.keyboard.addKey('RIGHT').isDown) {
            this.player.sprite.x += 2
            this.player.sprite.angle = -90
            this.player.sprite.rotation = -1.57

        }

        if (this.input.keyboard.addKey('SPACE').isDown && !this.shot) {
            const speed_x = Math.cos(this.player.sprite.rotation + Math.PI / 2) * 20;
            const speed_y = Math.sin(this.player.sprite.rotation + Math.PI / 2) * 20;
            this.shot = true;
            socket.emit('shoot-bullet', { x: this.player.sprite.x, y: this.player.sprite.y, angle: this.player.sprite.rotation, speed_x: speed_x, speed_y: speed_y })
        }
        if (!this.input.keyboard.addKey('SPACE').isDown) this.shot = false;

        socket.emit('move-player', { x: this.player.sprite.x, y: this.player.sprite.y, angle: this.player.sprite.rotation })

    }
    createCharacter(type, x, y, angle) {
        const sprite = this.add.sprite(x, y, 'player');
        sprite.rotation = angle;
        return sprite;
    }
}

export default playGame


