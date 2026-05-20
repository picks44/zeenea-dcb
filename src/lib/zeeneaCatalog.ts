/** Mock Zeenea / Actian catalog items for schema/property authoritative definitions (P1). */

export interface ZeeneaCatalogItem {
  id: string;
  label: string;
  url: string;
}

export const ZEENEA_CATALOG: ZeeneaCatalogItem[] = [
  {
    id: "zeenea-glossary-customer",
    label: "Customer - business glossary",
    url: "https://catalog.zeenea.example/actian/glossary/customer",
  },
  {
    id: "zeenea-glossary-order",
    label: "Order - business glossary",
    url: "https://catalog.zeenea.example/actian/glossary/order",
  },
  {
    id: "zeenea-lineage-orders",
    label: "Orders table - lineage",
    url: "https://catalog.zeenea.example/actian/lineage/orders",
  },
  {
    id: "zeenea-policy-retention",
    label: "Data retention policy",
    url: "https://catalog.zeenea.example/actian/policy/retention",
  },
];

export function findZeeneaCatalogItemByUrl(
  url: string,
): ZeeneaCatalogItem | undefined {
  const trimmed = url.trim();
  return ZEENEA_CATALOG.find((item) => item.url === trimmed);
}

export function findZeeneaCatalogItemById(
  id: string,
): ZeeneaCatalogItem | undefined {
  return ZEENEA_CATALOG.find((item) => item.id === id);
}
