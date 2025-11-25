document.addEventListener("DOMContentLoaded", () => {

  const circles = document.querySelectorAll(".circle");
  const expBox = document.querySelector(".exp");
  const resultContent = document.querySelector(".result-content");
  const resetBtn = document.querySelector(".reset");
  const homeBtn = document.querySelector(".jub");

  let firstUnit = null;
  let firstValue = null;
  let firstName = null;
  let activeTooltip = null;

  homeBtn.addEventListener("click", () => {
    window.location.replace("main.html");
  });

  circles.forEach(circle => {
    const tooltip = circle.querySelector(".tooltip");
    const input = circle.querySelector(".tooltip-input");
    const button = circle.querySelector(".tooltip-btn");
    const unitLabel = circle.querySelector(".circleAl");

    const unit = unitLabel?.textContent.trim() || "";
    const fullName = circle.parentElement.querySelector(".circleName")?.textContent.trim() || "";

    circle.addEventListener("click", (e) => {
      e.stopPropagation();

      if (!firstUnit) {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove("active");
        }
        tooltip.classList.add("active");
        activeTooltip = tooltip;
        input.focus();
        return;
      }

      if (unit === firstUnit) return;

      resultContent.innerHTML = `
        <div style="padding:20px; font-size:20px;">
          <b>${firstName}</b>를 <b>${fullName}</b>로 변환한 결과와 과정<br><br>
        </div>
      `;
    });

    button.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;

      firstUnit = unit;
      firstValue = value;
      firstName = fullName;

      tooltip.classList.remove("active");
      activeTooltip = null;

      expBox.innerHTML = `
        <div style="padding:20px; font-size:20px;">
          <b>${firstName}</b>에 대하여…
        </div>
      `;
    });
  });

  document.addEventListener("click", () => {
    if (activeTooltip) {
      activeTooltip.classList.remove("active");
      activeTooltip = null;
    }
  });

  resetBtn.addEventListener("click", () => {
    firstUnit = null;
    firstValue = null;
    firstName = null;

    expBox.innerHTML = "";
    resultContent.innerHTML = "";

    circles.forEach(circle => {
      const input = circle.querySelector(".tooltip-input");
      if (input) input.value = "";
    });
  });
});
