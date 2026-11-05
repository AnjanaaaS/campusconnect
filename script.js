const collegeWord = "lpu";
const minEnrollment = 6;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let registrations = [];
let slipCount = 0;

let events = [
  { id: "hackathon", name: "Hackathon 2026", date: "12 November 2026", venue: "Main Auditorium", eligibility: "All engineering students", total: 100, seats: 40 },
  { id: "cultural", name: "Cultural Night", date: "18 November 2026", venue: "Open Air Theatre", eligibility: "All students", total: 300, seats: 120 },
  { id: "workshop", name: "Web Development Workshop", date: "25 November 2026", venue: "Computer Lab 2", eligibility: "First and second year students", total: 60, seats: 15 }
];

function findEvent(id) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].id == id) {
      return events[i];
    }
  }
  return null;
}

function checkEmail(email) {
  let e = email.trim().toLowerCase();
  if (e.includes("@") && e.includes(collegeWord)) {
    return true;
  } else {
    return false;
  }
}

function alreadyRegistered(enrollment, eventId) {
  for (let i = 0; i < registrations.length; i++) {
    if (registrations[i].enrollment == enrollment && registrations[i].eventId == eventId) {
      return true;
    }
  }
  return false;
}

function formatDate(dateString) {
  let parts = dateString.split("-");
  let day = Number(parts[2]);
  let month = months[Number(parts[1]) - 1];
  return day + " " + month + " " + parts[0];
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

function registerStudent(e) {
  e.preventDefault();

  let name = document.getElementById("student-name").value.trim();
  let enrollment = document.getElementById("enrollment").value.trim();
  let email = document.getElementById("student-email").value;
  let eventId = document.getElementById("event-choice").value;
  let chosen = findEvent(eventId);

  if (enrollment.length < minEnrollment) {
    showMessage("register-message", "Enrollment number is too short", false);
  } else if (checkEmail(email) == false) {
    showMessage("register-message", "Please use your college email", false);
  } else if (alreadyRegistered(enrollment, eventId)) {
    showMessage("register-message", "You already registered for this event", false);
  } else if (chosen.seats <= 0) {
    showMessage("register-message", chosen.name + " is full", false);
  } else {
    chosen.seats = chosen.seats - 1;
    slipCount = slipCount + 1;
    registrations.push({ name: name, enrollment: enrollment, eventId: eventId });
    document.getElementById("seats-" + chosen.id).textContent = chosen.seats;
    showMessage("register-message", "Thank you " + name + "! You are registered for " + chosen.name + ". Slip no: " + slipCount + ". Seats left: " + chosen.seats, true);
    document.getElementById("student-name").value = "";
    document.getElementById("enrollment").value = "";
    document.getElementById("student-email").value = "";
  }
}

function searchEvents(e) {
  e.preventDefault();

  let text = document.getElementById("search-box").value.trim().toLowerCase();
  let boxes = document.getElementsByClassName("event-box");
  let found = 0;

  for (let i = 0; i < boxes.length; i++) {
    let title = boxes[i].getElementsByTagName("h3")[0].textContent.toLowerCase();
    if (title.includes(text)) {
      boxes[i].style.display = "inline-block";
      found = found + 1;
    } else {
      boxes[i].style.display = "none";
    }
  }

  if (found == 0) {
    showMessage("search-message", "No events found", false);
  } else {
    showMessage("search-message", found + " event(s) found", true);
  }
}

function createEvent(e) {
  e.preventDefault();

  let limit = Number(document.getElementById("event-limit").value);
  let eligibility = document.getElementById("event-eligibility").value.trim();

  if (isNaN(limit) || limit < 1) {
    showMessage("organizer-message", "Registration limit must be 1 or more", false);
    return;
  }

  if (eligibility == "") {
    eligibility = "All students";
  }

  let newEvent = {
    id: "event" + (events.length + 1),
    name: document.getElementById("event-name").value.trim(),
    date: formatDate(document.getElementById("event-date").value),
    venue: document.getElementById("event-venue").value.trim(),
    eligibility: eligibility,
    total: limit,
    seats: limit
  };

  events.push(newEvent);

  let box = document.createElement("div");
  box.className = "event-box";
  box.innerHTML = "<h3>" + newEvent.name + "</h3>" +
    "<p>Date: " + newEvent.date + "</p>" +
    "<p>Venue: " + newEvent.venue + "</p>" +
    "<p>Eligibility: " + newEvent.eligibility + "</p>" +
    "<p>Seats available: <span id='seats-" + newEvent.id + "'>" + newEvent.seats + "</span> out of " + newEvent.total + "</p>" +
    "<a class='button' href='#register'>Register</a>";
  document.getElementById("events").appendChild(box);

  let option = document.createElement("option");
  option.value = newEvent.id;
  option.textContent = newEvent.name;
  document.getElementById("event-choice").appendChild(option);

  showMessage("organizer-message", "Event " + newEvent.name + " created!", true);
  document.getElementById("event-name").value = "";
  document.getElementById("event-date").value = "";
  document.getElementById("event-venue").value = "";
  document.getElementById("event-eligibility").value = "";
  document.getElementById("event-limit").value = "";
  document.getElementById("event-description").value = "";
}

let forms = document.getElementsByTagName("form");
forms[0].addEventListener("submit", searchEvents);
forms[1].addEventListener("submit", registerStudent);
forms[2].addEventListener("submit", createEvent);
