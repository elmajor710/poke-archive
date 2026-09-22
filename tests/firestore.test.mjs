import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const require = createRequire(import.meta.url);
const owner = 'test-owner-only';
const collections = ['pokemon', 'items', 'runeAndChips', 'notice', 'tips', 'events',
    'recommendedDecks', 'announcements', 'v2_pokemon', 'v2_items', 'v2_runes',
    'v2_chips', 'v2_notice', 'v2_tips', 'v2_events', 'v2_decks'];
let env;
firebase.firestore.setLogLevel('silent');
before(async () => {
    env = await initializeTestEnvironment({
        projectId: 'demo-poke-archive',
        firestore: { host: '127.0.0.1', port: 8180,
            rules: readFileSync('security/firestore.rules.template', 'utf8').replace('__OWNER_UID__', owner) }
    });
});
after(async () => { if (env) await env.cleanup(); });
beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async context => {
        const batch = context.firestore().batch();
        for (const name of collections) {
            batch.set(context.firestore().doc(`${name}/public`), { name: 'Public', isPublished: true, likeCount: 7 });
            batch.set(context.firestore().doc(`${name}/draft`), { name: 'Draft', isPublished: false, likeCount: 0 });
            batch.set(context.firestore().doc(`${name}/missing-flag`), { name: 'Unclassified' });
        }
        batch.set(context.firestore().doc('siteStats/visitors'), { total: 100 });
        await batch.commit();
    });
});

function access() {
    const resolved = require.resolve('../archive-access.js');
    delete require.cache[resolved];
    return require(resolved);
}
function auth(uid) {
    const instance = {
        currentUser: uid ? { uid } : null,
        onAuthStateChanged(callback) { queueMicrotask(() => callback(instance.currentUser)); return () => {}; },
        async signInAnonymously() { throw new Error('Browsing must not sign in'); }
    };
    return instance;
}
const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();

test('visitors and non-owner accounts can read only published content', async () => {
    for (const db of [env.unauthenticatedContext().firestore(), env.authenticatedContext('visitor').firestore()]) {
        for (const name of collections) {
            await assertSucceeds(db.doc(`${name}/public`).get());
            const snapshot = await assertSucceeds(db.collection(name).where('isPublished', '==', true).get());
            assert.equal(snapshot.size, 1);
            await assertFails(db.doc(`${name}/draft`).get());
            await assertFails(db.doc(`${name}/missing-flag`).get());
            await assertFails(db.collection(name).get());
        }
    }
});

test('only owner can create, edit, publish, or delete content including v2', async () => {
    const ownerDb = env.authenticatedContext(owner).firestore();
    for (const name of collections) {
        for (const db of [env.unauthenticatedContext().firestore(), env.authenticatedContext('visitor').firestore()]) {
            await assertFails(db.doc(`${name}/new`).set({ isPublished: true }));
            await assertFails(db.doc(`${name}/public`).update({ name: 'Tampered' }));
            await assertFails(db.doc(`${name}/draft`).update({ isPublished: true }));
            await assertFails(db.doc(`${name}/public`).delete());
        }
        await assertSucceeds(ownerDb.collection(name).get());
        await assertSucceeds(ownerDb.doc(`${name}/new`).set({ name: 'New', isPublished: false }));
        await assertSucceeds(ownerDb.doc(`${name}/new`).update({ isPublished: true }));
        await assertSucceeds(ownerDb.doc(`${name}/new`).delete());
    }
});

test('admin permission probe rejects anonymous and non-owner accounts', async () => {
    await assertSucceeds(access().requireOwner(env.authenticatedContext(owner).firestore()));
    await assertFails(access().requireOwner(env.unauthenticatedContext().firestore()));
    await assertFails(access().requireOwner(env.authenticatedContext('visitor').firestore()));
});

test('unlisted data and historical visitor statistics are not public', async () => {
    const visitor = env.authenticatedContext('visitor').firestore();
    await assertFails(visitor.doc('siteStats/visitors').get());
    await assertFails(visitor.doc('siteStats/visitors').update({ total: 999 }));
    await assertFails(visitor.doc('futurePrivateData/example').set({ isPublished: true }));
    await assertSucceeds(env.authenticatedContext(owner).firestore().doc('siteStats/visitors').get());
});

