
const url = "https://fynifyelxrrfgvcxejpg.supabase.co/functions/v1/kiwify_webhook";

async function test() {
    console.log("Testing URL:", url);
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test_mode: true })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
