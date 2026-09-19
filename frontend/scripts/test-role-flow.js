const http = require("http");

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
      headers: {
        "User-Agent": "RoleFlowTestAgent/1.0",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          location: res.headers.location,
          body,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("  NIVASA ROLE-BASED ACCESS CONTROL & JOURNEY TEST");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(name, condition, extra = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${name}`);
      if (extra) console.error(`       Details: ${extra}`);
    }
  }

  try {
    // 1. Landing Page Test
    console.log("--- 1. Landing Page Verification ---");
    const landing = await makeRequest("/");
    assert(
      "Landing page loads with 200 OK",
      landing.statusCode === 200,
      `Status: ${landing.statusCode}`
    );
    assert(
      "Landing page contains Nivasa branding and Primary CTA (Find Your Home)",
      landing.body.includes("Living,") &&
      landing.body.includes("Find Your Home"),
      "Missing Living, or Find Your Home"
    );
    assert(
      "Landing page contains Secondary CTA (List Your Property)",
      landing.body.includes("List Your Property"),
      "Missing List Your Property"
    );
    assert(
      "Landing page contains How Nivasa Works section",
      landing.body.includes("How Nivasa Works"),
      "Missing How Nivasa Works"
    );
    assert(
      "Landing page contains For Tenants & For Owners sections",
      landing.body.includes("For Tenants") && landing.body.includes("For Property Owners"),
      "Missing For Tenants or For Owners"
    );

    // 2. Unauthenticated Route Protection
    console.log("\n--- 2. Unauthenticated Route Protection ---");
    const unauthTenant = await makeRequest("/tenant");
    assert(
      "Unauthenticated /tenant redirects to /login?redirect=/tenant",
      (unauthTenant.statusCode === 307 || unauthTenant.statusCode === 308 || unauthTenant.statusCode === 302) &&
      unauthTenant.location &&
      unauthTenant.location.includes("/login"),
      `Status: ${unauthTenant.statusCode}, Location: ${unauthTenant.location}`
    );

    const unauthOwner = await makeRequest("/owner");
    assert(
      "Unauthenticated /owner redirects to /login?redirect=/owner",
      (unauthOwner.statusCode === 307 || unauthOwner.statusCode === 308 || unauthOwner.statusCode === 302) &&
      unauthOwner.location &&
      unauthOwner.location.includes("/login"),
      `Status: ${unauthOwner.statusCode}, Location: ${unauthOwner.location}`
    );

    // 3. Authenticated Tenant Journey
    console.log("\n--- 3. Authenticated Tenant Journey ---");
    const tenantAccess = await makeRequest("/tenant", {
      Cookie: "nivasa_auth=1; nivasa_role=tenant; nivasa_user_name=Ronak",
    });
    assert(
      "Authenticated Tenant can access /tenant (200 OK)",
      tenantAccess.statusCode === 200,
      `Status: ${tenantAccess.statusCode}`
    );

    const tenantBlockedFromOwner = await makeRequest("/owner", {
      Cookie: "nivasa_auth=1; nivasa_role=tenant; nivasa_user_name=Ronak",
    });
    assert(
      "Authenticated Tenant accessing /owner is redirected to /tenant",
      (tenantBlockedFromOwner.statusCode === 307 || tenantBlockedFromOwner.statusCode === 308 || tenantBlockedFromOwner.statusCode === 302) &&
      tenantBlockedFromOwner.location &&
      tenantBlockedFromOwner.location.includes("/tenant"),
      `Status: ${tenantBlockedFromOwner.statusCode}, Location: ${tenantBlockedFromOwner.location}`
    );

    // 4. Authenticated Owner Journey
    console.log("\n--- 4. Authenticated Owner Journey ---");
    const ownerAccess = await makeRequest("/owner", {
      Cookie: "nivasa_auth=1; nivasa_role=owner; nivasa_user_name=Mehta",
    });
    assert(
      "Authenticated Owner can access /owner (200 OK)",
      ownerAccess.statusCode === 200,
      `Status: ${ownerAccess.statusCode}`
    );

    const ownerBlockedFromTenant = await makeRequest("/tenant", {
      Cookie: "nivasa_auth=1; nivasa_role=owner; nivasa_user_name=Mehta",
    });
    assert(
      "Authenticated Owner accessing /tenant is redirected to /owner",
      (ownerBlockedFromTenant.statusCode === 307 || ownerBlockedFromTenant.statusCode === 308 || ownerBlockedFromTenant.statusCode === 302) &&
      ownerBlockedFromTenant.location &&
      ownerBlockedFromTenant.location.includes("/owner"),
      `Status: ${ownerBlockedFromTenant.statusCode}, Location: ${ownerBlockedFromTenant.location}`
    );

    // 5. Authenticated Users Bypassing Login Page
    console.log("\n--- 5. Authenticated Redirection From Auth Pages ---");
    const tenantLoginBypass = await makeRequest("/login", {
      Cookie: "nivasa_auth=1; nivasa_role=tenant",
    });
    assert(
      "Authenticated Tenant visiting /login is redirected to /tenant",
      (tenantLoginBypass.statusCode === 307 || tenantLoginBypass.statusCode === 308 || tenantLoginBypass.statusCode === 302) &&
      tenantLoginBypass.location &&
      tenantLoginBypass.location.includes("/tenant"),
      `Status: ${tenantLoginBypass.statusCode}, Location: ${tenantLoginBypass.location}`
    );

    const ownerLoginBypass = await makeRequest("/login", {
      Cookie: "nivasa_auth=1; nivasa_role=owner",
    });
    assert(
      "Authenticated Owner visiting /login is redirected to /owner",
      (ownerLoginBypass.statusCode === 307 || ownerLoginBypass.statusCode === 308 || ownerLoginBypass.statusCode === 302) &&
      ownerLoginBypass.location &&
      ownerLoginBypass.location.includes("/owner"),
      `Status: ${ownerLoginBypass.statusCode}, Location: ${ownerLoginBypass.location}`
    );

    console.log("\n=================================================");
    console.log(`  SUMMARY: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
    console.log("=================================================\n");

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
