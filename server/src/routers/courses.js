import express from "express";

const router = express.Router();

const courses = [
  {
    id: 1,
    name: "React Native",
  },
  {
    id: 2,
    name: "React JS",
  },
  {
    id: 3,
    name: "Node JS",
  },
  {
    id: 4,
    name: "MongoDB",
  },
];

router.get("/", (req, res) => {
  return res.send(courses);
});

router.get("/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("Course with this id was not found!");

  return res.status(200).send(course);
});

router.get("/:id/:name", (req, res) => {
  return res.send(req.params);
});

router.post("/", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const course = {
      id: courses.length + 1,
      name: req.body.name,
    };
    courses.push(course);
    return res.status(200).send(courses);
  } catch {
    return res.status(500).send("Something went wrong");
  }
});

router.put("/:id", (req, res) => {
  try {
    const course = courses.find((c) => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("course doesn't exist");

    const { error } = validateCourse(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    course.name = req.body.name;
    return res.status(200).send(course);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.delete("/:id", (req, res) => {
  try {
    const course = courses.find((c) => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("No course has this id");

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    return res.status(200).send(courses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
