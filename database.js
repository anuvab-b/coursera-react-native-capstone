import * as SQLite from "expo-sqlite";
const database = SQLite.openDatabaseAsync("little_lemon");

/// Database operations
export async function initializeDB() {
  const database = await SQLite.openDatabaseAsync("little_lemon");

  await database.execAsync(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        category TEXT
      ); `);

  return database;
}

export async function getAllMenuItems(database) {
  return await database.getAllAsync("SELECT * FROM menu ORDER BY name");
}

export async function saveMenuItems(database, menuItems) {
  for (const item of menuItems) {
    await database.runAsync(
      "INSERT INTO menu (name, price, description, image, category) VALUES (?, ?, ?, ?, ?)",
      [
        item.name,
        item.price,
        item.description,
        item.image,
        item.category || "Main",
      ]
    );
  }
}

export async function filterByCategories(database, categories) {
  if (categories.length === 0) {
    return await this.getAllMenuItems(database);
  }

  const placeholders = categories.map(() => "?").join(",");
  const query = `SELECT * FROM menu WHERE category IN (${placeholders}) ORDER BY name`;
  return await database.getAllAsync(query, categories);
}

export async function filterBySearchAndCategories(
  database,
  searchText,
  categories
) {
  let query = "SELECT * FROM menu WHERE 1=1";
  const params = [];

  if (searchText && searchText.trim()) {
    query += " AND name LIKE ?";
    params.push(`%${searchText.trim()}%`);
  }

  if (categories.length > 0) {
    const placeholders = categories.map(() => "?").join(",");
    query += ` AND category IN (${placeholders})`;
    params.push(...categories);
  }

  query += " ORDER BY name";
  return await database.getAllAsync(query, params);
}

export async function getCategories(database) {
  const result = await database.getAllAsync(
    "SELECT DISTINCT category FROM menu ORDER BY category"
  );
  return result.map((row) => row.category);
}
