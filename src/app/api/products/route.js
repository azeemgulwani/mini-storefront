export async function GET() {
  const products = [
    { id: "p1",  name: "Laptop Pro 14",          price: 1299, category: "Electronics", stock: 5 },
    { id: "p2",  name: "Noise-Cancel Headphones", price: 199,  category: "Electronics", stock: 7 },
    { id: "p3",  name: "Smartphone X",           price: 899,  category: "Electronics", stock: 4 },
    { id: "p4",  name: "Ergo Desk Chair",        price: 179,  category: "Furniture",   stock: 6 },
    { id: "p5",  name: "Standing Desk",          price: 349,  category: "Furniture",   stock: 3 },
    { id: "p6",  name: "Ceramic Mug Set",        price: 24,   category: "Home",        stock: 10 },
    { id: "p7",  name: "Cotton Throw",           price: 39,   category: "Home",        stock: 8 },
    { id: "p8",  name: "Running Shoes",          price: 129,  category: "Apparel",     stock: 9 },
    { id: "p9",  name: "Hoodie",                 price: 69,   category: "Apparel",     stock: 5 },
    { id: "p10", name: "Bluetooth Speaker",      price: 59,   category: "Electronics", stock: 12 },
    { id: "p11", name: "Table Lamp",             price: 49,   category: "Home",        stock: 11 },
    { id: "p12", name: "Bookshelf",              price: 99,   category: "Furniture",   stock: 2 },
  ];
  return Response.json(products);
}