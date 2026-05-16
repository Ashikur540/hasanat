"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchToUserDevices = dispatchToUserDevices;
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
if (!admin.apps.length)
    admin.initializeApp();
const STALE_TOKEN_CODES = new Set([
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
    "messaging/invalid-registration-token",
]);
/**
 * Send FCM message to every device registered for the user.
 * Stale tokens are pruned from `users/{uid}/devices/{deviceId}`.
 */
async function dispatchToUserDevices(uid, notification, data = {}) {
    const firestore = admin.firestore();
    const messaging = admin.messaging();
    const devicesSnap = await firestore
        .collection("users")
        .doc(uid)
        .collection("devices")
        .get();
    const targets = devicesSnap.docs
        .map((d) => ({ id: d.id, token: d.get("token") }))
        .filter((t) => Boolean(t.token));
    if (targets.length === 0)
        return { sent: 0, pruned: 0, failed: 0 };
    let sent = 0;
    let pruned = 0;
    let failed = 0;
    await Promise.all(targets.map(async ({ id, token }) => {
        var _a, _b, _c;
        try {
            await messaging.send({
                token,
                notification,
                data,
            });
            sent++;
        }
        catch (err) {
            const code = (_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.errorInfo) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : err === null || err === void 0 ? void 0 : err.code) !== null && _c !== void 0 ? _c : "unknown";
            if (STALE_TOKEN_CODES.has(code)) {
                await firestore
                    .collection("users")
                    .doc(uid)
                    .collection("devices")
                    .doc(id)
                    .delete();
                pruned++;
                logger.info("fcm token pruned", { uid, deviceId: id, code });
            }
            else {
                failed++;
                logger.warn("fcm send failed", { uid, deviceId: id, code });
            }
        }
    }));
    return { sent, pruned, failed };
}
//# sourceMappingURL=notify.js.map