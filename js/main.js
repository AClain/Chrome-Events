const today = new Date();
today.setHours(0, 0, 0, 0);

const loaderHTML = `<div class="h-25 w-25" id="spinner">
  <svg viewbox="0 0 150 150"><circle class=ccc2002 cx=75 cy=75 r=20 /><circle class=ccc2002 cx=75 cy=75 r=35 /><circle class=ccc2002 cx=75 cy=75 r=50 /><circle class=ccc2002 cx=75 cy=75 r=65 /></svg>
  </div>`;

function generateUniqueIdentifier() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 12).padStart(12, 0)
  );
}

function validateInput(value, options) {
  if (options.required && (!value || value.length === 0)) {
    return { valid: false, message: "This field is required." };
  }

  if (options.type) {
    if (options.type === "string" && typeof value !== "string") {
      return { valid: false, message: "Input must be a string." };
    } else if (options.type === "number" && isNaN(value)) {
      return { valid: false, message: "Input must be a number." };
    }
  }

  if (options.min !== undefined && value.length < options.min) {
    return {
      valid: false,
      message: `Input must be at least ${options.min} characters.`,
    };
  }

  if (options.max !== undefined && value.length > options.max) {
    return {
      valid: false,
      message: `Input must be no more than ${options.max} characters.`,
    };
  }

  return { valid: true, message: "Valid input." };
}

function parseDate(dateString) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