test('viewing a deck does not create a user account', async () => {
    assert.equal(await access().getReaction(null, auth(null), 'public'), false);
});

test('real reaction code adds once, handles duplicate requests, and removes once', async () => {
    const db = env.authenticatedContext('visitor').firestore();
    const a = access();
    const user = auth('visitor');
    assert.deepEqual(await a.setReaction(db, user, 'public', true, timestamp), { liked: true, count: 8 });
    assert.equal(await a.getReaction(db, user, 'public'), true);
    assert.deepEqual(await a.setReaction(db, user, 'public', true, timestamp), { liked: true, count: 8 });
    assert.deepEqual(await a.setReaction(db, user, 'public', false, timestamp), { liked: false, count: 7 });
    assert.deepEqual(await a.setReaction(db, user, 'public', false, timestamp), { liked: false, count: 7 });
    assert.equal(await a.getReaction(db, user, 'public'), false);
});

test('concurrent visitors add two votes without losing a count', async () => {
    await Promise.all(['alice', 'bob'].map(uid =>
        access().setReaction(env.authenticatedContext(uid).firestore(), auth(uid), 'public', true, timestamp)));
    assert.equal((await env.unauthenticatedContext().firestore().doc('recommendedDecks/public').get()).data().likeCount, 9);
});

test('reactions require matching atomic receipts and cannot change content', async () => {
    const db = env.authenticatedContext('visitor').firestore();
    const deck = db.doc('recommendedDecks/public');
    const vote = db.doc('deckLikes/public/votes/visitor');
    await assertFails(deck.update({ likeCount: 8 }));
    await assertFails(vote.set({ createdAt: timestamp() }));
    for (const changed of [{ likeCount: 999 }, { likeCount: 8, name: 'Tampered' },
        { likeCount: 8, isPublished: false }, { likeCount: -1 }]) {
        const batch = db.batch();
        batch.set(vote, { createdAt: timestamp() });
        batch.update(deck, changed);
        await assertFails(batch.commit());
    }
    const otherVote = db.batch();
    otherVote.set(db.doc('deckLikes/public/votes/another-user'), { createdAt: timestamp() });
    otherVote.update(deck, { likeCount: 8 });
    await assertFails(otherVote.commit());
});

test('two tabs for one visitor do not double-count or double-remove', async () => {
    const db = env.authenticatedContext('same-visitor').firestore();
    const user = auth('same-visitor');
    await Promise.all([access(), access()].map(a => a.setReaction(db, user, 'public', true, timestamp)));
    assert.equal((await db.doc('recommendedDecks/public').get()).data().likeCount, 8);
    await Promise.all([access(), access()].map(a => a.setReaction(db, user, 'public', false, timestamp)));
    assert.equal((await db.doc('recommendedDecks/public').get()).data().likeCount, 7);
});

test('concurrent add and remove preserve the combined total', async () => {
    const alice = env.authenticatedContext('alice').firestore();
    const bob = env.authenticatedContext('bob').firestore();
    await access().setReaction(alice, auth('alice'), 'public', true, timestamp);
    await Promise.all([
        access().setReaction(alice, auth('alice'), 'public', false, timestamp),
        access().setReaction(bob, auth('bob'), 'public', true, timestamp)
    ]);
    assert.equal((await alice.doc('recommendedDecks/public').get()).data().likeCount, 8);
});

test('a second receipt cannot be used to count the same visitor twice', async () => {
    const db = env.authenticatedContext('visitor').firestore();
    await access().setReaction(db, auth('visitor'), 'public', true, timestamp);
    const batch = db.batch();
    batch.set(db.doc('deckLikes/public/votes/visitor'), { createdAt: timestamp() });
    batch.update(db.doc('recommendedDecks/public'), { likeCount: 9 });
    await assertFails(batch.commit());
    await assertFails(db.doc('deckLikes/public/votes/visitor').delete());
});

test('visitors cannot inspect other voters or react to private decks', async () => {
    const db = env.authenticatedContext('visitor').firestore();
    await assertFails(db.doc('deckLikes/public/votes/other').get());
    await assertFails(db.collection('deckLikes/public/votes').get());
    await assertFails(access().setReaction(db, auth('visitor'), 'draft', true, timestamp));
    const unauth = env.unauthenticatedContext().firestore();
    await assertFails(unauth.doc('recommendedDecks/public').update({ likeCount: 8 }));
});
