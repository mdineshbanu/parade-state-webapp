
const ADMIN_EMAILS = ["admin1@example.com", "admin2@example.com"];
let currentUserEmail = "";

function onSignIn(response) {
  const credential = parseJwt(response.credential);
  currentUserEmail = credential.email;
  document.getElementById("userInfo").innerText = `Logged in as: ${currentUserEmail}`;
  if (isAdmin(currentUserEmail)) loadDataTable();
  else document.querySelector("form").style.display = "block";
}

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = decodeURIComponent(atob(base64Url).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(base64);
}

document.getElementById('paradeForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const rows = [];
  for (const row of ["AUTH STR"]) {
    rows.push({
      detailment: row,
      OFFR: formData.get(`${row}_OFFR`) || 0,
      JCO: formData.get(`${row}_JCO`) || 0,
      OR: formData.get(`${row}_OR`) || 0,
      TOTAL: formData.get(`${row}_TOTAL`) || 0,
    });
  }
  const response = await fetch("https://script.google.com/macros/s/AKfycbx0XRYtVTkTtS-CAKQbPVB3BFpO4HjozOkWaDC912hmBSwSM4buYC_peD5j0ATGvFHh/exec", {
    method: "POST",
    body: JSON.stringify({ rows }),
    headers: { "Content-Type": "application/json" }
  });
  if (response.ok) {
    alert("Form submitted successfully!");
    e.target.reset();
  } else {
    alert("Error submitting the form.");
  }
});

async function loadDataTable() {
  const res = await fetch("https://script.google.com/macros/s/AKfycbx0XRYtVTkTtS-CAKQbPVB3BFpO4HjozOkWaDC912hmBSwSM4buYC_peD5j0ATGvFHh/exec");
  const data = await res.json();
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${row.detailment}</td>
      <td contenteditable="true">${row.OFFR}</td>
      <td contenteditable="true">${row.JCO}</td>
      <td contenteditable="true">${row.OR}</td>
      <td contenteditable="true">${row.TOTAL}</td>
      <td>
        ${isAdmin(currentUserEmail) ? `<button onclick="updateRow(${index})">Update</button>
        <button onclick="deleteRow(${index})">Delete</button>` : "N/A"}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateRow(index) {
  const tr = document.querySelectorAll("#dataTable tbody tr")[index];
  const tds = tr.querySelectorAll("td");
  const payload = {
    row: index,
    OFFR: tds[2].innerText,
    JCO: tds[3].innerText,
    OR: tds[4].innerText,
    TOTAL: tds[5].innerText
  };
  const res = await fetch("https://script.google.com/macros/s/AKfycbx0XRYtVTkTtS-CAKQbPVB3BFpO4HjozOkWaDC912hmBSwSM4buYC_peD5j0ATGvFHh/exec", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  if (res.ok) alert("Row updated.");
}

async function deleteRow(index) {
  if (!confirm("Are you sure to delete this row?")) return;
  const res = await fetch("https://script.google.com/macros/s/AKfycbx0XRYtVTkTtS-CAKQbPVB3BFpO4HjozOkWaDC912hmBSwSM4buYC_peD5j0ATGvFHh/exec", {
    method: "DELETE",
    body: JSON.stringify({ row: index })
  });
  if (res.ok) {
    alert("Row deleted.");
    loadDataTable();
  }
}

function downloadExcel() {
  let table = document.getElementById("dataTable");
  let html = table.outerHTML;
  let url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'ParadeStateReport.xls';
  a.click();
}
