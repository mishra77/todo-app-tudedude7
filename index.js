const { name } = require("ejs");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todo");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

const trySchema = new mongoose.Schema({
  name: String,
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  }
});

const Task = new mongoose.model("Task", trySchema);

app.get("/", async (req, res) => {
  try {
    const filter = req.query.priority || "All";
    let tasks = await Task.find();
    if (filter !== "All") {
      tasks = tasks.filter(task => task.priority === filter);
    }
    res.render("list.ejs", { exejs: tasks, filter: filter });
  } catch (err) {
    res.status(500).send("Error fetching tasks");
  }
});

app.post("/", async (req, res) => {
  const item = req.body.ele1;
  const priority = req.body.priority;

  if (!item || item.trim() === "") {
    return res.send("<script>alert('Task cannot be empty'); window.location.href='/'</script>");
  }

  const newItem = new Task({
    name: item.trim(),
    priority: priority
  });

  await newItem.save();
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const checked = req.body.checkbox1;
  await Task.findByIdAndDelete(checked);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.id;
  const updatedName = req.body.updatedName;
  const updatedPriority = req.body.updatedPriority;

  if (!updatedName || updatedName.trim() === "") {
    return res.send("<script>alert('Task name cannot be empty'); window.location.href='/'</script>");
  }

  await Task.findByIdAndUpdate(id, { name: updatedName.trim(), priority: updatedPriority });
  res.redirect("/");
});

app.listen(port, () => {
  console.log("server is listening on the port 3000");
});
