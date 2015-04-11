parseCommand = (input) ->
	splitInput = input.split /\s+/
	command = splitInput[0]
	args = splitInput[1..]
	return [command, args]

createZoneManager = (display, sound, zone) ->
	# TODO create zone based on 'zone' arg
	zoneManager = new ZoneManager(display, sound)
	return zoneManager

class Zone
	constructor: (@displayMgr, @soundMgr, @taskMgr, @os) ->
		# Listen for any click whatsoever
		$("html").click => helpScreen @taskMgr.currentTask.hints[0]

	run: () ->
		# TODO how to return next zone from within handleInput method?
		@displayMgr.drawFileSystem(@os.fileSystem)
		# Create Terminal object
		# 'onBlur: false' guarantees the terminal always stays in focus
		$('#terminal').terminal(@handleInput,
			{ greetings: "", prompt: '$ ', onBlur: false, name: 'bashyTerminal' })

	executeCommand: (command, args) ->
		# Get a copy of the current file system
		fs = @os.fileSystem

		# @os updates and returns context, stdout, stderr
		# @os.fileSystem may be modified by this command
		[cwd, stdout, stderr] = @os.runCommand(command, args)
		alert cwd

		# TaskManager checks for completed tasks
		@taskMgr.update(@os)

		# DisplayManager updates map
		@displayMgr.update(fs, cwd)
		
		# Play sound effect, 
		# return text to terminal
		if stderr
			@playError()
			return stderr
		else
			@playSuccess()
			if stdout
				return stdout
			else
				# Returning 'undefined' means no terminal output
				return undefined

	playError: ->
		@soundMgr.playOops()

	playSuccess: ->
		@soundMgr.playBoing()


	# Function called each time user types a command
	# Takes user input string, updates system, returns text to terminal
	handleInput: (input) =>
		# Strip leading and trailing whitespace
		input = input.replace /^\s+|\s+$/g, ""
		# Parse input and check for invalid command
		# TODO use a splat here
		[command, args] = parseCommand(input)
		if command not in @os.validCommands
			return "Invalid command: #{command}"
		else
			return @executeCommand(command, args)


class ZoneManager
	constructor: (@displayMgr, @soundMgr) ->
		@taskMgr = new TaskManager()
		@os = createBashyOS "nav"
		@currentZone = new Zone(@displayMgr, @soundMgr, @taskMgr, @os)

	run: () ->
		@currentZone.run()
