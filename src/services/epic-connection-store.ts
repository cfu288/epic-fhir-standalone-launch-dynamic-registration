import { EpicAuthResponse, EpicDynamicRegistrationResponse } from "./epic";

// Configuration for IndexedDb for epic auth metadata
export const IDBEpicConnectionConfig = {
  DATABASE_NAME: "EpicConnectionDb",
  OBJECT_STORE_NAME: "EpicConnectionStore",
  VERSION: 1,
  CONNECTION_KEY_ID: 1,
  DYNAMIC_CLIENT_METADATA_ID: 2,
};

/**
 * Opens indexedDb and handles initial setup
 * @returns
 */
function openDb() {
  const indexedDB = window.indexedDB;
  // Open (or create) the database
  const open = indexedDB.open(
    IDBEpicConnectionConfig.DATABASE_NAME,
    IDBEpicConnectionConfig.VERSION
  );

  // Create the schema
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore(IDBEpicConnectionConfig.OBJECT_STORE_NAME, {
      keyPath: "id",
    });
  };

  return open;
}

export async function getLastConnection(): Promise<
  EpicAuthResponse & { expires_at: number }
> {
  return new Promise((resolve, reject) => {
    // Open (or create) the database
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME,
        "readwrite"
      );
      const store = tx.objectStore(IDBEpicConnectionConfig.OBJECT_STORE_NAME);

      const getConnection = store.get(
        IDBEpicConnectionConfig.CONNECTION_KEY_ID
      ) as IDBRequest<{
        id: number;
        connection: EpicAuthResponse & { expires_at: number };
      }>;
      getConnection.onsuccess = async function () {
        try {
          resolve(getConnection.result?.connection);
        } catch (e) {
          reject(e);
        }
      };
    };
  });
}

export async function getLastDynamicRegistration(): Promise<EpicDynamicRegistrationResponse> {
  return new Promise((resolve, reject) => {
    // Open (or create) the database
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      const tx = db.transaction(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME,
        "readwrite"
      );
      const store = tx.objectStore(IDBEpicConnectionConfig.OBJECT_STORE_NAME);

      const getConnection = store.get(
        IDBEpicConnectionConfig.DYNAMIC_CLIENT_METADATA_ID
      ) as IDBRequest<{
        id: number;
        metadata: EpicDynamicRegistrationResponse;
      }>;
      getConnection.onsuccess = async function () {
        try {
          resolve(getConnection.result?.metadata);
        } catch (e) {
          reject(e);
        }
      };
    };
  });
}

// function to get keys or create them if they don't exist
export async function storeConnection(
  connection: EpicAuthResponse & { expires_at: number }
): Promise<IDBRequest<IDBValidKey>> {
  return new Promise((resolve, reject) => {
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      // Create new transaction to store new keys, as the previous one is closed
      const tx = db.transaction(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME,
        "readwrite"
      );
      const newTxStore = tx.objectStore(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME
      );
      const res = newTxStore.put({
        id: IDBEpicConnectionConfig.CONNECTION_KEY_ID,
        connection,
      });
      resolve(res);
    };
  });
}

/**
 * Stores dynamic registration metadata in indexedDb
 * @param metadata
 * @returns
 */
export async function storeDynamicRegistrationMetadata(
  metadata: EpicDynamicRegistrationResponse
): Promise<IDBRequest<IDBValidKey>> {
  return new Promise((resolve, reject) => {
    const open = openDb();

    open.onsuccess = function () {
      // Start a new transaction
      const db = open.result;
      // Create new transaction to store new keys, as the previous one is closed
      const tx = db.transaction(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME,
        "readwrite"
      );
      const newTxStore = tx.objectStore(
        IDBEpicConnectionConfig.OBJECT_STORE_NAME
      );
      const res = newTxStore.put({
        id: IDBEpicConnectionConfig.DYNAMIC_CLIENT_METADATA_ID,
        metadata,
      });
      resolve(res);
    };
  });
}
