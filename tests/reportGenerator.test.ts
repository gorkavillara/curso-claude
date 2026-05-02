import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { EventEmitter } from 'events';

// Mock 'https' before requiring the legacy module so notifySlack picks it up.
type MockReq = EventEmitter & {
  write: jest.Mock;
  end: jest.Mock;
};
type Captured = {
  options: any;
  body: string;
  req: MockReq;
};
const captured: { last?: Captured } = {};
let nextStatusCode = 200;
let nextRequestError: Error | null = null;

jest.mock('https', () => ({
  request: (options: any, cb: (res: { statusCode: number }) => void) => {
    const req = new EventEmitter() as MockReq;
    req.write = jest.fn((chunk: string) => {
      captured.last = { options, body: (captured.last?.body || '') + chunk, req };
    });
    req.end = jest.fn(() => {
      if (nextRequestError) {
        const err = nextRequestError;
        setImmediate(() => req.emit('error', err));
        return;
      }
      setImmediate(() => cb({ statusCode: nextStatusCode }));
    });
    captured.last = { options, body: '', req };
    return req;
  },
}));

const reportGenerator = require('../backend/src/legacy/reportGenerator');
const FIXTURE = path.join(__dirname, 'fixtures', 'reportGenerator.tasks.json');

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reportgen-'));
  nextStatusCode = 200;
  nextRequestError = null;
  captured.last = undefined;
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('legacy/reportGenerator — buildLine (current behavior, frozen)', () => {
  it('marks completed=true with [X] and includes description when present', () => {
    const line = reportGenerator.buildLine({
      title: 'Ship v1',
      description: 'release notes',
      completed: true,
    });
    expect(line).toBe('[X] Ship v1 — release notes');
  });

  it('marks completed=false with [ ]', () => {
    const line = reportGenerator.buildLine({
      title: 'Write docs',
      description: 'Add README',
      completed: false,
    });
    expect(line).toBe('[ ] Write docs — Add README');
  });

  it('omits the dash when description is empty string', () => {
    const line = reportGenerator.buildLine({
      title: 'Ship v1',
      description: '',
      completed: true,
    });
    expect(line).toBe('[X] Ship v1');
  });

  it('omits the dash when description is missing', () => {
    const line = reportGenerator.buildLine({ title: 'Refactor router', completed: false });
    expect(line).toBe('[ ] Refactor router');
  });

  // Quirks of `task.completed == true`. Frozen on purpose: production data may
  // rely on this exact behavior. Do not "fix" without confirming with ops.
  it('treats numeric 1 as completed (1 == true)', () => {
    const line = reportGenerator.buildLine({ title: 'x', completed: 1 });
    expect(line.startsWith('[X]')).toBe(true);
  });

  it('treats string "true" as NOT completed ("true" == true is false)', () => {
    const line = reportGenerator.buildLine({ title: 'x', completed: 'true' });
    expect(line.startsWith('[ ]')).toBe(true);
  });

  it('treats numeric 0 as NOT completed', () => {
    const line = reportGenerator.buildLine({ title: 'x', completed: 0 });
    expect(line.startsWith('[ ]')).toBe(true);
  });
});

describe('legacy/reportGenerator — loadTasks', () => {
  it('returns the tasks array from a JSON dump', (done) => {
    reportGenerator.loadTasks(FIXTURE, (err: Error | null, tasks: unknown[]) => {
      expect(err).toBeNull();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(5);
      done();
    });
  });

  it('returns [] when the JSON has no tasks key', (done) => {
    const p = path.join(tmpRoot, 'empty.json');
    fs.writeFileSync(p, JSON.stringify({}));
    reportGenerator.loadTasks(p, (err: Error | null, tasks: unknown[]) => {
      expect(err).toBeNull();
      expect(tasks).toEqual([]);
      done();
    });
  });

  it('propagates fs errors when the file does not exist', (done) => {
    reportGenerator.loadTasks(path.join(tmpRoot, 'missing.json'), (err: NodeJS.ErrnoException) => {
      expect(err).toBeTruthy();
      expect(err.code).toBe('ENOENT');
      done();
    });
  });

  it('propagates JSON parse errors', (done) => {
    const p = path.join(tmpRoot, 'broken.json');
    fs.writeFileSync(p, '{not json');
    reportGenerator.loadTasks(p, (err: Error | null) => {
      expect(err).toBeInstanceOf(SyntaxError);
      done();
    });
  });
});

