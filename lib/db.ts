import * as SQLite from 'expo-sqlite';

const DB_NAME = 'recall.db';

const db = SQLite.openDatabase(DB_NAME);

export function getDb() {
  return db;
}

export function ensureDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL,
            note TEXT,
            createdAt TEXT NOT NULL,
            contactId TEXT
          );`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
}

export function runSql<T = SQLite.SQLResultSet>(
  sql: string,
  params: SQLite.SQLStatementArg[] = []
): Promise<T> {
  return new Promise((resolve, reject) => {
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result as T),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
}

export function runWriteSql<T = SQLite.SQLResultSet>(
  sql: string,
  params: SQLite.SQLStatementArg[] = []
): Promise<T> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result as T),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
}
