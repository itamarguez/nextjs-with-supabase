// List all products in the store
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = '249945';

async function listProducts() {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/products?filter[store_id]=${STORE_ID}`, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
    },
  });

  console.log('Response status:', response.status);

  if (response.ok) {
    const data = await response.json();
    console.log('Products found:', data.data.length);
    data.data.forEach(product => {
      console.log(`\n📦 Product: ${product.attributes.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Status: ${product.attributes.status}`);
    });
  } else {
    const error = await response.text();
    console.log('❌ Error:', error);
  }
}

listProducts();
