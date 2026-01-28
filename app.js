const initialVehicles = [
    { id: 1, type: 'generator', model: '1톤', plate: '98머7126', spec: '25kw', status: 'available' },
    { id: 2, type: 'generator', model: '1톤', plate: '987도7450', spec: '30kw', status: 'available' },
    { id: 3, type: 'generator', model: '2.5톤', plate: '99보9739', spec: '50kw', status: 'available' },
    { id: 4, type: 'generator', model: '3.5톤', plate: '87우0443', spec: '50kw', status: 'available' },
    { id: 5, type: 'generator', model: '5톤', plate: '98나3019', spec: '115kw', status: 'available' },
    { id: 6, type: 'generator', model: '5톤', plate: '98서9038', spec: '150kw', status: 'available' },
    { id: 7, type: 'station', model: '5톤', plate: '99거3019', spec: '5G(2식),LTE(2식),3G', status: 'available' },
    { id: 8, type: 'station', model: '98무2110', spec: '5G(2식),LTE(2식)', status: 'available' },
    { id: 9, type: 'station', model: '솔라티', plate: '725구5480', spec: '5G(2식),LTE(2식)', status: 'available' }
];

let vehicles = JSON.parse(localStorage.getItem('vehicles')) || initialVehicles;

let selectedVehicle = null;
let currentPhoto = null;

function renderVehicles(category = 'all') {
    const container = document.getElementById('vehicle-list');
    container.innerHTML = '';

    const filtered = category === 'all' ? vehicles : vehicles.filter(v => v.type === category);

    filtered.forEach(v => {
        const card = document.createElement('div');
        card.className = 'glass vehicle-card';
        card.onclick = () => startInspection(v);
        card.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <h3 style="font-size: 1.1rem;">${v.plate}</h3>
          <span class="category-badge">${v.model}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">${v.spec}</p>
      </div>
      <div style="text-align: right;">
        <span class="status-dot status-${v.status}"></span>
        <span style="font-size: 0.8rem; margin-left: 0.25rem; color: var(--text-secondary);">${v.status === 'available' ? '대여가능' : '사용중'}</span>
      </div>
    `;
        container.appendChild(card);
    });
}

function showView(viewId) {
    document.getElementById('view-dashboard').style.display = viewId === 'dashboard' ? 'block' : 'none';
    document.getElementById('view-inspection').style.display = viewId === 'inspection' ? 'block' : 'none';
}

function startInspection(vehicle) {
    selectedVehicle = vehicle;
    document.getElementById('inspection-title').innerText = `${vehicle.plate} 점검 등록`;

    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';

    // Expanded checklist items as requested
    const generatorItems = [
        '장비 불량 유,무',
        '안테나 파손 유,무',
        '급전선 불량 유,무',
        '차량 외관 파손 유,무',
        '발전기 시동 상태 유,무',
        '유류 잔량 및 누유 유,무',
        '장비 결속 상태 유,무'
    ];

    const stationItems = [
        '장비 불량 유,무',
        '안테나 파손 유,무',
        '급전선 불량 유,무',
        '차량 외관 파손 유,무',
        '안테나 마스트 작동 유,무',
        '광케이블 손상 유,무'
    ];

    const items = vehicle.type === 'generator' ? generatorItems : stationItems;

    items.forEach(item => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.gap = '0.75rem';
        div.style.padding = '0.5rem 0';
        div.innerHTML = `
      <span>${item}</span>
      <div style="display: flex; gap: 1rem;">
        <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.9rem;">
          <input type="radio" name="${item}" value="무" checked> 무
        </label>
        <label style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.9rem;">
          <input type="radio" name="${item}" value="유"> 유
        </label>
      </div>
    `;
        checklist.appendChild(div);
    });

    showView('inspection');
    lucide.createIcons();
}

function takePhoto() {
    document.getElementById('input-photo').click();
}

function handlePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentPhoto = e.target.result;
            document.getElementById('preview-img').src = currentPhoto;
            document.getElementById('photo-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function submitInspection() {
    const team = document.getElementById('input-team').value;
    const operator = document.getElementById('input-operator').value;
    if (!team || !operator) return alert('팀명과 운행자를 모두 입력해주세요.');

    const checklistItems = document.getElementById('checklist').children;
    const results = Array.from(checklistItems).map(div => {
        const label = div.querySelector('span').innerText;
        const value = div.querySelector('input[type="radio"]:checked').value;
        return { label, value };
    });

    // Update vehicle status
    selectedVehicle.status = selectedVehicle.status === 'available' ? 'in-use' : 'available';
    localStorage.setItem('vehicles', JSON.stringify(vehicles));

    // Create report body (Text)
    const date = new Date().toLocaleString();
    const typeText = selectedVehicle.status === 'in-use' ? '[대여]' : '[반납]';
    let body = `${typeText} 특수차량 점검 보고서\n\n`;
    body += `일시: ${date}\n`;
    body += `차량: ${selectedVehicle.plate} (${selectedVehicle.model})\n`;
    body += `팀명: ${team}\n`;
    body += `운행자: ${operator}\n\n`;
    body += `[점검 항목]\n`;
    results.forEach(item => {
        body += `- ${item.label}: ${item.value}\n`;
    });

    if (currentPhoto) {
        body += `\n* 불량 관련 사진이 촬영되었습니다. (메일 발송 시 수동 첨부 필요)`;
    }

    // Create Excel-compatible CSV data
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "구분,일시,차량번호,차량모델,팀명,운행자,항목,상태\n";
    results.forEach(item => {
        csvContent += `${typeText},${date},${selectedVehicle.plate},${selectedVehicle.model},${team},${operator},${item.label},${item.value}\n`;
    });

    // Download CSV (Excel)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${selectedVehicle.plate}_${team}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mailto link to specific email
    const mailtoLink = `mailto:piaagio@naver.com?subject=${encodeURIComponent(`${typeText} ${selectedVehicle.plate}_${team}_${operator}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    alert('엑셀 파일이 다운로드되고 이메일 작성이 시작됩니다.\n메일 앱에서 [보내기]를 눌러주세요.');

    // Reset Form
    document.getElementById('input-team').value = '';
    document.getElementById('input-operator').value = '';
    document.getElementById('photo-preview').style.display = 'none';
    currentPhoto = null;

    showView('dashboard');
    renderVehicles();
}

function filterCategory(cat) {
    renderVehicles(cat);
    const btns = document.querySelectorAll('#view-dashboard .btn');
    btns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Initial Render
renderVehicles();
lucide.createIcons();
