// src/sidebarConfig.js
export const menuGroups = [
  {
    group: "Utama",
    items: [
      {
        name: "Overview",
        path: "/dashboard",
        icon: "📈",
        roles: ["admin", "supervisor", "accounting", "gm"],
      },
    ],
  },
  {
    group: "Transaksi Logistik",
    items: [
      {
        name: "Permintaan Barang",
        path: "/dashboard/permintaan",
        icon: "📋",
        roles: ["admin", "supervisor", "logistic"],
      },
      {
        name: "Barang Masuk",
        path: "/dashboard/barang-masuk",
        icon: "📦",
        roles: ["admin", "supervisor", "logistic"],
      },
      {
        name: "Barang Keluar",
        path: "/dashboard/barang-keluar",
        icon: "🚚",
        roles: ["admin", "supervisor", "logistic"],
      },
    ],
  },
  {
    group: "Master Data",
    items: [
      {
        name: "Data Barang",
        path: "/dashboard/barang",
        icon: "⛏️",
        roles: ["admin", "supervisor", "logistic"],
      },
      {
        name: "Kategori & Satuan",
        path: "/dashboard/kategori-satuan", // Diubah mengarah ke halaman gabungan
        icon: "🏷️",
        roles: ["admin", "supervisor"],
      },
      {
        name: "Data Vendor",
        path: "/dashboard/vendor",
        icon: "🏗️",
        roles: ["admin", "supervisor", "accounting"],
      },
    ],
  },
  {
    group: "Organisasi",
    items: [
      {
        name: "Departemen",
        path: "/dashboard/departemen",
        icon: "🏢",
        roles: ["admin", "supervisor"],
      },
      {
        name: "Data Pegawai",
        path: "/dashboard/pegawai",
        icon: "👷‍♂️",
        roles: ["admin", "supervisor"],
      },
      {
        name: "User Management",
        path: "/dashboard/user-management",
        icon: "👥",
        roles: ["supervisor"],
      },
    ],
  },
  {
    group: "Laporan",
    items: [
      {
        name: "Laporan Masuk",
        path: "/dashboard/laporan-masuk",
        icon: "📥",
        roles: ["admin", "supervisor", "accounting", "gm"],
      },
      {
        name: "Laporan Keluar",
        path: "/dashboard/laporan-keluar",
        icon: "📤",
        roles: ["admin", "supervisor", "accounting", "gm"],
      },
      {
        name: "Laporan Stok",
        path: "/dashboard/laporan-stok",
        icon: "📊",
        roles: ["admin", "supervisor", "accounting", "gm"],
      },
    ],
  },

  // Di dalam file sidebarConfig.js
  {
    group: "Pengaturan",
    items: [
      {
        name: "Pengaturan Sistem",
        path: "/dashboard/settings",
        icon: "⚙️",
        roles: ["supervisor", "admin"], // Sesuaikan role yang diizinkan
      },
    ],
  },
];
