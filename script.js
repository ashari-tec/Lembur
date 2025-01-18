document.addEventListener('DOMContentLoaded', function() {
    // Set tanggal input ke tanggal hari ini
    const tanggalInput = document.getElementById('tanggal');
    const today = new Date().toISOString().split('T')[0];
    tanggalInput.value = today;

    // Isi opsi jam lembur dari 1 sampai 24
    const jamSelect = document.getElementById('jam');
    for (let i = 1; i <= 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} Jam`;
        jamSelect.appendChild(option);
    }

    // Ambil nilai UMR dari localStorage dan set sebagai nilai default input
    let umrBulanan = parseFloat(localStorage.getItem('umrBulanan')) || 2065000;
    let umrPerJam = parseFloat(localStorage.getItem('umrPerJam')) || 9620;

    document.getElementById('umrBulanan').value = umrBulanan;
    document.getElementById('umrPerJam').value = umrPerJam;
});

document.addEventListener('DOMContentLoaded', function() {
    const greetingElement = document.getElementById('greeting');
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 10) {
        greeting = "Halo, Selamat Pagi";
    } else if (currentHour < 15) {
        greeting = "Halo, Selamat Siang";
    } else if (currentHour < 18) {
        greeting = "Halo, Selamat Sore";
    } else {
        greeting = "Halo, Selamat Malam";
    }

    greetingElement.textContent = greeting;

    // Tambahkan efek gradasi warna bumi
    greetingElement.style.background = 'linear-gradient(90deg, #a8dadc, #457b9d, #1d3557)';
    greetingElement.style.webkitBackgroundClip = 'text';
    greetingElement.style.webkitTextFillColor = 'transparent';
});

document.addEventListener('DOMContentLoaded', function() {
    let lemburData = JSON.parse(localStorage.getItem('lemburData')) || [];
    let umrBulanan = parseFloat(localStorage.getItem('umrBulanan')) || 2065000;
    let umrPerJam = parseFloat(localStorage.getItem('umrPerJam')) || 9620;

    function saveData() {
        localStorage.setItem('lemburData', JSON.stringify(lemburData));
        localStorage.setItem('umrBulanan', umrBulanan);
        localStorage.setItem('umrPerJam', umrPerJam);
    }

    function updateCurrentMonthTotals() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let filteredData = lemburData.filter(entry => {
            let entryDate = new Date(entry.tanggal);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        let totalJam = filteredData.reduce((sum, entry) => sum + entry.jam, 0);
        let gajiKotor = totalJam * 1.5 * umrPerJam + umrBulanan;

        document.getElementById('totalLembur').textContent = `Lembur Bulan Ini: ${totalJam} Jam`;
        document.getElementById('totalGaji').textContent = `Gaji Kotor: ${gajiKotor.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' })}`;

        updatePreviousMonthsTotals();
    }

    function updatePreviousMonthsTotals() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let historyHtml = '';

        for (let i = 1; i <= 2; i++) {
            let targetMonth = currentMonth - i;
            let targetYear = currentYear;

            if (targetMonth < 0) {
                targetMonth += 12;
                targetYear -= 1;
            }

            let filteredData = lemburData.filter(entry => {
                let entryDate = new Date(entry.tanggal);
                return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
            });

            let totalJam = filteredData.reduce((sum, entry) => sum + entry.jam, 0);
            let gajiKotor = totalJam * 1.5 * umrPerJam + umrBulanan;

            historyHtml += `<p>${new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}: ${gajiKotor.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' })}</p>`;
        }

        document.getElementById('gajiKotorHistory').innerHTML = historyHtml;
    }

    function updateLemburTable() {
        const selectedYear = document.getElementById('filterYear').value;
        const selectedMonth = document.getElementById('filterMonth').value;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const filteredData = lemburData.filter(entry => {
            let entryDate = new Date(entry.tanggal);
            let yearMatch = selectedYear ? entryDate.getFullYear() == selectedYear : entryDate.getFullYear() == currentYear;
            let monthMatch = selectedMonth ? entryDate.getMonth() + 1 == selectedMonth : entryDate.getMonth() + 1 == currentMonth;
            return yearMatch && monthMatch;
        });

        filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        const dataLemburTable = document.getElementById('dataLembur');
        dataLemburTable.innerHTML = '';
        filteredData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.tanggal}</td>
                <td>${entry.jam}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeData('${entry.tanggal}')"><i class="bi bi-trash"></i></button></td>
            `;
            dataLemburTable.appendChild(row);
        });

        document.getElementById('totalFilteredLembur').textContent = `Total Jam Lembur: ${filteredData.reduce((sum, entry) => sum + entry.jam, 0)} Jam`;
    }

    function populateYearDropdown() {
        const yearDropdown = document.getElementById('filterYear');
        let years = [...new Set(lemburData.map(entry => new Date(entry.tanggal).getFullYear()))];
        yearDropdown.innerHTML = '<option value="">Semua Tahun</option>';
        years.forEach(year => {
            let option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearDropdown.appendChild(option);
        });

        const currentYear = new Date().getFullYear();
        yearDropdown.value = currentYear;
    }

    function populateMonthDropdown() {
        const monthDropdown = document.getElementById('filterMonth');
        monthDropdown.innerHTML = '<option value="">Semua Bulan</option>';
        for (let i = 1; i <= 12; i++) {
            let option = document.createElement('option');
            option.value = i;
            option.textContent = new Date(0, i - 1).toLocaleString('default', { month: 'long' });
            monthDropdown.appendChild(option);
        }

        const currentMonth = new Date().getMonth() + 1;
        monthDropdown.value = currentMonth;
    }

    window.removeData = function(tanggal) {
        lemburData = lemburData.filter(entry => entry.tanggal !== tanggal);
        saveData();
        updateLemburTable();
        populateYearDropdown();
        populateMonthDropdown();
        updateCurrentMonthTotals();
    };

    document.getElementById('lemburForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const tanggal = document.getElementById('tanggal').value;
        const jam = parseFloat(document.getElementById('jam').value);

        if (lemburData.some(entry => entry.tanggal === tanggal)) {
            document.getElementById('alertLemburFail').style.display = 'block';
            document.getElementById('alertLemburSuccess').style.display = 'none';
        } else if (tanggal && jam) {
            lemburData.push({ tanggal, jam });
            saveData();
            updateLemburTable();
            populateYearDropdown();
            populateMonthDropdown();
            updateCurrentMonthTotals();
            document.getElementById('alertLemburSuccess').style.display = 'block';
            document.getElementById('alertLemburFail').style.display = 'none';
            document.getElementById('lemburForm').reset();
        } else {
            document.getElementById('alertLemburFail').style.display = 'block';
            document.getElementById('alertLemburSuccess').style.display = 'none';
        }

        setTimeout(() => {
            document.getElementById('alertLemburSuccess').style.display = 'none';
            document.getElementById('alertLemburFail').style.display = 'none';
        }, 3000);
    });

    document.getElementById('filterYear').addEventListener('change', updateLemburTable);
    document.getElementById('filterMonth').addEventListener('change', updateLemburTable);


    document.getElementById('gajiForm').addEventListener('submit', function(e) {
        e.preventDefault();
        umrBulanan = parseFloat(document.getElementById('umrBulanan').value);
        umrPerJam = parseFloat(document.getElementById('umrPerJam').value);
        saveData();
        updateLemburTable();
        updateCurrentMonthTotals();

        document.getElementById('alertGajiSuccess').style.display = 'block';
        let gajiModal = bootstrap.Modal.getInstance(document.getElementById('gajiModal'));

        setTimeout(() => {
            gajiModal.hide(); 
            document.getElementById('alertGajiSuccess').style.display = 'none';
        }, 2000);
    });

    updateLemburTable();
    populateYearDropdown();
    populateMonthDropdown();
    updateCurrentMonthTotals();
});