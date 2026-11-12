const namePattern = /^[A-Za-z ]{3,}$/;
const enrollmentPattern = /^[0-9]{6,10}$/;
const emailPattern = /^\S+@\S*lpu\S*$/i;

let events = [
  { id: "hackathon", name: "Hackathon 2026", date: "2026-11-12", time: "9:00 AM", venue: "Main Auditorium", eligibility: "All engineering students", description: "", total: 100, seats: 40 },
  { id: "cultural", name: "Cultural Night", date: "2026-11-18", time: "6:00 PM", venue: "Open Air Theatre", eligibility: "All students", description: "", total: 300, seats: 120 },
  { id: "workshop", name: "Web Development Workshop", date: "2026-11-25", time: "10:00 AM", venue: "Computer Lab 2", eligibility: "First and second year students", description: "", total: 60, seats: 15 }
];
let registrations = [];

let forms = document.getElementsByTagName("form");
let searchBox = document.getElementById("search-box");

function saveData() {
  localStorage.setItem("campusconnect_events", JSON.stringify(events));
  localStorage.setItem("campusconnect_registrations", JSON.stringify(registrations));
}

function loadData() {
  try {
    let savedEvents = localStorage.getItem("campusconnect_events");
    let savedRegistrations = localStorage.getItem("campusconnect_registrations");
    if (savedEvents !== null) {
      events = JSON.parse(savedEvents);
    }
    if (savedRegistrations !== null) {
      registrations = JSON.parse(savedRegistrations);
    }
  } catch (error) {
    console.log("Could not load saved data", error);
  }
}

function todayText() {
  return new Date().toLocaleDateString("en-CA");
}

function formatDate(dateString) {
  let d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function daysLeft(dateString) {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let eventDay = new Date(dateString + "T00:00:00");
  return Math.round((eventDay - today) / (1000 * 60 * 60 * 24));
}

function daysText(dateString) {
  let days = daysLeft(dateString);
  if (days < 0) {
    return "Event over";
  } else if (days == 0) {
    return "Today";
  } else if (days == 1) {
    return "Tomorrow";
  } else {
    return "In " + days + " days";
  }
}

function findEvent(id) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].id == id) {
      return events[i];
    }
  }
  return null;
}

function alreadyRegistered(enrollment, eventId) {
  for (let i = 0; i < registrations.length; i++) {
    if (registrations[i].enrollment == enrollment && registrations[i].eventId == eventId) {
      return true;
    }
  }
  return false;
}

function showMessage(id, text, good) {
  let box = document.getElementById(id);
  box.textContent = text;
  if (good) {
    box.style.color = "green";
  } else {
    box.style.color = "red";
  }
}

function showEvents() {
  let searchText = searchBox.value.trim().toLowerCase();
  sessionStorage.setItem("campusconnect_search", searchText);

  let matching = events.filter(function (ev) {
    return ev.name.toLowerCase().includes(searchText);
  });

  let html = "<h2>Upcoming Events</h2>";
  matching.forEach(function (ev) {
    let button = "<a class='button' href='#register' data-id='" + ev.id + "'>Register</a>";
    if (ev.seats <= 0 || daysLeft(ev.date) < 0) {
      button = "<strong>Registration closed</strong>";
    }

    html += "<div class='event-box'>";
    html += "<h3>" + ev.name + "</h3>";
    html += "<p>Date: " + formatDate(ev.date) + " (" + daysText(ev.date) + ")</p>";
    html += "<p>Venue: " + ev.venue + "</p>";
    html += "<p>Eligibility: " + ev.eligibility + "</p>";
    if (ev.description != "") {
      html += "<p>" + ev.description + "</p>";
    }
    html += "<p>Seats available: " + ev.seats + " out of " + ev.total + "</p>";
    html += button;
    html += "</div>";
  });

  document.getElementById("events").innerHTML = html;
  return matching.length;
}

function showCalendar() {
  let rows = "<caption>Events this month</caption>";
  rows += "<tr><th>Date</th><th>Event</th><th>Venue</th><th>Time</th></tr>";
  for (let i = 0; i < events.length; i++) {
    let ev = events[i];
    rows += "<tr><td>" + formatDate(ev.date) + "</td><td>" + ev.name + "</td><td>" + ev.venue + "</td><td>" + ev.time + "</td></tr>";
  }
  document.querySelector("#calendar table").innerHTML = rows;
}

