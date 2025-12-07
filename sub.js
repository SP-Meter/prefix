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

  // 단위 API URL
  const API_BASE_URL = "http://seena.kro.kr:3000";

  // 단위 ID 매핑
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

  // 단위 정보 가져오기
  async function getUnitInfo(unitId) {
    const response = await fetch(`${API_BASE_URL}/info?t=${unitId}`);
    if (!response.ok) throw new Error("API 요청 실패");
    return await response.json();
  }

  // 변환 요청
  async function getConversion(fromUnitId, toUnitId, value) {
    const response = await fetch(`${API_BASE_URL}/result?f=${fromUnitId}&t=${toUnitId}&v=${value}`);
    if (!response.ok) throw new Error("변환 요청 실패");
    return await response.json();
  }

  // 홈 버튼
  homeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.replace("https://sp-meter.github.io/prefix/index.html");
  });

  // 원 요소 반복
  circles.forEach(circle => {
    const tooltip = circle.querySelector(".tooltip");
    const input = circle.querySelector(".tooltip-input");
    const button = circle.querySelector(".tooltip-btn");
    const unitLabel = circle.querySelector(".circleAl");

    const unit = unitLabel?.textContent.trim() || "";
    const unitName = circle.closest(".circleItem")
      ?.querySelector(".circleName")
      ?.textContent.trim() || "";

    // 첫 번째 값 입력 (tooltip 버튼 클릭)
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
          <div style="padding:20px; font-size:20px;">
            <h2><b>${data.name}</b> 단위 설명</h2>
            <div style="margin-top:10px; font-size:18px;">
              <b>기호:</b> ${data.symbol || '-'}<br>
              <b>차원:</b> ${data.dimension || '-'}<br><br>
              <div style="white-space:pre-line;">${data.desc || '설명 없음'}</div>
            </div>
          </div>
        `;
      } catch (e) {
        expBox.innerHTML = `<div>설명 데이터를 불러올 수 없습니다.</div>`;
      }
    });

    // 두 번째 원 클릭 → 변환
    circle.addEventListener("click", async (e) => {
      e.stopPropagation();

      // 첫 번째 값 입력 전 → tooltip 열기
      if (!firstUnit) {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove("active");
        }
        tooltip.classList.add("active");
        input.focus();
        activeTooltip = tooltip;
        return;
      }

      // 같은 원 클릭 → 무시
      if (unit === firstUnit) return;

      // 숫자 체크
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
          <div style="padding:20px; font-size:20px;">
            <b>${firstUnitName}</b> → <b>${unitName}</b><br><br>
            <div style="font-size:18px; line-height:1.5;">
              결과: ${conversion.result}<br>
              계산 과정: ${conversion.formula}
            </div>
          </div>
        `;
      } catch (error) {
        resultContent.innerHTML = `<div>변환 중 오류 발생: ${error.message}</div>`;
      }
    });
  });

  // 팝업 외부 클릭 → tooltip 닫기
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

    circles.forEach(circle => {
      const input = circle.querySelector(".tooltip-input");
      if (input) input.value = "";
    });
  });
});
