// Legacy module — original 2017 implementation.
// Generates a plain-text report of tasks, including weekly summary.
// Still used by an internal cron job. Do not delete without checking ops.

var fs = require('fs');
var path = require('path');

function loadTasks(dbPath, cb) {
  fs.readFile(dbPath, function (err, data) {
    if (err) {
      cb(err);
      return;
    }
    try {
      var parsed = JSON.parse(data);
      cb(null, parsed.tasks || []);
    } catch (e) {
      cb(e);
    }
  });
}

function buildLine(task) {
  var status = '';
  if (task.completed == true) {
    status = '[X]';
  } else {
    status = '[ ]';
  }
  var line = status + ' ' + task.title;
  if (task.description && task.description.length > 0) {
    line = line + ' — ' + task.description;
  }
  return line;
}

function generateReport(dbPath, outDir, cb) {
  loadTasks(dbPath, function (err, tasks) {
    if (err) {
      cb(err);
      return;
    }

    var pending = [];
    var done = [];
    for (var i = 0; i < tasks.length; i++) {
      var t = tasks[i];
      if (t.completed) {
        done.push(t);
      } else {
        pending.push(t);
      }
    }

    var report = '';
    report += 'TaskMaster Report\n';
    report += '=================\n\n';
    report += 'Pending (' + pending.length + '):\n';
    for (var j = 0; j < pending.length; j++) {
      report += '  ' + buildLine(pending[j]) + '\n';
    }
    report += '\nCompleted (' + done.length + '):\n';
    for (var k = 0; k < done.length; k++) {
      report += '  ' + buildLine(done[k]) + '\n';
    }

    var outPath = path.join(outDir, 'report.txt');
    fs.writeFile(outPath, report, function (writeErr) {
      if (writeErr) {
        cb(writeErr);
        return;
      }
      cb(null, outPath);
    });
  });
}

function notifySlack(reportPath, webhook, cb) {
  fs.readFile(reportPath, 'utf8', function (err, data) {
    if (err) {
      cb(err);
      return;
    }
    var http = require('https');
    var url = require('url');
    var parsed = url.parse(webhook);
    var payload = JSON.stringify({ text: data });

    var req = http.request(
      {
        host: parsed.host,
        path: parsed.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      },
      function (res) {
        cb(null, res.statusCode);
      },
    );
    req.on('error', function (e) {
      cb(e);
    });
    req.write(payload);
    req.end();
  });
}

module.exports = {
  loadTasks: loadTasks,
  buildLine: buildLine,
  generateReport: generateReport,
  notifySlack: notifySlack,
};
