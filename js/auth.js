import { auth, googleProvider } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements (will be set in main.js or game.js)
let loginBtn;
let userProfile;
let userNameDisplay;
let userAvatarDisplay;

export let currentUser = null;

export function initAuth(loginBtnId, userProfileId, userNameId, userAvatarId) {
    loginBtn = document.getElementById(loginBtnId);
    userProfile = document.getElementById(userProfileId);
    userNameDisplay = document.getElementById(userNameId);
    userAvatarDisplay = document.getElementById(userAvatarId);

    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    }

    if (userProfile) {
        userProfile.addEventListener("click", handleLogout);
    }

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            updateAuthUI(true);
            console.log("User signed in:", user.displayName);
        } else {
            // User is signed out
            currentUser = null;
            updateAuthUI(false);
            console.log("User signed out");
        }
    });
}

async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // The signed-in user info.
        const user = result.user;
        console.log("Login success:", user);
    } catch (error) {
        console.error("Login failed:", error.message);
        alert("Login gagal: " + error.message);
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        console.log("Logout success");
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
}

function updateAuthUI(isSignedIn) {
    if (!loginBtn || !userProfile) return;

    if (isSignedIn && currentUser) {
        loginBtn.style.display = "none";
        userProfile.style.display = "flex";
        if (userNameDisplay) userNameDisplay.innerText = currentUser.displayName.split(" ")[0]; // First name only
        if (userAvatarDisplay) userAvatarDisplay.src = currentUser.photoURL;
    } else {
        loginBtn.style.display = "block";
        userProfile.style.display = "none";
        if (userNameDisplay) userNameDisplay.innerText = "";
        if (userAvatarDisplay) userAvatarDisplay.src = "";
    }
}
