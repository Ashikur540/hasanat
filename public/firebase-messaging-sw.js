/* global importScripts, firebase, self */

importScripts(
	"https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
	apiKey: "AIzaSyB8_loWJrWEfxjgT9uFj76WJtCXrUGOKII",
	authDomain: "hasanat-3375b.firebaseapp.com",
	projectId: "hasanat-3375b",
	storageBucket: "hasanat-3375b.firebasestorage.app",
	messagingSenderId: "1076236487065",
	appId: "1:1076236487065:web:af2cc7e76ec6ec289bab08",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const data = payload.data || {};
	const notification = payload.notification || {};
	const title = notification.title || data.title || "Hasanat";
	const body = notification.body || data.body || "";

	self.registration.showNotification(title, {
		body,
		icon: "/web-app-manifest-192x192.png",
		badge: "/favicon-96x96.png",
		tag: data.tag || title,
		data: {
			url: data.url || "/dashboard",
			...data,
		},
	});
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = (event.notification.data && event.notification.data.url) || "/";
	event.waitUntil(
		self.clients.matchAll({ type: "window" }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes(url) && "focus" in client) return client.focus();
			}
			if (self.clients.openWindow) return self.clients.openWindow(url);
		}),
	);
});
