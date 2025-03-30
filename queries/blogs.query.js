export const blogsQuery = [
  {
    $lookup: {
      from: "categories",
      localField: "categories",
      foreignField: "_id",
      as: "categories",
    },
  },
];

export const blogSearchFields = ["title", "textField"];
