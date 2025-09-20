// taskScript.js
// Expected DOM IDs (in dailyTask.html):
// - taskDay (span), scenarioText (p), optionsContainer (div), penguinTip (div)
// Uses localStorage keys: chosenScenarios, day, balance, tradeHistory, balanceOverTime

(function () {
  const $ = id => document.getElementById(id);

  let day = parseInt(localStorage.getItem("day")) || 1;
  const maxDays = 7;
  let balance = parseFloat(localStorage.getItem("balance")) || 5000;
  let tradeHistoryHTML = localStorage.getItem("tradeHistory") || "";
  let balanceOverTime = JSON.parse(localStorage.getItem("balanceOverTime")) || [balance];

  // Full pool of 12 scenarios (each with 3 options: option text, effect RM, message)
  const fullPool = [
    {
      scenario: "Local supplier raises prices for construction materials.",
      options: [
        { text: "Import cheaper from Thailand", effect: +200, message: "Imported cheaper materials. Profit RM200." },
        { text: "Keep buying local", effect: -100, message: "Paid higher local prices. Loss RM100." },
        { text: "Negotiate with supplier", effect: +50, message: "Negotiated a small discount. Profit RM50." }
      ]
    },
    {
      scenario: "Logistics strike delays shipping.",
      options: [
        { text: "Pay extra for priority shipping", effect: -150, message: "Paid priority shipping. Loss RM150." },
        { text: "Wait for strike to end", effect: 0, message: "Waited it out. No change." },
        { text: "Use alternative land transport", effect: -50, message: "Alternative transport used. Loss RM50." }
      ]
    },
    {
      scenario: "A company in China wants to import palm oil.",
      options: [
        { text: "Agree to discount", effect: +100, message: "Sold more at lower margin. Net RM100." },
        { text: "Refuse and keep price", effect: 0, message: "Deal cancelled. No change." },
        { text: "Offer partial discount for big order", effect: +250, message: "Big order accepted. Profit RM250." }
      ]
    },
    {
      scenario: "Japan requests high-tech components.",
      options: [
        { text: "Accept with overtime", effect: +150, message: "Overtime accepted. Profit RM150." },
        { text: "Decline due to capacity", effect: 0, message: "Declined. No change." },
        { text: "Subcontract part of work", effect: +200, message: "Subcontracted and profited. RM200." }
      ]
    },
    {
      scenario: "Exchange rate fluctuates in your favor.",
      options: [
        { text: "Buy more imports", effect: +100, message: "Bought imports cheaper. Profit RM100." },
        { text: "Stay cautious", effect: 0, message: "No action. No change." },
        { text: "Sell reserves abroad", effect: +200, message: "Sold reserves at good rates. Profit RM200." }
      ]
    },
    {
      scenario: "Government offers export incentives.",
      options: [
        { text: "Apply for subsidy", effect: +300, message: "You received subsidy. Profit RM300." },
        { text: "Ignore paperwork", effect: 0, message: "No change." },
        { text: "Delay application", effect: -50, message: "Missed timing. Loss RM50." }
      ]
    },
    {
      scenario: "Storm damages part of your shipment.",
      options: [
        { text: "File insurance claim", effect: +100, message: "Insurance covered some loss. +RM100." },
        { text: "Absorb the loss", effect: -200, message: "You paid for the loss. -RM200." },
        { text: "Negotiate with buyer", effect: -50, message: "Partial deal made. -RM50." }
      ]
    },
    {
      scenario: "Middle East buyer requests halal-certified food.",
      options: [
        { text: "Upgrade certification", effect: +200, message: "Certification boosted sales. +RM200." },
        { text: "Refuse deal", effect: 0, message: "No change." },
        { text: "Partner with certified supplier", effect: +150, message: "Partnered and profited. +RM150." }
      ]
    },
    {
      scenario: "European Union increases import taxes.",
      options: [
        { text: "Accept tax burden", effect: -200, message: "Taxes reduced profit. -RM200." },
        { text: "Find alternative markets", effect: +100, message: "Found new market. +RM100." },
        { text: "Negotiate trade deal", effect: +50, message: "Small success. +RM50." }
      ]
    },
    {
      scenario: "US company offers a long-term contract.",
      options: [
        { text: "Accept immediately", effect: +250, message: "Secured contract. +RM250." },
        { text: "Delay decision", effect: 0, message: "No change." },
        { text: "Reject", effect: -50, message: "Lost opportunity. -RM50." }
      ]
    },
    {
      scenario: "Warehouse fire damages goods.",
      options: [
        { text: "Claim insurance", effect: +200, message: "Insurance payout. +RM200." },
        { text: "Sell damaged goods cheaply", effect: -100, message: "Recovered some cash. -RM100." },
        { text: "Do nothing", effect: -250, message: "Major loss. -RM250." }
      ]
    },
    {
      scenario: "ASEAN free trade agreement lowers tariffs.",
      options: [
        { text: "Expand exports quickly", effect: +200, message: "Expanded exports. +RM200." },
        { text: "Wait and see", effect: 0, message: "No change." },
        { text: "Form new partnerships", effect: +300, message: "New partnerships succeed. +RM300." }
      ]
    }
  ];

  // --- Choose 7 non-repeating scenarios at start of a new game ---
  function ensureChosenScenarios() {
    if (!localStorage.getItem("chosenScenarios")) {
      const shuffled = [...fullPool].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, maxDays);
      localStorage.setItem("chosenScenarios", JSON.stringify(chosen));
    }
  }

  function renderTask() {
    ensureChosenScenarios();
    const chosen = JSON.parse(localStorage.getItem("chosenScenarios"));
    const idx = day - 1;
    const task = chosen[idx];
    if (!task) {
      document.body.innerHTML = "<p>No task found. Redirecting to game...</p>";
      setTimeout(() => { window.location.href = "game.html"; }, 1000);
      return;
    }
    if ($("taskDay")) $("taskDay").textContent = day;
    if ($("scenarioText")) $("scenarioText").textContent = task.scenario;

    const optionsContainer = $("optionsContainer");
    if (!optionsContainer) return;
    optionsContainer.innerHTML = "";
    task.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt.text;
      btn.style.width = "100%"; // full width like trade buttons
      btn.addEventListener("click", () => applyTaskChoice(task, i));
      optionsContainer.appendChild(btn);
    });

    const peng = $("penguinTip");
    if (peng) {
      peng.textContent = "Tip: Read the choices carefully — outcomes differ!";
      peng.style.display = "block";
      setTimeout(() => peng.style.display = "none", 3000);
    }
  }

  function applyTaskChoice(task, optionIndex) {
    const option = task.options[optionIndex];
    balance += option.effect;
    balanceOverTime.push(balance);

    const color = option.effect >= 0 ? "profit" : "loss";
    tradeHistoryHTML += `<tr class="task-row">
      <td>${day}</td>
      <td>Daily Task</td>
      <td>${task.scenario}</td>
      <td>-</td>
      <td>-</td>
      <td class="${color}">${option.effect >= 0 ? "+" : ""}RM ${option.effect}</td>
    </tr>`;

    localStorage.setItem("balance", balance.toString());
    localStorage.setItem("tradeHistory", tradeHistoryHTML);
    localStorage.setItem("balanceOverTime", JSON.stringify(balanceOverTime));

    alert(option.message + ` (${option.effect >= 0 ? "+" : ""}${option.effect} RM)`);

    if (day >= maxDays) {
      window.location.href = "results.html";
    } else {
      day++;
      localStorage.setItem("day", day.toString());
      window.location.href = "game.html";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if ($("taskDay")) renderTask();

    window.showTaskTip = function () {
      const peng = $("penguinTip");
      if (!peng) return;
      const tips = [
        "Tip: Consider long-term effects before choosing.",
        "Tip: Small losses can avoid bigger problems later.",
        "Tip: Some choices bring immediate profit but risk future loss."
      ];
      peng.textContent = tips[Math.floor(Math.random() * tips.length)];
      peng.style.display = "block";
      setTimeout(() => peng.style.display = "none", 3000);
    };
  });

  window._taskScript = { renderTask, applyTaskChoice };
})();
