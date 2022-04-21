// Function that get all files name in the routes folder
export const getRoutes = (): string[] => {
  const fs = require("fs");
  const path = require("path");
  const files = fs.readdirSync(path.join(__dirname, "../routes"));
  return files.map((file: string) => file.replace(".ts", ""));
};
