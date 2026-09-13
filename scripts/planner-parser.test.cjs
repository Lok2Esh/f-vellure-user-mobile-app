const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function compile(relative, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    if (!(id in dependencies)) throw new Error('Unexpected import: ' + id);
    return dependencies[id];
  }, mod, mod.exports);
  return mod.exports;
}
function loadParser() {
  const catalog = compile('constants/plannerServices.ts');
  return compile('services/aiParser.ts', { '../constants/plannerServices': catalog });
}
test('mobile prompt parser reads the total budget, not the first service price', () => {
  const { parseNaturalLanguagePrompt } = loadParser();
  for (const [note, budget] of [
    ['Photography 25k. Engagement in Patiala for 150 guests. Budget ₹4 lakh.', 400000],
    ['Photography budget 25k. Engagement in Patiala for 150 guests. Total budget ₹4L.', 400000],
    ['Birthday in Patiala for 50 guests, budget 1.5 lakh.', 150000],
    ['Reception for 1,000 guests. Budget INR 12,00,000.', 1200000],
  ]) {
    const result = parseNaturalLanguagePrompt(note, 'Patiala');
    assert.equal(result.totalBudget, budget);
  }
  assert.ok(parseNaturalLanguagePrompt('Plan a birthday', 'Patiala').missingInfo.some(s => s.includes('budget limit')));
  assert.deepEqual(
    parseNaturalLanguagePrompt('Jaipur engagement for 120 guests with catering and decor. Budget ₹6 lakh.', 'Patiala').selectedServiceKeys,
    ['catering', 'decor']
  );
});

test('offline planner builds an exact, service-aware budget allocation', () => {
  const catalog = compile('constants/plannerServices.ts');
  const { createLocalBudgetPlan } = compile('services/localBudgetPlanner.ts', {
    '../constants/plannerServices': catalog,
  });
  const result = createLocalBudgetPlan({
    totalBudget: 2500000,
    guestCount: 250,
    city: 'Jaipur',
    vibe: 'Royal Heritage',
    eventType: 'Wedding',
    services: ['venue', 'catering', 'decor', 'photography'],
    confirmedDetails: true,
  });
  assert.equal(result.categories.reduce((sum, item) => sum + item.amount, 0), 2500000);
  assert.deepEqual(result.interpretation.services, ['venue', 'catering', 'decor', 'photography']);
  assert.ok(result.categories.every(item => item.lowEstimate > 0 && item.highEstimate >= item.lowEstimate));
  assert.ok(result.categories.some(item => item.service === 'buffer'));
});

test('offline planner adjusts benchmark ranges by Indian city market', () => {
  const catalog = compile('constants/plannerServices.ts');
  const { createLocalBudgetPlan } = compile('services/localBudgetPlanner.ts', {
    '../constants/plannerServices': catalog,
  });
  const base = { totalBudget: 1200000, guestCount: 200, vibe: 'Elegant', eventType: 'Wedding', services: ['venue'] };
  const mumbai = createLocalBudgetPlan({ ...base, city: 'Mumbai' });
  const patiala = createLocalBudgetPlan({ ...base, city: 'Patiala' });
  assert.ok(mumbai.categories[0].highEstimate > patiala.categories[0].highEstimate);
});
