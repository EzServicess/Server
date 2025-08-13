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
    const { username, license, hwid } = req.body;
    let users = loadUsers();

    if (action === "register") {
        if (!username || !license) {
            return res.status(400).json({ message: "Missing username or license" });
        }
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: "Username already exists" });
        }
        users.push({ username, license, hwid: null });
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
        if (!user.hwid) {
            user.hwid = hwid;
            saveUsers(users);
            return res.status(200).json({ message: "VALID" });
        }
        if (user.hwid !== hwid) {
            return res.status(403).json({ message: "HWID MISMATCH" });
        }
        return res.status(200).json({ message: "VALID" });
    }

    return res.status(400).json({ message: "Unknown action" });
}
