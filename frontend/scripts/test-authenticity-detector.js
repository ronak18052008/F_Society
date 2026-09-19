// scratch/test-authenticity-detector.js
// Automated verification suite for Feature 3: AI Scam / Fake Listing Detector

const assert = require("assert");

async function runTests() {
  console.log("=== RUNNING AI SCAM / FAKE LISTING DETECTOR TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  async function itAsync(desc, fn) {
    try {
      await fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${desc}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  const baseUrl = "http://localhost:3000";
  const testPropId = "prop-navrang-02";

  // Test 1: GET /api/properties/:propertyId/authenticity
  await itAsync(`API GET /api/properties/${testPropId}/authenticity returns 200 with full telemetry`, async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true, "data.success should be true");
    assert.ok(data.analysis, "analysis object must exist");

    const a = data.analysis;
    assert.ok(typeof a.authenticityScore === "number", "authenticityScore should be number");
    assert.ok(a.authenticityScore >= 0 && a.authenticityScore <= 100, "Score between 0 and 100");
    assert.ok(
      ["LIKELY_AUTHENTIC", "NEEDS_REVIEW", "SUSPICIOUS", "HIGH_RISK"].includes(a.status),
      `Valid status: ${a.status}`
    );
    assert.ok(["HIGH", "MEDIUM", "LOW"].includes(a.confidence), `Valid confidence: ${a.confidence}`);
    assert.strictEqual(typeof a.confidenceScore, "number", "confidenceScore should be numeric");
    assert.ok(Array.isArray(a.signals), "signals must be an array");
    assert.ok(a.whyThisResult, "whyThisResult breakdown must exist");
    assert.strictEqual(a.whyThisResult.initialScore, 100, "initialScore must be 100");
    assert.ok(Array.isArray(a.whyThisResult.deductions), "deductions must be an array");
    assert.ok(typeof a.priceAnomaly === "boolean", "priceAnomaly must be boolean");
    assert.ok(typeof a.duplicateWarning === "boolean", "duplicateWarning must be boolean");
    assert.ok(Array.isArray(a.suspiciousDescriptionFlags), "suspiciousDescriptionFlags must be array");
    assert.ok(Array.isArray(a.missingInformation), "missingInformation must be array");
    assert.strictEqual(a.imageMetadata.performedRealReverseSearch, false, "Must never claim external reverse image search");
    console.log(`    [Telemetry] Score: ${a.authenticityScore}/100, Status: ${a.status}, Confidence: ${a.confidence}`);
  });

  // Test 2: Scoring determinism & repeatability
  await itAsync("Deterministic check: Repeated calls yield identical score, status, and deductions", async () => {
    const res1 = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity`);
    const data1 = await res1.json();

    const res2 = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity`);
    const data2 = await res2.json();

    assert.strictEqual(data1.analysis.authenticityScore, data2.analysis.authenticityScore);
    assert.strictEqual(data1.analysis.status, data2.analysis.status);
    assert.strictEqual(data1.analysis.signals.length, data2.analysis.signals.length);
  });

  // Test 3: POST /api/properties/:propertyId/authenticity/analyze
  await itAsync(`POST /api/properties/${testPropId}/authenticity/analyze recalculates successfully`, async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.analysis);
    assert.ok(data.reanalyzedAt);
  });

  // Test 4: Safe Error Handling (404 for non-existent property)
  await itAsync("API returns 404 with safe JSON for non-existent propertyId", async () => {
    const res = await fetch(`${baseUrl}/api/properties/fake-non-existent-9999/authenticity`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error);
  });

  // Test 5: Price Anomaly Detection
  await itAsync("Detects severe underpricing scam trigger (>50% below benchmark)", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          rent: 3500, // Extremely low for 1180 sqft in Ahmedabad (benchmark ₹20/sqft -> rate ₹2.9/sqft)
          city: "Ahmedabad",
          areaSqft: 1180,
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.analysis.priceAnomaly, true, "priceAnomaly should be true");
    const priceSignal = data.analysis.signals.find(s => s.code === "UNUSUALLY_LOW_PRICE");
    assert.ok(priceSignal, "UNUSUALLY_LOW_PRICE signal must be detected");
    assert.strictEqual(priceSignal.severity, "CRITICAL");
    assert.ok(priceSignal.scoreDeduction >= 30);
    console.log(`    [Signal Caught] ${priceSignal.title}: -${priceSignal.scoreDeduction} pts`);
  });

  // Test 6: Suspicious Description Indicators (WhatsApp off-platform + Advance fee token)
  await itAsync("Detects suspicious off-platform contact and advance token demand in description", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          description: "Stunning flat. Do not message here, whatsapp me directly on 9876543210. Must transfer advance token before visit to confirm gate pass.",
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const descSignal = data.analysis.signals.find(s => s.code === "SUSPICIOUS_DESCRIPTION");
    assert.ok(descSignal, "SUSPICIOUS_DESCRIPTION signal must be detected");
    assert.ok(data.analysis.suspiciousDescriptionFlags.length >= 2, "At least 2 scam markers found");
    assert.ok(data.analysis.authenticityScore < 70, "Score should drop significantly");
    console.log(`    [Flags Caught] ${data.analysis.suspiciousDescriptionFlags.join(" | ")}`);
  });

  // Test 7: Duplicate Listing Detection
  await itAsync("Detects duplicate listing collision matching existing database title", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          title: "Studio loft near Vesu", // Matches existing prop-vesu-studio
          locality: "Vesu",
          city: "Ahmedabad",
          rent: 16500,
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.analysis.duplicateWarning, true, "duplicateWarning should be true");
    const dupSignal = data.analysis.signals.find(s => s.code === "DUPLICATE_LISTING");
    assert.ok(dupSignal, "DUPLICATE_LISTING signal must be detected");
    console.log(`    [Duplicate Caught] ${dupSignal.title}: -${dupSignal.scoreDeduction} pts`);
  });

  // Test 8: Inconsistent Location Detection
  await itAsync("Detects geographical location mismatch (e.g. Bandra in Bengaluru)", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          locality: "Bandra West",
          city: "Bengaluru", // Bandra is in Mumbai
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const locSignal = data.analysis.signals.find(s => s.code === "INCONSISTENT_LOCATION");
    assert.ok(locSignal, "INCONSISTENT_LOCATION signal must be detected");
    console.log(`    [Location Contradiction] ${locSignal.title}: -${locSignal.scoreDeduction} pts`);
  });

  // Test 9: Missing Information Checklist
  await itAsync("Accurately populates missing information checklist", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          rent: 0,
          description: "Short",
          pointOfContact: "",
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.analysis.missingInformation.length > 0, "Missing information list must not be empty");
    assert.ok(data.analysis.missingInformation.includes("Rent amount"));
    console.log(`    [Missing Items] ${data.analysis.missingInformation.join(", ")}`);
  });

  // Test 10: High Risk composite trigger
  await itAsync("Classifies high-risk scam profile as HIGH_RISK status", async () => {
    const res = await fetch(`${baseUrl}/api/properties/${testPropId}/authenticity/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customOverrides: {
          rent: 2000,
          areaSqft: 1200,
          city: "Mumbai",
          description: "Urgent booking western union deposit required. Contact on telegram only.",
          pointOfContact: "Owner",
          verification: "listing-unverified",
        },
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.analysis.status, "HIGH_RISK", "Status must be HIGH_RISK");
    assert.ok(data.analysis.authenticityScore < 40, "Score should be < 40");
    console.log(`    [High Risk Classification] Score: ${data.analysis.authenticityScore}/100, Status: ${data.analysis.status}`);
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
