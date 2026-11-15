/**
 * One-time cleanup: moves exact coordinates from the public user document to
 * users/{uid}/private/location, and removes the stored email address.
 *
 * Setup is the same as seed-deeds.mjs (serviceAccount.json in the project root).
 *
 *   Dry run (changes nothing, prints what it would do):
 *     GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/migrate-private-location.mjs
 *
 *   Apply:
 *     GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/migrate-private-location.mjs --apply
 *
 * Safe to run more than once: users that are already clean are skipped, and
 * an existing private location is never overwritten.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credPath =
	process.env.GOOGLE_APPLICATION_CREDENTIALS ??
	resolve(__dirname, "../serviceAccount.json");

initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, "utf8"))) });
const db = getFirestore();
const apply = process.argv.includes("--apply");

const hasCoords = (v) =>
	v && typeof v === "object" && typeof v.lat === "number" && typeof v.lng === "number";

const users = await db.collection("users").get();
let changed = 0;

for (const userDoc of users.docs) {
	const data = userDoc.data();
	const legacyLocation = hasCoords(data.location) ? data.location : null;
	const coords = hasCoords(data.geo) ? data.geo : legacyLocation;

	const publicUpdates = {};
	if ("email" in data) publicUpdates.email = FieldValue.delete();
	if (hasCoords(data.geo)) {
		publicUpdates["geo.lat"] = FieldValue.delete();
		publicUpdates["geo.lng"] = FieldValue.delete();
		publicUpdates["geo.source"] = FieldValue.delete();
	}
	if (legacyLocation) publicUpdates.location = FieldValue.delete();

	if (!coords && Object.keys(publicUpdates).length === 0) continue;
	changed++;
	console.log(
		`${userDoc.id}: ${coords ? "move coordinates" : ""} ${
			"email" in data ? "remove email" : ""
		}`.trim(),
	);
	if (!apply) continue;

	const privateRef = userDoc.ref.collection("private").doc("location");
	if (coords && !(await privateRef.get()).exists) {
		await privateRef.set({
			lat: coords.lat,
			lng: coords.lng,
			source: coords.source ?? "gps",
			updatedAt: FieldValue.serverTimestamp(),
		});
	}
	await userDoc.ref.update(publicUpdates);
}

console.log(
	`${users.size} users scanned, ${changed} ${apply ? "updated" : "would be updated (dry run, pass --apply to write)"}.`,
);
