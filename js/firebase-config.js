// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    // You'll get these details from Firebase Console after creating a project
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Database operations
export const dbOperations = {
    // Save order
    saveOrder: async (orderData) => {
        const ordersRef = ref(db, 'orders');
        await push(ordersRef, orderData);
    },

    // Get all orders
    getOrders: async () => {
        const ordersRef = ref(db, 'orders');
        const snapshot = await get(ordersRef);
        return snapshot.val() || {};
    },

    // Clear all orders (for admin reset)
    clearOrders: async () => {
        const ordersRef = ref(db, 'orders');
        await set(ordersRef, null);
    }
}; 