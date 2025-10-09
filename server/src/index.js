import Joi from "joi";
import express from "express";
import logger from "./middleware/logger.js";
import courses from './routers/courses.js'
import home from './routers/home.js'

const app = express();

const port = process.env.PORT || 4000;

const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    id: Joi.number().min(0).max(10),
  });
  return schema.validate(course);
};

app.use(logger) // my first custom middleware
app.use(express.json());
app.use('/api/courses', courses)
app.use('/', home)

app.listen(port, () => console.log(`listening to port ${port}`));
