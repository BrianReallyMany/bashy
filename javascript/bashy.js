// Generated by CoffeeScript 1.9.1
(function() {
  var BashyGame, BashyOS, Directory, DisplayManager, File, FileSystem, Man, Task, TaskManager, Terminal,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Man = (function() {
    function Man() {
      this.entries = {
        "cd": "\ncd - move to a new dir\n" + "\nUSAGE\n\tcd [DIR]\n" + "\tType 'cd /' to go to the top.\n" + "\tType 'cd' by itself to go home.\n" + "\tType 'cd ..' to go up one level.\n",
        "pwd": "\npwd - tell what dir you're in\n" + "\nUSAGE\n\tpwd\n",
        "man": "\nman - explain how commands work\n" + "\nUSAGE\n\tman <COMMAND>\n" + "\tType 'man cd' to learn about the 'cd' command\n",
        "ls": "\nls - list contents of a dir\n" + "\nUSAGE\n\tls [OPTION] [FILE]\n" + "\tType 'ls' by itself to see the contents of your " + "current working dir.\n" + "\nOPTIONS\n\t-R\n" + "\t\tlist subdirectories recursively\n",
        "cat": "\ncat - show the contents of a file\n" + "\nUSAGE\n\tcat <FILE>\n",
        "head": "\nhead - show the first part of a file\n" + "\nUSAGE\n\thead <FILE>\n",
        "tail": "\ntail - show the last part of a file\n" + "\nUSAGE\n\ttail <FILE>\n",
        "wc": "\nwc - count the number of lines, words and characters in a file.\n" + "\nUSAGE\n\twc <FILE>\n",
        "grep": "\ngrep - show lines matching a pattern\n" + "\nUSAGE\n\tgrep <PATTERN> <FILE>\n",
        "sed": "\nsed - substitute contents of a file\n" + "\nUSAGE\n\tsed 's/PATTERN/REPLACEMENT/' <FILE>\n",
        "rm": "\nrm - remove a file\n" + "\nUSAGE\n\trm <FILE>\n",
        "mv": "mv - move or rename a file or dir\n" + "\nUSAGE\n\tmv <SOURCE> <DESTINATION>\n",
        "cp": "cp - copy a file\n" + "\nUSAGE\n\tcp <SOURCE> <DESTINATION>\n"
      };
    }

    Man.prototype.getEntry = function(command) {
      var ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (command in this.entries) {
        stdout = this.entries[command];
      } else {
        stderr = "No manual entry for " + command;
      }
      return [stdout, stderr];
    };

    return Man;

  })();

  File = (function() {
    function File(name1, contents) {
      this.name = name1;
      this.contents = contents;
    }

    return File;

  })();

  Directory = (function() {
    function Directory(name1) {
      this.name = name1;
      this.parent = null;
      this.subdirectories = [];
      this.files = [];
    }

    Directory.prototype.getPath = function() {
      var parent, path;
      if (this.name === "/") {
        return "/";
      } else {
        parent = this.parent;
        path = this.name;
        while (parent.name !== "/") {
          path = parent.name + "/" + path;
          parent = parent.parent;
        }
        path = "/" + path;
        return path;
      }
    };

    Directory.prototype.getChild = function(name) {
      var child, j, len1, ref;
      ref = this.subdirectories;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        child = ref[j];
        if (child.name === name) {
          return child;
        }
      }
      return "";
    };

    Directory.prototype.removeFile = function(name) {
      var f;
      return this.files = (function() {
        var j, len1, ref, results;
        ref = this.files;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          f = ref[j];
          if (f.name !== name) {
            results.push(f);
          }
        }
        return results;
      }).call(this);
    };

    Directory.prototype.removeDirectory = function(name) {
      var d;
      return this.subdirectories = (function() {
        var j, len1, ref, results;
        ref = this.subdirectories;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          d = ref[j];
          if (d.name !== name) {
            results.push(d);
          }
        }
        return results;
      }).call(this);
    };

    return Directory;

  })();

  FileSystem = (function() {
    function FileSystem() {
      var bashy, foo, home, list, media, pics;
      this.root = new Directory("/");
      media = new Directory("media");
      media.parent = this.root;
      this.root.subdirectories.push(media);
      pics = new Directory("pics");
      pics.parent = media;
      media.subdirectories.push(pics);
      home = new Directory("home");
      home.parent = this.root;
      this.root.subdirectories.push(home);
      bashy = new Directory("bashy");
      bashy.parent = home;
      home.subdirectories.push(bashy);
      foo = new File("foo.txt", "This is a simple text file.");
      bashy.files.push(foo);
      list = new File("list", "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20");
      bashy.files.push(list);
    }

    FileSystem.prototype.isValidDirectoryPath = function(path) {
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

    FileSystem.prototype.isValidFilePath = function(path) {
      var currentParent, dir, dirName, file, filename, j, k, len, len1, len2, ref, ref1, splitPath;
      if (path === "/") {
        return true;
      }
      splitPath = path.split("/");
      len = splitPath.length;
      currentParent = this.root;
      ref = splitPath.slice(1, +(len - 2) + 1 || 9e9);
      for (j = 0, len1 = ref.length; j < len1; j++) {
        dirName = ref[j];
        dir = currentParent.getChild(dirName);
        if (!dir) {
          return false;
        } else {
          currentParent = dir;
        }
      }
      filename = splitPath[len - 1];
      ref1 = currentParent.files;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        file = ref1[k];
        if (file.name === filename) {
          return true;
        }
      }
      return false;
    };

    FileSystem.prototype.removeLastPart = function(path) {
      var splitPath;
      splitPath = path.split("/");
      return splitPath.slice(0, +splitPath.length(-2) + 1 || 9e9).join("/");
    };

    FileSystem.prototype.relativeToAbsolute = function(path, cwd) {
      var dir, dirs, j, len1;
      dirs = path.split("/");
      path = cwd.getPath();
      for (j = 0, len1 = dirs.length; j < len1; j++) {
        dir = dirs[j];
        if (dir === "..") {
          path = this.removeLastPart(path);
        } else if (dir === ".") {
          continue;
        } else {
          path = path + "/" + dir;
        }
      }
      return path;
    };

    FileSystem.prototype.splitPath = function(path, cwd) {
      var dirPath, filename, len, splitPath;
      if (path[0] !== "/") {
        path = this.relativeToAbsolute(path, cwd);
      }
      splitPath = path.split("/");
      len = splitPath.length;
      filename = splitPath[len - 1];
      dirPath = splitPath.slice(0, +(len - 2) + 1 || 9e9).join("/");
      return [dirPath, filename];
    };

    FileSystem.prototype.getDirectory = function(path, cwd) {
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

    FileSystem.prototype.getFile = function(path, cwd) {
      var dir, dirPath, file, filename, j, len1, ref, ref1;
      ref = this.splitPath(path, cwd), dirPath = ref[0], filename = ref[1];
      dir = this.getDirectory(dirPath);
      ref1 = dir.files;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        file = ref1[j];
        if (file.name === filename) {
          return file;
        }
      }
    };

    return FileSystem;

  })();

  BashyOS = (function() {
    function BashyOS() {
      this.pwd = bind(this.pwd, this);
      this.cd = bind(this.cd, this);
      this.runCommand = bind(this.runCommand, this);
      this.validCommands = ["man", "cd", "pwd", "ls", "cat", "head", "tail", "wc", "grep", "sed", "rm", "mv", "cp"];
      this.fileSystem = new FileSystem();
      this.cwd = this.fileSystem.root;
      this.man = new Man();
    }

    BashyOS.prototype.runCommand = function(command, args) {
      var ref, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (indexOf.call(this.validCommands, command) < 0) {
        stderr = "Invalid command: " + command;
      } else if (command === 'man') {
        ref1 = this.man.getEntry(args[0]), stdout = ref1[0], stderr = ref1[1];
      } else if (command === 'cd') {
        ref2 = this.cd(args), stdout = ref2[0], stderr = ref2[1];
      } else if (command === 'pwd') {
        ref3 = this.pwd(), stdout = ref3[0], stderr = ref3[1];
      } else if (command === 'ls') {
        ref4 = this.ls(args), stdout = ref4[0], stderr = ref4[1];
      } else if (command === 'cat') {
        ref5 = this.cat(args), stdout = ref5[0], stderr = ref5[1];
      } else if (command === 'head') {
        ref6 = this.head(args), stdout = ref6[0], stderr = ref6[1];
      } else if (command === 'tail') {
        ref7 = this.tail(args), stdout = ref7[0], stderr = ref7[1];
      } else if (command === 'wc') {
        ref8 = this.wc(args), stdout = ref8[0], stderr = ref8[1];
      } else if (command === 'grep') {
        ref9 = this.grep(args), stdout = ref9[0], stderr = ref9[1];
      } else if (command === 'sed') {
        ref10 = this.sed(args), stdout = ref10[0], stderr = ref10[1];
      } else if (command === 'rm') {
        ref11 = this.rm(args), stdout = ref11[0], stderr = ref11[1];
      } else if (command === 'mv') {
        ref12 = this.mv(args), stdout = ref12[0], stderr = ref12[1];
      } else if (command === 'cp') {
        ref13 = this.cp(args), stdout = ref13[0], stderr = ref13[1];
      }
      return [this.cwd.getPath(), stdout, stderr];
    };

    BashyOS.prototype.cd = function(args) {
      var path, ref, stderr, stdout, targetDirectory;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        this.cwd = this.fileSystem.getDirectory("/home");
      } else {
        path = args[0];
        targetDirectory = this.getDirectoryFromPath(path);
        if (targetDirectory != null) {
          this.cwd = targetDirectory;
        } else {
          stderr = "Invalid path: " + path;
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.pwd = function() {
      var ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      stdout = this.cwd.getPath();
      return [stdout, stderr];
    };

    BashyOS.prototype.ls = function(args) {
      var arg, dir, directory, file, j, k, l, len1, len2, len3, len4, m, newStderr, newStdout, path, recursive, ref, ref1, ref2, ref3, ref4, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      recursive = false;
      for (j = 0, len1 = args.length; j < len1; j++) {
        arg = args[j];
        if (arg === "-R") {
          recursive = true;
        } else {
          path = arg;
        }
      }
      if (path == null) {
        dir = this.cwd;
      } else {
        dir = this.getDirectoryFromPath(path);
      }
      if (dir == null) {
        file = this.getFileFromPath(path);
        if (file != null) {
          stdout = path;
        } else {
          stderr = "ls: " + path + ": No such file or directory";
        }
      } else {
        ref1 = dir.files;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          file = ref1[k];
          stdout += file.name + "\t";
        }
        ref2 = dir.subdirectories;
        for (l = 0, len3 = ref2.length; l < len3; l++) {
          directory = ref2[l];
          stdout += directory.name + "\t";
        }
        if (recursive) {
          stdout += "\n\n";
          ref3 = dir.subdirectories;
          for (m = 0, len4 = ref3.length; m < len4; m++) {
            directory = ref3[m];
            stdout += directory.getPath() + ":\n";
            ref4 = this.ls(["-R", directory.getPath()]), newStdout = ref4[0], newStderr = ref4[1];
            stdout += newStdout;
            stderr += newStderr;
          }
        }
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cat = function(args) {
      var file, path, ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        stderr = "cat: please provide the path to a file";
        return [stdout, stderr];
      }
      path = args[0];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "cat: " + path + ": No such file or directory";
      } else {
        stdout = file.contents;
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.head = function(args) {
      var file, numberOfLines, path, ref, splitContents, stderr, stdout;
      numberOfLines = 10;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        stderr = "head: please provide the path to a file";
        return [stdout, stderr];
      }
      path = args[0];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "head: " + path + ": No such file or directory";
      } else {
        splitContents = file.contents.split("\n");
        stdout = splitContents.slice(0, +(numberOfLines - 1) + 1 || 9e9).join("\n");
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.tail = function(args) {
      var file, numberOfLines, path, ref, splitContents, stderr, stdout, totalLines;
      numberOfLines = 10;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        stderr = "tail: please provide the path to a file";
        return [stdout, stderr];
      }
      path = args[0];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "tail: " + path + ": No such file or directory";
      } else {
        splitContents = file.contents.split("\n");
        totalLines = splitContents.length;
        stdout = splitContents.slice(totalLines - numberOfLines).join("\n");
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.wc = function(args) {
      var file, lines, numberOfCharacters, numberOfLines, numberOfWords, path, ref, stderr, stdout, words;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length === 0) {
        stderr = "wc: please provide the path to a file";
        return [stdout, stderr];
      }
      path = args[0];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "wc: " + path + ": open: No such file or directory";
      } else {
        lines = file.contents.split("\n");
        numberOfLines = lines.length;
        words = file.contents.match(/\S+/g);
        numberOfWords = words.length;
        numberOfCharacters = file.contents.length + 1;
        stdout = "\t" + numberOfLines + "\t" + numberOfWords + "\t" + numberOfCharacters;
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.grep = function(args) {
      var file, line, lines, matchingLines, path, pattern, ref, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length !== 2) {
        stderr = "grep: please provide a pattern and the path to a file";
        return [stdout, stderr];
      }
      pattern = args[0];
      path = args[1];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "grep: " + path + ": open: No such file or directory";
      } else {
        lines = file.contents.split("\n");
        matchingLines = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = lines.length; j < len1; j++) {
            line = lines[j];
            if (line.match(pattern)) {
              results.push(line);
            }
          }
          return results;
        })();
        stdout = matchingLines.join("\n");
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.sed = function(args) {
      var command, file, line, lines, newLines, pattern, ref, replacement, splitCommand, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length !== 2) {
        stderr = "sed: invalid or missing arguments.";
        return [stdout, stderr];
      }
      file = this.getFileFromPath(args[1]);
      if (!file) {
        stderr = "sed: " + path + ": No such file or directory";
      } else {
        command = args[0];
        splitCommand = command.split("/");
        if (splitCommand[0] !== 's') {
          stderr = "sed: sorry, command must start with 's'";
          return [stdout, stderr];
        } else if (splitCommand.length !== 4) {
          stderr = "sed: incomplete command: " + command;
          return [stdout, stderr];
        }
        pattern = splitCommand[1];
        replacement = splitCommand[2];
        lines = file.contents.split("\n");
        newLines = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = lines.length; j < len1; j++) {
            line = lines[j];
            results.push(line.replace(pattern, replacement));
          }
          return results;
        })();
        stdout = newLines.join("\n");
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.rm = function(args) {
      var dirPath, file, filename, parentDirectory, path, ref, ref1, stderr, stdout;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length < 1) {
        stderr = "rm: please specify a path";
        return [stdout, stderr];
      }
      path = args[0];
      file = this.getFileFromPath(path);
      if (!file) {
        stderr = "rm: " + path + ": No such file or directory";
      } else {
        ref1 = this.fileSystem.splitPath(path, this.cwd), dirPath = ref1[0], filename = ref1[1];
        parentDirectory = this.getDirectoryFromPath(dirPath);
        parentDirectory.removeFile(filename);
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.mv = function(args) {
      var filename, parent, parentPath, ref, ref1, ref2, ref3, sourceDirPath, sourceDirectory, sourceFile, sourceFilename, sourcePath, stderr, stdout, targetDirPath, targetDirectory, targetFilename, targetPath;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length < 2) {
        stderr = "mv: please specify a source and a target";
        return [stdout, stderr];
      }
      sourcePath = args[0];
      targetPath = args[1];
      sourceFile = this.getFileFromPath(sourcePath);
      if (!sourceFile) {
        sourceDirectory = this.getDirectoryFromPath(sourcePath);
        if (!sourceDirectory) {
          stderr = "mv: " + sourcePath + ": No such file or directory";
        } else {
          sourceDirectory.parent.removeDirectory(sourceDirectory.name);
          targetDirectory = this.getDirectoryFromPath(targetPath);
          if (!targetDirectory) {
            ref1 = this.fileSystem.splitPath(targetPath, this.cwd), parentPath = ref1[0], filename = ref1[1];
            sourceDirectory.name = filename;
            parent = this.getDirectoryFromPath(parentPath);
            parent.subdirectories.push(sourceDirectory);
            return [stdout, stderr];
          }
          if (targetPath[targetPath.length - 1] === "/") {
            targetDirectory.subdirectories.push(sourceDirectory);
          } else {
            if (targetDirectory.name !== "/") {
              parent = targetDirectory.parent;
            } else {
              parent = targetDirectory;
            }
            parent.removeDirectory(targetDirectory.name);
            parent.subdirectories.push(sourceDirectory);
            sourceDirectory.parent = parent;
          }
          return [stdout, stderr];
        }
      } else {
        ref2 = this.fileSystem.splitPath(sourcePath, this.cwd), sourceDirPath = ref2[0], sourceFilename = ref2[1];
        sourceDirPath = this.cleanPath(sourceDirPath);
        sourceDirectory = this.getDirectoryFromPath(sourceDirPath);
        sourceDirectory.removeFile(sourceFilename);
        ref3 = this.fileSystem.splitPath(targetPath, this.cwd), targetDirPath = ref3[0], targetFilename = ref3[1];
        targetDirectory = this.getDirectoryFromPath(targetDirPath);
        targetDirectory.files.push(sourceFile);
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cp = function(args) {
      var ref, ref1, source, sourcePath, stderr, stdout, targetDirPath, targetDirectory, targetFilename, targetPath;
      ref = ["", ""], stdout = ref[0], stderr = ref[1];
      if (args.length < 2) {
        stderr = "cp: please specify a source and a target";
        return [stdout, stderr];
      }
      sourcePath = args[0];
      source = this.getFileFromPath(sourcePath);
      if (!source) {
        stderr = "cp: " + path + ": No such file or directory";
      } else {
        targetPath = args[1];
        ref1 = this.fileSystem.splitPath(targetPath, this.cwd), targetDirPath = ref1[0], targetFilename = ref1[1];
        targetDirectory = this.getDirectoryFromPath(targetDirPath);
        targetDirectory.files.push(source);
      }
      return [stdout, stderr];
    };

    BashyOS.prototype.cleanPath = function(path) {
      path = path.replace(/\/+/g, "/");
      path = path.replace(/\/$/, "");
      return path;
    };

    BashyOS.prototype.getParentPath = function(path) {
      var i, j, len, parentPath, ref, splitPath;
      if (path === "/") {
        return "/";
      } else {
        splitPath = path.split("/");
        len = splitPath.length;
        parentPath = "";
        for (i = j = 0, ref = len - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          parentPath = parentPath + "/" + splitPath[i];
        }
        return this.cleanPath(parentPath);
      }
    };

    BashyOS.prototype.getDirectoryFromPath = function(path) {
      if (this.isRelativePath(path)) {
        path = this.parseRelativePath(path);
        path = this.cleanPath(path);
      }
      if (this.fileSystem.isValidDirectoryPath(path)) {
        return this.fileSystem.getDirectory(path);
      } else {
        return null;
      }
    };

    BashyOS.prototype.getFileFromPath = function(path) {
      path = this.cleanPath(path);
      if (this.isRelativePath(path)) {
        path = this.parseRelativePath(path);
        path = this.cleanPath(path);
      }
      if (this.fileSystem.isValidFilePath(path)) {
        return this.fileSystem.getFile(path);
      } else {
        return null;
      }
    };

    BashyOS.prototype.isRelativePath = function(path) {
      if (path[0] === "/") {
        return false;
      } else {
        return true;
      }
    };

    BashyOS.prototype.parseRelativePath = function(relativePath) {
      var cwdPath, dir, fields, finished, newPath;
      cwdPath = this.cwd.getPath();
      if (relativePath === "..") {
        newPath = this.getParentPath(cwdPath);
        return newPath;
      }
      fields = relativePath.split("/");
      finished = false;
      while (!finished) {
        if (fields.length === 1) {
          finished = true;
        }
        dir = fields[0];
        if (dir === ".") {
          fields = fields.slice(1, +fields.length + 1 || 9e9);
          continue;
        } else if (dir === "..") {
          cwdPath = this.getParentPath(cwdPath);
        } else {
          cwdPath = cwdPath + "/" + dir;
        }
        fields = fields.slice(1, +fields.length + 1 || 9e9);
      }
      return cwdPath;
    };

    return BashyOS;

  })();

  Terminal = (function() {
    function Terminal(callback) {
      $('#terminalDiv').terminal(callback, {
        greetings: "",
        prompt: '$ ',
        onBlur: false,
        name: 'bashyTerminal',
        height: 300,
        exceptionHandler: function(error) {
          return console.log(error);
        }
      });
    }

    return Terminal;

  })();

  TaskManager = (function() {
    function TaskManager() {
      this.winner = false;
      this.tasks = this.getTasks();
      this.currentTask = this.tasks[0];
      this.showTask(this.currentTask);
    }

    TaskManager.prototype.update = function(os) {
      if (!this.winner) {
        if (this.currentTask.done(os)) {
          if (this.tasks.length > 1) {
            this.tasks = this.tasks.slice(1);
            this.currentTask = this.tasks[0];
            this.showTask(this.currentTask);
          } else {
            this.winner = true;
            this.win();
          }
        }
      }
    };

    TaskManager.prototype.showTask = function(task) {
      $("#menu").html(task.name);
    };

    TaskManager.prototype.win = function() {
      $("#menuHeader").html("");
      $("#menu").html("<h4>You Win!</h4>");
    };

    TaskManager.prototype.getTasks = function() {
      var task1, task1Function, task2, task2Function, task3, task3Function;
      task1Function = function(os) {
        return os.cwd.getPath() === "/home";
      };
      task2Function = function(os) {
        return os.cwd.getPath() === "/media";
      };
      task3Function = function(os) {
        return os.cwd.getPath() === "/";
      };
      task1 = new Task("navigate to home", ["type 'cd' and press enter"], task1Function);
      task2 = new Task("navigate to /media", ["type 'cd /media' and press enter"], task2Function);
      task3 = new Task("navigate to root", ["type 'cd /' and press enter"], task3Function);
      return [task1, task2, task3];
    };

    return TaskManager;

  })();

  Task = (function() {
    function Task(name1, hints, completeFunction) {
      this.name = name1;
      this.hints = hints;
      this.completeFunction = completeFunction;
      this.isComplete = false;
    }

    Task.prototype.done = function(os) {
      if (this.isComplete) {
        return true;
      } else {
        this.isComplete = this.completeFunction(os);
        return this.isComplete;
      }
    };

    Task.prototype.toString = function() {
      return this.name;
    };

    return Task;

  })();

  DisplayManager = (function() {
    function DisplayManager(fileSystem) {
      var canvas;
      this.fileSystem = fileSystem;
      this.update = bind(this.update, this);
      canvas = $("#bashyCanvas")[0];
      this.stage = new createjs.Stage(canvas);
      this.map = this.fileSystemToMap(this.fileSystem);
      this.stage.addChild(this.map);
      this.centeredOn = "/";
      this.initializeSprite();
      return;
    }

    DisplayManager.prototype.initializeSprite = function() {
      var bashyImage;
      bashyImage = new Image();
      bashyImage.onload = (function(_this) {
        return function() {
          return _this.spriteSheetLoaded(bashyImage);
        };
      })(this);
      bashyImage.src = "assets/bashy_sprite_sheet.png";
    };

    DisplayManager.prototype.spriteSheetLoaded = function(image) {
      this.bashySprite = this.createBashySprite(image, this.stage);
      this.startTicker(this.stage);
    };

    DisplayManager.prototype.fileSystemToMap = function(fs) {
      var centeredOn, map, ref, ref1, startingX, startingY;
      ref = [130, 60], startingX = ref[0], startingY = ref[1];
      centeredOn = "/";
      map = new createjs.Container();
      map.name = "map";
      ref1 = [startingX, startingY], map.x = ref1[0], map.y = ref1[1];
      this.drawFile(map, fs.root, map.x, map.y);
      this.drawChildren(map, fs.root, map.x, map.y);
      return map;
    };

    DisplayManager.prototype.mapsEqual = function(oldMap, newMap) {
      var i, j, ref;
      if (oldMap.children.length !== newMap.children.length) {
        return false;
      } else {
        for (i = j = 0, ref = oldMap.children.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          if (oldMap.children[i].text !== newMap.children[i].text) {
            return false;
          }
        }
      }
      return true;
    };

    DisplayManager.prototype.update = function(fs, newDir) {
      var deltaX, deltaY, equal, newMap, newX, newY, oldX, oldY, ref, ref1, ref2;
      newMap = this.fileSystemToMap(fs);
      equal = this.mapsEqual(this.map, newMap);
      if (!equal) {
        this.stage.removeChild(this.map);
        this.stage.addChild(newMap);
        this.map = newMap;
      }
      ref = this.getCoordinatesForPath(this.centeredOn), oldX = ref[0], oldY = ref[1];
      ref1 = this.getCoordinatesForPath(newDir), newX = ref1[0], newY = ref1[1];
      ref2 = [oldX - newX, oldY - newY], deltaX = ref2[0], deltaY = ref2[1];
      createjs.Tween.get(this.map).to({
        x: this.map.x + deltaX,
        y: this.map.y + deltaY
      }, 500, createjs.Ease.getPowInOut(2));
      this.centeredOn = newDir;
    };

    DisplayManager.prototype.getCoordinatesForPath = function(path) {
      var item, j, lastChildDirName, len1, ref, splitPath;
      if (path === "/") {
        lastChildDirName = "/";
      } else {
        splitPath = path.split("/");
        lastChildDirName = splitPath[splitPath.length - 1];
      }
      ref = this.map.children;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        item = ref[j];
        if (item.name === lastChildDirName) {
          return [item.x, item.y];
        }
      }
    };

    DisplayManager.prototype.drawFileSystem = function(fs) {
      this.drawFile(this.map, fs.root, this.map.x, this.map.y);
      this.drawChildren(this.map, fs.root, this.map.x, this.map.y);
      this.stage.addChild(this.map);
    };

    DisplayManager.prototype.helpScreen = function(hint) {
      var helpHtml;
      helpHtml = "<h3>B@shy Help</h3>";
      helpHtml += "<p>Hint: " + hint + "</p>";
      $('#helpText').html(helpHtml);
      $('#helpScreen').foundation('reveal', 'open');
    };

    DisplayManager.prototype.createBashySprite = function(image) {
      var SPRITEX, SPRITEY, bashySpriteSheet, ref, sprite;
      ref = [200, 50], SPRITEX = ref[0], SPRITEY = ref[1];
      bashySpriteSheet = new createjs.SpriteSheet({
        images: [image],
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
      sprite.name = "bashySprite";
      sprite.framerate = 4;
      sprite.gotoAndPlay("walking");
      sprite.currentFrame = 0;
      sprite.x = SPRITEX;
      sprite.y = SPRITEY;
      this.stage.addChild(sprite);
      return sprite;
    };

    DisplayManager.prototype.startTicker = function(stage) {
      var tick;
      tick = function(event) {
        return stage.update(event);
      };
      createjs.Ticker.addEventListener("tick", tick);
      createjs.Ticker.useRAF = true;
      createjs.Ticker.setFPS(15);
    };

    DisplayManager.prototype.calculateChildCoords = function(count, parentX, parentY) {
      var coords, i, startingX, xOffset, y, yOffset;
      yOffset = 80;
      xOffset = 100;
      startingX = parentX - 0.5 * count * xOffset;
      y = parentY + yOffset;
      coords = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = count - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          results.push([startingX + 2 * i * xOffset, y]);
        }
        return results;
      })();
      return coords;
    };

    DisplayManager.prototype.drawFile = function(map, directory, x, y) {
      var ref, text;
      text = new createjs.Text(directory.name, "20px Arial", "black");
      text.name = directory.name;
      ref = [x, y], text.x = ref[0], text.y = ref[1];
      text.textBaseline = "alphabetic";
      map.addChild(text);
    };

    DisplayManager.prototype.drawChildren = function(map, parent, parentX, parentY) {
      var child, childCoords, childX, childY, i, j, line, lineOffsetX, lineOffsetY, numChildren, ref;
      lineOffsetX = 20;
      lineOffsetY = 20;
      numChildren = parent.subdirectories.length;
      childCoords = this.calculateChildCoords(numChildren, parentX, parentY);
      for (i = j = 0, ref = numChildren - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        child = parent.subdirectories[i];
        childX = childCoords[i][0];
        childY = childCoords[i][1];
        if (child.subdirectories.length > 0) {
          this.drawChildren(map, child, childX, childY);
        }
        this.drawFile(map, child, childX, childY);
        line = new createjs.Shape();
        line.graphics.setStrokeStyle(1);
        line.graphics.beginStroke("gray");
        line.graphics.moveTo(parentX, parentY + lineOffsetY);
        line.graphics.lineTo(childX + lineOffsetX, childY - lineOffsetY);
        line.graphics.endStroke();
        map.addChild(line);
      }
    };

    return DisplayManager;

  })();

  jQuery(function() {
    var game;
    return game = new BashyGame();
  });

  BashyGame = (function() {
    function BashyGame() {
      this.handleInput = bind(this.handleInput, this);
      this.taskMgr = new TaskManager();
      this.os = new BashyOS();
      this.displayMgr = new DisplayManager(this.os.fileSystem);
      this.terminal = new Terminal(this.handleInput);
      $("#helpButton").click((function(_this) {
        return function() {
          return _this.help();
        };
      })(this));
    }

    BashyGame.prototype.help = function() {
      var currentHint;
      currentHint = this.taskMgr.currentTask.hints[0];
      return this.displayMgr.helpScreen(currentHint);
    };

    BashyGame.prototype.parseCommand = function(input) {
      var args, command, splitInput;
      input = input.replace(/^\s+|\s+$/g, "");
      splitInput = input.split(/\s+/);
      command = splitInput[0];
      args = splitInput.slice(1);
      return [command, args];
    };

    BashyGame.prototype.executeCommand = function(command, args) {
      var cwd, fs, ref, stderr, stdout;
      fs = this.os.fileSystem;
      ref = this.os.runCommand(command, args), cwd = ref[0], stdout = ref[1], stderr = ref[2];
      this.taskMgr.update(this.os);
      this.displayMgr.update(fs, cwd);
      if (stderr) {
        return stderr;
      } else if (stdout) {
        return stdout;
      } else {

      }
    };

    BashyGame.prototype.handleInput = function(input) {
      var args, command, ref;
      ref = this.parseCommand(input), command = ref[0], args = ref[1];
      return this.executeCommand(command, args);
    };

    return BashyGame;

  })();

}).call(this);
