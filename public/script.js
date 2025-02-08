// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

// Add chore to Firestore
async function addLog() {
    const logInput = document.getElementById('logInput');
    const money = document.getElementById('money');
    const logText = logInput.value.trim();
    const moneyAmount = money.value.trim();

    if (logText === "") return;

    try {
        console.log("Adding log to Firestore:", logText, moneyAmount);  // Debugging log
        await addDoc(collection(db, "chores"), {
            chore: logText,
            money: moneyAmount,
            timestamp: new Date()  // Adding timestamp here
        });
        logInput.value = '';
        money.value = '';
        loadLogs();  // Refresh the list after adding
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
        await deleteDoc(doc(db, "chores", docId));  // Delete from Firestore
        li.remove();
    }, 300);
}

// Load chores from Firestore
async function loadLogs() {
    const logList = document.getElementById('logList');
    logList.innerHTML = ''; // Clear current list

    try {
        const querySnapshot = await getDocs(collection(db, "chores"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement('li');
            const timestamp = new Date(data.timestamp.seconds * 1000).toLocaleString();  // Convert timestamp to readable format
            li.innerHTML = `${data.chore} $${data.money} ${timestamp}`;  // Display timestamp

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteLog(doc.id, deleteButton));  // Use event listener

            li.appendChild(deleteButton);
            logList.appendChild(li);
        });
    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}

// Add event listener to the button after the page has loaded
window.onload = () => {
    document.getElementById('addButton').addEventListener('click', addLog);
    loadLogs();  // Load chores when the page loads
};
