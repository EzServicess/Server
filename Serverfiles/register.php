<?php
// Database credentials
$host = "localhost";
$dbname = "licenses_db";
$dbuser = "db_user";
$dbpass = "db_pass";

// Connect to DB
$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Get username from POST
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
if ($username === '') {
    die("Invalid username.");
}

// Generate random license key
function generateLicense($length = 16) {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $license = '';
    for ($i = 0; $i < $length; $i++) {
        $license .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $license;
}

$license_key = generateLicense();

// Store in DB
$stmt = $conn->prepare("INSERT INTO users (username, license_key) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $license_key);

if ($stmt->execute()) {
    echo "<h2>Registration Successful!</h2>";
    echo "<p>Username: <b>$username</b></p>";
    echo "<p>License Key: <b>$license_key</b></p>";
    echo "<p>You can now log in with these credentials in the loader.</p>";
} else {
    echo "Error: Username may already exist.";
}

$stmt->close();
$conn->close();
?>
