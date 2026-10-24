import * as XLSX from "xlsx";
import toast from "react-hot-toast";

// 1. Export Excel Laporan Barang Masuk (Standar SheetJS Bersih)
export function exportLaporanMasukToExcel(
  data,
  fileName = "Laporan_Barang_Masuk.xlsx",
) {
  try {
    if (!data || data.length === 0) {
      toast.error("Tidak ada data untuk diexport!");
      return;
    }

    const excelRows = [];

    // Header Perusahaan & Judul Laporan
    excelRows.push(["PT. MEGA PUTRA PERKASA"]);
    excelRows.push([
      "Sistem Manajemen Logistik Tambang — Laporan Barang Masuk",
    ]);
    excelRows.push([
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
    ]);
    excelRows.push([]); // Baris kosong

    // Header Kolom Tabel
    excelRows.push([
      "No",
      "No. Dokumen",
      "Tanggal",
      "Vendor",
      "Nama Barang",
      "Qty",
      "Satuan",
      "Harga Satuan (IDR)",
      "Total (IDR)",
    ]);

    // Data Baris Transaksi
    let grandTotal = 0;
    data.forEach((item, index) => {
      const qty = Number(item.qty || 0);
      const hargaSat = Number(item.hargaSat || 0);
      const total = qty * hargaSat;
      grandTotal += total;

      excelRows.push([
        index + 1,
        item.noDok || "-",
        item.tanggal || "-",
        item.vendor || "-",
        item.barang || "-",
        qty,
        item.sat || "Pcs",
        hargaSat,
        total,
      ]);
    });

    // Baris Total Keseluruhan
    excelRows.push([]);
    excelRows.push([
      "TOTAL KESELURUHAN",
      "",
      "",
      "",
      "",
      data.reduce((acc, curr) => acc + Number(curr.qty || 0), 0),
      "",
      "",
      grandTotal,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Pengaturan Lebar Kolom
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 15 },
      { wch: 22 },
      { wch: 28 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Barang Masuk");

    XLSX.writeFile(workbook, fileName);
    toast.success("File Excel Laporan berhasil di-download!");
  } catch (error) {
    console.error("Gagal export excel laporan masuk:", error);
    toast.error("Gagal mengeksport laporan ke Excel.");
  }
}

// 2. Cetak PDF Laporan Barang Masuk (Tanda Tangan GM & Supervisor)
export function printLaporanMasukPDF(displayedData, providedGrandTotal) {
  if (!displayedData || displayedData.length === 0) {
    toast.error("Tidak ada data laporan untuk dicetak!");
    return;
  }

  // Fallback hitung otomatis grandTotal jika argumen kedua terlewat/undefined
  const grandTotal =
    providedGrandTotal !== undefined
      ? providedGrandTotal
      : displayedData.reduce(
          (acc, curr) =>
            acc + Number(curr.qty || 0) * Number(curr.hargaSat || 0),
          0,
        );

  const formatRupiah = (val) =>
    "Rp " + Number(val || 0).toLocaleString("id-ID");
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Pop-up browser diblokir! Izinkan pop-up untuk mencetak PDF.");
    return;
  }

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const rowsHtml = displayedData
    .map(
      (item, idx) => `
      <tr style="background-color: ${idx % 2 === 1 ? "#fdfbf7" : "#ffffff"};">
        <td style="padding: 10px 12px; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px 12px;"><b style="color: #059669; font-family: monospace;">${item.noDok || "-"}</b></td>
        <td style="padding: 10px 12px;">${item.tanggal || "-"}</td>
        <td style="padding: 10px 12px;">${item.vendor || "-"}</td>
        <td style="padding: 10px 12px; font-weight: 600;">${item.barang || "-"}</td>
        <td style="padding: 10px 12px; text-align: center;"><b>${item.qty || 0}</b></td>
        <td style="padding: 10px 12px; text-align: center;">${item.sat || "Pcs"}</td>
        <td style="padding: 10px 12px; text-align: right;">${formatRupiah(item.hargaSat)}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #0f172a;">${formatRupiah((item.qty || 0) * (item.hargaSat || 0))}</td>
      </tr>`,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Barang Masuk - PT. Mega Putra Perkasa</title>
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
          .divider-bottom { border-bottom: 2px solid #059669; margin-top: 2px; margin-bottom: 15px; }
          .info-count { font-style: italic; font-size: 10px; color: #64748b; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { background-color: #1a1612; color: #ffffff; font-weight: bold; font-size: 10px; text-transform: uppercase; padding: 8px 10px; text-align: left; border: none; }
          td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
          td.center { text-align: center; }
          td.right { text-align: right; }
          .total-row { background-color: #ecfdf5 !important; font-weight: bold; border-top: 2px solid #059669; border-bottom: 2px solid #059669; }
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
              <h3>Laporan Barang Masuk</h3>
              <p>Tanggal Cetak: ${todayStr}</p>
              <p>Dicetak oleh: Administrator</p>
            </div>
          </div>
          <div class="divider-top"></div>
          <div class="divider-bottom"></div>
          <div class="info-count">Data ditampilkan: Menampilkan ${displayedData.length} transaksi</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;" class="center">No</th>
                <th style="width: 120px;">No. Dokumen</th>
                <th style="width: 100px;">Tanggal</th>
                <th>Vendor</th>
                <th>Nama Barang</th>
                <th style="width: 60px;" class="center">Qty</th>
                <th style="width: 60px;" class="center">Sat.</th>
                <th style="width: 110px;" class="right">Harga Satuan</th>
                <th style="width: 120px;" class="right">Total Nilai</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="8" class="right" style="text-transform: uppercase; font-size: 10px;">TOTAL (${displayedData.length} TRANSAKSI)</td>
                <td class="right" style="color: #059669; font-size: 12px;">${formatRupiah(grandTotal)}</td>
              </tr>
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