function parseTime(timeString) {
  const parts = timeString.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function isTheDayAfter(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes < startMinutes;
}

function displayErrors(errors) {
  let formErrorsContainer = document.getElementById("formErrors");
  formErrorsContainer.classList.add("alert", "alert-danger", "mt-3");
  formErrorsContainer.replaceChildren();

  let listElement = document.createElement("ul");
  listElement.classList.add("mb-0");

  errors.map((error) => {
    let listChildElement = document.createElement("li");
    listChildElement.innerText = error;
    listElement.appendChild(listChildElement);
  });

  formErrorsContainer.appendChild(listElement);
}

function displayLoading() {
  let eventListContainer = document.getElementById("event-list");
  eventListContainer.insertAdjacentHTML("afterbegin", loaderHTML);
  eventListContainer.classList.add(
    "justify-content-center",
    "align-items-center"
  );
}

function clearLoading() {
  let eventListContainer = document.getElementById("event-list");
  let spinner = document.querySelector("#event-list #spinner");

  spinner.remove();

  eventListContainer.classList.remove(
    "justify-content-center",
    "align-items-center"
  );
}

function clearUI() {
  let formErrorsContainer = document.getElementById("formErrors");
  formErrorsContainer.classList.remove("alert", "alert-danger", "mt-3");
  formErrorsContainer.replaceChildren();
}

function clearEvents() {
  let eventContainer = document.getElementById("event-list");
  eventContainer.replaceChildren();
}

function generateEventHtml(event) {
  let dateObj = new Date(event.startDate);
  let day = dateObj.getDate().toString().padStart(2, "0");
  let month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  let year = dateObj.getFullYear();
  let formattedDate = `${day}/${month}/${year}`;

  console.log(event);

  let startTimeDate = new Date(event.startTime);
  let startTimeHours = startTimeDate.getHours().toString().padStart(2, "0");
  let startTimeMinutes = startTimeDate.getMinutes().toString().padStart(2, "0");
  let startTime24HrFormat = `${startTimeHours}:${startTimeMinutes}`;
  let endTimeDate = new Date(event.endTime);
  let endTimeHours = endTimeDate.getHours().toString().padStart(2, "0");
  let endTimeMinutes = endTimeDate.getMinutes().toString().padStart(2, "0");
  let endTime24HrFormat = `${endTimeHours}:${endTimeMinutes}`;

  console.log(startTimeDate);

  let now = new Date();
  let start = new Date(event.startTime);
  let end = new Date(event.endTime);

  let badgeText = "Ended";
  let badgeType = "error";

  if (now >= start && now <= end) {
    badgeText = "Ongoing";
    badgeType = "success";
  } else if (now < start) {
    badgeText = "Upcoming";
    badgeType = "info";
  }

  return `
        <div class="p-4 alert alert-secondary" role="alert">
            <div class="col mt-2">
                <h5 class="m-0">${event.name}</h5>
            </div>
            <div clas="col mt-2">
                <a href="${event.url}" target="_blank">Go to event</a>
                <a href="${event.sourceUrl}" target="_blank">Source</a>
            </div>
            <div class="col mt-2">
                <span>${formattedDate}</span>
                <span>${startTime24HrFormat} - ${endTime24HrFormat}</span>
                <span class="badge text-bg-${badgeType}">${badgeText}</span>
            </div>
            <div class="col mt-2">
                <button type="button" class="btn btn-outline-danger remove-btn" data-id="${event.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                        <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"></path>
                    </svg>
                    Remove
                </button>
            </div>
        </div>
    `;
}

function displayEvents(events) {
  let eventContainer = document.getElementById("event-list");
  if (events.lengtht < 1) {
    eventContainer.insertAdjacentHTML(`<div class="alert alert-dark" role="alert">
        No upcoming events
    </div>`);
    return;
  }

  events.map((event) => {
    eventContainer.insertAdjacentHTML("beforeend", generateEventHtml(event));
  });
}

function resetEvents() {
  chrome.storage.local.set({ "lambda.events": [] }, function () {});
}

function reloadEvents() {
  clearEvents();
  displayLoading();

  chrome.storage.local.get(["lambda.events"], function (result) {
    console.log(result["lambda.events"]);

    let events = [];
    if (!("lambda.events" in result)) {
      chrome.storage.local.set({ "lambda.events": [] }, function () {});
    } else {
      events = result["lambda.events"];
    }

    events.sort((a, b) => {
      let dateA = new Date(a.startDate);
      let dateB = new Date(b.startDate);
      return dateA - dateB;
    });

    displayEvents(events);
  });

  clearLoading();
}

function onStartup() {
  $("#startDate").datepicker({
    format: "dd/mm/yyyy",
    startDate: "0d",
  });
  $("#endDate").datepicker({
    format: "dd/mm/yyyy",
    startDate: "0d",
  });

  reloadEvents();

  let eventsTabButton = document.getElementById("events-tab");
  eventsTabButton.addEventListener("click", function () {
    reloadEvents();
  });

  $("#event-list").on("click", ".remove-btn", function () {
    const eventId = $(this).data("id");

    chrome.storage.local.get(["lambda.events"], function (result) {
      let events = result["lambda.events"];

      chrome.storage.local.set(
        { "lambda.events": events.filter((event) => event.id !== eventId) },
        function () {}
      );

      reloadEvents();
    });
  });
}

(function () {
  onStartup();

  const form = document.getElementById("eventForm");

  form.addEventListener("submit", function (event) {
    clearUI();
    let errors = [];
    event.preventDefault();

    const eventName = document.getElementById("eventName").value.trim();
    const eventUrl = document.getElementById("eventUrl").value.trim();
    const sourceUrl = document.getElementById("eventSourceUrl").value.trim();
    // dd/mm/yyyy
    const startDateString = document.getElementById("startDate").value.trim();
    // hh:mm
    const startTimeString = document.getElementById("startTime").value.trim();
    const endTimeString = document.getElementById("endTime").value.trim();

    const startDate = parseDate(startDateString);
    const startTime = parseTime(startTimeString);
    const endTime = parseTime(endTimeString);

    startTime.setDate(startDate.getDate());
    startTime.setMonth(startDate.getMonth());
    startTime.setFullYear(startDate.getFullYear());
    endTime.setDate(
      isTheDayAfter(startTimeString, endTimeString)
        ? startDate.getDate() + 1
        : startDate.getDate()
    );
    endTime.setMonth(startDate.getMonth());
    endTime.setFullYear(startDate.getFullYear());

    if (startDate < today) {
      errors.push("The start date must be today or later.");
    }

    if (errors.length > 0) {
      displayErrors(errors);
      return;
    }

    let newEvent = {
      id: generateUniqueIdentifier(),
      name: eventName,
      url: eventUrl,
      sourceUrl: sourceUrl,
      startDate: startDate.toDateString(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    };

    chrome.storage.local.get(["lambda.events"], function (result) {
      let events = result["lambda.events"];

      events.push(newEvent);

      chrome.storage.local.set({ "lambda.events": events }, function () {});
    });

    clearUI();
    form.reset();
  });
})();
