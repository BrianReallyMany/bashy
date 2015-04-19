class Zone
	constructor: (@displayMgr, @taskMgr, @os) ->
		# Listen for any click whatsoever
		# TODO should this just go in BashyGame?
		$("html").click => @displayMgr.helpScreen @taskMgr.currentTask.hints[0]

	run: () ->
		# TODO how to return next zone from within handleInput method?
		@displayMgr.drawFileSystem(@os.fileSystem)
		# Create Terminal object
		# 'onBlur: false' guarantees the terminal always stays in focus
		$('#terminal').terminal(@handleInput,
			{ greetings: "", prompt: '$ ', onBlur: false, name: 'bashyTerminal' })

	parseCommand: (input) ->
		# Trim leading and trailing whitespace
		input = input.replace /^\s+|\s+$/g, ""
		splitInput = input.split /\s+/
		command = splitInput[0]
		args = splitInput[1..]
		# Return list with command (string) and args (list of strings)
		return [command, args]

	executeCommand: (command, args) ->
		# Get a copy of the current file system
		fs = @os.fileSystem

		# @os updates and returns context, stdout, stderr
		# @os.fileSystem may be modified by this command
		[cwd, stdout, stderr] = @os.runCommand(command, args)

		# TaskManager checks for completed tasks
		@taskMgr.update(@os)

		# DisplayManager updates map
		@displayMgr.update(fs, cwd)
		
	# Function called each time user types a command
	# Takes user input string, updates system, returns text to terminal
	handleInput: (input) =>
		# Strip leading and trailing whitespace
		[command, args] = @parseCommand(input)
		return @executeCommand(command, args)
