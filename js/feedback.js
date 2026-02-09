import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const FEEDBACK_COLLECTION = "feedback";

/**
 * Save user feedback to Firestore.
 * @param {object} user - The Firebase Auth user object (optional)
 * @param {string} message - The feedback message
 * @param {string} category - The type of feedback (bug, suggestion, other)
 */
export async function submitFeedback(user, message, category = "general") {
    try {
        await addDoc(collection(db, FEEDBACK_COLLECTION), {
            uid: user ? user.uid : "anonymous",
            displayName: user ? user.displayName : "Anonymous",
            message: message,
            category: category,
            timestamp: new Date()
        });
        console.log("Feedback submitted successfully!");
        return true;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return false;
    }
}
