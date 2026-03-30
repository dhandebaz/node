const { extractAirbnbInfo } = require('./src/app/actions/listings');

async function test() {
  const url = "https://www.airbnb.com/rooms/1411615243808363308"; // The one used in research
  console.log("Testing extraction for:", url);
  try {
    const result = await extractAirbnbInfo(url);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
