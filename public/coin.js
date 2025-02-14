const canvas = document.getElementById('canvas');
export let override = true;
export default class Coin {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.collected=false
        this.scale = getRandom(0.2, 0.4);
        this.sx = getRandom(-8, 8);
        this.sy = getRandom(-8, 8);
        this.width = width * this.scale;
        this.height = height * this.scale;
        this.img = new Image();
        this.img.src = "images/coin.png";
        this.markedForDeletion = false; // Flag to mark for removal
    }

    update() {
        if(!this.collected){
            if(!override){
                this.sy-=0.1;
            }else{
                this.sx+=0.02*(0-this.sx)
                this.sy+=0.02*(0-this.sy)
                if(Math.round(this.sx)==0){
                    if(Math.round(this.sy)==0){
                        if(!this.collected){
                            
                            this.collected=true
                            console.log(this.collected)
                        }
                    }
                }
            } 
        }else{
            this.sy++;

        }
        this.x += this.sx;
        this.y -= this.sy;


        // Remove the coin if it goes offscreen
        if (this.x + this.width < 0 || this.x > canvas.width || this.y > canvas.height || this.y + this.height < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        this.update();
        ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

function getRandom(min, max) {
    return Math.random() * (max - min + 1) + min;
}

// window.addEventListener('keydown', (event) => {
//     if (event.key === ' ') {
//         override=!override
//     }
// });