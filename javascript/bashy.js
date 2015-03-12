// Generated by CoffeeScript 1.9.1
(function() {
  var BashyOS, BashySprite, DisplayManager, File, FileSystem, MenuManager, Task, TaskManager, createBashySprite, drawFileSystem, drawLines, get_tasks, helpScreen, playIntro, showHomeText, showMediaText, showRootText, startTicker, validPath,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  validPath = function(path) {
    if (path === '/' || path === '/home' || path === '/media') {
      return true;
    } else {
      return false;
    }
  };

  File = (function() {
    function File(path1) {
      this.path = path1;
      this.children = [];
    }

    File.prototype.toString = function() {
      return this.path + " with children " + this.children;
    };

    return File;

  })();

  FileSystem = (function() {
    function FileSystem() {
      var home, media;
      this.root = new File("/");
      media = new File("/media");
      home = new File("/home");
      this.root.children.push(home);
      this.root.children.push(media);
    }

    FileSystem.prototype.isValidPath = function(cwd, path) {
      return true;
    };

    return FileSystem;

  })();


  /*
  
   * FileSystem continued ...
  #
   * needs children or children()
   * needs needs coords
   * oh wait no, needs root
   * root needs children
   * so we're talkin 'File' here, or 'Dir' or whatever.
   * let's just say Dirs for now.
   * 
   * a big question is how to construct -- pass in children and
   * parent or add them in? i spose it doesnt matter
   */

  BashyOS = (function() {
    function BashyOS(file_system1) {
      this.file_system = file_system1;
      this.pwd = bind(this.pwd, this);
      this.cd = bind(this.cd, this);
      this.cd_absolute_path = bind(this.cd_absolute_path, this);
      this.cd_relative_path = bind(this.cd_relative_path, this);
      this.handleTerminalInput = bind(this.handleTerminalInput, this);
    }

    BashyOS.prototype.cwd = '/';

    BashyOS.prototype.handleTerminalInput = function(input) {
      var fields, ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      fields = input.split(/\s+/);
      if (fields[0] === 'cd') {
        ref1 = this.cd(fields), stdout = ref1[0], stderr = ref1[1];
      } else if (fields[0] === 'pwd') {
        ref2 = this.pwd(), stdout = ref2[0], stderr = ref2[1];
      }
      return [this.cwd, stdout, stderr];
    };

    BashyOS.prototype.cd_relative_path = function(path) {
      var fields, newpath, ref, stderr, stdout, x;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      newpath = "";
      fields = path.split("/");
      if (fields[0] === "..") {
        if (fields.length === 1) {
          this.cwd = "/";
        } else {
          newpath = "/";
          [
            (function() {
              var i, len, ref1, results;
              ref1 = fields.slice(1, -1);
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                x = ref1[i];
                results.push(newpath += x + "/");
              }
              return results;
            })()
          ];
          newpath += fields.slice(-1);
          if (validPath(newpath)) {
            this.cwd = newpath;
          } else {
            stderr = "Invalid path";
          }
        }
      } else {
        if (validPath(this.cwd + path)) {
          this.cwd = this.cwd + path;
        } else {
          stderr = "Invalid path";
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cd_absolute_path = function(path) {
      var ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (validPath(path)) {
        this.cwd = path;
      } else {
        stderr = "Invalid path";
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cd = function(args) {
      var path, ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 1) {
        this.cwd = '/home';
      } else if (args.length > 1) {
        path = args[1];
        if (path[0] === "/") {
          ref1 = this.cd_absolute_path(path), stdout = ref1[0], stderr = ref1[1];
        } else {
          ref2 = this.cd_relative_path(path), stdout = ref2[0], stderr = ref2[1];
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.pwd = function() {
      var ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      stdout = this.cwd;
      return [stdout, stderr];
    };

    return BashyOS;

  })();

  BashySprite = (function() {
    function BashySprite(sprite1) {
      this.sprite = sprite1;
      this.sprite.x = 200;
      this.sprite.y = 50;
    }

    BashySprite.prototype.goToDir = function(dir) {
      if (dir === "/") {
        return this.goRoot();
      } else if (dir === "/home") {
        return this.goHome();
      } else if (dir === "/media") {
        return this.goMedia();
      }
    };

    BashySprite.prototype.goRoot = function() {
      this.sprite.x = 200;
      return this.sprite.y = 50;
    };

    BashySprite.prototype.goHome = function() {
      this.sprite.x = 80;
      return this.sprite.y = 180;
    };

    BashySprite.prototype.goMedia = function() {
      this.sprite.x = 390;
      return this.sprite.y = 180;
    };

    BashySprite.prototype.moveTo = function(x, y) {
      this.sprite.x = x;
      return this.sprite.y = y;
    };

    return BashySprite;

  })();

  DisplayManager = (function() {
    function DisplayManager(bashy_sprite1) {
      this.bashy_sprite = bashy_sprite1;
      this.update = bind(this.update, this);
    }

    DisplayManager.prototype.update = function(fs, new_dir) {
      return this.bashy_sprite.goToDir(new_dir);
    };

    return DisplayManager;

  })();

  MenuManager = (function() {
    function MenuManager() {}

    MenuManager.prototype.showTask = function(task) {
      var current_html;
      current_html = $("#menu").html();
      return $("#menu").html(current_html + "<p>" + task.name + "</p>");
    };

    return MenuManager;

  })();

  window.BashyOS = BashyOS;

  window.BashySprite = BashySprite;

  window.DisplayManager = DisplayManager;

  window.MenuManager = MenuManager;

  window.FileSystem = FileSystem;

  get_tasks = function() {
    var task1, task1_fn, task2, task2_fn, task3, task3_fn;
    task1_fn = function(os) {
      return os.cwd === "/home";
    };
    task2_fn = function(os) {
      return os.cwd === "/media";
    };
    task3_fn = function(os) {
      return os.cwd === "/";
    };
    task1 = new Task("navigate to home", ["type 'cd' and press enter"], task1_fn);
    task2 = new Task("navigate to /media", ["type 'cd /media' and press enter"], task2_fn);
    task3 = new Task("navigate to root", ["type 'cd /' and press enter"], task3_fn);
    return [task1, task2, task3];
  };

  TaskManager = (function() {
    function TaskManager(menu_mgr1) {
      var i, len, ref, task;
      this.menu_mgr = menu_mgr1;
      this.tasks = get_tasks();
      ref = this.tasks;
      for (i = 0, len = ref.length; i < len; i++) {
        task = ref[i];
        this.menu_mgr.showTask(task);
      }
    }

    TaskManager.prototype.update = function(os) {
      var all_complete, i, len, ref, task;
      all_complete = true;
      ref = this.tasks;
      for (i = 0, len = ref.length; i < len; i++) {
        task = ref[i];
        if (!task.done(os)) {
          all_complete = false;
        }
      }
      if (all_complete) {
        return alert("you win");
      }
    };

    return TaskManager;

  })();

  Task = (function() {
    function Task(name, hints, complete_fn) {
      this.name = name;
      this.hints = hints;
      this.complete_fn = complete_fn;
      this.is_complete = false;
    }

    Task.prototype.done = function(os) {
      if (this.is_complete) {
        return true;
      } else {
        this.is_complete = this.complete_fn(os);
        return this.is_complete;
      }
    };

    return Task;

  })();

  window.TaskManager = TaskManager;

  playIntro = function() {
    var intro_html;
    intro_html = "<h3>Welcome to B@shy!</h3>";
    intro_html += "<p>Use your keyboard to type commands.</p>";
    intro_html += "<p>Available commands are 'pwd' and 'cd'</p>";
    $('#help_text').html(intro_html);
    return $('#helpScreen').foundation('reveal', 'open');
  };

  helpScreen = function() {
    var help_html;
    help_html = "<h3>B@shy Help</h3>";
    help_html += "TODO contextual help messages";
    $('#help_text').html(help_html);
    return $('#helpScreen').foundation('reveal', 'open');
  };

  showRootText = function(stage) {
    var rootText;
    rootText = new createjs.Text("/", "20px Arial", "black");
    rootText.x = 250;
    rootText.y = 120;
    rootText.textBaseline = "alphabetic";
    return stage.addChild(rootText);
  };

  showHomeText = function(stage) {
    var homeText;
    homeText = new createjs.Text("/home", "20px Arial", "black");
    homeText.x = 140;
    homeText.y = 235;
    homeText.textBaseline = "alphabetic";
    return stage.addChild(homeText);
  };

  showMediaText = function(stage) {
    var mediaText;
    mediaText = new createjs.Text("/media", "20px Arial", "black");
    mediaText.x = 340;
    mediaText.y = 235;
    mediaText.textBaseline = "alphabetic";
    return stage.addChild(mediaText);
  };

  drawLines = function(stage) {
    var line1, line2;
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
    return stage.addChild(line2);
  };

  drawFileSystem = function(stage, fs) {
    showRootText(stage);
    showHomeText(stage);
    showMediaText(stage);
    return drawLines(stage);
  };


  /*
  
  drawLine = (stage, startCoords, endCoords) ->
  	line = new createjs.Shape()
  	line.graphics.setStrokeStyle(1)
  	line.graphics.beginStroke("gray")
  	line.graphics.moveTo(startCoords.x, startCoords.y)
  	line.graphics.lineTo(endCoords.x, endCoords.y)
  	line.graphics.endStroke()
  	stage.addChild(line)
  
  drawDirName = (stage, name, coords) ->
  	text = new createjs.Text(name, "20px Arial", "black")
  	text.x = coords.x
  	text.y = coords.y
  	text.textBaseline = "alphabetic"
  	stage.addChild(text)
  
  drawRoot = (stage) ->
  	drawDirName("/", (0,0) )
  
  drawDir = (stage, dir, parentCoords) ->
  	 * do stuff with stage and line and whatever the hell
  	 * like, say
  	drawDirName(stage, dir.name, dir.coords)
  	drawLine(stage, coords, parentCoords)
  	
  drawChildren = (stage, dir) ->
  	for child in dir.children
  		 * do something indexy in this loop to be able
  		 * to calculate child's coords based on own coords
  		child.coords = doSomething()
  		if not child.children
  			drawDir(stage, child, dir.coords) # pass in child's parents coords
  		else
  			drawChildren(stage, child)
  
  drawFileSystemMap = (stage, fs) ->
  	drawRoot()
  	for dir in fs.root.children
  		drawChildren(dir)
   */

  createBashySprite = function(bashy_himself, stage) {
    var bashySpriteSheet, bashy_sprite, sprite;
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
    return bashy_sprite = new BashySprite(sprite);
  };

  startTicker = function(stage) {
    var tick;
    tick = function() {
      return stage.update();
    };
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.useRAF = true;
    return createjs.Ticker.setFPS(5);
  };

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

  this.DisplayManager = (function() {
    function DisplayManager() {}

    return DisplayManager;

  })();

  this.TaskManager = (function() {
    function TaskManager() {}

    return TaskManager;

  })();

  this.MenuManager = (function() {
    function MenuManager() {}

    return MenuManager;

  })();

  jQuery(function() {
    var bashy_himself, canvas, handleFileLoad, playOops, playSound, playSounds, playTheme, seenIntro, soundOff, stage, startGame;
    canvas = $("#bashy_canvas")[0];
    stage = new createjs.Stage(canvas);
    bashy_himself = new Image();
    bashy_himself.onload = function() {
      return startGame();
    };
    bashy_himself.src = "assets/bashy_sprite_sheet.png";
    playSounds = true;
    soundOff = function() {
      playSounds = false;
      return createjs.Sound.stop();
    };
    playSound = function() {
      if (playSounds) {
        if (Math.random() < 0.5) {
          return createjs.Sound.play("boing1");
        } else {
          return createjs.Sound.play("boing2");
        }
      }
    };
    playOops = function() {
      if (playSounds) {
        return createjs.Sound.play("oops");
      }
    };
    playTheme = function() {
      return createjs.Sound.play("bashy_theme1", createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.5);
    };
    handleFileLoad = (function(_this) {
      return function(event) {
        console.log("Preloaded:", event.id, event.src);
        if (event.id === "bashy_theme1") {
          playTheme();
          return soundOff();
        }
      };
    })(this);
    createjs.Sound.addEventListener("fileload", handleFileLoad);
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.registerManifest([
      {
        id: "boing1",
        src: "boing1.mp3"
      }, {
        id: "boing2",
        src: "boing2.mp3"
      }, {
        id: "oops",
        src: "oops.mp3"
      }, {
        id: "bashy_theme1",
        src: "bashy_theme1.mp3"
      }
    ], "assets/");
    $("#audio_off").click(soundOff);
    seenIntro = false;
    $("#playScreen").click(function() {
      if (!seenIntro) {
        playIntro();
        return seenIntro = true;
      } else {
        return helpScreen();
      }
    });
    return startGame = function() {
      var file_system, handleInput, menu_mgr, os, task_mgr;
      file_system = new FileSystem();
      os = new BashyOS(file_system);
      drawFileSystem(stage, os.file_system);
      startTicker(stage);
      menu_mgr = new MenuManager();
      task_mgr = new TaskManager(menu_mgr);
      handleInput = function(input) {
        var cwd, fs, ref, stderr, stdout;
        fs = os.file_system;
        ref = os.handleTerminalInput(input), cwd = ref[0], stdout = ref[1], stderr = ref[2];
        task_mgr.update(os);
        if (stderr) {
          playOops();
        } else {
          playSound();
        }
        if (stderr) {
          return stderr;
        } else {
          if (stdout) {
            return stdout;
          } else {
            return void 0;
          }
        }
      };
      return $('#terminal').terminal(handleInput, {
        greetings: "",
        prompt: '> ',
        onBlur: false,
        name: 'bashy_terminal'
      });
    };
  });

}).call(this);
