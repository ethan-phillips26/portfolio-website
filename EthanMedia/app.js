import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDICNGtnlULh0gXg9-TUmSq8aFiahGlyA0",
  authDomain: "socialethan-2596d.firebaseapp.com",
  projectId: "socialethan-2596d",
  storageBucket: "socialethan-2596d.appspot.com",
  messagingSenderId: "718319759019",
  appId: "1:718319759019:web:138c6797cb869a9d4651ee",
  databaseURL: "https://socialethan-2596d-default-rtdb.firebaseio.com/",
};

//Initialize Firebase first
const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

//Initialize Auth
const auth = getAuth();
const provider = new GoogleAuthProvider();

//Sign-in and sign-out elements
const signInButton = document.getElementById("signInButton");
const signOutButton = document.getElementById("signOutButton");
const userName = document.getElementById("userName");

//Sign-in function
const userSignIn = async () => {
  signInWithPopup(auth, provider)
    .then((result) => console.log(result.user))
    .catch((error) => console.error(error.message));
};

//Sign-out function
const userSignOut = async () => {
  signOut(auth)
    .then(() => alert("You have signed out successfully"))
    .catch((error) => console.error(error.message));
};

//Track authentication state
onAuthStateChanged(auth, (user) => {
  const profilePicture = document.getElementById("profilePicture");
  const authAction = document.getElementById("authAction");

  if (user) {
    //Update profile picture
    profilePicture.src = user.photoURL || "default-avatar.png";
    document.getElementById("userName").innerText = user.displayName || "User";
    authAction.innerText = "Sign Out";
  } else {
    profilePicture.src = "default-avatar.jpeg";
    document.getElementById("userName").innerText = "Guest";
    authAction.innerText = "Sign In";
  }
});

//Handle sign-in and sign-out on click
document.getElementById("authAction").addEventListener("click", async () => {
  if (auth.currentUser) {
    await signOut(auth);
  } else {
    await signInWithPopup(auth, provider);
  }
});

//Like functionality
const displayLikeCount = async (postId) => {
  const postRef = ref(db, "posts/" + postId);

  try {
    const snapshot = await get(postRef);
    if (snapshot.exists()) {
      const postData = snapshot.val();
      const likeCount = postData.likeCount || 0;

      const likeCountElement = document.getElementById(`likeCount-${postId}`);
      if (likeCountElement) {
        likeCountElement.innerHTML = `${likeCount} Likes`;
      } else {
        console.error(`Element likeCount-${postId} not found`);
      }
    } else {
      console.log("Post not found");
    }
  } catch (error) {
    console.error("Error fetching like count:", error.message);
  }
};

//Fetch and display like count when the page loads
window.addEventListener("load", () => {
  displayLikeCount("post1");
});

//Update likePost function to refresh the UI after liking
const likePost = async (postId) => {
  console.log("Like button clicked for post:", postId);

  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to like posts.");
    return;
  }

  const userId = user.uid;
  const postRef = ref(db, "posts/" + postId);

  const snapshot = await get(postRef);
  if (snapshot.exists()) {
    const postData = snapshot.val();
    const likes = postData.likes || {};
    let likeCount = postData.likeCount || 0;

    if (likes[userId]) {
      alert("You already liked this post!");
      return;
    }

    //Add user to likes object
    likes[userId] = true;
    likeCount += 1;

    //Update Firebase
    update(postRef, { likes, likeCount })
      .then(() => {
        console.log("Post liked successfully");
        displayLikeCount(postId); //Refresh UI after liking
      })
      .catch((error) => console.error("Error liking post:", error.message));
  } else {
    console.log("Post not found");
  }
};

//Add event listener for the like button
const likeButton = document.getElementById("like1");
if (likeButton) {
  likeButton.addEventListener("click", () => likePost("post1"));
} else {
  console.error("Button with ID 'like1' not found");
}
window.likePost = likePost;
