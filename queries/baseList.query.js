export const baseListQuery = (query, params, searchFields, options) => {
  const baseQuery = [...query];
  if (options.search && params.search && searchFields.length) {
    if (options.search && params.search && searchFields.length) {
      const searchQuery = searchFields.map((field) => ({
        [field]: { $regex: params.search, $options: "i" },
      }));
      baseQuery.push({ $match: { $or: searchQuery } });
    }
  }
  baseQuery.push({ $sort: { createdAt: -1 } });
  return baseQuery;
};
