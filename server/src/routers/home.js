import express from 'express'

const router = express.Router()

router.get("/", (req, res) => {
  return res.send("this is the first time i feel like i understand this thing!");
});

export default router;