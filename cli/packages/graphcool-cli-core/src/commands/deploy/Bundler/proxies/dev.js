var child = require('child_process')
var byline = require('./byline')
var fs = require('fs')
injectEnvironment()

var input = byline(process.stdin)
var old_stdout_write = process.stdout.write
var stdout = ''
var stderr = ''

function localLog(useStderr) {
  return function() {
    [].forEach.call(arguments, function(arg) {
      if (useStderr) {
        stderr += arg + ' '
      } else {
        stdout += arg + ' '
      }
    })
    if (useStderr) {
      stderr += '\n'
    } else {
      stdout += '\n'
    }
  }
}

process.stdout.write = localLog()
process.stderr.write = localLog(true)
console.log = localLog()
console.info = localLog()
console.error = localLog(true)
console.warn = localLog(true)

var fn = require(getTargetFileName())
fn = fn.default || fn

input.on('data', function(line){
  const event = JSON.parse(line)
  executeFunction(fn, event, cb)
})

// prevent process from exiting
// function infinite() {
//   setTimeout(infinite, 100000)
// }
// infinite()

function cb(error, value) {
  const result = {
    error: error,
    value: value,
    stdout: stdout,
    stderr: stderr
  }
  old_stdout_write.call(process.stdout, JSON.stringify(result) + '\n')
  stdout = ''
  stderr = ''
}

function executeFunction(fn, event, cb) {
  try {
    var promise = fn(event)
    if (typeof promise.then === 'function') {
      promise.then(function (data) {
        cb(null, data)
      }).catch(function (error) {
        cb(error)
      })
    } else {
      cb(null, promise)
    }
  } catch (e) {
    cb(e)
  }
}

function getTargetFileName() {
  return __filename.slice(0, __filename.length - 7) + '.js'
}

function getEnvFileName() {
  return __filename.slice(0, __filename.length - 7) + '.env.json'
}

function injectEnvironment() {
  var envFileName = getEnvFileName()
  if(fs.existsSync(envFileName)) {
    try {
      var file = fs.readFileSync(envFileName, 'utf-8')
      var json = JSON.parse(file)
      if (json) {
        Object.assign(process.env, json)
      }
    } catch (e) {
      // noop
    }
  }
}
