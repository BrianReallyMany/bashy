// Generated by CoffeeScript 1.9.1
(function() {
  var BashyController, BashyOS, BashySprite, DisplayManager, File, FileSystem, HelpManager, MenuManager, SoundManager, Task, TaskManager, calculateChildCoords, cleanPath, createBashySprite, drawChildren, drawFile, findFileCoords, getParentPath, get_tasks, parseCommand, startGame, startTicker,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  File = (function() {
    function File(path1) {
      this.path = path1;
      this.children = [];
    }

    File.prototype.name = function() {
      var len, splitPath;
      if (this.path === "/") {
        return this.path;
      } else {
        splitPath = this.path.split("/");
        len = splitPath.length;
        return splitPath[len - 1];
      }
    };

    File.prototype.toString = function() {
      return "File object with path=" + this.path;
    };

    File.prototype.getChild = function(name) {
      var child, j, len1, ref;
      ref = this.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        child = ref[j];
        if (child.name() === name) {
          return child;
        }
      }
      return "";
    };

    return File;

  })();

  FileSystem = (function() {
    function FileSystem() {
      var bashy, home, media, pics;
      this.root = new File("/");
      media = new File("/media");
      pics = new File("/media/pics");
      media.children.push(pics);
      this.root.children.push(media);
      home = new File("/home");
      bashy = new File("/home/bashy");
      home.children.push(bashy);
      this.root.children.push(home);
    }

    FileSystem.prototype.isValidPath = function(path) {
      var currentParent, dir, dirName, j, len1, ref, splitPath;
      if (path === "/") {
        return true;
      }
      splitPath = path.split("/");
      currentParent = this.root;
      ref = splitPath.slice(1);
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dirName = ref[j];
        dir = currentParent.getChild(dirName);
        if (!dir) {
          return false;
        } else {
          currentParent = dir;
        }
      }
      return true;
    };

    FileSystem.prototype.getFile = function(path) {
      var currentParent, dirName, j, len1, ref, splitPath;
      if (path === "/") {
        return this.root;
      }
      currentParent = this.root;
      splitPath = path.split("/");
      ref = splitPath.slice(1);
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dirName = ref[j];
        currentParent = currentParent.getChild(dirName);
      }
      return currentParent;
    };

    return FileSystem;

  })();

  cleanPath = function(path) {
    var dir, j, len1, newPath, splitPath;
    splitPath = path.split("/");
    newPath = "";
    for (j = 0, len1 = splitPath.length; j < len1; j++) {
      dir = splitPath[j];
      if (dir !== "") {
        newPath = newPath + "/" + dir;
      }
    }
    return newPath;
  };

  getParentPath = function(dir) {
    var i, j, len, parentPath, ref, splitPath;
    if (dir.path === "/") {
      return "/";
    } else {
      splitPath = dir.path.split("/");
      len = splitPath.length;
      parentPath = "";
      for (i = j = 0, ref = len - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        parentPath = parentPath + "/" + splitPath[i];
      }
      return parentPath;
    }
  };

  BashyOS = (function() {
    function BashyOS(file_system1) {
      this.file_system = file_system1;
      this.pwd = bind(this.pwd, this);
      this.cd = bind(this.cd, this);
      this.cd_absolute_path = bind(this.cd_absolute_path, this);
      this.cd_relative_path = bind(this.cd_relative_path, this);
      this.runCommand = bind(this.runCommand, this);
      this.cwd = this.file_system.root;
    }

    BashyOS.prototype.validCommands = function() {
      return ["cd", "pwd"];
    };

    BashyOS.prototype.runCommand = function(command, args) {
      var ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (command === 'cd') {
        ref1 = this.cd(args), stdout = ref1[0], stderr = ref1[1];
      } else if (command === 'pwd') {
        ref2 = this.pwd(), stdout = ref2[0], stderr = ref2[1];
      }
      return [this.cwd, stdout, stderr];
    };

    BashyOS.prototype.cd_relative_path = function(path) {
      var absolutePath, field, fields, j, len1, newpath, ref, ref1, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      newpath = "";
      fields = path.split("/");
      if (fields[0] === "..") {
        absolutePath = getParentPath(this.cwd);
        ref1 = [fields.slice(1)];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          field = ref1[j];
          if (absolutePath === "/") {
            absolutePath = absolutePath + field;
          } else {
            absolutePath = absolutePath + "/" + field;
          }
        }
        absolutePath = cleanPath(absolutePath);
        if (this.file_system.isValidPath(absolutePath)) {
          this.cwd = this.file_system.getFile(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      } else if (fields[0] === ".") {
        if (this.cwd === "/") {
          absolutePath = this.cwd + path.slice(2);
        } else {
          absolutePath = this.cwd + "/" + path.slice(2);
        }
        absolutePath = cleanPath(absolutePath);
        if (this.file_system.isValidPath(absolutePath)) {
          this.cwd = this.file_system.getFile(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      } else {
        if (this.cwd === this.file_system.root) {
          absolutePath = this.cwd.path + path;
        } else {
          absolutePath = this.cwd.path + "/" + path;
        }
        absolutePath = cleanPath(absolutePath);
        if (this.file_system.isValidPath(absolutePath)) {
          this.cwd = this.file_system.getFile(absolutePath);
        } else {
          stderr = "Invalid path: " + absolutePath;
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cd_absolute_path = function(path) {
      var absolutePath, ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      absolutePath = cleanPath(path);
      if (this.file_system.isValidPath(path)) {
        this.cwd = this.file_system.getFile(path);
      } else {
        stderr = "Invalid path";
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cd = function(args) {
      var path, ref, ref1, ref2, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        this.cwd = this.file_system.getFile("/home");
      } else if (args.length > 0) {
        path = args[0];
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
      stdout = this.cwd.path;
      return [stdout, stderr];
    };

    return BashyOS;

  })();

  window.BashyOS = BashyOS;

  get_tasks = function() {
    var task1, task1_fn, task2, task2_fn, task3, task3_fn;
    task1_fn = function(os) {
      return os.cwd.path === "/home";
    };
    task2_fn = function(os) {
      return os.cwd.path === "/media";
    };
    task3_fn = function(os) {
      return os.cwd.path === "/";
    };
    task1 = new Task("navigate to home", ["type 'cd' and press enter"], task1_fn);
    task2 = new Task("navigate to /media", ["type 'cd /media' and press enter"], task2_fn);
    task3 = new Task("navigate to root", ["type 'cd /' and press enter"], task3_fn);
    return [task1, task2, task3];
  };

  TaskManager = (function() {
    function TaskManager(menu_mgr1) {
      this.menu_mgr = menu_mgr1;
      this.winner = false;
      this.tasks = get_tasks();
      this.current_task = this.tasks[0];
      this.menu_mgr.showTask(this.current_task);
    }

    TaskManager.prototype.update = function(os) {
      if (!this.winner) {
        if (this.current_task.done(os)) {
          if (this.tasks.length > 1) {
            this.tasks = this.tasks.slice(1);
            this.current_task = this.tasks[0];
            return this.menu_mgr.showTask(this.current_task);
          } else {
            this.winner = true;
            return this.menu_mgr.win();
          }
        }
      }
    };

    return TaskManager;

  })();

  Task = (function() {
    function Task(name1, hints, complete_fn) {
      this.name = name1;
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

    Task.prototype.toString = function() {
      return this.name;
    };

    return Task;

  })();

  MenuManager = (function() {
    function MenuManager() {}

    MenuManager.prototype.showTask = function(task) {
      return $("#menu").html("<p>" + task.name + "</p>");
    };

    MenuManager.prototype.win = function() {
      return $("#menu").html("<h4>You Win!</h4>");
    };

    return MenuManager;

  })();

  window.TaskManager = TaskManager;

  window.MenuManager = MenuManager;

  HelpManager = (function() {
    function HelpManager() {
      this.seenIntro = false;
    }

    HelpManager.prototype.onClick = function() {
      if (!this.seenIntro) {
        this.playIntro();
        return this.seenIntro = true;
      } else {
        return this.helpScreen();
      }
    };

    HelpManager.prototype.playIntro = function() {
      var intro_html;
      intro_html = "<h3>Welcome to B@shy!</h3>";
      intro_html += "<p>Use your keyboard to type commands.</p>";
      intro_html += "<p>Available commands are 'pwd' and 'cd'</p>";
      $('#help_text').html(intro_html);
      return $('#helpScreen').foundation('reveal', 'open');
    };

    HelpManager.prototype.helpScreen = function() {
      var help_html;
      help_html = "<h3>B@shy Help</h3>";
      help_html += "TODO contextual help messages";
      $('#help_text').html(help_html);
      return $('#helpScreen').foundation('reveal', 'open');
    };

    return HelpManager;

  })();

  window.HelpManager = HelpManager;

  calculateChildCoords = function(count, parentX, parentY) {
    var coords, i, j, ref, startingX, x, xOffset, y, yOffset;
    yOffset = 80;
    xOffset = 100;
    coords = [];
    startingX = parentX - 0.5 * count * xOffset;
    y = parentY + yOffset;
    for (i = j = 0, ref = count - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      x = startingX + 2 * i * xOffset;
      coords.push([x, y]);
    }
    return coords;
  };

  drawFile = function(stage, file, x, y) {
    var ref, text;
    text = new createjs.Text(file.name(), "20px Arial", "black");
    ref = [x, y], text.x = ref[0], text.y = ref[1];
    text.textBaseline = "alphabetic";
    return stage.addChild(text);
  };

  drawChildren = function(stage, parent, parentX, parentY) {
    var child, childCoords, childX, childY, i, j, line, lineOffsetX, lineOffsetY, numChildren, ref, results;
    lineOffsetX = 20;
    lineOffsetY = 20;
    numChildren = parent.children.length;
    childCoords = calculateChildCoords(numChildren, parentX, parentY);
    results = [];
    for (i = j = 0, ref = numChildren - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      child = parent.children[i];
      childX = childCoords[i][0];
      childY = childCoords[i][1];
      if (child.children.length > 0) {
        drawChildren(stage, child, childX, childY);
      }
      drawFile(stage, child, childX, childY);
      line = new createjs.Shape();
      line.graphics.setStrokeStyle(1);
      line.graphics.beginStroke("gray");
      line.graphics.moveTo(parentX, parentY + lineOffsetY);
      line.graphics.lineTo(childX + lineOffsetX, childY - lineOffsetY);
      line.graphics.endStroke();
      results.push(stage.addChild(line));
    }
    return results;
  };

  findFileCoords = function(fs, filepath, rootX, rootY) {
    if (filepath === "/") {
      return [250, 120];
    } else {
      return [200, 100];
    }
  };

  DisplayManager = (function() {
    function DisplayManager(stage1, bashy_sprite1) {
      var ref;
      this.stage = stage1;
      this.bashy_sprite = bashy_sprite1;
      this.update = bind(this.update, this);
      ref = [250, 120], this.rootX = ref[0], this.rootY = ref[1];
    }

    DisplayManager.prototype.update = function(fs, new_dir) {
      var child, deltaX, deltaY, j, len1, newX, newY, ref, ref1, ref2, results;
      ref = findFileCoords(fs, new_dir.path, this.rootX, this.rootY), newX = ref[0], newY = ref[1];
      deltaX = this.rootX - newX;
      deltaY = this.rootY - newY;
      ref1 = [this.rootX + deltaX, this.rootY + deltaY], this.rootX = ref1[0], this.rootY = ref1[1];
      ref2 = this.stage.children.slice(1);
      results = [];
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        child = ref2[j];
        child.x = child.x + deltaX;
        results.push(child.y = child.y + deltaY);
      }
      return results;
    };

    DisplayManager.prototype.drawFileSystem = function(fs) {
      drawFile(this.stage, fs.root, this.rootX, this.rootY);
      return drawChildren(this.stage, fs.root, this.rootX, this.rootY);
    };

    return DisplayManager;

  })();

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

  this.BashyController = (function() {
    function BashyController() {}

    return BashyController;

  })();

  this.BashyOS = (function() {
    function BashyOS() {}

    return BashyOS;

  })();

  this.BashySprite = (function() {
    function BashySprite() {}

    return BashySprite;

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

  this.HelpManager = (function() {
    function HelpManager() {}

    return HelpManager;

  })();

  this.SoundManager = (function() {
    function SoundManager() {}

    return SoundManager;

  })();

  jQuery(function() {
    var bashy_image, canvas, file_system, help_mgr, menu_mgr, os, playSounds, sound_mgr, stage, task_mgr;
    playSounds = false;
    sound_mgr = new SoundManager(playSounds);
    $("#audio_off").click(function() {
      return sound_mgr.soundOff();
    });
    help_mgr = new HelpManager();
    $("#playScreen").click(function() {
      return help_mgr.onClick();
    });
    file_system = new FileSystem();
    os = new BashyOS(file_system);
    menu_mgr = new MenuManager();
    task_mgr = new TaskManager(menu_mgr);
    canvas = $("#bashy_canvas")[0];
    stage = new createjs.Stage(canvas);
    bashy_image = new Image();
    bashy_image.src = "assets/bashy_sprite_sheet.png";
    return bashy_image.onload = function() {
      return startGame(sound_mgr, stage, bashy_image, os, task_mgr);
    };
  });

  startGame = function(sound_mgr, stage, bashy_image, os, task_mgr) {
    var bashy_sprite, controller, display_mgr, handleInput;
    bashy_sprite = createBashySprite(bashy_image, stage);
    startTicker(stage);
    display_mgr = new DisplayManager(stage, bashy_sprite);
    display_mgr.drawFileSystem(os.file_system);
    controller = new BashyController(os, task_mgr, display_mgr, sound_mgr);
    handleInput = function(input) {
      return controller.handleInput(input);
    };
    return $('#terminal').terminal(handleInput, {
      greetings: "",
      prompt: '> ',
      onBlur: false,
      name: 'bashy_terminal'
    });
  };

  SoundManager = (function() {
    function SoundManager(playSounds1) {
      this.playSounds = playSounds1;
      this.handleFileLoad = bind(this.handleFileLoad, this);
      createjs.Sound.addEventListener("fileload", this.handleFileLoad);
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
    }

    SoundManager.prototype.soundOff = function() {
      this.playSounds = false;
      return createjs.Sound.stop();
    };

    SoundManager.prototype.playBoing = function() {
      if (this.playSounds) {
        if (Math.random() < 0.5) {
          return createjs.Sound.play("boing1");
        } else {
          return createjs.Sound.play("boing2");
        }
      }
    };

    SoundManager.prototype.playOops = function() {
      if (this.playSounds) {
        return createjs.Sound.play("oops");
      }
    };

    SoundManager.prototype.playTheme = function() {
      if (this.playSounds) {
        return createjs.Sound.play("bashy_theme1", createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 0.5);
      }
    };

    SoundManager.prototype.handleFileLoad = function(event) {
      console.log("Preloaded:", event.id, event.src);
      if (event.id === "bashy_theme1") {
        return this.playTheme();
      }
    };

    return SoundManager;

  })();

  window.SoundManager = SoundManager;

  parseCommand = function(input) {
    var args, command, i, j, len, ref, splitInput;
    splitInput = input.split(/\s+/);
    command = splitInput[0];
    args = [];
    len = splitInput.length;
    if (len > 1) {
      for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        args.push(splitInput[i]);
      }
    }
    return [command, args];
  };

  BashyController = (function() {
    function BashyController(os1, task_mgr1, display_mgr1, sound_mgr1) {
      this.os = os1;
      this.task_mgr = task_mgr1;
      this.display_mgr = display_mgr1;
      this.sound_mgr = sound_mgr1;
    }

    BashyController.prototype.executeCommand = function(command, args) {
      var cwd, fs, ref, stderr, stdout;
      fs = this.os.file_system;
      ref = this.os.runCommand(command, args), cwd = ref[0], stdout = ref[1], stderr = ref[2];
      this.task_mgr.update(this.os);
      this.display_mgr.update(fs, cwd);
      if (stderr) {
        this.sound_mgr.playOops();
      } else {
        this.sound_mgr.playBoing();
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

    BashyController.prototype.handleInput = function(input) {
      var args, command, ref;
      input = input.replace(/^\s+|\s+$/g, "");
      ref = parseCommand(input), command = ref[0], args = ref[1];
      if (indexOf.call(this.os.validCommands(), command) < 0) {
        return "Invalid command: " + command;
      } else {
        return this.executeCommand(command, args);
      }
    };

    return BashyController;

  })();

  window.BashyController = BashyController;

}).call(this);
