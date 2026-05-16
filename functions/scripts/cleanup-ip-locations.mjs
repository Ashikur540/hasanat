// One-shot cleanup: removes `location` field from any user doc where
// `location.source === "ip"`. Forces those users to re-acquire location
// via GPS on next sign-in (IP-source data is unreliable — often returns
// ISP gateway, not user's real coords).
//
// Usage:
//   node scripts/cleanup-ip-locations.mjs           # dry run (default, no writes)
//   node scripts/cleanup-ip-locations.mjs --apply   # actually delete
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

async function main() {
	console.log(`Mode: ${apply ? "APPLY (will delete)" : "DRY RUN (no writes)"}`);
	console.log(`Project: ${PROJECT_ID}\n`);

	const snap = await db.collection("users").get();
	console.log(`Scanned ${snap.size} user docs`);

	const targets = [];
	for (const doc of snap.docs) {
		const loc = doc.get("location");
		if (loc && loc.source === "ip") {
			targets.push({
				uid: doc.id,
				lat: loc.lat,
				lng: loc.lng,
				city: loc.city ?? "(no city)",
				country: loc.country ?? "(no country)",
			});
		}
	}

	console.log(`Found ${targets.length} users with location.source === "ip":\n`);
	for (const t of targets) {
		console.log(
			`  ${t.uid}  ${t.city}, ${t.country}  (${t.lat}, ${t.lng})`,
		);
	}

	if (targets.length === 0) {
		console.log("\nNothing to clean. Exiting.");
		return;
	}

	if (!apply) {
		console.log(
			`\nDry run complete. Re-run with --apply to delete these ${targets.length} location fields.`,
		);
		return;
	}

	console.log(`\nDeleting location field from ${targets.length} docs...`);
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
		console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} docs (${deleted}/${targets.length})`);
	}

	console.log(`\nDone. ${deleted} location fields removed.`);
	console.log(
		"Affected users will re-acquire location on next app open (GPS prompt).",
	);
}

main().catch((err) => {
	console.error("Failed:", err);
	process.exit(1);
});
