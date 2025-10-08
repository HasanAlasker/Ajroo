import Joi from "joi";
import express from "express";

const app = express();

const port = process.env.PORT || 4000;

const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    id: Joi.number().min(0).max(10),
  });
  return schema.validate(course);
};

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

app.use(express.json());

app.get("/", (req, res) => {
  return res.send("this is the first time i feel like i understand this thing!");
});

app.get("/api/courses", (req, res) => {
  return res.send(courses);
});

app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).send("Course with this id was not found!");

  return res.status(200).send(course);
});

app.get("/api/courses/:id/:name", (req, res) => {
  return res.send(req.params);
});

app.post("/api/courses", (req, res) => {
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

app.put("/api/courses/:id", (req, res) => {
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

app.delete("/api/courses/:id", (req, res) => {
  try {
    const course = courses.find((c) => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("No course has this id");

    const index = courses.indexOf(course)
    courses.splice(index, 1)

    return res.status(200).send(courses);
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.listen(port, () => console.log(`listening to port ${port}`));
