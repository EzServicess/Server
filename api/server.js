import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data.json');

function loadUsers() {
    try {
        if (fs.existsSync(dataFile)) {
            const json = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(json);
        }
    } catch (err) {
        console.error("Error reading data.json", err);
    }
    return [];
}

function saveUsers(users) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing data.json", err);
    }
}

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const action = req.query.action;
    const { username, license, hwid, duration } = req.body; // duration in days
    let users = loadUsers();

    if (action === "register") {
        if (!username || !license || !duration) {
            return res.status(400).json({ message: "Missing fields" });
        }
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + parseInt(duration)); // add days

        users.push({
            username,
            license,
            hwid: null,
            created_at: new Date().toISOString(),
            expires_at: expires_at.toISOString()
        });
        saveUsers(users);
        return res.status(200).json({ message: "Registered successfully" });
    }

    if (action === "check") {
        if (!username || !license || !hwid) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const user = users.find(u => u.username === username && u.license === license);
        if (!user) {
            return res.status(401).json({ message: "INVALID" });
        }

        const now = new Date();
        if (user.expires_at && new Date(user.expires_at) < now) {
            return res.status(403).json({ message: "LICENSE EXPIRED" });
        }

        if (!user.hwid) {
            user.hwid = hwid; // lock HWID
            saveUsers(users);
            return res.status(200).json({ message: "VALID", expires_at: user.expires_at });
        }

        if (user.hwid !== hwid) {
            return res.status(403).json({ message: "HWID MISMATCH" });
        }

        return res.status(200).json({ message: "VALID", expires_at: user.expires_at });
    }

    return res.status(400).json({ message: "Unknown action" });
}
