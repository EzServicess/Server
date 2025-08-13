import fs from "fs";
import path from "path";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, license, hwid } = req.body;

    if (!username || !license || !hwid) {
        return res.status(400).json({ message: "Missing credentials or HWID" });
    }

    const filePath = path.join(process.cwd(), "api", "data.json");

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: "No users registered" });
    }

    let users = JSON.parse(fs.readFileSync(filePath));
    let user = users.find(u => u.username === username && u.license === license);

    if (!user) {
        return res.status(401).json({ message: "INVALID" });
    }

    // First-time login — lock HWID
    if (user.hwid === null) {
        user.hwid = hwid;
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        return res.status(200).json({ message: "VALID" });
    }

    // HWID check
    if (user.hwid === hwid) {
        return res.status(200).json({ message: "VALID" });
    } else {
        return res.status(401).json({ message: "HWID MISMATCH" });
    }
}
