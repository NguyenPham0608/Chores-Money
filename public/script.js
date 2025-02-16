// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
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

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scale = window.devicePixelRatio; // Get device's pixel ratio
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.scale(scale, scale);

const total = document.getElementById('total');
let coinArray=[];


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
        totalMoney += parseFloat(data.approvedMoney);
    });
    total.innerText = 'Total: $ ' + totalMoney.toFixed(2);
}

async function getChore(){
    const dropdown=document.getElementById('choreSelect');
    const selectedValue=dropdown.options[dropdown.selectedIndex].value
    console.log(selectedValue)
    return {chore: selectedValue, money: getValue()}
}
async function getValue(){
    const dropdown=document.getElementById('money');
    const selectedValue=dropdown.options[dropdown.selectedIndex].value
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

async function approveLog(docId, button) {
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
    const pendingList = document.getElementById('pendingList');
    pendingList.innerHTML = ''; // Clear current list

    try {
        const querySnapshot = await getDocs(collection(db, "chores"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(data);
            const li = document.createElement('li');
            li.innerHTML = `${data.chore} ${data.money}`;  // Display timestamp

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
            li.innerHTML = `${data.approvedChore} ${data.approvedMoney} ${timestamp}`;  // Display timestamp

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

loop();