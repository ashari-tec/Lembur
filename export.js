document.addEventListener('DOMContentLoaded', function () {
    const csvButton = document.getElementById('exportCSV');
    const excelButton = document.getElementById('exportExcel');

    function getFilteredData() {
        let data;
        try {
            data = JSON.parse(localStorage.getItem('lemburData') || '[]');
        } catch (error) {
            data = [];
        }

        const selectedYear = document.getElementById('filterYear').value;
        const selectedMonth = document.getElementById('filterMonth').value;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        return data
            .filter(entry => {
                if (!entry || !/^\d{4}-\d{2}-\d{2}$/.test(entry.tanggal) || !Number.isFinite(Number(entry.jam))) {
                    return false;
                }
                const [year, month] = entry.tanggal.split('-').map(Number);
                const yearMatch = selectedYear ? year === Number(selectedYear) : year === currentYear;
                const monthMatch = selectedMonth ? month === Number(selectedMonth) : month === currentMonth;
                return yearMatch && monthMatch;
            })
            .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }

    function downloadBlob(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function getFilename(extension) {
        const now = new Date();
        const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        return `data-lembur-${date}.${extension}`;
    }

    function safeCell(value) {
        const text = String(value ?? '');
        // Prevent spreadsheet applications from interpreting exported text as a formula.
        return /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
    }

    csvButton.addEventListener('click', function () {
        const rows = [['Tanggal', 'Jam'], ...getFilteredData().map(entry => [safeCell(entry.tanggal), safeCell(entry.jam)])];
        const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        // BOM ensures Indonesian characters display correctly in spreadsheet applications.
        downloadBlob(`\uFEFF${csv}`, 'text/csv;charset=utf-8', getFilename('csv'));
    });

    excelButton.addEventListener('click', function () {
        const rows = [['Tanggal', 'Jam'], ...getFilteredData().map(entry => [entry.tanggal, Number(entry.jam)])];

        if (window.XLSX && window.XLSX.utils && typeof window.XLSX.writeFile === 'function') {
            const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Lembur');
            window.XLSX.writeFile(workbook, getFilename('xlsx'));
            return;
        }

        // Still provide an Excel-openable download when the optional SheetJS CDN is unavailable.
        const htmlRows = rows.map((row, index) => `<tr>${row.map(cell => `<${index === 0 ? 'th' : 'td'}>${String(cell).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))}</${index === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('');
        const html = `<html><head><meta charset="utf-8"></head><body><table>${htmlRows}</table></body></html>`;
        downloadBlob(`\uFEFF${html}`, 'application/vnd.ms-excel;charset=utf-8', getFilename('xls'));
    });
});
