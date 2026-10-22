async function runTests() {
  const baseUrl = "http://localhost:3000";

  console.log("=== 1. Testing GET /api/credits ===");
  const res1 = await fetch(`${baseUrl}/api/credits`);
  const data1 = await res1.json();
  console.log("GET /api/credits status:", res1.status, "Balance:", data1.data?.account?.balance);

  const initialBalance = data1.data?.account?.balance;

  console.log("\n=== 2. Testing POST /api/credits/add (+1000 credits) ===");
  const testKey = `test-key-${Date.now()}`;
  const res2 = await fetch(`${baseUrl}/api/credits/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 1000,
      category: "TEST_PURCHASE",
      description: "Test Suite Recharge",
      idempotencyKey: testKey,
    }),
  });
  const data2 = await res2.json();
  console.log("POST /api/credits/add status:", res2.status, "New Balance:", data2.data?.account?.balance);
  if (data2.data?.account?.balance !== initialBalance + 1000) {
    throw new Error(`Balance mismatch: expected ${initialBalance + 1000}, got ${data2.data?.account?.balance}`);
  }

  console.log("\n=== 3. Testing Idempotency on duplicate /api/credits/add ===");
  const res3 = await fetch(`${baseUrl}/api/credits/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 1000,
      category: "TEST_PURCHASE",
      description: "Test Suite Recharge Duplicate",
      idempotencyKey: testKey, // Same idempotency key!
    }),
  });
  const data3 = await res3.json();
  console.log("Duplicate status:", res3.status, "Balance unchanged:", data3.data?.account?.balance === initialBalance + 1000);
  if (data3.data?.account?.balance !== initialBalance + 1000) {
    throw new Error("Idempotency failed: balance increased on duplicate key!");
  }

  console.log("\n=== 4. Testing AI Inference deduction via POST /api/analyze ===");
  const currentBalBeforeInference = data3.data.account.balance;
  const res4 = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Assess architectural scalability of multi-tenant credit accounting engine under heavy load.",
      model: "Wiseware Neural-v4",
      category: "Architecture",
    }),
  });
  const data4 = await res4.json();
  console.log("Analyze status:", res4.status, "Credits used:", data4.data?.creditsUsed, "Remaining:", data4.data?.creditsRemaining);
  if (data4.data?.creditsRemaining !== currentBalBeforeInference - 25) {
    throw new Error(`Inference deduction mismatch: expected ${currentBalBeforeInference - 25}, got ${data4.data?.creditsRemaining}`);
  }

  console.log("\n=== 5. Testing Zero-Credit Preview on /api/enrich (authorizeCreditUsage: false) ===");
  const res5 = await fetch(`${baseUrl}/api/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: "stripe.com",
      authorizeCreditUsage: false,
    }),
  });
  const data5 = await res5.json();
  console.log("Enrich preview status:", res5.status, "Credits used:", data5.creditsUsed);

  console.log("\n=== 6. Testing Guard Against Insufficient Credits (Negative balance prevention) ===");
  // Attempt to deduct an exorbitant amount (e.g. 9,999,999 credits)
  const res6 = await fetch(`${baseUrl}/api/credits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: 9999999,
      category: "AI_INFERENCE",
      description: "Exorbitant test charge",
    }),
  });
  const data6 = await res6.json();
  console.log("Guard status:", res6.status, "(Expected 402)", "Code:", data6.code, "Error:", data6.error);
  if (res6.status !== 402 || data6.code !== "INSUFFICIENT_CREDITS") {
    throw new Error(`Negative balance guard failed: expected 402 INSUFFICIENT_CREDITS, got ${res6.status}`);
  }

  console.log("\n=== 7. Final Balance & Transaction Count Verification ===");
  const res7 = await fetch(`${baseUrl}/api/credits`);
  const data7 = await res7.json();
  console.log("Final balance:", data7.data?.account?.balance);
  console.log("Total transactions in ledger:", data7.data?.transactions?.length);
  console.log("Latest transaction:", data7.data?.transactions?.[0]?.description, "Amount:", data7.data?.transactions?.[0]?.amount);

  console.log("\n🎉 ALL CREDIT ENGINE TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
