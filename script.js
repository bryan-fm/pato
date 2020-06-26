(function() { "use strict";

  /* Each sprite sheet tile is 16x16 pixels in dimension. */

  const SPRITE_SIZE = 16;


  var Animation = function(frame_set, delay) {

    this.count = 0;// Counts the number of game cycles since the last frame change.

    this.delay = delay;// The number of game cycles to wait until the next frame change.

    this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.

    this.frame_index = 0;// The frame's index in the current animation frame set.

    this.frame_set = frame_set;// The current animation frame set that holds sprite tile values.

  };

  Animation.prototype = {


    change:function(frame_set, delay = 15) {

      if (this.frame_set != frame_set) {// If the frame set is different:



        this.count = 0;// Reset the count.

        this.delay = delay;// Set the delay.

        this.frame_index = 0;// Start at the first frame in the new frame set.

        this.frame_set = frame_set;// Set the new frame set.

        this.frame = this.frame_set[this.frame_index];// Set the new frame value.
      }

    },



    /* Call this on each game cycle. */

    update:function() {

      this.count ++;// Keep track of how many cycles have passed since the last frame change.

      if (this.count >= this.delay) {// If enough cycles have passed, we change the frame.

        this.count = 0;// Reset the count.

        /* If the frame index is on the last value in the frame set, reset to 0.

        If the frame index is not on the last value, just add 1 to it. */

        this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;

        this.frame = this.frame_set[this.frame_index];// Change the current frame value.
      }
    }
  };



  var buffer, controller, display, loop, player, render, resize, sprite_sheet, quack;
  buffer = document.createElement("canvas").getContext("2d");
  display = document.querySelector("canvas").getContext("2d");


  /* I made some changes to the controller object. */
  controller = {

    /* Now each key object knows its physical state as well as its active state.

    When a key is active it is used in the game logic, but its physical state is

    always recorded and never altered for reference. */

    left:  { active:false, state:false },

    right: { active:false, state:false },

    up:    { active:false, state:false },

    space:   { active:false, state:false },

    keyUpDown:function(event) {

      /* Get the physical state of the key being pressed. true = down false = up*/

      var key_state = (event.type == "keydown") ? true : false;
      switch(event.keyCode) {

        case 37:// left key

          if (controller.left.state != key_state) controller.left.active = key_state;

          controller.left.state  = key_state;// Always update the physical state.

        break;

        case 38:// up key

          if (controller.up.state != key_state) controller.up.active = key_state;

          controller.up.state  = key_state;

        break;

        case 39:// right key

          if (controller.right.state != key_state) controller.right.active = key_state;

          controller.right.state  = key_state;

        break;

        case 32:// space
        
            if (controller.space.state != key_state) controller.space.active = key_state;

            controller.space.state  = key_state;

        break;

        }


      //console.log("left:  " + controller.left.state + ", " + controller.left.active + "\nright: " + controller.right.state + ", " + controller.right.active + "\nup:    " + controller.up.state + ", " + controller.up.active);

    }

  };


  player = {

    animation:new Animation(),// You don't need to setup Animation right away.

    jumping:true,

    height:16,    width:16,

    x:0,          y:40 - 18,

    x_velocity:0, y_velocity:0

  };

  window.setInterval(function () {
    var a = Math.floor(Math.random() * 11);
    if(a == 1)
    {
      controller.right.active = true;
      controller.left.active = false;
      controller.space.active = false;
      controller.up.active = false;
    }
    else if (a == 0)
    {
      controller.left.active = true;
      controller.right.active = false;
      controller.space.active = false;
      controller.up.active = false;
    }

    else if (a == 2) {
      controller.up.active = true;
      controller.space.active = false;
      controller.left.active = false;
      controller.right.active = false;
    }

    else if (a == 3)
    {
      playMp3();
      controller.space.active = true;
      controller.left.active = false;
      controller.right.active = false;
      controller.up.active = false;
    }

    else{
      controller.space.active = false;
      controller.left.active = false;
      controller.right.active = false;
      controller.up.active = false;
    }
  }, 1000);


  sprite_sheet = {

    frame_sets:[[0, 1], [2, 3], [4, 5], [6]],// standing still, walk right, walk left

    image:new Image()

  };


  loop = function(time_stamp) {

    if (controller.up.active && !player.jumping) {

      controller.up.active = false;

      player.jumping = true;

      player.y_velocity -= 2.5;

    }

    if (controller.left.active) {

      player.animation.change(sprite_sheet.frame_sets[2], 15);

      player.x_velocity -= 0.02;

    }

    if (controller.right.active) {

      player.animation.change(sprite_sheet.frame_sets[1], 15);

      player.x_velocity += 0.02;

    }

    if (controller.space.active) {

      player.animation.change(sprite_sheet.frame_sets[3], 15);
  
      }


    if (!controller.left.active && !controller.right.active && !controller.space.active) {

      player.animation.change(sprite_sheet.frame_sets[0], 20);

    }



    player.y_velocity += 0.25;



    player.x += player.x_velocity;

    player.y += player.y_velocity;

    player.x_velocity *= 0.9;

    player.y_velocity *= 0.9;



    if (player.y + player.height > buffer.canvas.height - 2) {



      player.jumping = false;

      player.y = buffer.canvas.height - 2 - player.height;

      player.y_velocity = 0;



    }



    if (player.x + player.width < 0) {



      player.x = buffer.canvas.width;



    } else if (player.x > buffer.canvas.width) {



      player.x = - player.width;



    }



    player.animation.update();



    render();



    window.requestAnimationFrame(loop);



  };



  render = function() {



    /* Draw the background. */

    buffer.fillStyle = "#7ec0ff";

    buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

    buffer.strokeStyle = "#8ed0ff";

    buffer.lineWidth = 10;

    buffer.beginPath();

    buffer.moveTo(0, 0);

    buffer.bezierCurveTo(40, 20, 40, 0, 80, 0);

    buffer.moveTo(0, 0);

    buffer.bezierCurveTo(40, 20, 40, 20, 80, 0);

    buffer.stroke();

    buffer.fillStyle = "#009900";

    buffer.fillRect(0, 36, buffer.canvas.width, 4);


    /* 02/07/2018 I added Math.floor to the player's x and y positions to eliminate

    antialiasing issues. Take out the Math.floor to see what I mean. */

    buffer.drawImage(sprite_sheet.image, player.animation.frame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, Math.floor(player.x), Math.floor(player.y), SPRITE_SIZE, SPRITE_SIZE);



    display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);



  };



  resize = function() {



    display.canvas.width = document.documentElement.clientWidth - 100;



    display.canvas.height = display.canvas.width * 0.4;



    display.imageSmoothingEnabled = false;



  };



      ////////////////////

    //// INITIALIZE ////

  ////////////////////



  buffer.canvas.width = 80;

  buffer.canvas.height = 40;



  window.addEventListener("resize", resize);



  window.addEventListener("keydown", controller.keyUpDown);

  window.addEventListener("keyup", controller.keyUpDown);



  resize();



  sprite_sheet.image.addEventListener("load", function(event) {// When the load event fires, do this:



    window.requestAnimationFrame(loop);// Start the game loop.



  });



  sprite_sheet.image.src = "animation.png";// Start loading the image.



})();

