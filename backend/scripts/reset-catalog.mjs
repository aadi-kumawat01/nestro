import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../src/models/product.model.js";
import Category from "../src/models/category.model.js";
import Room from "../src/models/room.model.js";
import Cart from "../src/models/cart.model.js";
import {
  Wishlist,
  Review,
  InventoryAdjustment,
  StoreSettings,
} from "../src/models/commerce.model.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

const apply = process.argv.includes("--apply");
const confirmed = process.argv.includes("--confirm=RESET_CATALOG");
if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
if (apply && !confirmed)
  throw new Error(
    "Destructive reset blocked. Add --confirm=RESET_CATALOG after taking a backup.",
  );

const categorySeed = [
  ["Sofas", "sofas"],
  ["Chairs", "chairs"],
  ["Tables", "tables"],
  ["Beds", "beds"],
  ["Storage", "storage"],
  ["Lighting", "lighting"],
  ["Decor", "decor"],
  ["Dining", "dining"],
];
const roomSeed = [
  ["Living Room", "living-room"],
  ["Bedroom", "bedroom"],
  ["Dining Room", "dining-room"],
  ["Home Office", "home-office"],
  ["Entryway", "entryway"],
];

const photos = {
  sofa: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85",
  chair:
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=85",
  table:
    "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1400&q=85",
  bed: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=85",
  storage:
    "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=85",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=85",
  decor:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85",
  dining:
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=85",
};

