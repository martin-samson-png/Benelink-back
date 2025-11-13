export const toCamel = (row: any) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replaceAll(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value,
    ])
  );

export const toSnake = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replaceAll(/[A-Z]/g, (c) => "_" + c.toLowerCase()),
      value,
    ])
  );

export const mapRow = <T>(row: any): T => {
  const camel = toCamel(row);
  return camel as T;
};

export const mapRows = <T>(rows: any[]): T[] => {
  return rows.map((r) => mapRow<T>(r));
};
