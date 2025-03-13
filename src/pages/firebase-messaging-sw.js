'use strict';

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "AIzaSyByRSfKC2pRP5U5ulzswhGnTmk_19B5KTw",
    authDomain: "project-plant-monitoring-b580a.firebaseapp.com",
    projectId: "project-plant-monitoring-b580a",
    storageBucket: "project-plant-monitoring-b580a.firebasestorage.app",
    messagingSenderId: "512464485373",
    appId: "1:512464485373:web:dd3792ebaf8a25e08f7794",
    measurementId: "G-CDJBB3E3RK"
};

// Initialize the firebase in the service worker.
firebase.initializeApp(firebaseConfig);

self.addEventListener('push', function (event) {
	var data = event.data.json();
 
	const title = data.Title;
	data.Data.actions = data.Actions;
	const options = {
		body: data.Message,
		data: data.Data
	};
	event.waitUntil(self.registration.showNotification(title, options));
});
 
self.addEventListener('notificationclick', function (event) {});
 
self.addEventListener('notificationclose', function (event) {});