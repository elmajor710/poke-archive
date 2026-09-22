(function (root) {
    'use strict';

    let authenticationReady;
    let pendingAnonymousSignIn;

    async function currentUser(auth) {
        if (!authenticationReady) {
            authenticationReady = new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(() => {
                    unsubscribe();
                    resolve();
                }, reject);
            });
        }
        await authenticationReady;
        return auth.currentUser;
    }

    async function reactionUser(auth) {
        const user = await currentUser(auth);
        if (user) return user;
        if (!pendingAnonymousSignIn) {
            pendingAnonymousSignIn = auth.signInAnonymously()
                .then(result => result.user)
                .finally(() => { pendingAnonymousSignIn = null; });
        }
        return pendingAnonymousSignIn;
    }

    async function requireOwner(db) {
        // Firestore, not a client-side email check, makes this decision.
        await db.collection('_admin').doc('access').get({ source: 'server' });
    }

    async function getReaction(db, auth, deckId) {
        const user = await currentUser(auth);
        if (!user) return false;
        const vote = await db.collection('deckLikes').doc(deckId)
            .collection('votes').doc(user.uid).get({ source: 'server' });
        return vote.exists;
    }

    async function setReaction(db, auth, deckId, liked, serverTimestamp) {
        const user = await reactionUser(auth);
        const deckRef = db.collection('recommendedDecks').doc(deckId);
        const voteRef = db.collection('deckLikes').doc(deckId).collection('votes').doc(user.uid);
        // Rules may reject a stale count before the SDK reports contention.
        // Retry only after confirming that the server state actually changed.
        for (let attempt = 0; attempt < 4; attempt++) {
          let observed;
          try {
            return await db.runTransaction(async transaction => {
            const deck = await transaction.get(deckRef);
            const vote = await transaction.get(voteRef);
            if (!deck.exists || deck.data().isPublished !== true) {
                throw new Error('공개된 덱에만 좋아요를 남길 수 있습니다.');
            }
            const count = deck.data().likeCount ?? 0;
            observed = { count, liked: vote.exists };
            if (!Number.isSafeInteger(count) || count < 0) {
                throw new Error('좋아요 정보를 확인하지 못했습니다.');
            }
            // Desired state makes duplicate clicks / concurrent tabs idempotent.
            if (vote.exists === liked) return { liked, count };
            const nextCount = count + (liked ? 1 : -1);
            if (nextCount < 0) throw new Error('좋아요 정보를 확인하지 못했습니다.');
            if (liked) transaction.set(voteRef, { createdAt: serverTimestamp() });
            else transaction.delete(voteRef);
            transaction.update(deckRef, { likeCount: nextCount });
            return { liked, count: nextCount };
            });
          } catch (error) {
            if (error.code !== 'permission-denied' || !observed || attempt === 3) throw error;
            const [latestDeck, latestVote] = await Promise.all([
                deckRef.get({ source: 'server' }), voteRef.get({ source: 'server' })
            ]);
            if (!latestDeck.exists || latestDeck.data().isPublished !== true ||
                ((latestDeck.data().likeCount ?? 0) === observed.count &&
                 latestVote.exists === observed.liked)) throw error;
          }
        }
    }

    const api = { currentUser, requireOwner, getReaction, setReaction };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.ArchiveAccess = api;
})(typeof window !== 'undefined' ? window : {});
