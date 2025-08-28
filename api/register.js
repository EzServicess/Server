// api/check_license.js
import { users } from "./register";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, license, hwid } = req.body;

    if (!username || !license || !hwid) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const user = users.find(u => u.username === username && u.license === license);
    if (!user) {
        return res.status(401).json({ message: "INVALID" });
    }

    const now = new Date();

    // Check license expiration
    if (user.expires_at && new Date(user.expires_at) < now) {
        return res.status(403).json({ message: "LICENSE EXPIRED" });
    }

    // HWID lock
    if (!user.hwid) {
        user.hwid = hwid; // First login locks the HWID
        return res.status(200).json({ message: "VALID", expires_at: user.expires_at });
    }

    if (user.hwid !== hwid) {
        return res.status(403).json({ message: "HWID MISMATCH" });
    }

    return res.status(200).json({ message: "VALID", expires_at: user.expires_at });
}
