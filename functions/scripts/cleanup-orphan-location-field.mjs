// One-shot cleanup: removes orphaned `location` field from user docs.
//
// Background: an earlier migration promoted geographic coords to
// `users/{uid}.location` (object {lat, lng, city, country, ...}). Geographic
// data has since moved to `users/{uid}.geo`. The string-typed profile display
// `location` was also retired (the profile now derives its label from `geo`).
// Either shape — leftover object OR leftover free-text — is now dead weight
// and should be deleted to prevent confusion and stale reads.
//
// Usage:
//   node scripts/cleanup-orphan-location-field.mjs           # dry run (default)
//   node scripts/cleanup-orphan-location-field.mjs --apply   # actually delete
//
// Requires: gcloud auth application-default login (ADC).
//
// Safety:
// - Default is dry-run. Must pass --apply to mutate.
// - Only deletes the `location` field; user doc itself stays intact.
// - Uses FieldValue.delete() — removes field cleanly, no orphan keys.
// - Batches at 400 ops (Firestore limit 500, leaving headroom).

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PROJECT_ID = "hasanat-3375b";
const BATCH_SIZE = 400;

const apply = process.argv.includes("--apply");

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

function describe(loc) {
	if (loc === null || loc === undefined) return "(null)";
	if (typeof loc === "string") return `string: "${loc}"`;
	if (typeof loc === "object") {
		const parts = [];
		if (typeof loc.lat === "number" && typeof loc.lng === "number") {
			parts.push(`(${loc.lat}, ${loc.lng})`);
		}
		if (loc.city) parts.push(`city=${loc.city}`);
		if (loc.country) parts.push(`country=${loc.country}`);
		if (loc.source) parts.push(`source=${loc.source}`);
		return `object: ${parts.join(" ") || "(empty)"}`;
	}
	return `${typeof loc}`;
}

async function main() {
	console.log(`Mode: ${apply ? "APPLY (will delete)" : "DRY RUN (no writes)"}`);
	console.log(`Project: ${PROJECT_ID}\n`);

	const snap = await db.collection("users").get();
	console.log(`Scanned ${snap.size} user docs`);

	const targets = [];
	for (const doc of snap.docs) {
		const data = doc.data();
		if (Object.prototype.hasOwnProperty.call(data, "location")) {
			targets.push({ uid: doc.id, value: data.location });
		}
	}

	console.log(`Found ${targets.length} users with orphan \`location\` field:\n`);
	for (const t of targets) {
		console.log(`  ${t.uid}  ${describe(t.value)}`);
	}

	if (targets.length === 0) {
		console.log("\nNothing to clean. Exiting.");
		return;
	}

	if (!apply) {
		console.log(
			`\nDry run complete. Re-run with --apply to delete \`location\` from these ${targets.length} docs.`,
		);
		return;
	}

	console.log(`\nDeleting \`location\` field from ${targets.length} docs...`);
	let deleted = 0;
	for (let i = 0; i < targets.length; i += BATCH_SIZE) {
		const chunk = targets.slice(i, i + BATCH_SIZE);
		const batch = db.batch();
		for (const t of chunk) {
			batch.update(db.collection("users").doc(t.uid), {
				location: FieldValue.delete(),
			});
		}
		await batch.commit();
		deleted += chunk.length;
		console.log(
			`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs (${deleted}/${targets.length})`,
		);
	}

	console.log(`\nDone. ${deleted} \`location\` fields removed.`);
	console.log(
		"Profile display label now derives from `users/{uid}.geo` exclusively.",
	);
}

main().catch((err) => {
	console.error("Failed:", err);
	process.exit(1);
});
