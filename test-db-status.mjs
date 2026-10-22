async function check() {
  const res = await fetch("http://localhost:3000/api/health");
  const data = await res.json();
  console.log("Services status:", JSON.stringify(data.services, null, 2));
}
check();
