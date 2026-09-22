import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const html = readFileSync('index.html', 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const code = readFileSync('data.js', 'utf8') + '\n' + readFileSync('script.js', 'utf8');
const fixtures = {
    notice: [{ id: 'notice-1', title: '테스트 공지', content: '공지 내용' }],
    pokemon: [{ id: 'pikachu', name_ko: '피카츄', types: ['electric'], grade: 'SS', skills: [] }],
    items: [{ id: 'item-1', name: '테스트 아이템', grade: 'God' }],
    runeAndChips: [{ id: 'rune-1', name: '테스트 룬', type: 'rune' }, { id: 'chip-1', name: '테스트 칩', type: 'chip' }],
    tips: [{ id: 'tip-1', name: '테스트 팁', content: '팁 내용' }],
    recommendedDecks: [{ id: 'deck-1', name: '테스트 덱', likeCount: 7, composition: [] }],
    events: []
};

async function setup(t, width = 390, options = {}) {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error.message));
    const dom = new JSDOM(html, { url: 'https://archive.example.test/', runScripts: 'outside-only', virtualConsole });
    t.after(() => dom.window.close());
    const w = dom.window;
    w.innerWidth = width;
    w.IntersectionObserver = class { observe() {} unobserve() {} };
    w.alert = message => errors.push(message);
    w.db = {
        collection(name) {
            return { where(field, op, value) {
                assert.deepEqual([field, op, value], ['isPublished', '==', true]);
                return { async get() {
                    if (options.loadError) throw new Error('Test offline');
                    const docs = fixtures[name].map(item => ({ id: item.id, data: () => ({ ...item, isPublished: true }) }));
                    return { docs, forEach: callback => docs.forEach(callback) };
                } };
            } };
        }
    };
    w.reactionDb = {};
    w.reactionAuth = {};
    let liked = false;
    w.ArchiveAccess = {
        async getReaction() { return liked; },
        async setReaction(db, auth, id, desired) {
            if (options.reactionError) throw new Error('Test offline');
            liked = desired;
            return { liked, count: liked ? 8 : 7 };
        }
    };
    w.firebase = { firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } };
    await new Promise(resolve => w.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    w.eval(code);
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 30));
    return { w, document: w.document, errors, tick: () => new Promise(resolve => setTimeout(resolve, 30)) };
}

test('home loads public notices and popular decks without visitor-stat writes', async t => {
    const { document, errors } = await setup(t);
    assert.match(document.querySelector('#main-notice-list').textContent, /테스트 공지/);
    assert.match(document.querySelector('#popular-deck-list').textContent, /테스트 덱/);
    assert.deepEqual(errors, []);
});

test('all mobile grid categories open without coming-soon alerts', async t => {
    const { document, errors, tick } = await setup(t);
    for (const button of document.querySelectorAll('.grid-menu-btn')) {
        button.click();
        await tick();
        if (button.dataset.menuId === 'calendar') {
            assert.equal(document.querySelector('#lev4-panel').classList.contains('visible'), true);
            document.querySelector('#lev4-panel .back-btn').click();
        } else {
            assert.equal(document.querySelector('#list-filter-page').classList.contains('visible'), true);
            assert.notEqual(document.querySelector('#list-page-content').children.length, 0);
            document.querySelector('.back-to-grid-btn').click();
        }
    }
    assert.deepEqual(errors, []);
});

test('mobile sidebar categories, deck details, like/unlike, and back buttons work', async t => {
    const { document, errors, tick } = await setup(t);
    document.querySelector('#sidebar [data-id="deck"]').click();
    await tick();
    document.querySelector('#list-page-content [data-id="deck-1"]').click();
    await tick();
    const button = document.querySelector('.like-btn');
    assert.equal(button.disabled, false);
    button.click();
    await tick();
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.equal(button.querySelector('.like-count').textContent, '8');
    button.click();
    await tick();
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.equal(button.querySelector('.like-count').textContent, '7');
    document.querySelector('#lev4-panel .back-btn').click();
    assert.equal(document.querySelector('#list-filter-page').classList.contains('visible'), true);
    document.querySelector('.back-to-grid-btn').click();
    await new Promise(resolve => setTimeout(resolve, 360));
    assert.equal(document.querySelector('#main-placeholder').style.display, 'flex');
    assert.equal(document.querySelector('#list-filter-page').style.display, 'none');
    assert.deepEqual(errors, []);
});

test('desktop sidebar opens recommended decks and returns through panels', async t => {
    const { document, errors, tick } = await setup(t, 1280);
    document.querySelector('#sidebar [data-id="deck"]').click();
    document.querySelector('#lev2-panel [data-id="recommended"]').click();
    document.querySelector('#lev3-panel [data-id="deck-1"]').click();
    await tick();
    assert.ok(document.querySelector('#lev4-panel .like-btn'));
    document.querySelector('#lev4-panel .back-btn').click();
    assert.equal(document.querySelector('#lev3-panel').classList.contains('visible'), true);
    document.querySelector('#lev3-panel .back-btn').click();
    document.querySelector('#lev2-panel .back-btn').click();
    assert.equal(document.querySelector('#main-placeholder').style.display, 'flex');
    assert.deepEqual(errors, []);
});

test('a failed like keeps the count and gives an inline error', async t => {
    const { document, tick, errors } = await setup(t, 390, { reactionError: true });
    document.querySelector('.grid-menu-btn[data-menu-id="deck"]').click();
    await tick();
    document.querySelector('#list-page-content [data-id="deck-1"]').click();
    await tick();
    const button = document.querySelector('.like-btn');
    button.click();
    await tick();
    assert.equal(button.querySelector('.like-count').textContent, '7');
    assert.equal(button.disabled, false);
    assert.ok(document.querySelector('.reaction-status').textContent.length > 0);
    assert.deepEqual(errors, []);
});

test('a loading failure preserves the header, admin link, and retry action', async t => {
    const { document, errors } = await setup(t, 390, { loadError: true });
    assert.ok(document.querySelector('header .owner-link'));
    assert.match(document.querySelector('#main-placeholder').textContent, /다시 불러오기/);
    assert.deepEqual(errors, []);
});
