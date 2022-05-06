/* eslint-disable no-undef */

self.indexedDB =
  self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB;
self.IDBTransaction = self.IDBTransaction ||
  self.webkitIDBTransaction ||
  self.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
self.IDBKeyRange =
  self.IDBKeyRange || self.webkitIDBKeyRange || self.msIDBKeyRange;

class IndexDB {
  async open() {
    if (this.db) return this.db;
    return new Promise((next) => {
      const request = indexedDB.open("W2EB", 3);
      request.onsuccess = (event) => {
        this.db = event.target.result;
        next(this.db);
      };
    });
  }
}
