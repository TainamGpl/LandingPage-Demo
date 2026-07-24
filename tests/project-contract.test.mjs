import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const approvedScreenshotSha256 =
  'f52d997d67b51b6defca61bccac035f44dca7f7036f1c2a27ca86c41dabd9cbf';
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const sensitiveInputPattern =
  /<input\b[^>]*(?:\btype\s*=\s*(?:["']\s*)?password(?:\s*["'])?|\b(?:name|id)\s*=\s*(?:["'][^"']*(?:password|senha|cpf)[^"']*["']|[^\s>]*(?:password|senha|cpf)[^\s>]*))[^>]*>/i;
const forbiddenPublicPatterns = [
  ['chamada fetch', /\bfetch\s*\(/i],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/i],
  ['WebSocket', /\bWebSocket\b/i],
  ['navigator.sendBeacon', /\bnavigator\s*\.\s*sendBeacon\s*\(/i],
  ['EventSource', /\b(?:new\s+)?EventSource\s*\(/i],
  [
    'formulário com action remoto',
    /<form\b[^>]*\baction\s*=\s*(?:["']\s*)?(?:https?:)?\/\//i,
  ],
  [
    'controle com formaction remoto',
    /<(?:button|input)\b[^>]*\bformaction\s*=\s*(?:["']\s*)?(?:https?:)?\/\//i,
  ],
  [
    'atribuição remota de action',
    /\b[a-z_$][\w$]*\s*\.\s*action\s*=\s*["'`]\s*(?:https?:)?\/\//i,
  ],
  ['CPF', /\bcpf\b/i],
  ['input sensível', sensitiveInputPattern],
  [
    'credencial embutida',
    /\b(?:password|passwd|senha|credentials?|api[_-]?key|client[_-]?secret|access[_-]?token)\b\s*[:=]\s*['"`][^'"`\r\n]+/i,
  ],
  [
    'persistência ou leitura de dado sensível',
    /localStorage\.(?:setItem|getItem)\(\s*['"`][^'"`]*(?:password|senha|cpf|credential)/i,
  ],
  [
    'uso programático de campo sensível',
    /(?:getElementById|querySelector)\(\s*['"`][^'"`]*(?:password|senha|cpf)/i,
  ],
  [
    'indicador de backend real',
    /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/|database_url|authorization\s*[:=]|bearer\s+[a-z0-9._~+/-]{8,}/i,
  ],
];
const sensitiveCollectionPatterns = [
  ['FormData combinado com input sensível', /\b(?:new\s+)?FormData\s*\(/i],
  ['form.elements combinado com input sensível', /\.\s*elements\b/i],
];
async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );

  return nestedFiles.flat();
}

function screenshotIsApproved(screenshot) {
  const hasPngSignature = screenshot
    .subarray(0, pngSignature.length)
    .equals(pngSignature);
  const sha256 = createHash('sha256').update(screenshot).digest('hex');

  return hasPngSignature && sha256 === approvedScreenshotSha256;
}

function findPublicSafetyViolations(sources) {
  const violations = [];

  for (const { filePath, content } of sources) {
    for (const [label, pattern] of forbiddenPublicPatterns) {
      if (pattern.test(content)) {
        violations.push(`${label} encontrado em ${filePath}`);
      }
    }

    if (sensitiveInputPattern.test(content)) {
      for (const [label, pattern] of sensitiveCollectionPatterns) {
        if (pattern.test(content)) {
          violations.push(`${label} encontrado em ${filePath}`);
        }
      }
    }
  }

  return violations;
}

test('README apresenta a demo pública e a captura aprovada', async () => {
  const readme = await readFile(join(projectRoot, 'README.md'), 'utf8');

  assert.match(readme, /https:\/\/landing-store-taina\.tainalopesgpl\.chatgpt\.site/);
  assert.match(readme, /!\[[^\]]+\]\(docs\/images\/landing-preview\.png\)/);
});

test('LICENSE contém a licença MIT completa', async () => {
  const license = await readFile(join(projectRoot, 'LICENSE'), 'utf8');

  assert.match(license, /^MIT License\r?\n/);
  assert.match(license, /Copyright \(c\) 2026 Tainã Lopes/);
  assert.match(license, /Permission is hereby granted, free of charge/);
  assert.match(license, /THE SOFTWARE IS PROVIDED "AS IS"/);
});

test('captura pública existe e possui assinatura PNG válida', async () => {
  const screenshot = await readFile(
    join(projectRoot, 'docs', 'images', 'landing-preview.png'),
  );

  assert.ok(screenshotIsApproved(screenshot));
});

test('captura com assinatura PNG, mas conteúdo diferente, é rejeitada', () => {
  const forgedScreenshot = Buffer.concat([
    pngSignature,
    Buffer.from('conteúdo não aprovado'),
  ]);

  assert.equal(screenshotIsApproved(forgedScreenshot), false);
});

test('_addMessage renderiza texto sem injetá-lo em innerHTML', async () => {
  const chatbotSource = await readFile(
    join(projectRoot, 'public', 'assets', 'js', 'chatbot.js'),
    'utf8',
  );
  const createElement = (tagName) => ({
    tagName: tagName.toUpperCase(),
    attributes: new Map(),
    children: [],
    className: '',
    innerHTML: '',
    textContent: '',
    scrollHeight: 0,
    scrollTop: 0,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    classList: {
      add() {},
    },
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
  });
  const messages = createElement('div');
  const sandbox = {
    document: {
      addEventListener() {},
      createElement,
      createTextNode(text) {
        return {
          nodeType: 3,
          textContent: String(text),
        };
      },
      getElementById(id) {
        assert.equal(id, 'chatbot-messages');
        return messages;
      },
    },
    requestAnimationFrame(callback) {
      callback();
    },
    setTimeout() {
      return 0;
    },
    window: {},
  };

  runInNewContext(
    `${chatbotSource}\nglobalThis.ChatbotWidgetForTest = ChatbotWidget;`,
    sandbox,
  );

  const chatbot = Object.create(sandbox.ChatbotWidgetForTest.prototype);
  const payload = '<img src=x onerror="globalThis.injected=true">';
  chatbot._addMessage(payload, 'user');

  const bubble = messages.children[0];
  assert.doesNotMatch(bubble.innerHTML, /<img\b/i);
  const messageContent = bubble.children.find(
    (child) => child.className === 'chatbot-message__bubble',
  );
  assert.equal(messageContent?.textContent, payload);

  const botPayload = '**<img src=x onerror="globalThis.injected=true">**\nLinha segura';
  chatbot._addMessage(botPayload, 'bot');

  const botBubble = messages.children[1];
  const botContent = botBubble.children.find(
    (child) => child.className === 'chatbot-message__bubble',
  );
  assert.doesNotMatch(botContent?.innerHTML ?? '', /<img\b/i);
  const strong = botContent?.children.find((child) => child.tagName === 'STRONG');
  assert.equal(strong?.textContent, '<img src=x onerror="globalThis.injected=true">');
  assert.ok(botContent?.children.some((child) => child.tagName === 'BR'));
});

test('contrato reconhece vetores de rede e coleta sensível', () => {
  const fixtures = [
    ['sendBeacon', 'navigator.sendBeacon("/collect", payload)', 'navigator.sendBeacon'],
    ['EventSource', 'new EventSource("/events")', 'EventSource'],
    [
      'form remoto absoluto',
      '<form action="https://example.test/collect"></form>',
      'formulário com action remoto',
    ],
    [
      'form remoto HTTP',
      '<form action="http://example.test/collect"></form>',
      'formulário com action remoto',
    ],
    [
      'form remoto protocol-relative',
      '<form action="//example.test/collect"></form>',
      'formulário com action remoto',
    ],
    [
      'button com formaction remoto',
      '<button formaction="https://example.test/collect">Enviar</button>',
      'controle com formaction remoto',
    ],
    [
      'input com formaction remoto',
      '<input type="submit" formaction="//example.test/collect">',
      'controle com formaction remoto',
    ],
    [
      'atribuição remota de form.action',
      '<script>form.action = "https://example.test/collect"</script>',
      'atribuição remota de action',
    ],
    ['senha por tipo', '<input type="password">', 'input sensível'],
    ['senha por id', '<input id="auth-senha">', 'input sensível'],
    ['CPF por name', '<input name="customer-cpf">', 'input sensível'],
    [
      'FormData com senha',
      '<input name="password"><script>new FormData(form)</script>',
      'FormData combinado com input sensível',
    ],
    [
      'form.elements com CPF',
      '<input id="cpf"><script>form.elements["cpf"]</script>',
      'form.elements combinado com input sensível',
    ],
  ];

  const unblockedFixtures = fixtures.flatMap(
    ([fixtureName, content, expectedViolation]) => {
      const violations = findPublicSafetyViolations([
        { filePath: `fixture-${fixtureName}`, content },
      ]);
      return violations.some((violation) => violation.includes(expectedViolation))
        ? []
        : [`${fixtureName}: ${violations.join(', ') || 'nenhuma violação'}`];
    },
  );

  assert.deepEqual(unblockedFixtures, []);
});

test('conteúdo público não integra rede, backend real ou dados sensíveis', async () => {
  const publicRoot = join(projectRoot, 'public');
  const textExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.txt']);
  const textFiles = (await listFiles(publicRoot)).filter((filePath) =>
    textExtensions.has(extname(filePath).toLowerCase()),
  );
  const sources = await Promise.all(
    textFiles.map(async (filePath) => ({
      filePath,
      content: await readFile(filePath, 'utf8'),
    })),
  );

  assert.deepEqual(findPublicSafetyViolations(sources), []);
});

test('hosting.json contém somente project_id opcional', async () => {
  const hostingPath = join(projectRoot, '.openai', 'hosting.json');
  const hosting = JSON.parse(await readFile(hostingPath, 'utf8'));
  const keys = Object.keys(hosting).sort();

  assert.deepEqual(keys, hosting.project_id === undefined ? [] : ['project_id']);
  if (hosting.project_id !== undefined) {
    assert.equal(typeof hosting.project_id, 'string');
    assert.ok(hosting.project_id.length > 0);
  }
});

test('build gera um Worker ESM válido', async () => {
  const build = spawnSync(process.execPath, ['scripts/build.mjs'], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const workerPath = join(projectRoot, 'dist', 'server', 'index.js');
  const workerSource = await readFile(workerPath, 'utf8');
  assert.match(workerSource, /\bexport\s+default\s+\{/);
  assert.doesNotMatch(workerSource, /\bmodule\.exports\b|\brequire\s*\(/);

  const workerModule = await import(
    `${pathToFileURL(workerPath).href}?contract=${Date.now()}`
  );
  assert.equal(typeof workerModule.default?.fetch, 'function');
});
