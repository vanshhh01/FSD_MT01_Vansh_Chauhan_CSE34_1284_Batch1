const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next();
});

let students = [
  {
    id: 201,
    rollNumber: "CSE2401",
    name: "Aarav Sharma",
    branch: "CSE",
    semester: 3,
    email: "aarav@example.com",
  },
  {
    id: 202,
    rollNumber: "ECE2402",
    name: "Diya Verma",
    branch: "ECE",
    semester: 3,
    email: "diya@example.com",
  },
  {
    id: 203,
    rollNumber: "CSE2403",
    name: "Kabir Singh",
    branch: "CSE",
    semester: 3,
    email: "kabir@example.com",
  },
];

let nextId = 204;

function validateStudent(body, excludeId = null) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }

  const { rollNumber, name, branch, semester, email } = body;

  if (typeof rollNumber !== "string" || rollNumber.trim() === "") {
    return "rollNumber is required and must be a non-empty string";
  }

  const duplicate = students.some(
    (s) =>
      s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase() &&
      s.id !== excludeId
  );
  if (duplicate) {
    return "rollNumber already exists";
  }

  if (typeof name !== "string" || name.trim() === "") {
    return "name is required and must be a non-empty string";
  }

  if (typeof branch !== "string" || branch.trim() === "") {
    return "branch is required and must be a non-empty string";
  }

  if (
    typeof semester !== "number" ||
    !Number.isInteger(semester) ||
    semester < 1
  ) {
    return "semester is required and must be a positive integer";
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "email is required and must be a valid email address";
  }

  return null;
}

app.get("/api/students", (req, res) => {
  res.status(200).json(students);
});

app.get("/api/students/filter", (req, res) => {
  const { branch } = req.query;

  if (typeof branch !== "string" || branch.trim() === "") {
    return res
      .status(400)
      .json({ error: "branch query parameter is required" });
  }

  const queryBranch = branch.trim().toLowerCase();
  const filtered = students.filter(
    (s) => s.branch.toLowerCase() === queryBranch
  );
  res.status(200).json(filtered);
});

app.get("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  res.status(200).json(student);
});

app.post("/api/students", (req, res) => {
  const error = validateStudent(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const newStudent = {
    id: nextId++,
    rollNumber: req.body.rollNumber.trim(),
    name: req.body.name.trim(),
    branch: req.body.branch.trim(),
    semester: req.body.semester,
    email: req.body.email.trim(),
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const error = validateStudent(req.body, id);
  if (error) {
    return res.status(400).json({ error });
  }

  students[index] = {
    id,
    rollNumber: req.body.rollNumber.trim(),
    name: req.body.name.trim(),
    branch: req.body.branch.trim(),
    semester: req.body.semester,
    email: req.body.email.trim(),
  };

  res.status(200).json(students[index]);
});

app.delete("/api/students/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const deleted = students.splice(index, 1)[0];
  res
    .status(200)
    .json({ message: "Student deleted successfully", student: deleted });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
