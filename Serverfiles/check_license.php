<?php
$host = "localhost";
$dbname = "licenses_db";
$dbuser = "db_user";
$dbpass = "db_pass";

$username = isset($_GET['username']) ? $_GET['username'] : '';
$license  = isset($_GET['license']) ? $_GET['license'] : '';

$conn = new mysqli($host, $dbuser, $dbpass, $dbname);
if ($conn->connect_error) {
    die("DB connection failed");
}

$stmt = $conn->prepare("SELECT * FROM users WHERE username=? AND license_key=?");
$stmt->bind_param("ss", $username, $license);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "VALID";
} else {
    echo "INVALID";
}

$stmt->close();
$conn->close();
?>
