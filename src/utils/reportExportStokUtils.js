import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const formatRupiah = (val) => "Rp " + Number(val || 0).toLocaleString("id-ID");

// 1. Export Excel Laporan Stok (.xlsx mentahan bersih)
export function exportLaporanStokToExcel(
  filteredData,
  totalSummary,
  fileName = "Laporan_Stok_Barang.xlsx",
) {
  try {
    if (!filteredData || filteredData.length === 0) {
      toast.error("Tidak ada data untuk diexport!");
      return;
    }

    const excelRows = [];

    // Header Perusahaan & Judul Laporan
    excelRows.push(["PT. MEGA PUTRA PERKASA"]);
    excelRows.push(["Sistem Manajemen Logistik Tambang — Laporan Stok Barang"]);
    excelRows.push([
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
    ]);
    excelRows.push([]); // Baris kosong

    // Ringkasan Statistik
    excelRows.push(["RINGKASAN INVENTORI"]);
    excelRows.push([
      "Total Jenis Barang",
      totalSummary.totalJenis,
      "",
      "Total Stok Unit",
      totalSummary.totalStokUnit,
    ]);
    excelRows.push([
      "Stok Kritis",
      totalSummary.totalKritis,
      "",
      "Nilai Inventori",
      totalSummary.nilaiInventori,
    ]);
    excelRows.push([]);

    // Header Kolom Tabel
    excelRows.push([
      "No",
      "Kode",
      "Nama Barang",
      "Kategori",
      "Satuan",
      "Stok Awal",
      "Masuk",
      "Keluar",
      "Stok Akhir",
      "Min. Stok",
      "Status",
      "Harga Satuan (IDR)",
      "Nilai Aset (IDR)",
    ]);

    // Data Baris
    filteredData.forEach((item, index) => {
      const stokAkhir = Number(item.akhir || 0);
      const hargaSat = Number(item.hargaSat || 0);
      const nilaiAset = stokAkhir * hargaSat;

      excelRows.push([
        index + 1,
        item.kode || "-",
        item.nama || "-",
        item.kategori || "-",
        item.sat || "Pcs",
        Number(item.awal || 0),
        Number(item.masuk || 0),
        Number(item.keluar || 0),
        stokAkhir,
        Number(item.minStok || 0),
        item.status || "Aman",
        hargaSat,
        nilaiAset,
      ]);
    });

    // Baris Total Keseluruhan
    excelRows.push([]);
    const totalRow = new Array(13).fill("");
    totalRow[0] = "TOTAL KESELURUHAN";
    totalRow[8] = totalSummary.totalStokUnit;
    totalRow[11] = "Total Nilai Inventori:";
    totalRow[12] = totalSummary.nilaiInventori;

    excelRows.push(totalRow);

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Pengaturan Lebar Kolom
    worksheet["!cols"] = [
      { wch: 6 }, // No
      { wch: 12 }, // Kode
      { wch: 25 }, // Nama Barang
      { wch: 15 }, // Kategori
      { wch: 8 }, // Satuan
      { wch: 10 }, // Stok Awal
      { wch: 10 }, // Masuk
      { wch: 10 }, // Keluar
      { wch: 10 }, // Stok Akhir
      { wch: 10 }, // Min Stok
      { wch: 12 }, // Status
      { wch: 18 }, // Harga Satuan
      { wch: 20 }, // Nilai Aset
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Stok");

    XLSX.writeFile(workbook, fileName);
    toast.success("File Excel Laporan Stok berhasil di-download!");
  } catch (error) {
    console.error("Gagal export excel laporan stok:", error);
    toast.error("Gagal mengeksport laporan ke Excel.");
  }
}

// 2. Cetak PDF Laporan Stok (Tanda Tangan GM & Supervisor)
export function printLaporanStokPDF(filteredData, totalSummary) {
  if (!filteredData || filteredData.length === 0) {
    toast.error("Tidak ada data laporan untuk dicetak!");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up browser diblokir! Izinkan pop-up untuk mencetak.");
    return;
  }

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const rowsHtml = filteredData
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 1 ? "#fdfbf7" : "#ffffff"};">
        <td style="padding: 9px 10px; text-align: center;">${idx + 1}</td>
        <td style="padding: 9px 10px; font-weight: 600;">${item.kode || "-"}</td>
        <td style="padding: 9px 10px; font-weight: bold;">${item.nama || "-"}</td>
        <td style="padding: 9px 10px;">${item.kategori || "-"}</td>
        <td style="padding: 9px 10px; text-align: center;">${item.sat || "Pcs"}</td>
        <td style="padding: 9px 10px; text-align: center;">${item.awal || 0}</td>
        <td style="padding: 9px 10px; text-align: center; color: #059669; font-weight: bold;">+${item.masuk || 0}</td>
        <td style="padding: 9px 10px; text-align: center; color: #e11d48; font-weight: bold;">-${item.keluar || 0}</td>
        <td style="padding: 9px 10px; text-align: center; font-weight: bold; background: #f8fafc;">${item.akhir || 0}</td>
        <td style="padding: 9px 10px; text-align: center;">${item.minStok || 0}</td>
        <td style="padding: 9px 10px; text-align: center; font-weight: bold; color: ${item.status === "Kritis" ? "#dc2626" : item.status === "Menipis" ? "#d97706" : "#059669"};">${item.status}</td>
      </tr>`,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Stok Barang - PT. Mega Putra Perkasa</title>
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
          .divider-bottom { border-bottom: 2px solid #059669; margin-top: 2px; margin-bottom: 12px; }
          .summary-boxes { display: flex; gap: 15px; margin-bottom: 15px; }
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; font-size: 10px; }
          .summary-box b { display: block; font-size: 13px; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { background-color: #1a1612; color: #ffffff; font-weight: bold; font-size: 10px; text-transform: uppercase; padding: 8px 10px; text-align: left; border: none; }
          td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
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
              <h3>Laporan Stok Barang</h3>
              <p>Tanggal Cetak: ${todayStr}</p>
              <p>Dicetak oleh: Administrator</p>
            </div>
          </div>
          <div class="divider-top"></div>
          <div class="divider-bottom"></div>

          <div class="summary-boxes">
            <div class="summary-box">Total Jenis Barang: <b>${totalSummary.totalJenis}</b></div>
            <div class="summary-box">Total Stok Unit: <b>${totalSummary.totalStokUnit}</b></div>
            <div class="summary-box">Stok Kritis: <b style="color: #dc2626;">${totalSummary.totalKritis}</b></div>
            <div class="summary-box">Nilai Inventori: <b style="color: #d97706;">${formatRupiah(totalSummary.nilaiInventori)}</b></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">No</th>
                <th style="width: 80px;">Kode</th>
                <th>Nama Barang</th>
                <th style="width: 110px;">Kategori</th>
                <th style="width: 60px; text-align: center;">Sat.</th>
                <th style="width: 70px; text-align: center;">Awal</th>
                <th style="width: 70px; text-align: center;">Masuk</th>
                <th style="width: 70px; text-align: center;">Keluar</th>
                <th style="width: 70px; text-align: center;">Akhir</th>
                <th style="width: 70px; text-align: center;">Min.</th>
                <th style="width: 90px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box"><p>Mengetahui,</p><p class="role">General Manager (GM)</p><div class="signature-line"></div></div>
            <div class="signature-box"><p>Dibuat oleh,</p><p class="role">Supervisor Logistik</p><div class="signature-line"></div></div>
          </div>
          <div class="footer-note">Dicetak otomatis — Sistem Logistik Tambang PT. Mega Putra Perkasa</div>
        </div>
        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
