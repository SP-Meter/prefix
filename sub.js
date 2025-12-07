document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const expBox = document.querySelector(".exp");
  const resultContent = document.querySelector(".result-content");
  const resetBtn = document.querySelector(".reset");
  const homeBtn = document.querySelector(".jub");
  
  let activeTooltip = null;
  let firstUnit = null;
  let firstValue = null;
  let firstUnitName = null;
  
  const API_BASE_URL = "http://seena.kro.kr:3000";
  
  const unitIdMap = {
  "섭씨": "celsiusDegree",
  "화씨": "fahrenheitDegree",
  "인치": "inch",
  "피트": "ft",
  "미터": "meter",
  "파운드": "lb",
  "킬로그램": "kg",
  "마일": "mile",
  "거리": "km"
  };
  
  async function getUnitInfo(unitId) {
  try {
    const res = await fetch(`${API_BASE_URL}/u/info?t=${unitId}`);
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);
  return await res.json();
  } catch (err) {
  console.error(err);
  throw err;
  }
  }
  
  async function getConversion(fromUnitId, toUnitId, value) {
  try {
  const res = await fetch(`${API_BASE_URL}/u/result?f=${fromUnitId}&t=${toUnitId}&v=${value}`);
  if (!res.ok) throw new Error(`변환 요청 실패: ${res.status}`);
  return await res.json();
  } catch (err) {
  console.error(err);
  throw err;
  }
  }
  
  // 홈 버튼
  homeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.replace("main.html");
  });
  
  // 원 반복
  circles.forEach(circle => {
  const tooltip = circle.querySelector(".tooltip");
  const input = circle.querySelector(".tooltip-input");
  const button = circle.querySelector(".tooltip-btn");
  const unitLabel = circle.querySelector(".circleAl");
  const unitName = circle.closest(".circleItem")?.querySelector(".circleName")?.textContent.trim() || "";
  const unit = unitLabel?.textContent.trim() || "";
  
  // 첫 번째 값 입력
  button?.addEventListener("click", async () => {
    const value = input.value.trim();
    if (!value) return;
  
    firstUnit = unit;
    firstValue = value;
    firstUnitName = unitName;
  
    tooltip.classList.remove("active");
    activeTooltip = null;
  
    const unitId = unitIdMap[firstUnitName];
    if (!unitId) {
      expBox.innerHTML = `<div>해당 단위 설명 데이터가 없습니다.</div>`;
      return;
    }
  
    try {
      const data = await getUnitInfo(unitId);
      expBox.innerHTML = `
        <div style="padding:10px; font-size:15px;">
          <h2><b>${data.name}</b> 단위 설명</h2>
          <div style="font-size:18px;">
            <b>기호:</b> ${data.symbol || '-'}<br>
            <b>차원:</b> ${data.dimension || '-'}<br><br>
            <div style="white-space:pre-line;">${data.desc || '설명 없음'}</div>
          </div>
        </div>
      `;
    } catch (err) {
      expBox.innerHTML = `<div>설명 데이터를 불러올 수 없습니다.</div>`;
    }
  });
  
  // 두 번째 원 클릭 → 변환
  circle.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!firstUnit) {
      if (activeTooltip && activeTooltip !== tooltip) activeTooltip.classList.remove("active");
      tooltip.classList.add("active");
      input.focus();
      activeTooltip = tooltip;
      return;
    }
  
    if (unit === firstUnit) return;
  
    const numericValue = parseFloat(firstValue);
    if (isNaN(numericValue)) {
      resultContent.innerHTML = `<div>유효한 숫자를 입력해주세요.</div>`;
      return;
    }
  
    const fromUnitId = unitIdMap[firstUnitName];
    const toUnitId = unitIdMap[unitName];
  
    try {
      const conversion = await getConversion(fromUnitId, toUnitId, numericValue);
      resultContent.innerHTML = `
        <div style="padding:10px; font-size:20px;">
          <b>${firstUnitName}</b> → <b>${unitName}</b><br><br>
          <div style="white-space:pre-line; line-height:1.6;">
            결과: ${conversion.result}<br>
            계산 과정: ${conversion.formula}
          </div>
        </div>
      `;
    } catch (err) {
      resultContent.innerHTML = `<div>변환 중 오류 발생: ${err.message}</div>`;
    }
  });
  
  });
  
  // 외부 클릭 → tooltip 닫기
  document.addEventListener("click", (e) => {
  if (!e.target.closest(".tooltip") && !e.target.closest(".circle")) {
  if (activeTooltip) {
  activeTooltip.classList.remove("active");
  activeTooltip = null;
  }
  }
  });
  
  // 초기화 버튼
  resetBtn.addEventListener("click", () => {
  firstUnit = null;
  firstValue = null;
  firstUnitName = null;
  expBox.innerHTML = "";
  resultContent.innerHTML = "";
  circles.forEach(c => {
  const input = c.querySelector(".tooltip-input");
  if (input) input.value = "";
  });
  });
  });
  
