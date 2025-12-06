// Quick script to check if our LemonSqueezy variants still exist
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

async function checkVariant(variantId) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/variants/${variantId}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`✅ Variant ${variantId} exists:`, data.data.attributes.name);
    return true;
  } else {
    console.log(`❌ Variant ${variantId} not found (${response.status})`);
    return false;
  }
}

async function main() {
  console.log('Checking Pro variant (1119497)...');
  await checkVariant(1119497);

  console.log('\nChecking Unlimited variant (1119519)...');
  await checkVariant(1119519);
}

main();
