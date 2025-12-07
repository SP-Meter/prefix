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

  // 백엔드 API URL
  const API_BASE_URL = "백엔드 API URL";

  // API id 매핑
  const unitIdMap = {
    "섭씨": "celsiusDegree",
    "화씨": "fahrenheitDegree",
    "인치": "inch",
    "피트": "foot",
    "미터": "meter",
    "파운드": "pound",
    "킬로그램": "kilogram",
    "마일": "mile",
    "거리": "kilometer"
  };

  // 단위 설명 API
  async function getUnitInfo(unitId) {
    const response = await fetch(`${API_BASE_URL}/${unitId}`);
    if (!response.ok) throw new Error("API 요청 실패");
    return await response.json();
  }

  // 단위 변환 API
  async function convertUnit(fromId, toId, value) {
    const url = `${API_BASE_URL}/u/result?f=${fromId}&t=${toId}&v=${value}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("변환 API 요청 실패");
    return await response.json();
  }

  // 홈 버튼
  homeBtn.addEventListener("click", () => {
    window.location.replace("main.html");
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
              <b>기호:</b> ${data.symbol}<br>
              <b>차원:</b> ${data.dimension}<br><br>
              <div style="white-space:pre-line;">${data.desc}</div>
            </div>
          </div>
        `;

      } catch (e) {
        expBox.innerHTML = `<div>설명 데이터를 불러올 수 없습니다.</div>`;
      }
    });

    // 두 번째 클릭 → 변환 요청
    circle.addEventListener("click", async (e) => {
      e.stopPropagation();

      // 첫 클릭 전 → tooltip 열기
      if (!firstUnit) {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove("active");
        }
        tooltip.classList.add("active");
        input.focus();
        activeTooltip = tooltip;
        return;
      }

      // 같은 원 클릭 무시
      if (unit === firstUnit) return;

      // ID 매핑
      const fromId = unitIdMap[firstUnitName];
      const toId = unitIdMap[unitName];

      if (!fromId || !toId) {
        resultContent.innerHTML = `<div style="padding:20px;">해당 단위 변환 API가 없습니다.</div>`;
        return;
      }

      try {
        // 백엔드 변환 요청
        const data = await convertUnit(fromId, toId, firstValue);

        resultContent.innerHTML = `
          <div style="padding:20px; font-size:20px;">
            <b>${firstUnitName}</b> → <b>${unitName}</b> 변환 결과<br><br>

            <div style="font-size:22px; margin-bottom:10px;">
              변환 결과 : <b>${data.result}</b>
            </div>

            <div style="white-space:pre-line; font-size:18px; line-height:1.5;">
              변환 과정 :\n${data.formula}
            </div>
          </div>
        `;

      } catch (e) {
        resultContent.innerHTML = `<div style="padding:20px;">변환 실패: 서버 오류</div>`;
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
