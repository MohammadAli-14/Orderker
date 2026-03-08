import { initAuthCreds, proto, BufferJSON } from '@whiskeysockets/baileys';
import { WhatsAppAuth } from '../models/whatsapp-auth.model.js';

/**
 * Custom MongoDB Authentication State Provider for Baileys
 * Replaces useMultiFileAuthState to ensure 100% Stateless Server Operations
 */
export const useMongoDBAuthState = async (sessionId = 'default') => {
    // Native Baileys BufferJSON perfectly handles all Uint8Array cryptographic keys
    const replacer = BufferJSON.replacer;
    const reviver = BufferJSON.reviver;

    // Helper to read data from DB mapping to our compound index
    const readData = async (collectionName, key) => {
        try {
            const result = await WhatsAppAuth.findOne({ sessionId, collectionName, key });
            if (result && result.data) {
                const parsed = JSON.parse(result.data, reviver);
                if (key === 'creds' && parsed.noiseKey) {
                    console.log(`[MongoDBAuthState] Read creds noiseKey.private isBuffer:`, Buffer.isBuffer(parsed.noiseKey.private));
                    if (!Buffer.isBuffer(parsed.noiseKey.private)) {
                        console.log(`[MongoDBAuthState] RAW DATA:`, result.data.substring(0, 150));
                        console.log(`[MongoDBAuthState] PARSED DATA:`, parsed.noiseKey.private);
                    }
                }
                return parsed;
            }
            return null;
        } catch (error) {
            console.error(`[MongoDBAuthState] Error reading ${collectionName} - ${key}:`, error);
            return null;
        }
    };

    // Helper to write data to DB mapping to our compound index
    const writeData = async (collectionName, key, data) => {
        try {
            await WhatsAppAuth.updateOne(
                { sessionId, collectionName, key },
                { $set: { data: JSON.stringify(data, replacer) } },
                { upsert: true }
            );
        } catch (error) {
            console.error(`[MongoDBAuthState] Error writing ${collectionName} - ${key}:`, error);
        }
    };

    // Helper to remove data from DB mapping to our compound index
    const removeData = async (collectionName, key) => {
        try {
            await WhatsAppAuth.deleteOne({ sessionId, collectionName, key });
        } catch (error) {
            console.error(`[MongoDBAuthState] Error removing ${collectionName} - ${key}:`, error);
        }
    };

    // 1. Initial Load of main credentials
    const creds = await readData('auth', 'creds') || initAuthCreds();

    return {
        state: {
            creds,
            // 2. The critical Signal Keys interface required by Baileys
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(type, id);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = id;
                            if (value) {
                                tasks.push(writeData(category, key, value));
                            } else {
                                tasks.push(removeData(category, key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                },
            },
        },
        saveCreds: () => {
            return writeData('auth', 'creds', creds);
        },
    };
};
