import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
	AyahBookmark,
	ReaderLanguage,
	ReadingProgress,
} from "@/features/quran/types";

interface FirestoreTimestampLike {
	toMillis?: () => number;
}

interface FirestoreProgressDoc {
	surahNumber: number;
	ayahNumber: number;
	language: ReaderLanguage;
	updatedAt?: FirestoreTimestampLike;
}

interface FirestoreBookmarkDoc {
	surahNumber: number;
	ayahNumber: number;
	note?: string;
	createdAt?: FirestoreTimestampLike;
	updatedAt?: FirestoreTimestampLike;
}

const progressRef = (uid: string) =>
	doc(db, "users", uid, "quran_progress", "current");

const bookmarksRef = (uid: string) =>
	collection(db, "users", uid, "quran_bookmarks");

const bookmarkDocRef = (uid: string, bookmarkId: string) =>
	doc(db, "users", uid, "quran_bookmarks", bookmarkId);

const toMillis = (value: FirestoreTimestampLike | undefined): number => {
	if (!value || typeof value.toMillis !== "function") return 0;
	return value.toMillis();
};

export async function fetchCloudProgress(
	uid: string,
): Promise<ReadingProgress | null> {
	const snap = await getDoc(progressRef(uid));
	if (!snap.exists()) return null;

	const data = snap.data() as FirestoreProgressDoc;
	return {
		surahNumber: data.surahNumber,
		ayahNumber: data.ayahNumber,
		language: data.language,
		updatedAt: toMillis(data.updatedAt),
	};
}

export async function saveCloudProgress(
	uid: string,
	progress: ReadingProgress,
): Promise<void> {
	await setDoc(progressRef(uid), {
		surahNumber: progress.surahNumber,
		ayahNumber: progress.ayahNumber,
		language: progress.language,
		updatedAt: serverTimestamp(),
	});
}

export async function fetchCloudBookmarks(uid: string): Promise<AyahBookmark[]> {
	const snap = await getDocs(bookmarksRef(uid));
	return snap.docs
		.map((entry) => {
			const data = entry.data() as FirestoreBookmarkDoc;
			return {
				id: entry.id,
				surahNumber: data.surahNumber,
				ayahNumber: data.ayahNumber,
				note: data.note,
				createdAt: toMillis(data.createdAt),
				updatedAt: toMillis(data.updatedAt),
			} satisfies AyahBookmark;
		})
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertCloudBookmark(
	uid: string,
	bookmark: AyahBookmark,
): Promise<void> {
	await setDoc(bookmarkDocRef(uid, bookmark.id), {
		surahNumber: bookmark.surahNumber,
		ayahNumber: bookmark.ayahNumber,
		note: bookmark.note ?? null,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}

export async function removeCloudBookmark(
	uid: string,
	bookmarkId: string,
): Promise<void> {
	await deleteDoc(bookmarkDocRef(uid, bookmarkId));
}

