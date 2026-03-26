import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { PRESET_DEEDS, DIFFICULTY_INFO, type DeedCategory } from "@/data/deeds";
import type { CustomDeed } from "@/features/deeds/types";
import type { ModalDeed } from "../types";

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchMyCustomDeeds(userId: string): Promise<CustomDeed[]> {
  const q = query(
    collection(db, "custom_deeds"),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomDeed));
}

async function fetchPublicCustomDeeds(): Promise<CustomDeed[]> {
  const q = query(
    collection(db, "custom_deeds"),
    where("visibility", "==", "public"),
    where("isDeleted", "==", false),
    orderBy("pickCount", "desc"),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomDeed));
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function presetToModalDeed(d: (typeof PRESET_DEEDS)[number]): ModalDeed {
  return {
    id: d.id,
    deedType: "preset",
    name: d.name,
    emoji: d.emoji,
    category: d.category,
    difficulty: d.difficulty,
    points: d.basePoints,
    description: d.description,
    hadithReference: d.hadithReference,
  };
}

function customToModalDeed(
  d: CustomDeed,
  creatorDisplayName?: string,
): ModalDeed {
  return {
    id: d.id,
    deedType: "custom",
    name: d.name,
    emoji: d.emoji,
    category: d.category,
    difficulty: d.difficulty,
    points: d.basePoints,
    description: d.description,
    hadithReference: d.hadithReference,
    creatorDisplayName,
    pickCount: d.pickCount,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAddDeedModal(addedDeedIds: Set<string>) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<DeedCategory | null>(null);

  const myCustomQuery = useQuery({
    queryKey: ["custom_deeds", "mine", user?.uid],
    queryFn: () => fetchMyCustomDeeds(user!.uid),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const publicCustomQuery = useQuery({
    queryKey: ["custom_deeds", "public"],
    queryFn: fetchPublicCustomDeeds,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = myCustomQuery.isLoading || publicCustomQuery.isLoading;

  /** All available deeds merged and deduplicated, excluding already-added ones */
  const allDeeds = useMemo<ModalDeed[]>(() => {
    const myCustomIds = new Set(
      (myCustomQuery.data ?? []).map((d) => d.id),
    );

    const presets = PRESET_DEEDS.map(presetToModalDeed);

    const myCustom = (myCustomQuery.data ?? []).map((d) =>
      customToModalDeed(d),
    );

    // Public deeds from others — exclude any that are already in myCustom
    const othersPublic = (publicCustomQuery.data ?? [])
      .filter((d) => d.userId !== user?.uid && !myCustomIds.has(d.id))
      .map((d) => customToModalDeed(d));

    return [...presets, ...myCustom, ...othersPublic].filter(
      (d) => !addedDeedIds.has(d.id),
    );
  }, [
    myCustomQuery.data,
    publicCustomQuery.data,
    addedDeedIds,
    user?.uid,
  ]);

  const filteredDeeds = useMemo(() => {
    return allDeeds.filter((d) => {
      if (filterCategory && d.category !== filterCategory) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [allDeeds, filterCategory, search]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setFilterCategory(null);
  }, []);

  return {
    filteredDeeds,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    resetFilters,
    isLoading,
    DIFFICULTY_INFO,
  };
}
