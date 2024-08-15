import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-9ZXoJqBv9iNgMJOzznzJdA5wGXxAJOI",
    authDomain: "blogging-website-f396b.firebaseapp.com",
    projectId: "blogging-website-f396b",
    storageBucket: "blogging-website-f396b.appspot.com",
    messagingSenderId: "976240081320",
    appId: "1:976240081320:web:ba38652383bca58657c59d",
    measurementId: "G-54K468QKRX"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);

let uid, currentUserInfo, userImgUrl, userPassword, isUser;
const loader = document.getElementById("loader");
const signUpForm = document.getElementById("signUp-form");
const logInForm = document.getElementById("logIn-form");
const signUp = document.getElementById("signUp");
const logIn = document.getElementById("logIn");
const firstName = document.getElementById("signUp-fn");
const lastName = document.getElementById("signUp-ln");
const signUpEmail = document.getElementById("signUp-email");
const signUpPass = document.getElementById("signUp-pass");
const signUpConfirmPass = document.getElementById("signUp-comfirmPass");
const signUpImg = document.getElementById("signUp-img");
const signUpBtn = document.getElementById("signUp-btn");
const logInEmail = document.getElementById("logIn-email");
const logInPass = document.getElementById("logIn-pass");
const logInBtn = document.getElementById("logIn-btn");
const dashboard = document.getElementById("dashboard");
const main = document.getElementById("main");
const navLogIn = document.getElementById("nav-logIn");
const navLogOut = document.getElementById("nav-logOut");
const createAccounBtn = document.getElementById("create-account-btn");
const userName = document.getElementById("userName");
const blogTitle = document.getElementById("blog-title");
const blogDesc = document.getElementById("blog-desc");
const publishBtn = document.getElementById("publish-btn");
const myBlogs = document.getElementById("my-blogs");
const allPost = document.getElementById("all-post");
const profile = document.getElementById("profile");
const logo = document.getElementById("logo");
const setPassBtn = document.getElementById("set-pass-btn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    uid = user.uid;
    isUser = true;
    loader.classList.add("d-none");
    loader.classList.remove("d-block");
    dashboard.classList.add("d-block");
    dashboard.classList.remove("d-none");
    navLogIn.classList.add("d-none");
    navLogIn.classList.remove("d-block");
    navLogOut.classList.add("d-block");
    navLogOut.classList.remove("d-none");
    logIn.classList.add("d-none");
    logIn.classList.remove("d-block");
    signUp.classList.add("d-none");
    signUp.classList.remove("d-block");
    setTimeout(() => {
      getUserInfo();
      getBlogs();
    }, 2000);
  } else {
    isUser = false;
    loader.classList.add("d-none");
    main.classList.add("d-block");
    main.classList.remove("d-none");
    getAllPost();
  }
});

async function getUserInfo() {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    currentUserInfo = docSnap.data();
    userName.innerText = currentUserInfo.firstName;
    userImgUrl = currentUserInfo.userImg;
    userPassword = currentUserInfo.password;
  } else {
    console.log("No such document!");
  }
}

function signIn(e) {
  e.preventDefault();
  signInWithEmailAndPassword(auth, logInEmail.value, logInPass.value)
    .then((userCredential) => {
      const user = userCredential.user;
      uid = user.uid;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode);
    });
}
logInBtn.addEventListener("click", signIn);

async function register(e) {
  e.preventDefault();

  if (signUpPass.value === signUpConfirmPass.value) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail.value,
        signUpPass.value
      );
      const user = userCredential.user;
      uid = user.uid;

      const imgRef = ref(storage, `users/${signUpImg.files[0].name}`);
      await uploadBytes(imgRef, signUpImg.files[0]).then(async (snapshot) => {
        await getDownloadURL(imgRef)
          .then((url) => {
            userImgUrl = url;
            const profileImage = document.getElementById("form-profile-image");
            profileImage.src = userImgUrl;
          })
          .catch((err) => console.error(err));
      });

      const userObj = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: signUpEmail.value,
        password: signUpPass.value,
        userImg: userImgUrl,
      };
      await setDoc(doc(db, "users", uid), userObj);

      getUserInfo();
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode);
      alert(errorMessage);
      console.error(error);
    }
  } else {
    alert("Password and confirm should be the same");
  }
}
signUpBtn.addEventListener("click", register);

function logOut() {
  signOut(auth)
    .then(() => {
      location.reload();
    })
    .catch((error) => {});
}
navLogOut.addEventListener("click", logOut);

function showLogin() {
  main.classList.add("d-none");
  main.classList.remove("d-block");
  logIn.classList.add("d-block");
  logIn.classList.remove("d-none");
  signUp.classList.add("d-none");
  signUp.classList.remove("d-block");
}
navLogIn.addEventListener("click", showLogin);

function showSignUp() {
  signUp.classList.add("d-block");
  signUp.classList.remove("d-none");
  logIn.classList.add("d-none");
  logIn.classList.remove("d-block");
}
createAccounBtn.addEventListener("click", showSignUp);

async function submitBlog() {
  if (
    blogTitle.value.length >= 5 &&
    blogTitle.value.length <= 50 &&
    blogDesc.value.length >= 100 &&
    blogDesc.value.length <= 3000
  ) {
    const d = new Date().toLocaleDateString();
    const blogRef = await addDoc(collection(db, "blogs"), {
      author: currentUserInfo.firstName,
      title: blogTitle.value,
      desc: blogDesc.value,
      uid,
      date: d,
      imgUrl: currentUserInfo.userImg,
    });
    blogTitle.value = "";
    blogDesc.value = "";
  } else {
    alert(
      "Title should be b/w 5 - 50 characters \n Decscription should be b/w 100 - 3000 characters"
    );
  }
}

