import { db } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, limit, getDocs, where, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const SCORES_COLLECTION = "scores";

/**
 * Save user score to Firestore.
 * Only updates if the new score is higher than the existing high score for the user.
 * @param {object} user - The Firebase Auth user object
 * @param {number} score - The score to save
 */
export async function saveScore(user, score) {
    if (!user) return;

    try {
        const userScoreRef = doc(db, SCORES_COLLECTION, user.uid);
        const userScoreSnap = await getDoc(userScoreRef);

        if (userScoreSnap.exists()) {
            const currentHighScore = userScoreSnap.data().score;
            if (score > currentHighScore) {
                await setDoc(userScoreRef, {
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    score: score,
                    timestamp: new Date()
                });
                console.log("New high score saved!");
                return true; // New high score
            } else {
                console.log("Score simpler than high score, not saved.");
                return false;
            }
        } else {
            // First time score
            await setDoc(userScoreRef, {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                score: score,
                timestamp: new Date()
            });
            console.log("First score saved!");
            return true;
        }
    } catch (error) {
        console.error("Error saving score:", error);
        return false;
    }
}

/**
 * Fetch top scores for the leaderboard.
 * @param {number} limitCount - Number of top scores to fetch (default 10)
 * @returns {Array} - Array of score objects
 */
export async function getLeaderboard(limitCount = 10) {
    try {
        const q = query(collection(db, SCORES_COLLECTION), orderBy("score", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);

        const leaderboard = [];
        querySnapshot.forEach((doc) => {
            leaderboard.push(doc.data());
        });

        return leaderboard;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}
