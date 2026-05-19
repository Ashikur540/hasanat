Alhamdulillah 💚

আজ Hasanat-এর একটা নতুন update push করলাম — v0.4.0

এই update-টা নতুন feature-এর চেয়ে বেশি ছিল **আপনাদের সমস্যাগুলো সারানোর** জন্য।
অনেকেই feedback দিয়েছিলেন:

* "আমার location ভুল দেখাচ্ছে — আমি Bogura-তে আছি, কিন্তু Hasanat বলছে Keraniganj 😅"
* "আজকের আরবি তারিখ বাংলাদেশের সাথে মিলে না, ১ দিন এগিয়ে"
* "Profile page মাঝে মাঝে crash করে"

সবগুলোই honest, ছোট ছোট কষ্ট — কিন্তু রোজকার ব্যবহারে এগুলোই বিরক্তিকর হয়ে দাঁড়ায়।

তাই এই update-এ যা ঠিক করলাম:

🌍 **সঠিক Location detect**
আগে কখনো কখনো আপনার internet provider-এর city দেখাত (যেটা আপনার আসল city না)। এখন GPS থেকেই সঠিক city ও country নিজে নিজে চলে আসবে — Profile-এও আর manually লিখতে হবে না।

🌙 **Hijri তারিখ সমন্বয় করার option**
বাংলাদেশে সাধারণত Saudi-এর Umm al-Qura calendar থেকে ১ দিন পরে চাঁদ দেখা হয়। তাই Settings-এ এখন একটা ছোট option আছে — −২ থেকে +২ দিন পর্যন্ত নিজে adjust করতে পারবেন। বাংলাদেশের users-রা সাধারণত −১ select করলেই হয়ে যাবে ✨

⚡ **App অনেক fast হয়েছে**
পুরো build system upgrade করেছি (Vite 5 → 8)। Dev mode-এ আগে যেখানে ৩-৪ সেকেন্ড লাগত, এখন প্রায় instant। যারা PWA install করেছেন, তাদের জন্যও cold start অনেক quick।

🛡️ **Privacy + Stability**
Profile page-এর সেই crash bug fix। GPS ছাড়া কেউ landing page-এ ঢুকলে আর location prompt আসবে না। ভেতরে আরও অনেক ছোট সমস্যা ঠিক করেছি যেগুলো user হিসেবে আপনারা কখনো দেখতেও পেতেন না।

---

honestly বলতে গেলে — সবচেয়ে কষ্টের কাজ ছিল ওই Bogura-Keraniganj bug-টা।
এক user-ই বললেন "ভাই city ভুল দেখাচ্ছে"। প্রথমে ভাবলাম, ছোট bug। পরে দেখি — root cause টা ছিল আমাদের database-এর দুটো আলাদা concept একই field-এ rakha হয়েছিল। সারিয়ে দিতে কয়েক ঘণ্টা গেল, কিন্তু এখন ইনশাআল্লাহ আর কারো সাথে এটা হবে না 🙏

ছোট ছোট fix, কিন্তু প্রতিটাই কারো না কারো feedback থেকে এসেছে।
আপনাদের message, screenshot, complaint — সবই দরকার।
এগুলোই আসলে app-টাকে আরো ভালো করে।

ব্যবহার করে দেখুন। কিছু খারাপ লাগলে বলবেন 🤍

🔗 https://hasanat-3375b.web.app/

#Hasanat #MuslimTech #BuildingInPublic #Bangladesh
