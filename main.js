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

  dan.addEventListener("click", () => {
    window.location.replace("sub.html");
  });

  circles.forEach(circle => {
    const tooltip = circle.querySelector(".tooltip");
    const input = circle.querySelector(".tooltip-input");
    const button = circle.querySelector(".tooltip-btn");
    const unitLabel = circle.querySelector(".circleAl");

    const unit = unitLabel?.textContent.trim() || "";

    const circleItem = circle.closest(".circleItem");
    const unitName = circleItem?.querySelector(".circleName")?.textContent.trim() || "";

    button?.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;

      firstUnit = unit;
      firstValue = value;
      firstUnitName = unitName;

      tooltip.classList.remove("active");
      activeTooltip = null;

      expBox.innerHTML = `
        <div style="padding:20px; font-size:20px;">
          <b>${firstUnitName}</b>에 대하여…
        </div>
      `;
    });
    circle.addEventListener("click", (e) => {
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

      resultContent.innerHTML = `
        <div style="padding:20px; font-size:20px;">
          <b>${firstUnitName}</b>를 <b>${unitName}</b>로 변환한 결과와 과정<br><br>
        </div>
      `;
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tooltip") && !e.target.closest(".circle")) {
      if (activeTooltip) {
        activeTooltip.classList.remove("active");
        activeTooltip = null;
      }
    }
  });

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
