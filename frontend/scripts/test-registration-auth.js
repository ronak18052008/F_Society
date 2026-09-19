const fs = require("fs");
const path = require("path");

const base = "http://localhost:3000";

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  return { status: res.status, headers: res.headers, data };
}

async function runTests() {
  console.log("=================================================");
  console.log("  NIVASA ROLE REGISTRATION & AUTH TEST SUITE");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const testOwnerEmail = `verified_owner_${timestamp}@test.com`;
  const testTenantEmail = `verified_tenant_${timestamp}@test.com`;
  const testPassword = "SecurePassword123!";

  // Test 1: Register Account as Owner
  console.log("[Test 1] Register new account choosing OWNER role");
  const r1 = await post(`${base}/api/auth/register`, {
    name: "Yug Owner Test",
    email: testOwnerEmail,
    password: testPassword,
    role: "owner",
  });
  console.log("Status:", r1.status);
  console.log("Data:", r1.data);
  if (r1.status !== 200 || r1.data?.user?.role !== "owner" || r1.data?.redirectTo !== "/owner") {
    throw new Error("Test 1 Failed: Owner registration did not return owner role / redirect.");
  }
  console.log("PASS: Registered account saved with role 'owner' and directed to /owner\n");

  // Test 2: Register Account as Tenant
  console.log("[Test 2] Register new account choosing TENANT role");
  const r2 = await post(`${base}/api/auth/register`, {
    name: "Yug Tenant Test",
    email: testTenantEmail,
    password: testPassword,
    role: "tenant",
  });
  console.log("Status:", r2.status);
  console.log("Data:", r2.data);
  if (r2.status !== 200 || r2.data?.user?.role !== "tenant" || r2.data?.redirectTo !== "/tenant") {
    throw new Error("Test 2 Failed: Tenant registration did not return tenant role / redirect.");
  }
  console.log("PASS: Registered account saved with role 'tenant' and directed to /tenant\n");

  // Test 3: Login with registered Owner credentials
  console.log("[Test 3] Login with registered OWNER credentials at /api/auth/login");
  const r3 = await post(`${base}/api/auth/login`, {
    email: testOwnerEmail,
    password: testPassword,
  });
  console.log("Status:", r3.status);
  console.log("Data:", r3.data);
  if (r3.status !== 200 || r3.data?.user?.role !== "owner" || r3.data?.redirectTo !== "/owner") {
    throw new Error("Test 3 Failed: Login did not detect owner role from registered account.");
  }
  console.log("PASS: Authenticated as Owner, directed to /owner\n");

  // Test 4: Login with registered Tenant credentials
  console.log("[Test 4] Login with registered TENANT credentials at /api/auth/login");
  const r4 = await post(`${base}/api/auth/login`, {
    email: testTenantEmail,
    password: testPassword,
  });
  console.log("Status:", r4.status);
  console.log("Data:", r4.data);
  if (r4.status !== 200 || r4.data?.user?.role !== "tenant" || r4.data?.redirectTo !== "/tenant") {
    throw new Error("Test 4 Failed: Login did not detect tenant role from registered account.");
  }
  console.log("PASS: Authenticated as Tenant, directed to /tenant\n");

  // Test 5: Rejection of invalid password
  console.log("[Test 5] Attempt login with wrong password");
  const r5 = await post(`${base}/api/auth/login`, {
    email: testOwnerEmail,
    password: "WrongPassword!",
  });
  console.log("Status (expected 401):", r5.status);
  console.log("Error:", r5.data?.error);
  if (r5.status !== 401) {
    throw new Error("Test 5 Failed: Wrong password was not rejected!");
  }
  console.log("PASS: Rejected invalid credentials with HTTP 401\n");

  // Test 6: Verify no role switch buttons exist in frontend files
  console.log("[Test 6] Codebase audit: verify role switch buttons are completely removed");
  const headerContent = fs.readFileSync(path.join(process.cwd(), "src/components/layout/nivasa-header.tsx"), "utf-8");
  const sidebarContent = fs.readFileSync(path.join(process.cwd(), "src/components/layout/nivasa-sidebar.tsx"), "utf-8");
  const profileContent = fs.readFileSync(path.join(process.cwd(), "src/app/profile/page.tsx"), "utf-8");

  if (headerContent.includes("Switch to Tenant") || headerContent.includes("Switch to Owner")) {
    throw new Error("Test 6 Failed: Role switch button still exists in nivasa-header.tsx!");
  }
  if (sidebarContent.includes("Switch to Tenant") || sidebarContent.includes("Switch to Owner")) {
    throw new Error("Test 6 Failed: Role switch button still exists in nivasa-sidebar.tsx!");
  }
  if (profileContent.includes("Switch to Tenant") || profileContent.includes("Switch to Owner")) {
    throw new Error("Test 6 Failed: Role switch button still exists in profile/page.tsx!");
  }
  console.log("PASS: Zero role-switching buttons found across header, sidebar, and profile\n");

  console.log("=================================================");
  console.log("  ALL 6 REGISTRATION & AUTH TESTS PASSED (100%)");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
