import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// 1. Fungsi Export ke Excel (.xlsx) dengan Format Korporat Profesional & Rapi
export function exportToExcel(data, fileName = "Data_Barang.xlsx") {
  try {
    if (!data || data.length === 0) {
      toast.error("Tidak ada data untuk diexport!");
      return;
    }

    const excelRows = [];

    // Header Perusahaan & Judul Laporan
    excelRows.push(["PT. MEGA PUTRA PERKASA"]);
    excelRows.push(["Sistem Manajemen Logistik Tambang — Data Master Barang"]);
    excelRows.push([
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
    ]);
    excelRows.push([]); // Baris kosong untuk spasi

    // Header Kolom Tabel (Total 10 Kolom)
    excelRows.push([
      "No",
      "Kode Barang",
      "Nama Barang",
      "Kategori",
      "Satuan",
      "Harga (IDR)",
      "Stok",
      "Stok Min.",
      "Vendor / Supplier",
      "Status",
    ]);

    // Data Baris Master Barang
    let totalStok = 0;
    let totalNilaiAset = 0;

    data.forEach((item, index) => {
      const stok = Number(item.stok || 0);
      const harga = Number(item.harga || 0);
      totalStok += stok;
      totalNilaiAset += stok * harga;

      const status = stok <= Number(item.min || 5) ? "Menipis" : "Aman";

      excelRows.push([
        index + 1,
        item.kode || "-",
        item.nama || "-",
        item.kategori || "-",
        item.satuan || "Pcs",
        harga,
        stok,
        Number(item.min || 5),
        item.vendor || "-",
        status,
      ]);
    });

    // Baris Total / Summary (Disesuaikan pas dengan 10 kolom: Index 0 s/d 9)
    excelRows.push([]);

    const totalRow = new Array(10).fill("");
    totalRow[0] = "TOTAL";
    totalRow[5] = `Total Aset:`; // Di kolom Harga (indeks 5)
    totalRow[6] = totalStok; // Di kolom Stok (indeks 6)
    // Kita taruh nilai total aset di kolom vendor (indeks 8) atau gabung rapi
    totalRow[8] = `Rp ${totalNilaiAset.toLocaleString("id-ID")}`;

    excelRows.push(totalRow);

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Pengaturan Lebar Kolom agar tidak ada teks yang kepotong
    const colWidths = [
      { wch: 6 }, // No
      { wch: 14 }, // Kode Barang
      { wch: 28 }, // Nama Barang
      { wch: 16 }, // Kategori
      { wch: 10 }, // Satuan
      { wch: 18 }, // Harga (IDR)
      { wch: 10 }, // Stok
      { wch: 10 }, // Stok Min
      { wch: 24 }, // Vendor / Supplier
      { wch: 12 }, // Status
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Master Barang");

    XLSX.writeFile(workbook, fileName);
    toast.success("File Excel Data Barang berhasil di-download dengan rapi!");
  } catch (error) {
    console.error("Gagal export excel:", error);
    toast.error("Gagal mengeksport data ke Excel.");
  }
}

// 2. Fungsi Cetak PDF / Print Preview Minimalis Profesional Korporat
export function printDataPDF(data) {
  if (!data || data.length === 0) {
    toast.error("Tidak ada data untuk dicetak!");
    return;
  }

  const printWindow = window.open("", "_blank");
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Data Barang - PT. Mega Putra Perkasa</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 0; background: #ffffff; }
          
          .page-wrapper { max-width: 1050px; margin: 0 auto; padding: 15px; }

          .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
          .company-title { font-size: 15px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin: 0; }
          .company-subtitle { font-size: 10px; color: #475569; margin: 2px 0; }
          .company-address { font-size: 10px; color: #475569; margin: 0; }
          
          .report-meta { text-align: right; }
          .report-meta h3 { font-size: 13px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; }
          .report-meta p { font-size: 10px; color: #475569; margin: 2px 0 0; }

          .divider-top { border-bottom: 2px solid #0f172a; margin-top: 6px; }
          .divider-bottom { border-bottom: 2px solid #84cc16; margin-top: 2px; margin-bottom: 15px; }

          .info-count { font-style: italic; font-size: 10px; color: #64748b; margin-bottom: 8px; }

          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { background-color: #1a1612; color: #ffffff; font-weight: bold; font-size: 10px; text-transform: uppercase; padding: 8px 10px; text-align: left; border: none; }
          td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
          tr:hover { background-color: #f8fafc; }
          
          td.center { text-align: center; }
          td.right { text-align: right; }
          th.center { text-align: center; }
          th.right { text-align: right; }

          .badge-kritis { color: #dc2626; font-weight: bold; }
          .badge-aman { color: #059669; font-weight: bold; }

          .signature-section { margin-top: 35px; display: flex; justify-content: space-between; page-break-inside: avoid; padding: 0 40px; }
          .signature-box { text-align: center; width: 220px; }
          .signature-box p { margin: 0; font-size: 11px; color: #1e293b; }
          .signature-box .role { font-weight: bold; margin-bottom: 55px; }
          .signature-line { border-bottom: 1px solid #1e293b; margin-top: 4px; }

          .footer-note { margin-top: 25px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="header-container">
            <div>
              <h2 class="company-title">⛏️ PT. Mega Putra Perkasa</h2>
              <p class="company-subtitle">Sistem Manajemen Logistik Tambang</p>
              <p class="company-address">Jl. Sudirman No. 45, Jambi — 0741-123456</p>
            </div>
            <div class="report-meta">
              <h3>Data Master Barang</h3>
              <p>Tanggal Cetak: ${currentDate}</p>
              <p>Dicetak oleh: Administrator</p>
            </div>
          </div>

          <div class="divider-top"></div>
          <div class="divider-bottom"></div>

          <div class="info-count">
            Data ditampilkan: Menampilkan ${data.length} dari ${data.length} data
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;" class="center">No</th>
                <th style="width: 90px;">Kode</th>
                <th>Nama Barang</th>
                <th style="width: 120px;">Kategori</th>
                <th style="width: 70px;">Sat.</th>
                <th style="width: 110px;" class="right">Harga</th>
                <th style="width: 70px;" class="center">Stok</th>
                <th style="width: 70px;" class="center">Min.</th>
                <th style="width: 140px;">Vendor</th>
                <th style="width: 80px;" class="center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map((item, index) => {
                  const isKritis =
                    Number(item.stok || 0) <= Number(item.min || 5);
                  return `
                  <tr>
                    <td class="center">${index + 1}</td>
                    <td><b>${item.kode || "-"}</b></td>
                    <td><b>${item.nama || "-"}</b></td>
                    <td>${item.kategori || "-"}</td>
                    <td>${item.satuan || "Pcs"}</td>
                    <td class="right">Rp ${Number(item.harga || 0).toLocaleString("id-ID")}</td>
                    <td class="center"><b>${item.stok || 0}</b></td>
                    <td class="center">${item.min || 5}</td>
                    <td>${item.vendor || "-"}</td>
                    <td class="center ${isKritis ? "badge-kritis" : "badge-aman"}">
                      ${isKritis ? "Menipis" : "Aman"}
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box">
              <p style="margin-bottom: 5px;">Mengetahui,</p>
              <p class="role">General Manager (GM)</p>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <p style="margin-bottom: 5px;">Dibuat oleh,</p>
              <p class="role">Supervisor Logistik</p>
              <div class="signature-line"></div>
            </div>
          </div>

          <div class="footer-note">
            Dicetak otomatis — Sistem Logistik Tambang PT. Mega Putra Perkasa
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
