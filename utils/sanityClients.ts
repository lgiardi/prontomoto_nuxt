import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "1i1fbngf",
  dataset: "production",
  apiVersion: "2025-09-07",
  useCdn: true,
});