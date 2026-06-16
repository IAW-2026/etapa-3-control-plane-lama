export type SearchParams = Record<string, string | string[] | undefined>;

export type ListQuery = {
  q: string;
  page: number;
  pageSize: number;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(firstValue(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function parseListQuery(searchParams: SearchParams): ListQuery {
  return {
    q: firstValue(searchParams.q)?.trim() ?? "",
    page: toPositiveInt(searchParams.page, 1),
    pageSize: Math.min(toPositiveInt(searchParams.pageSize, 10), 50),
  };
}

export function toQueryObject(searchParams: SearchParams) {
  return Object.fromEntries(
    Object.entries(searchParams).flatMap(([key, value]) => {
      if (!value) {
        return [];
      }

      return [[key, Array.isArray(value) ? value[0] : value]];
    }),
  ) as Record<string, string>;
}