describe('legacy/reportGenerator — generateReport (output frozen)', () => {
  it('writes report.txt with the exact expected layout', (done) => {
    reportGenerator.generateReport(FIXTURE, tmpRoot, (err: Error | null, outPath: string) => {
      expect(err).toBeNull();
      expect(outPath).toBe(path.join(tmpRoot, 'report.txt'));

      // NOTE: this output reflects a real inconsistency in the legacy module:
      // generateReport groups by truthy check (`if (t.completed)`), but
      // buildLine uses `== true`. So `completed: "true"` is grouped under
      // Completed yet rendered with `[ ]`. Frozen on purpose — do not "fix".
      const expected =
        'TaskMaster Report\n' +
        '=================\n\n' +
        'Pending (2):\n' +
        '  [ ] Write docs — Add README\n' +
        '  [ ] Refactor router\n' +
        '\n' +
        'Completed (3):\n' +
        '  [X] Ship v1\n' +
        '  [X] Numeric truthy — completed is 1\n' +
        '  [ ] String truthy — completed is the string true\n';

      const actual = fs.readFileSync(outPath, 'utf8');
      expect(actual).toBe(expected);
      done();
    });
  });

  it('propagates errors from loadTasks', (done) => {
    reportGenerator.generateReport(
      path.join(tmpRoot, 'missing.json'),
      tmpRoot,
      (err: NodeJS.ErrnoException) => {
        expect(err).toBeTruthy();
        expect(err.code).toBe('ENOENT');
        done();
      },
    );
  });

  it('propagates errors when the output directory does not exist', (done) => {
    const badOut = path.join(tmpRoot, 'does', 'not', 'exist');
    reportGenerator.generateReport(FIXTURE, badOut, (err: NodeJS.ErrnoException) => {
      expect(err).toBeTruthy();
      expect(err.code).toBe('ENOENT');
      done();
    });
  });
});

describe('legacy/reportGenerator — notifySlack', () => {
  it('POSTs the report contents as { text } and returns the status code', (done) => {
    const reportPath = path.join(tmpRoot, 'report.txt');
    const reportBody = 'TaskMaster Report\nhello';
    fs.writeFileSync(reportPath, reportBody, 'utf8');
    nextStatusCode = 201;

    reportGenerator.notifySlack(
      reportPath,
      'https://hooks.slack.com/services/AAA/BBB/CCC',
      (err: Error | null, statusCode: number) => {
        expect(err).toBeNull();
        expect(statusCode).toBe(201);

        const c = captured.last!;
        expect(c.options.method).toBe('POST');
        expect(c.options.host).toBe('hooks.slack.com');
        expect(c.options.path).toBe('/services/AAA/BBB/CCC');
        expect(c.options.headers['Content-Type']).toBe('application/json');
        expect(JSON.parse(c.body)).toEqual({ text: reportBody });
        expect(c.options.headers['Content-Length']).toBe(c.body.length);
        done();
      },
    );
  });

  it('propagates fs errors when the report file is missing', (done) => {
    reportGenerator.notifySlack(
      path.join(tmpRoot, 'missing.txt'),
      'https://hooks.slack.com/services/X/Y/Z',
      (err: NodeJS.ErrnoException) => {
        expect(err).toBeTruthy();
        expect(err.code).toBe('ENOENT');
        done();
      },
    );
  });

  it('propagates request errors via the error event', (done) => {
    const reportPath = path.join(tmpRoot, 'report.txt');
    fs.writeFileSync(reportPath, 'x', 'utf8');
    nextRequestError = new Error('network down');

    reportGenerator.notifySlack(
      reportPath,
      'https://hooks.slack.com/services/X/Y/Z',
      (err: Error | null) => {
        expect(err).toBeTruthy();
        expect((err as Error).message).toBe('network down');
        done();
      },
    );
  });
});
