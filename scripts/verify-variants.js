// Verify the new variant IDs are correct
const LEMONSQUEEZY_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5YzEyY2Q0NmFkZWQwNDNiNjVhMTQ4OWY3MWJmYmYxNjYyYTIxNWRhNjVmYWVmYTFmNWZkNmI1Y2M1OGVlZWM5YWQwY2Q5Y2IxYWE3NGU3NSIsImlhdCI6MTc2NTA0NjczOS4xMzQyNDgsIm5iZiI6MTc2NTA0NjczOS4xMzQyNTEsImV4cCI6MjA4MDU3OTUzOS4xMTgwMzYsInN1YiI6IjYwNDc5NDUiLCJzY29wZXMiOltdfQ.pTDRPchjQsgdDV-iyoKqeKqEih2aD_xBDIvRbRsTP-2ozZCPt4w5kwHfL5GGCMIZKYsI9afqHRH_sJ2iAFvKF6yDMY6hAQkLuNI35094arHOy03Zvnb-GCfT0UJb43E9ZhMm1cUzUrhOQaEX2DcSoA3x07U-0WCYBfxRNLVBCUgW7Ugo8D84qGH6FkbjXotafvu-NhU59ulk1HTrArU944jn77U9xy9AvqUY-WXHsYkZF9mK5fathmKRSNbRiW9V-ciZDrklvr63aZsaN-vTjjdWXf8-m_7gTPWt753Gk8uKbLSaSoMOoDug2SHJM2eeHuWgFrlRBPz6AMfdfZThwzXJcYPknDHFfuDMTVBeolAwjwKN3bbrCIbI5WuZ3scmmj05MTECWBK3OkeoWgQRlUsuPKCxcZZp_sMw_cJuTyeyQ2QJUpJ15-_DrM6YhEG619Xyc9T-0Q3P2Am1A8I390E_1eFUlGmzlOG3cJS6ppP3B8g5qE9WdKyj3fpqkbHOsbPeK4qx3NaB0Zcss2fl9EVTMS4QhkEPg0CCUCP_952pANHDYLbAnbqLYk_FNWH5kb0aUgN17w4HIN8ZOThuIr_hAuSPwQ0pn7JjqQ5cHC1rtDAOqwgLllYYTJy8eC5JImJviMHd1zju0a35AvXbwtadZgeaMw-0gh3lj7GuAo0";

async function checkVariant(variantId, expectedName) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/variants/${variantId}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const name = data.data.attributes.name;
    const price = data.data.attributes.price;
    const interval = data.data.attributes.interval;

    console.log(`✅ ${expectedName} variant (${variantId}):`);
    console.log(`   Name: ${name}`);
    console.log(`   Price: $${price / 100}`);
    console.log(`   Interval: ${interval}`);
    console.log(`   Status: ${data.data.attributes.status}`);
    return true;
  } else {
    console.log(`❌ ${expectedName} variant (${variantId}) not found (${response.status})`);
    return false;
  }
}

async function main() {
  console.log('Verifying Pro variant (1133917)...\n');
  await checkVariant(1133917, 'Pro');

  console.log('\nVerifying Unlimited variant (1133918)...\n');
  await checkVariant(1133918, 'Unlimited');
}

main();