const products = [
  [
    "Arden 3-Seater Sofa",
    "sofas",
    "living-room",
    64999,
    57999,
    18,
    "NEST-SOF-ARD-001",
    "Fabric",
    "Sand Beige",
    "sofa",
    [215, 92, 84],
    54,
    "Featured comfort sofa with deep seats and a clean contemporary silhouette.",
  ],
  [
    "Mira Boucle Lounge Chair",
    "chairs",
    "living-room",
    24999,
    21999,
    14,
    "NEST-CHR-MIR-002",
    "Fabric",
    "Ivory",
    "chair",
    [78, 82, 76],
    18,
    "Soft boucle lounge chair designed for reading corners and relaxed living spaces.",
  ],
  [
    "Aster Solid Wood Coffee Table",
    "tables",
    "living-room",
    18999,
    15999,
    22,
    "NEST-TBL-AST-003",
    "Sheesham",
    "Walnut",
    "table",
    [110, 60, 42],
    24,
    "Solid wood coffee table with rounded edges and a warm natural grain.",
  ],
  [
    "Noor King Upholstered Bed",
    "beds",
    "bedroom",
    78999,
    69999,
    9,
    "NEST-BED-NOR-004",
    "Fabric",
    "Taupe",
    "bed",
    [205, 190, 118],
    72,
    "Upholstered king bed with a cushioned headboard and sturdy internal frame.",
  ],
  [
    "Luma Queen Platform Bed",
    "beds",
    "bedroom",
    56999,
    49999,
    12,
    "NEST-BED-LUM-005",
    "Wood",
    "Natural Oak",
    "bed",
    [205, 165, 102],
    61,
    "Minimal queen platform bed with a low profile and durable wood construction.",
  ],
  [
    "Riva 6-Seater Dining Table",
    "dining",
    "dining-room",
    74999,
    66999,
    8,
    "NEST-DIN-RIV-006",
    "Sheesham",
    "Honey Oak",
    "dining",
    [180, 95, 76],
    68,
    "Six-seater dining table built for everyday family meals and hosting.",
  ],
  [
    "Riva Dining Chair Set of 2",
    "chairs",
    "dining-room",
    22999,
    19999,
    20,
    "NEST-CHR-RIV-007",
    "Wood",
    "Honey Oak",
    "chair",
    [48, 55, 86],
    14,
    "Pair of supportive dining chairs with upholstered seats and solid wood frames.",
  ],
  [
    "Elara Sideboard",
    "storage",
    "dining-room",
    42999,
    38999,
    11,
    "NEST-STO-ELA-008",
    "Engineered Wood",
    "Warm Walnut",
    "storage",
    [150, 42, 82],
    46,
    "Wide sideboard with concealed storage for serveware, linens and daily essentials.",
  ],
  [
    "Cove TV Console",
    "storage",
    "living-room",
    35999,
    31999,
    16,
    "NEST-STO-COV-009",
    "Engineered Wood",
    "Smoked Oak",
    "storage",
    [180, 42, 55],
    39,
    "Low-profile media console with cable routing and generous closed storage.",
  ],
  [
    "Sora Nesting Tables",
    "tables",
    "living-room",
    16999,
    13999,
    25,
    "NEST-TBL-SOR-010",
    "Metal",
    "Black & Oak",
    "table",
    [55, 55, 52],
    13,
    "Space-saving pair of nesting side tables for flexible living-room layouts.",
  ],
  [
    "Iris Floor Lamp",
    "lighting",
    "living-room",
    12999,
    10999,
    30,
    "NEST-LGT-IRI-011",
    "Metal",
    "Matte Black",
    "lamp",
    [38, 38, 162],
    7,
    "Slim floor lamp with warm ambient lighting for sofas, corners and reading zones.",
  ],
  [
    "Halo Bedside Table",
    "tables",
    "bedroom",
    14999,
    12999,
    24,
    "NEST-TBL-HAL-012",
    "Wood",
    "Natural Ash",
    "table",
    [48, 40, 52],
    15,
    "Compact bedside table with a drawer and open shelf for nighttime essentials.",
  ],
  [
    "Ava Chest of Drawers",
    "storage",
    "bedroom",
    32999,
    28999,
    10,
    "NEST-STO-AVA-013",
    "Engineered Wood",
    "Ivory & Oak",
    "storage",
    [95, 45, 105],
    42,
    "Five-drawer storage chest with soft-close runners and a clean neutral finish.",
  ],
  [
    "Kian Study Desk",
    "tables",
    "home-office",
    26999,
    23999,
    17,
    "NEST-TBL-KIA-014",
    "Wood",
    "Walnut",
    "table",
    [130, 60, 76],
    32,
    "Focused work desk with cable access, storage drawer and generous writing surface.",
  ],
  [
    "Nora Ergonomic Desk Chair",
    "chairs",
    "home-office",
    21999,
    18999,
    19,
    "NEST-CHR-NOR-015",
    "Fabric",
    "Graphite",
    "chair",
    [66, 66, 112],
    16,
    "Supportive task chair with adjustable height, tilt and breathable upholstered back.",
  ],
  [
    "Atlas Bookcase",
    "storage",
    "home-office",
    29999,
    26999,
    13,
    "NEST-STO-ATL-016",
    "Engineered Wood",
    "Dark Oak",
    "storage",
    [90, 34, 190],
    44,
    "Tall bookcase with five shelves for books, objects and home-office storage.",
  ],
  [
    "Melo Console Table",
    "tables",
    "entryway",
    23999,
    20999,
    15,
    "NEST-TBL-MEL-017",
    "Sheesham",
    "Walnut",
    "table",
    [125, 38, 82],
    28,
    "Slim entryway console with a drawer for keys, mail and everyday carry items.",
  ],
  [
    "Oro Round Wall Mirror",
    "decor",
    "entryway",
    11999,
    9999,
    27,
    "NEST-DEC-ORO-018",
    "Metal",
    "Brushed Brass",
    "decor",
    [85, 4, 85],
    8,
    "Large round wall mirror with a slim brushed-metal frame for entryways and bedrooms.",
  ],
  [
    "Vela Accent Chair",
    "chairs",
    "living-room",
    27999,
    23999,
    12,
    "NEST-CHR-VEL-019",
    "Fabric",
    "Terracotta",
    "chair",
    [76, 80, 82],
    19,
    "Statement accent chair with supportive cushioning and warm textured upholstery.",
  ],
  [
    "Tara 4-Seater Dining Set",
    "dining",
    "dining-room",
    69999,
    61999,
    7,
    "NEST-DIN-TAR-020",
    "Wood",
    "Natural Oak",
    "dining",
    [150, 85, 76],
    76,
    "Compact four-seater dining set designed for apartments and modern dining spaces.",
  ],
  [
    "Eden Storage Ottoman",
    "storage",
    "living-room",
    15999,
    13999,
    21,
    "NEST-STO-EDE-021",
    "Fabric",
    "Olive",
    "storage",
    [85, 45, 43],
    14,
    "Upholstered ottoman with hidden storage for throws, cushions and small essentials.",
  ],
  [
    "Sol Pendant Light",
    "lighting",
    "dining-room",
    10999,
    8999,
    28,
    "NEST-LGT-SOL-022",
    "Metal",
    "Warm Brass",
    "lamp",
    [42, 42, 35],
    5,
    "Modern pendant light for dining tables and kitchen counters with focused warm illumination.",
  ],
  [
    "Aira Ceramic Vase Set",
    "decor",
    "living-room",
    6999,
    5499,
    35,
    "NEST-DEC-AIR-023",
    "Marble",
    "Cream",
    "decor",
    [24, 24, 38],
    4,
    "Decorative vase pair with soft neutral tones for shelves, consoles and dining tables.",
  ],
  [
    "Reya Upholstered Bench",
    "chairs",
    "entryway",
    19999,
    16999,
    18,
    "NEST-CHR-REY-024",
    "Fabric",
    "Oatmeal",
    "chair",
    [120, 42, 48],
    20,
    "Entryway bench with a cushioned seat and understated solid-wood base.",
  ],
];

