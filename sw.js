self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

self.addEventListener("fetch", event => {
  const url = event.request.url;

  if (
    url.includes("firebase") ||
    url.includes("razorpay") ||
    url.includes("cloudinary") ||
    url.includes("onrender.com") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Offline", { status: 503 });
    })
  );
});
