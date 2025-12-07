document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const expBox = document.querySelector(".exp");
  const resultContent = document.querySelector(".result-content");
  const resetBtn = document.querySelector(".reset");
  const dan = document.querySelector(".dan");

  let activeTooltip = null;
  let firstUnit = null;
  let firstValue = null;
  let firstUnitName = null;

  // 백엔드 API URL
  const API_BASE_URL = "http://localhost:3000/p";

  // API id 매핑
  const unitIdMap = {
    "피코": "pico",
    "나노": "nano",
    "마이크로": "micro",
    "밀리": "milli",
    "센티": "centi",
    "데시": "deci",
    "데카": "deca",
    "헥토": "hecto",
    "킬로": "kilo",
    "메가": "mega",
    "기가": "giga",
    "테라": "tera"
};


  // sub.html 이동
  dan.addEventListener("click", () => {
    window.location.replace("sub.html");
  });

  //설명 API
  //설명 API
async function getUnitInfo(unitName) {
  const id = unitIdMap[unitName.trim()];
  if (!id) throw new Error("해당 접두어 ID 없음");

  // 수정: 백엔드 URL에 쿼리 파라미터 추가
  const res = await fetch(`${API_BASE_URL}/p/info?t=${id}`);
  if (!res.ok) throw new Error("접두어 설명 API 오류");

  return await res.json();
}


  //변환 API
  async function convertUnit(fromName, toName, value) {
    const fromId = unitIdMap[fromName.trim()];
    const toId = unitIdMap[toName.trim()];

    if (!fromId || !toId) throw new Error("접두어 ID 매핑 오류");

    const res = await fetch(
      `${API_BASE_URL}/p/result?f=${fromId}&t=${toId}&v=${value}`
    );

    if (!res.ok) throw new Error("접두어 변환 API 오류");

    return await res.json();
  }

  //   메인 로직
  circles.forEach(circle => {
    const tooltip = circle.querySelector(".tooltip");
    const input = circle.querySelector(".tooltip-input");
    const button = circle.querySelector(".tooltip-btn");
    const unitLabel = circle.querySelector(".circleAl");

    const unit = unitLabel?.textContent.trim() || "";
    const circleItem = circle.closest(".circleItem");
    const unitName = circleItem?.querySelector(".circleName")?.textContent.trim() || "";

    // 첫 번째 값 입력 시
    button?.addEventListener("click", async () => {
      const value = input.value.trim();
      if (!value) return;

      firstUnit = unit;
      firstValue = value;
      firstUnitName = unitName;

      tooltip.classList.remove("active");
      activeTooltip = null;

      if (!unitIdMap[firstUnitName.trim()]) {
        expBox.innerHTML = `<div>해당 접두어 설명 데이터가 없습니다.</div>`;
        return;
      }

      try {
        const data = await getUnitInfo(firstUnitName);

        expBox.innerHTML = `
          <div style="padding:20px; font-size:20px;">
            <h2><b>${data.name}</b> 단위 설명</h2>
            <div style="margin-top:10px; font-size:18px;">
              <b>기호:</b> ${data.symbol}<br>
              <b>배율:</b> ${data.magnification}<br><br>
              <div style="white-space:pre-line;">${data.desc}</div>
            </div>
          </div>
        `;

      } catch (e) {
        expBox.innerHTML = `<div>설명 데이터를 불러올 수 없습니다.</div>`;
      }
    });

    // 두 번째 단위 클릭 → 변환 실행
    circle.addEventListener("click", async (e) => {
      e.stopPropagation();

      if (!firstUnit) {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove("active");
        }
        tooltip.classList.add("active");
        input.focus();
        activeTooltip = tooltip;
        return;
      }

      if (unit === firstUnit) return;

      let fromName = firstUnitName.trim();
      let toName = unitName.trim();

      // 디버깅용
      console.log("fromName:", fromName, "toName:", toName);
      console.log("unitIdMap keys:", Object.keys(unitIdMap));

      if (!unitIdMap[fromName] || !unitIdMap[toName]) {
        resultContent.innerHTML = `<div style="padding:20px;">해당 접두어 변환 API가 없습니다.</div>`;
        return;
      }

      try {
        const data = await convertUnit(fromName, toName, firstValue);

        resultContent.innerHTML = `
          <div style="padding:20px; font-size:20px;">
            <b>${fromName}</b> → <b>${toName}</b> 변환 결과<br><br>
            <div style="font-size:22px; margin-bottom:10px;">
              결과: <b>${data.result}</b>
            </div>
            <div style="white-space:pre-line; font-size:18px; line-height:1.6;">
              ${data.formula}
            </div>
          </div>
        `;

      } catch (err) {
        resultContent.innerHTML = `<div style="padding:20px;">변환 실패: 서버 오류</div>`;
      }
    });
  });

  // 팝업 외부 클릭 시 닫기
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
