<?php
/**
 * EasyDentalLab — License Revocation Endpoint
 *
 * Deploy this file on any PHP host (shared hosting, VPS, etc.).
 * Point VALIDATION_URL in licenseValidator.js to its public URL.
 *
 * Request:  POST  { "key": "<PAYLOAD.SIGNATURE>" }
 * Response:        { "valid": true|false, "reason": "..." }
 *
 * The server only needs to decide if a key is revoked — the app's
 * licenseValidator.js has already verified the cryptographic signature
 * locally before calling here.
 */

// ─── CORS headers (restrict origin to your app's domain in production) ────────
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");           // TODO: tighten in production
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["valid" => false, "reason" => "Method not allowed."]);
    exit;
}

// ─── Revoked keys ─────────────────────────────────────────────────────────────
// Add full license key strings here to immediately revoke them.
// Alternatively, load from a database or flat file.
//
// Example:
//   "eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.SIGNATURE_HERE",
$revoked = [
    // "FULL_LICENSE_KEY_STRING_HERE",
];

// ─── Request parsing ──────────────────────────────────────────────────────────
$raw  = file_get_contents("php://input");
$body = json_decode($raw, true);
$key  = isset($body["key"]) ? trim($body["key"]) : "";

if (empty($key)) {
    http_response_code(400);
    echo json_encode(["valid" => false, "reason" => "No license key provided."]);
    exit;
}

// ─── Revocation check ─────────────────────────────────────────────────────────
if (in_array($key, $revoked, true)) {
    echo json_encode(["valid" => false, "reason" => "This license has been revoked."]);
    exit;
}

// Key is not on the revocation list — report valid.
// (Cryptographic signature + expiry already checked client-side.)
echo json_encode(["valid" => true, "reason" => "ok"]);