publishBtn.addEventListener("click", submitBlog);

function getBlogs() {
  const q = query(collection(db, "blogs"), where("uid", "==", uid));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    myBlogs.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const { author, date, desc, imgUrl, title } = doc.data();
      let card = `<div class="cards">
      <div>
        <div class="d-flex align-items-center">
            <img src="${imgUrl}" alt="" height="50px" width="50px">
            <div class="ms-2">
                <h3 class="m-0 p-0">${title}</h3>
                <span>${author}</span>
                <span>-</span>
                <span>${date}</span>
            </div>
        </div>
        <div>
            <span>${desc}</span>
        </div>
        <div>
        
            <span class="del-btn" data-id=${doc.id}>Delete</span>
            <span class="edit-btn" data-id="${doc.id}-edit">Edit</span>
        </div>
      </div>
      <div class="d-none">
      <input type="text" value="${title}" class="">
      <textarea class="" rows="4">${desc}</textarea>
      <button class="btn btn-dark save-btn" data-id="${doc.id}-edit">Save</button>
      </div>
      </div>`;

      myBlogs.innerHTML += card;
    });

    let editButtons = document.getElementsByClassName("edit-btn");
    Array.from(editButtons).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        btn.parentNode.parentNode.classList.add("d-none");
        btn.parentNode.parentNode.classList.remove("d-block");
        btn.parentNode.parentNode.nextElementSibling.classList.add("d-block");
        btn.parentNode.parentNode.nextElementSibling.classList.remove("d-none");
      });
    });

    let saveButtons = document.getElementsByClassName("save-btn");
    Array.from(saveButtons).forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        let id = e.target.getAttribute("data-id");
        let updateId = id.slice(0, id.length - 5);
        let saveTitle = btn.previousElementSibling.previousElementSibling.value;
        let saveDesc = btn.previousElementSibling.value;

        const querySnapshot = await doc(db, "blogs", updateId);
        updateDoc(querySnapshot, { title: saveTitle, desc: saveDesc })
          .then(() => {
            console.log("Document successfully updated!");
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
      });
    });

    let deleteButtons = document.getElementsByClassName("del-btn");
    Array.from(deleteButtons).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let blogId = e.target.getAttribute("data-id");
        if (blogId) {
          deleteBlog(blogId);
        }
      });
    });
  });
}

function deleteBlog(blogId) {
  deleteDoc(doc(db, "blogs", blogId))
    .then(() => {})
    .catch((error) => {
      console.error("Error deleting blog:");
    });
}

function getAllPost() {
  const q = query(collection(db, "blogs"), orderBy("date", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    allPost.innerHTML = "";
    querySnapshot.forEach((doc) => {
      let data = doc.data();

      let card = `<div class='my-5 cards all-post-cards'>
        <div class="d-flex align-items-center">
            <img src="${data.imgUrl}" alt="" height="50px" width="50px">
            <div class="ms-2">
                <h3 class="m-0 p-0 text-capitalize">${data.title}</h3>
                <span>${data.author}</span>
                <span>-</span>
                <span>${data.date}</span>
            </div>
        </div>
        <div>
            <span class="fs-6 text-capitalize">${data.desc}</span>
        </div>
        </div>`;

      allPost.innerHTML += card;
    });
  });
}

function showProfile() {
  dashboard.classList.add("d-none");
  dashboard.classList.remove("d-block");
  profile.classList.add("d-block");
  profile.classList.remove("d-none");

  const profileImage = document.getElementById("profile-image");
  const profileFn = document.getElementById("profile-fn");
  const profileLn = document.getElementById("profile-ln");
  const profileEmail = document.getElementById("profile-email");

  profileImage.src = userImgUrl;
  profileFn.innerText = currentUserInfo.firstName;
  profileLn.innerText = currentUserInfo.lastName;
  profileEmail.innerText = currentUserInfo.email;
}

userName.addEventListener("click", showProfile);

function backToHome() {
  if (isUser) {
    profile.classList.add("d-none");
    profile.classList.remove("d-block");
    dashboard.classList.add("d-block");
    dashboard.classList.remove("d-none");
  } else {
    main.classList.add("d-block");
    main.classList.remove("d-none");
    logIn.classList.add("d-none");
    logIn.classList.remove("d-block");
    signUp.classList.add("d-none");
    signUp.classList.remove("d-block");
  }
}
logo.addEventListener("click", backToHome);

function reauthentication() {
  const oldPasswordInput = document.getElementById("old-password").value;
  const newPasswordInput = document.getElementById("new-password").value;
  const confirmPasswordInput = document.getElementById("confirm-new-password").value;

  if (oldPasswordInput === userPassword && newPasswordInput === confirmPasswordInput) {
    const user = auth.currentUser;
    console.log(user);
    const email = currentUserInfo.email;
    const credential = EmailAuthProvider.credential(
      email,
      oldPasswordInput
    );
    reauthenticateWithCredential(user, credential)
      .then(() => {
        oldPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        setNewPassword(newPasswordInput);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    alert("Fill all fields correctly")
  }
};
setPassBtn.addEventListener("click", reauthentication);

function setNewPassword(newPassword) {
  const user = auth.currentUser;
  updatePassword(user, newPassword)
      .then(async () => {
        const passRef = await doc(db, "users", uid);
        updateDoc(passRef, { password: newPassword })
          .then(() => {
          })
          .catch((error) => {
            console.error("Error updating document:", error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
}