await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
});
try {
  const existing = await Product.countDocuments({ archived: { $ne: true } });
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      activeProductsToRemove: existing,
      newProducts: products.length,
      categories: categorySeed.length,
      rooms: roomSeed.length,
    }),
  );
  if (!apply) process.exitCode = 0;
  else {
    await mongoose.connection.transaction(async (session) => {
      await Product.deleteMany({}, { session });
      await Cart.deleteMany({}, { session });
      await Wishlist.deleteMany({}, { session });
      await Review.deleteMany({}, { session });
      await InventoryAdjustment.deleteMany({}, { session });
      await Category.deleteMany({}, { session });
      await Room.deleteMany({}, { session });
      await StoreSettings.findByIdAndUpdate(
        "store",
        {
          $set: {
            shippingCharge: 1500,
            freeShippingAbove: 100000,
            codMaxOrderValue: 50000,
          },
        },
        { upsert: true, session },
      );
      const categoryDocs = await Category.insertMany(
        categorySeed.map(([name, slug]) => ({ name, slug, status: true })),
        { session },
      );
      const roomDocs = await Room.insertMany(
        roomSeed.map(([name, slug]) => ({ name, slug, status: true })),
        { session },
      );
      const categories = Object.fromEntries(
        categoryDocs.map((doc) => [doc.slug, doc._id]),
      );
      const rooms = Object.fromEntries(
        roomDocs.map((doc) => [doc.slug, doc._id]),
      );
      await Product.insertMany(
        products.map((p, index) => {
          const [
            title,
            category,
            room,
            price,
            salePrice,
            stockQuantity,
            sku,
            material,
            color,
            photo,
            dims,
            weight,
            shortDescription,
          ] = p;
          return {
            title,
            slug: title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
            shortDescription,
            description: `${shortDescription} Built for everyday use with carefully selected materials, considered proportions and a finish designed to work across contemporary Indian homes.`,
            category: categories[category],
            roomType: rooms[room],
            price,
            salePrice,
            stockQuantity,
            sku,
            material,
            color,
            thumbnail: photos[photo],
            images: [photos[photo]],
            dimensions: {
              length: dims[0],
              width: dims[1],
              height: dims[2],
              unit: "cm",
            },
            weight: { value: weight, unit: "kg" },
            warranty: "6 months",
            assembly: ["sofa", "chair", "decor", "lamp"].includes(photo)
              ? "No assembly or minimal assembly"
              : "Professional assembly recommended",
            stock: true,
            status: true,
            archived: false,
            featured: index < 6,
            bestSeller: [0, 2, 5, 8, 13, 18].includes(index),
            newArrival: index >= 16,
            sold: 0,
          };
        }),
        { session },
      );
    });
    console.log(
      "Catalog reset complete. Verify images, physical stock counts and pricing before enabling checkout.",
    );
  }
} finally {
  await mongoose.disconnect();
}
