class @BashyOS
class @BashySprite
class @FileSystem
class @DisplayManager
class @TaskManager
class @MenuManager
class @SoundManager
class @Util

jQuery ->
	## LOAD UTILITY FUNCTIONS
	util = new Util() # TODO how to use static library?

	###################################################
	################## CANVAS, ETC. ###################
	###################################################
	## EASELJS SETUP CANVAS, STAGE, ANIMATIONS ##
	# Create canvas and stage
	canvas = $("#bashy_canvas")[0]
	stage = new createjs.Stage(canvas)

	# Load spritesheet image; start game when it's loaded
	bashy_himself = new Image()
	bashy_himself.src = "assets/bashy_sprite_sheet.png"
	bashy_himself.onload = ->
		startGame()

	###################################################
	################ SOUND ############################
	###################################################
	sound_mgr = new SoundManager()
	# Listen for 'turn off sound' button
	$("#audio_off").click sound_mgr.soundOff
	# Load sounds and fire sound_mgr.handleFileLoad when they're in memory
	createjs.Sound.addEventListener("fileload", sound_mgr.handleFileLoad)
	createjs.Sound.alternateExtensions = ["mp3"]
	createjs.Sound.registerManifest(
		    [{id:"boing1", src:"boing1.mp3"},
		     {id:"boing2", src:"boing2.mp3"},
		     {id:"oops", src:"oops.mp3"},
		     {id:"bashy_theme1", src:"bashy_theme1.mp3"}]
			, "assets/")

	###################################################
	################ HELP SCREEN ######################
	###################################################
	
	# Play intro on first click; show help screen on subsequent clicks
	seenIntro = false
	$("#playScreen").click ->
		if not seenIntro
			playIntro()
			seenIntro = true
		else
			helpScreen()

	###################################################
	########### MAIN GAME SETUP AND LOOP ##############
	###################################################
	startGame = () ->
		# Turn off sound
		sound_mgr.soundOff()

		# Create OS
		file_system = new FileSystem()
		os = new BashyOS(file_system)

		# Set up graphics
		drawFileSystem(stage, os.file_system)
		bashy_sprite = createBashySprite(bashy_himself, stage)
		startTicker(stage)

		# Create other objects
		display_mgr = new DisplayManager(bashy_sprite) # TODO really need this?
		menu_mgr = new MenuManager()
		task_mgr = new TaskManager(menu_mgr)

		executeCommand = (command, args, os, task_mgr, display_mgr, sound_mgr) ->
			# Get a copy of the current file system
			fs = os.file_system

			# BashyOS updates and returns context, stdout, stderr
			[cwd, stdout, stderr] = os.runCommand(command, args)

			# TaskManager checks for completed tasks
			task_mgr.update(os)

			# DisplayManager updates map
			# TODO re-implement
			#display_mgr.update(fs, cwd)
			
			# Handle sound effects
			# TODO can't seem to turn these off.
			###
			if stderr
				sound_mgr.playOops()
			else
				sound_mgr.playBoing()
			###

			# Return text to terminal
			if stderr
				stderr
			else
				if stdout
					stdout
				else
					# Returning 'undefined' means no terminal output
					undefined

		# Function called each time user types a command
		# Takes user input string, updates system, returns text to terminal
		handleInput = (input) ->
			# Strip leading and trailing whitespace
			input = input.replace /^\s+|\s+$/g, ""
			# Parse input and check for invalid command
			[command, args] = util.parseCommand(input)
			if command not in os.validCommands()
				"Invalid command: " + command
			else
				executeCommand(command, args, os, task_mgr, display_mgr, sound_mgr)

		# Create Terminal object
		# 'onBlur: false' guarantees the terminal always stays in focus
		$('#terminal').terminal(handleInput,
			{ greetings: "", prompt: '> ', onBlur: false, name: 'bashy_terminal' })

