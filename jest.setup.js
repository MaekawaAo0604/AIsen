require('@testing-library/jest-dom')

// IndexedDB グローバル設定
global.indexedDB = require('fake-indexeddb')
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

// Notification API モック
global.Notification = class Notification {
  constructor(title, options) {
    this.title = title
    this.options = options
  }
  static permission = 'granted'
  static requestPermission = async () => 'granted'
}

// Service Worker モック
global.navigator = global.navigator || {}
global.navigator.serviceWorker = {
  register: async () => ({
    showNotification: async () => {},
  }),
  ready: Promise.resolve({
    showNotification: async () => {},
  }),
  addEventListener: () => {},
}
