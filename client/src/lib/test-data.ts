export interface DemoOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: "cod" | "d17" | "flouci" | "card";
  status: "pending" | "processing" | "shipped" | "delivered" | "refund_requested" | "refunded" | "canceled";
  totalAmount: number;
  subtotal: number;
  createdAt: string;
  refundReason?: string;
  cancelReason?: string;
  shipments: {
    id: string;
    brandName: string;
    status: "pending" | "preparing" | "ready_for_pickup" | "shipped" | "delivered";
    carrier: string;
    trackingNumber: string;
    items: {
      name: string;
      price: number;
      quantity: number;
      image?: string;
      size?: string;
      color?: string;
    }[];
  }[];
}

export const TEST_DEMO_ORDERS: DemoOrder[] = [
  {
    id: "ord-test-01",
    customerName: "Sarra Ben Amor",
    customerEmail: "sarra.amor@gmail.com",
    phone: "+216 22 458 912",
    shippingAddress: "Avenue Habib Bourguiba, Ariana, Tunis",
    paymentMethod: "cod",
    status: "refund_requested",
    totalAmount: 185.0,
    subtotal: 178.0,
    refundReason: "Taille trop petite pour le blazer en lin",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    shipments: [
      {
        id: "shp-01",
        brandName: "Lilas Boutique",
        status: "delivered",
        carrier: "Aramex Express",
        trackingNumber: "ARX-TN-884210",
        items: [
          {
            name: "Blazer Lin Tunisien",
            price: 120.0,
            quantity: 1,
            size: "M",
            color: "Beige Naturel",
            image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
          },
          {
            name: "Foulard Soie Sauvage",
            price: 58.0,
            quantity: 1,
            size: "Unique",
            color: "Bleu Indigo",
            image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "ord-test-02",
    customerName: "Yassine Mansour",
    customerEmail: "yassine.m@yahoo.fr",
    phone: "+216 55 120 449",
    shippingAddress: "Route de Téniour Km 3, Sfax",
    paymentMethod: "d17",
    status: "processing",
    totalAmount: 240.0,
    subtotal: 232.0,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    shipments: [
      {
        id: "shp-02",
        brandName: "Zara TN Partner",
        status: "preparing",
        carrier: "Local Courier",
        trackingNumber: "ST-SFX-1092",
        items: [
          {
            name: "Chemise Col Tunisien Blanc",
            price: 85.0,
            quantity: 2,
            size: "L",
            color: "Blanc Pur",
            image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",
          },
          {
            name: "Pantalon Chino Beige",
            price: 70.0,
            quantity: 1,
            size: "42",
            color: "Sable",
            image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "ord-test-03",
    customerName: "Amira Dridi",
    customerEmail: "amira.dridi@topnet.tn",
    phone: "+216 98 765 432",
    shippingAddress: "Rue de la Plage, Hammamet, Nabeul",
    paymentMethod: "cod",
    status: "shipped",
    totalAmount: 310.5,
    subtotal: 300.0,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    shipments: [
      {
        id: "shp-03",
        brandName: "ElStyle Co.",
        status: "shipped",
        carrier: "Aramex Express",
        trackingNumber: "ARX-TN-992314",
        items: [
          {
            name: "Robe Longue Fleurie",
            price: 195.0,
            quantity: 1,
            size: "S",
            color: "Floral Émeraude",
            image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
          },
          {
            name: "Ceinture Cuir Artisanal",
            price: 105.0,
            quantity: 1,
            size: "85cm",
            color: "Marron Havane",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "ord-test-04",
    customerName: "Mohamed Ali Triki",
    customerEmail: "m.triki@gmail.com",
    phone: "+216 29 334 118",
    shippingAddress: "Kantaoui Resort, Sousse",
    paymentMethod: "card",
    status: "delivered",
    totalAmount: 95.0,
    subtotal: 90.0,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    shipments: [
      {
        id: "shp-04",
        brandName: "Moda Casa",
        status: "delivered",
        carrier: "Express Delivery",
        trackingNumber: "EXP-SOUSSE-441",
        items: [
          {
            name: "Polo Piqué Noir",
            price: 90.0,
            quantity: 1,
            size: "XL",
            color: "Noir Onyx",
            image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "ord-test-05",
    customerName: "Nourhene Khemir",
    customerEmail: "nour.khemir@outlook.com",
    phone: "+216 50 882 173",
    shippingAddress: "Les Berges du Lac 2, Tunis",
    paymentMethod: "d17",
    status: "refunded",
    totalAmount: 145.0,
    subtotal: 140.0,
    refundReason: "Colis retourné en agence suite à absence du destinataire",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    shipments: [
      {
        id: "shp-05",
        brandName: "Lilas Boutique",
        status: "delivered",
        carrier: "Aramex Express",
        trackingNumber: "ARX-TN-771120",
        items: [
          {
            name: "Cardigan Maille Côtelée",
            price: 140.0,
            quantity: 1,
            size: "M",
            color: "Crème Vanille",
            image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
          },
        ],
      },
    ],
  },
];