function showDropdown() {
  let options = "";
  for (let i = 0; i < events.length; i++) {
    options += "<option value='" + events[i].id + "'>" + events[i].name + "</option>";
  }
  document.getElementById("event-choice").innerHTML = options;
}

function showEverything() {
  showEvents();
  showCalendar();
  showDropdown();
}

function searchEvents(e) {
  e.preventDefault();
  let found = showEvents();
  if (found == 0) {
    showMessage("search-message", "No events found", false);
  } else {
    showMessage("search-message", found + " event(s) found", true);
  }
}

function registerStudent(e) {
  e.preventDefault();

  let name = document.getElementById("student-name").value.trim();
  let enrollment = document.getElementById("enrollment").value.trim();
  let email = document.getElementById("student-email").value.trim();
  let eventId = document.getElementById("event-choice").value;
  let chosen = findEvent(eventId);
  let errors = [];

  if (!namePattern.test(name)) {
    errors.push("Enter your full name using letters only");
  }
  if (!enrollmentPattern.test(enrollment)) {
    errors.push("Enrollment number must be 6 to 10 digits");
  }
  if (!emailPattern.test(email)) {
    errors.push("Use your LPU college email");
  }
  if (daysLeft(chosen.date) < 0) {
    errors.push(chosen.name + " is already over");
  } else if (chosen.seats <= 0) {
    errors.push(chosen.name + " is full");
  }
  if (alreadyRegistered(enrollment, eventId)) {
    errors.push("You already registered for this event");
  }

  if (errors.length > 0) {
    showMessage("register-message", errors.join(". "), false);
    return;
  }

  chosen.seats = chosen.seats - 1;
  registrations.push({ name: name, enrollment: enrollment, email: email, eventId: eventId });
  saveData();

  forms[1].reset();
  showEverything();
  showMessage("register-message", "Thank you " + name + "! You are registered for " + chosen.name + ". Slip no: " + registrations.length + ". Seats left: " + chosen.seats, true);
}

function createEvent(e) {
  e.preventDefault();

  let name = document.getElementById("event-name").value.trim();
  let date = document.getElementById("event-date").value;
  let venue = document.getElementById("event-venue").value.trim();
  let eligibility = document.getElementById("event-eligibility").value.trim();
  let limit = Number(document.getElementById("event-limit").value);
  let description = document.getElementById("event-description").value.trim();
  let errors = [];

  if (name.length < 3) {
    errors.push("Event name must be at least 3 characters");
  }
  if (date == "") {
    errors.push("Choose a date");
  } else if (daysLeft(date) < 0) {
    errors.push("The date cannot be in the past");
  }
  if (venue.length < 3) {
    errors.push("Enter the venue");
  }
  if (isNaN(limit) || limit < 1) {
    errors.push("Registration limit must be 1 or more");
  }

  if (errors.length > 0) {
    showMessage("organizer-message", errors.join(". "), false);
    return;
  }

  if (eligibility == "") {
    eligibility = "All students";
  }

  events.push({
    id: "event" + Date.now(),
    name: name,
    date: date,
    time: "To be announced",
    venue: venue,
    eligibility: eligibility,
    description: description,
    total: limit,
    seats: limit
  });

  events.sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });
  saveData();

  forms[2].reset();
  showEverything();
  showMessage("organizer-message", "Event " + name + " created!", true);
}

function loadEventsFromFile() {
  fetch("events.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("events.json gave status " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      events = data;
      showEverything();
    })
    .catch(function (error) {
      console.log("Could not load events.json, using built-in events", error);
    });
}

function chooseEvent(e) {
  if (e.target.className == "button") {
    document.getElementById("event-choice").value = e.target.dataset.id;
  }
}

loadData();
searchBox.value = sessionStorage.getItem("campusconnect_search") || "";
document.getElementById("event-date").min = todayText();

let messageIds = ["search-message", "register-message", "organizer-message"];
for (let i = 0; i < messageIds.length; i++) {
  document.getElementById(messageIds[i]).setAttribute("aria-live", "polite");
}

showEverything();

if (localStorage.getItem("campusconnect_events") === null) {
  loadEventsFromFile();
}

forms[0].addEventListener("submit", searchEvents);
forms[1].addEventListener("submit", registerStudent);
forms[2].addEventListener("submit", createEvent);
searchBox.addEventListener("input", showEvents);
document.getElementById("events").addEventListener("click", chooseEvent);
