import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/login";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext.";

// Import Halaman Admin & Dashboard yang sudah dipisah
import DashboardOverview from "./pages/admin/DashboardOverview";
import DataBarang from "./pages/admin/DataBarang";
import KategoriDanSatuan from "./pages/admin/KategoriDanSatuan";
import Vendor from "./pages/admin/Vendor";
import PermintaanBarang from "./pages/admin/PermintaanBarang";
import BarangMasuk from "./pages/admin/BarangMasuk";
import BarangKeluar from "./pages/admin/BarangKeluar";
import Departemen from "./pages/admin/Departemen";
import DataPegawai from "./pages/admin/DataPegawai";
import LaporanMasuk from "./pages/admin/LaporanMasuk";
import LaporanKeluar from "./pages/admin/LaporanKeluar";
import LaporanStok from "./pages/admin/LaporanStock";
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Route Dashboard dengan Layout & Proteksi Role */}
          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  {/* Overview (Hanya Admin, Supervisor, Accounting, Superadmin) */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "admin",
                          "supervisor",
                          "accounting",
                          "superadmin",
                          "gm",
                        ]}
                      >
                        <DashboardOverview />
                      </ProtectedRoute>
                    }
                  />

                  {/* Permintaan Barang */}
                  <Route
                    path="/permintaan"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin", "supervisor", "logistic"]}
                      >
                        <PermintaanBarang />
                      </ProtectedRoute>
                    }
                  />

                  {/* Barang Masuk & Keluar */}
                  <Route
                    path="/barang-masuk"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin", "supervisor", "logistic"]}
                      >
                        <BarangMasuk />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/barang-keluar"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin", "supervisor", "logistic"]}
                      >
                        <BarangKeluar />
                      </ProtectedRoute>
                    }
                  />

                  {/* Data Barang */}
                  <Route
                    path="/barang"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin", "supervisor", "logistic"]}
                      >
                        <DataBarang />
                      </ProtectedRoute>
                    }
                  />

                  {/* Kategori, Departemen, UserManagement & Pegawai */}
                  <Route
                    path="/kategori-satuan"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                        <KategoriDanSatuan />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/departemen"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                        <Departemen />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pegawai"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
                        <DataPegawai />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/user-management"
                    element={
                      <ProtectedRoute allowedRoles={["supervisor"]}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Vendor */}
                  <Route
                    path="/vendor"
                    element={
                      <ProtectedRoute
                        allowedRoles={["admin", "supervisor", "accounting"]}
                      >
                        <Vendor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Laporan-laporan */}
                  <Route
                    path="/laporan-masuk"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "admin",
                          "supervisor",
                          "accounting",
                          "gm",
                        ]}
                      >
                        <LaporanMasuk />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laporan-keluar"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "admin",
                          "supervisor",
                          "accounting",
                          "gm",
                        ]}
                      >
                        <LaporanKeluar />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/laporan-stok"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "admin",
                          "supervisor",
                          "accounting",
                          "gm",
                        ]}
                      >
                        <LaporanStok />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings / Pengaturan (Hanya Supervisor & Admin) */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
