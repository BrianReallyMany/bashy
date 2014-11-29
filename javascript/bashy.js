// Generated by CoffeeScript 1.8.0
(function() {
  var BashyOS, BashySprite,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BashyOS = (function() {
    function BashyOS(bashy_sprite) {
      this.bashy_sprite = bashy_sprite;
      this.handleTerminalInput = __bind(this.handleTerminalInput, this);
    }

    BashyOS.prototype.handleTerminalInput = function(input) {
      this.bashy_sprite.moveRight();
      return "> " + input + "\n" + input;
    };

    return BashyOS;

  })();

  BashySprite = (function() {
    function BashySprite(sprite) {
      this.sprite = sprite;
    }

    BashySprite.prototype.moveLeft = function() {
      if (this.sprite.x > 0) {
        return this.sprite.x -= 48;
      }
    };

    BashySprite.prototype.moveRight = function() {
      var limit;
      limit = 288 - this.sprite.getBounds().width;
      if (this.sprite.x < limit) {
        return this.sprite.x += 48;
      }
    };

    BashySprite.prototype.moveUp = function() {
      if (this.sprite.y > 0) {
        return this.sprite.y -= 48;
      }
    };

    BashySprite.prototype.moveDown = function() {
      var limit;
      limit = 288 - this.sprite.getBounds().height;
      if (this.sprite.y < limit) {
        return this.sprite.y += 48;
      }
    };

    return BashySprite;

  })();

  window.BashyOS = BashyOS;

  window.BashySprite = BashySprite;

  this.BashyOS = (function() {
    function BashyOS() {}

    return BashyOS;

  })();

  this.BashySprite = (function() {
    function BashySprite() {}

    return BashySprite;

  })();

  this.FileSystem = (function() {
    function FileSystem() {}

    return FileSystem;

  })();

  jQuery(function() {
    var bashy_himself, canvas, stage, startGame, tick;
    canvas = $("#bashy_canvas")[0];
    stage = new createjs.Stage(canvas);
    bashy_himself = new Image();
    bashy_himself.onload = function() {
      return startGame();
    };
    bashy_himself.src = "assets/bashy_sprite_sheet.png";
    tick = function() {
      return stage.update();
    };
    return startGame = function() {
      var bashySpriteSheet, bashy_sprite, homeText, line1, line2, mediaText, os, rootText, sprite;
      rootText = new createjs.Text("/", "20px Arial", "black");
      rootText.x = 250;
      rootText.y = 120;
      rootText.textBaseline = "alphabetic";
      stage.addChild(rootText);
      homeText = new createjs.Text("home", "20px Arial", "black");
      homeText.x = 140;
      homeText.y = 235;
      homeText.textBaseline = "alphabetic";
      stage.addChild(homeText);
      mediaText = new createjs.Text("media", "20px Arial", "black");
      mediaText.x = 340;
      mediaText.y = 235;
      mediaText.textBaseline = "alphabetic";
      stage.addChild(mediaText);
      line1 = new createjs.Shape();
      line1.graphics.setStrokeStyle(1);
      line1.graphics.beginStroke("gray");
      line1.graphics.moveTo(255, 125);
      line1.graphics.lineTo(350, 220);
      line1.graphics.endStroke();
      stage.addChild(line1);
      line2 = new createjs.Shape();
      line2.graphics.setStrokeStyle(1);
      line2.graphics.beginStroke("gray");
      line2.graphics.moveTo(245, 125);
      line2.graphics.lineTo(150, 220);
      line2.graphics.endStroke();
      stage.addChild(line2);
      bashySpriteSheet = new createjs.SpriteSheet({
        images: [bashy_himself],
        frames: {
          width: 64,
          height: 64
        },
        animations: {
          walking: [0, 4, "walking"],
          standing: [0, 0, "standing"]
        }
      });
      sprite = new createjs.Sprite(bashySpriteSheet, 0);
      sprite.gotoAndPlay("walking");
      sprite.currentFrame = 0;
      stage.addChild(sprite);
      bashy_sprite = new BashySprite(sprite);
      createjs.Ticker.addEventListener("tick", tick);
      createjs.Ticker.useRAF = true;
      createjs.Ticker.setFPS(5);
      os = new BashyOS(bashy_sprite);
      return $('#terminal').terminal(os.handleTerminalInput, {
        greetings: "",
        prompt: '> ',
        name: 'test'
      });
    };
  });

}).call(this);
