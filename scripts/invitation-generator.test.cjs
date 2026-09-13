const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '..', 'services', 'invitationGenerator.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', code)(require, mod, mod.exports);
const { generateInvitation } = mod.exports;

const events = ['Wedding', 'Engagement', 'Mehendi', 'Sangeet', 'Reception', 'Birthday', 'Anniversary', 'Housewarming', 'Corporate Gala'];

test('invitation generator creates polite, complete copy for every event', () => {
  for (const eventType of events) {
    const draft = generateInvitation({
      eventType,
      primaryName: eventType === 'Corporate Gala' ? 'Vellure India' : 'Meera',
      secondaryName: eventType === 'Corporate Gala' ? undefined : 'Arjun',
      date: 'Saturday, 14 February 2027',
      time: '6:00 PM onwards',
      venue: 'The Leela Palace',
      city: 'Jaipur, Rajasthan',
      tone: eventType === 'Corporate Gala' ? 'Formal' : 'Warm',
      variation: 0,
    });
    assert.equal(draft.eventType, eventType);
    assert.match(draft.invitationLine, /invite|request|honour|pleasure|delighted/i);
    assert.ok(draft.blessingLine.length > 30);
    assert.ok(draft.qualityScore >= 95);
    assert.ok(draft.etiquetteNotes.length > 0);
  }
});

test('fresh generation changes composition and wording', () => {
  const request = { eventType: 'Wedding', primaryName: 'Meera', secondaryName: 'Arjun', date: '14 February 2027', time: '4:00 PM', venue: 'Raj Bagh Palace', city: 'Jaipur', tone: 'Warm' };
  const first = generateInvitation({ ...request, variation: 0 });
  const second = generateInvitation({ ...request, variation: 1 });
  assert.notEqual(first.layout, second.layout);
  assert.notEqual(first.headline, second.headline);
  assert.notEqual(first.invitationLine, second.invitationLine);
  assert.notEqual(first.generationId, second.generationId);
});

test('invitation generator guarantees 0 collisions and verifies safe zones across all events', () => {
  for (const eventType of events) {
    const draft = generateInvitation({
      eventType,
      primaryName: 'Meera',
      secondaryName: 'Arjun',
      date: '14 February 2027',
      time: '4:00 PM',
      venue: 'Raj Bagh Palace',
      city: 'Jaipur',
      tone: 'Regal Royal',
      variation: 2,
    });
    assert.equal(draft.overlapAudit.collisionCount, 0);
    assert.equal(draft.overlapAudit.textCollisionRisk, 'Zero (Verified)');
    assert.ok(draft.safeZone.top >= 70);
    assert.ok(draft.safeZone.bottom <= 450);
    assert.ok(draft.agentTraces.length >= 10);
    assert.ok(draft.culturalContext.ritualSummary.length > 20);
  }
});

test('mapBackendCandidateToDraft correctly converts backend multi-agent payload', () => {
  const { mapBackendCandidateToDraft } = mod.exports;
  const mockBackendPayload = {
    invitationId: 'inv_live_9999',
    selectedCandidate: {
      candidateId: 'cand_1',
      creativeDirectionName: 'Regal Arch & Golden Lotus',
      themeCategory: 'Regal Botanical',
      sceneGraph: {
        safeZones: { textSafe: { x: 80, y: 160, width: 920, height: 1200 } },
        layers: new Array(26).fill({ id: 'layer' }),
      },
      copyContent: {
        eyebrow: 'With Auspicious Blessings',
        headline: 'Sacred Wedding Ceremony',
        primaryNames: ['Pooja', 'Karan'],
        invitationLine: 'cordially request your gracious presence',
        blessingLine: 'May harmony and divine grace bless this eternal union.',
        date: 'Sunday, 15 March 2026',
        time: '7:00 PM onwards',
        venue: 'Umaid Bhawan Palace',
        location: 'Jodhpur, Rajasthan',
        footer: 'Warm regards · The Sharma Family',
      },
      palette: {
        background: '#FFFDF9',
        surface: '#FBF5EE',
        primary: '#32161A',
        accent: '#D4AF37',
        muted: '#8C7A6B',
      },
      scores: {
        weightedTotal: 98,
        breakdown: {
          premiumQuality: 97,
          readability: 98,
          culturalAccuracy: 99,
        },
      },
      validation: {
        collisions: [],
      },
    },
    auditLog: [
      { agent: 'Event Recognition Agent', status: 'VERIFIED', detail: 'Wedding ceremony identified.' },
      { agent: 'Final Gatekeeper Agent', status: 'PASSED', detail: '0 collisions, certified luxury invite.' },
    ],
  };

  const draft = mapBackendCandidateToDraft(mockBackendPayload, {
    eventType: 'Wedding',
    primaryName: 'Pooja',
    secondaryName: 'Karan',
    date: 'Sunday, 15 March 2026',
    time: '7:00 PM onwards',
    venue: 'Umaid Bhawan Palace',
    city: 'Jodhpur, Rajasthan',
    tone: 'Regal Royal',
    variation: 0,
  });

  assert.equal(draft.generationId, 'inv_live_9999');
  assert.equal(draft.backendPowered, true);
  assert.equal(draft.layout, 'royal-arch');
  assert.equal(draft.names[0], 'Pooja');
  assert.equal(draft.names[1], 'Karan');
  assert.equal(draft.headline, 'Sacred Wedding Ceremony');
  assert.equal(draft.qualityScore, 98);
  assert.equal(draft.overlapAudit.collisionCount, 0);
  assert.equal(draft.overlapAudit.textCollisionRisk, 'Zero (Verified)');
});

test('generateInvitationFromBackend seamlessly falls back to 0-overlap local draft if backend is offline', async () => {
  const { generateInvitationFromBackend, setBackendBaseUrl } = mod.exports;
  // Point to a non-existent port to simulate offline
  setBackendBaseUrl('http://127.0.0.1:59999/api/v1');

  const draft = await generateInvitationFromBackend({
    eventType: 'Sangeet',
    primaryName: 'Meera',
    secondaryName: 'Arjun',
    date: 'Friday, 12 February 2027',
    time: '7:30 PM onwards',
    venue: 'The Royal Ballroom',
    city: 'Jaipur, Rajasthan',
    tone: 'Warm',
    variation: 0,
  });

  assert.equal(draft.eventType, 'Sangeet');
  assert.equal(draft.backendPowered, false);
  assert.equal(draft.overlapAudit.collisionCount, 0);
  assert.ok(draft.qualityScore >= 90);
  setBackendBaseUrl(null);
});
