import { socket } from '../api/socket'
import { WINDOW_HEIGHT, WINDOW_WIDTH, player } from '../helpers/constants'


const WORLD_SIZE = { w: 800, h: 600 };
const bulletArray = [];
const otherPlayers = {};


export function preload() {

    this.load.setCORS('anonymous')
    this.load.image('player', 'https://img.icons8.com/office/40/000000/iron-man.png')
    this.load.image('enemy', 'https://img.icons8.com/office/48/000000/blackblood.png')
    this.load.image('bullet', 'https://img.icons8.com/color/48/000000/identity-disc.png');

}

export function create() {
    this.add.grid(0, 0, 1800, 1600, 40, 40, 0x0575a9);

    player.sprite = this.add.sprite(Math.random() * WORLD_SIZE.w / 2 + WORLD_SIZE.w / 2, Math.random() * WORLD_SIZE.h / 2 + WORLD_SIZE.h / 2, 'player');


    socket.emit('new-player', {
        x: player.sprite.x,
        y: player.sprite.y,
        angle: player.sprite.rotation,

    })

    socket.on('update-players', (players_data) => {
        const playersFound = {};

        for (let id in players_data) {

            if (otherPlayers[id] === undefined && id !== socket.id) {
                const data = players_data[id];
                const p = this.add.sprite(data.x, data.y, 'enemy');
                otherPlayers[id] = p;
                console.log("Created new player at (" + data.x + ", " + data.y + ")");
            }
            playersFound[id] = true;


            if (id !== socket.id) {
                otherPlayers[id].target_x = players_data[id].x;
                otherPlayers[id].target_y = players_data[id].y;
                otherPlayers[id].target_rotation = players_data[id].angle;
            }


        }

        for (let id in otherPlayers) {
            if (!playersFound[id]) {
                otherPlayers[id].destroy();
                delete otherPlayers[id];
            }
        }

    })

    socket.on('bullets-update', (server_bullet_array) => {

        for (let i = 0; i < server_bullet_array.length; i++) {
            if (bulletArray[i] === undefined) {
                bulletArray[i] = this.add.sprite(server_bullet_array[i].x, server_bullet_array[i].y, 'bullet');
            } else {

                bulletArray[i].x = server_bullet_array[i].x;
                bulletArray[i].y = server_bullet_array[i].y;
            }
        }

        for (let i = server_bullet_array.length; i < bulletArray.length; i++) {
            bulletArray[i].destroy();
            bulletArray.splice(i, 1);
            i--;
        }

    })
    socket.on('player-hit', (id) => {
        if (id === socket.id) {
            player.sprite.alpha = 0.5;
        } else {
            otherPlayers[id].alpha = 0.5;
        }
    })
}

export function update() {
    if (player.sprite.x > WINDOW_WIDTH) {
        player.sprite.x = WINDOW_WIDTH
    }
    if (player.sprite.x < 0) {
        player.sprite.x = 0
    }
    if (player.sprite.y > WINDOW_HEIGHT) {
        player.sprite.y = WINDOW_HEIGHT
    }
    if (player.sprite.y < 0) {
        player.sprite.y = 0
    }


    if (this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('UP').isDown) {
        player.sprite.y -= 2
        player.sprite.rotation = 1.5
        player.sprite.angle = 180

    }
    if (this.input.keyboard.addKey('S').isDown || this.input.keyboard.addKey('DOWN').isDown) {
        player.sprite.y += 2
        player.sprite.angle = 0
        player.sprite.rotation = 0

    }
    if (this.input.keyboard.addKey('A').isDown || this.input.keyboard.addKey('LEFT').isDown) {
        player.sprite.x -= 2
        player.sprite.angle = 90
        player.sprite.rotation = 1.57
    }
    if (this.input.keyboard.addKey('D').isDown || this.input.keyboard.addKey('RIGHT').isDown) {
        player.sprite.x += 2
        player.sprite.angle = -90
        player.sprite.rotation = -1.57

    }

    if (this.input.keyboard.addKey('SPACE').isDown && !this.shot) {
        const speed_x = Math.cos(player.sprite.rotation + Math.PI / 2) * 20;
        const speed_y = Math.sin(player.sprite.rotation + Math.PI / 2) * 20;
        this.shot = true;
        socket.emit('shoot-bullet', { x: player.sprite.x, y: player.sprite.y, angle: player.sprite.rotation, speed_x: speed_x, speed_y: speed_y })
    }
    if (!this.input.keyboard.addKey('SPACE').isDown) this.shot = false;

    socket.emit('move-player', { x: player.sprite.x, y: player.sprite.y, angle: player.sprite.rotation })

}


