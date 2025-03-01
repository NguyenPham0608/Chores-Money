// Import Firebase modules
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js"; // Add Auth imports
import Coin from "./coin.js";
import { override } from "./coin.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyARPjGht5NCpztYmZ2-TJnO7wkCX3_jSJk",
    authDomain: "chores-log.firebaseapp.com",
    projectId: "chores-log",
    storageBucket: "chores-log.appspot.com",
    messagingSenderId: "209423809491",
    appId: "1:209423809491:web:de2f1bc79994b1ac8ccd26",
    measurementId: "G-1C5C7EH9JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Auth
const provider = new GoogleAuthProvider();
const total = document.getElementById('total');
const money=document.getElementById('money');
const updateInterval=1


const customChoreInput = document.getElementById("customChoreInput");
const customMoneyInput = document.getElementById("customMoneyInput");


document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("signInBtn");
    const userDisplay = document.getElementById("userDisplay");
    
    // Sign-in button click event
    signInBtn.addEventListener("click", () => {
        signInWithPopup(auth, provider)
            .then((result) => {

                console.log("User signed in:", result.user);
            })
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    });
    
    // Sign-out button click event

    
    // Authentication state observer
    onAuthStateChanged(auth, (user) => {
        if (user) {

            console.log("User is signed in:", user);
            userDisplay.textContent = `Signed in as: ${user.displayName}`;
            signInBtn.style.display = "none";
            total.style.display = "block";
        } else {
            console.log("No user signed in");
            userDisplay.textContent = "Not signed in";
            signInBtn.style.display = "block";
            total.style.display = "none";
        }
    });
});

// Handle showing/hiding the custom chore input

  

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scale = window.devicePixelRatio; // Get device's pixel ratio
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.scale(scale, scale);

let coinArray=[];

const dropdown=document.getElementById('choreSelect');


function addCoin(x, y, scale) {
    const coin = new Coin(x,y , 734*scale, 720*scale);
    coinArray.push(coin);
    coin.draw(ctx);
}
async function updateSpan() {
    const querySnapshot = await getDocs(collection(db, "approvedChores"));
    let totalMoney = 0;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalMoney += Number(data.approvedMoney);
    });
    total.innerText = 'Total: $ ' + totalMoney.toFixed(2);
}

async function getChore(){
    let selectedValue=dropdown.options[dropdown.selectedIndex].text
    if(selectedValue=='Custom'){
        selectedValue=customChoreInput.value
    }
    console.log(selectedValue)
    return {chore: selectedValue, money: getValue()}
}
async function getValue(){
    console.log(money.options[money.selectedIndex].value)
    let selectedValue=money.options[money.selectedIndex].value
    if(selectedValue=='custom'){
        selectedValue=customMoneyInput.value
    }
    console.log(selectedValue)
    return selectedValue
}

