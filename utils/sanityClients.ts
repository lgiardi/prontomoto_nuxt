import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "1i1fbngf",
  dataset: "production",
  apiVersion: "2025-09-07",
  useCdn: true,
  // Ottimizzazioni per performance
  perspective: "published", // Usa solo dati pubblicati
  stega: false, // Disabilita Sanity Visual Editing per produzione
  ignoreBrowserTokenWarning: true,
});