// Add chore to Firestore
async function addLog() {
    try {
        const choreData = await getChore();
        const logText = choreData.chore;
        const moneyAmount = await Promise.resolve(choreData.money); // Ensure moneyAmount is resolved

        if (!logText) return;

        console.log("Adding log to Firestore:", logText, moneyAmount); // Debugging log

        await addDoc(collection(db, "chores"), {
            chore: logText,
            money: moneyAmount,
        });
        customChoreInput.style.display = "none";
        dropdown.style.display = "block";
        money.style.display = "block";
        customMoneyInput.style.display = "none";



        dropdown.selectedIndex = 0;
        money.selectedIndex = 0;

        // choreSection
        loadLogs(); // Refresh the list after adding
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}


async function addApprovedLog(chore,money,button,docId) {
    explodeCoins(50)
    try {
        console.log("Adding log to Firestore:", chore, money);  // Debugging log
        await addDoc(collection(db, "approvedChores"), {
            approvedChore: chore,
            approvedMoney: money,
            timestamp: new Date()  // Adding timestamp here
        });
        loadApprovedLogs();  // Refresh the list after adding
        const li = button.parentElement;
        li.style.animation = "fadeOut 0.3s forwards";
        setTimeout(async () => {
            console.log("Deleting chore:", docId);  // Debugging log
            await deleteDoc(doc(db, "chores", docId));  // Delete from Firestore
            li.remove();
        }, 200);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Delete chore from Firestore
async function deleteLog(docId, button) {
    const li = button.parentElement;
    li.style.animation = "fadeOut 0.3s forwards";
    setTimeout(async () => {
        console.log("Deleting chore:", docId);  // Debugging log
        await deleteDoc(doc(db, "approvedChores", docId));  // Delete from Firestore
        li.remove();
    }, 200);
}


// Load chores from Firestore
async function loadLogs() {
    const pendingList = document.getElementById('pendingList');
    pendingList.innerHTML = ''; // Clear current list

    try {
        const querySnapshot = await getDocs(collection(db, "chores"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(data);
            const li = document.createElement('li');
            li.innerHTML = `${data.chore} $${data.money}`;  // Display timestamp

            const approveButton = document.createElement('button');
            approveButton.classList.add('approved-btn');
            approveButton.textContent = 'Approve';
            approveButton.addEventListener('click',() => addApprovedLog(data.chore, data.money, approveButton, doc.id));
            li.appendChild(approveButton);
            pendingList.appendChild(li);
        });
    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}

async function loadApprovedLogs() {
    const logList = document.getElementById('logList');
    logList.innerHTML = ''; // Clear current list

    try {
        const querySnapshot = await getDocs(collection(db, "approvedChores"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement('li');
            const timestamp = new Date(data.timestamp.seconds * 1000).toLocaleString();  // Convert timestamp to readable format
            li.innerHTML = `${data.approvedChore} $${data.approvedMoney} ${timestamp}`;  // Display timestamp

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteLog(doc.id, deleteButton));  // Use event listener

            li.appendChild(deleteButton);
            logList.appendChild(li);
        });
        updateSpan();
    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}


function loop(){
    let selectedValue=money.options[money.selectedIndex].value
    console.log(selectedValue)
    ctx.clearRect(0, 0, 100000000, 10000000000);
    if(!override){

    }
    coinArray.forEach((coin) => {
        coin.draw(ctx)
    });

    updateSpan();
    coinArray = coinArray.filter(coin => !coin.markedForDeletion);

    requestAnimationFrame(loop);
}

// Add event listener to the button after the page has loaded
window.onload = () => {
    document.getElementById('addButton').addEventListener('click', addLog);
    loadLogs();  // Load chores when the page loads
    loadApprovedLogs();
    updateSpan();
};

function explodeCoins(number) {
    for (let i = 0; i < number; i++) {
        addCoin(window.innerWidth/2, window.innerHeight/2, 0.1);
    }
}

// Authentication state listener
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const authSection = document.getElementById('authSection');
    const choreSection = document.getElementById('addChore');
    const pendingSection = document.getElementById('addLog');
    const approvedSection = document.getElementById('log');
    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const signOutButton = document.getElementById('signOutButton');
    const authMessage = document.getElementById('authMessage');

    if (user) {
        // User is signed in
        authSection.style.display = 'none';
        choreSection.style.display = 'block';
        pendingSection.style.display = 'block';
        approvedSection.style.display = 'block';
        signOutButton.style.display = 'block';
        authMessage.textContent = `Welcome, ${user.email}`;
        loadLogs(); // Load user-specific logs
        loadApprovedLogs();
    } else {
        // No user is signed in
        authSection.style.display = 'block';
        choreSection.style.display = 'none';
        pendingSection.style.display = 'none';
        approvedSection.style.display = 'none';
        signOutButton.style.display = 'none';
        authMessage.textContent = '';
    }
});

// Sign In
function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const authMessage = document.getElementById('authMessage');

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            authMessage.textContent = 'Signed in successfully!';
        })
        .catch((error) => {
            authMessage.textContent = `Error: ${error.message}`;
        });
}

// Sign Up
function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const authMessage = document.getElementById('authMessage');

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            authMessage.textContent = 'Signed up successfully!';
        })
        .catch((error) => {
            authMessage.textContent = `Error: ${error.message}`;
        });
}

// Sign Out
function signOutUser() {
    signOut(auth)
        .then(() => {
            document.getElementById('authMessage').textContent = 'Signed out successfully!';
        })
        .catch((error) => {
            document.getElementById('authMessage').textContent = `Error: ${error.message}`;
        });
}



window.onload = () => {
    document.getElementById('addButton').addEventListener('click', addLog);
    document.getElementById('signInButton').addEventListener('click', signIn);
    document.getElementById('signUpButton').addEventListener('click', signUp);
    document.getElementById('signOutButton').addEventListener('click', signOutUser);
    // Initial load will be handled by onAuthStateChanged
};

dropdown.addEventListener("change", function() {
    if(dropdown.options[dropdown.selectedIndex].text=='Custom'){
        let customChoreInput = document.getElementById("customChoreInput");
        customChoreInput.style.display = "block";
        dropdown.style.display = "none";
        window.addEventListener("keydown", function(e) {
            if(e.key=='Enter'){
                dropdown.style.display = "block";
                dropdown.selectedIndex = 0;
                customChoreInput.style.display = "none";
            }
        })
    
    }
});

// Handle showing/hiding the custom money input
money.addEventListener("change", function() {
    if(money.options[money.selectedIndex].text=='Custom'){
        let customMoneyInput = document.getElementById("customMoneyInput");

        customMoneyInput.style.display = "block";
        money.style.display = "none";
        window.addEventListener("keydown", function(e) {
            if(e.key=='Enter'){
                money.style.display = "block";
                money.selectedIndex = 0;
                customMoneyInput.style.display = "none";
            }
        })
    }
});

loop();
