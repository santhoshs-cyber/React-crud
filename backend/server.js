const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// ================================
// MONGODB
// ================================

const client = new MongoClient(process.env.mongodb_URI);

let db;


// ======================================================
// DUPLICATE CHECK
// Checks BOTH Students and Teachers
// ======================================================

async function checkDuplicate(name, email, phone) {
  const cleanName = name.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Get students
  const students = await db
    .collection("students")
    .find({})
    .toArray();

  // Check students
  const studentDuplicate = students.find((student) => {
    return (
      student.name?.trim().toLowerCase() === cleanName ||
      student.email?.trim().toLowerCase() === cleanEmail ||
      student.phone?.trim() === cleanPhone
    );
  });

  if (studentDuplicate) {
    if (
      studentDuplicate.email?.trim().toLowerCase() === cleanEmail
    ) {
      return "This email is already registered";
    }

    if (studentDuplicate.phone?.trim() === cleanPhone) {
      return "This phone number is already registered";
    }

    if (
      studentDuplicate.name?.trim().toLowerCase() === cleanName
    ) {
      return "This name is already registered";
    }
  }

  // Get teachers
  const teachers = await db
    .collection("teachers")
    .find({})
    .toArray();

  // Check teachers
  const teacherDuplicate = teachers.find((teacher) => {
    return (
      teacher.name?.trim().toLowerCase() === cleanName ||
      teacher.email?.trim().toLowerCase() === cleanEmail ||
      teacher.phone?.trim() === cleanPhone
    );
  });

  if (teacherDuplicate) {
    if (
      teacherDuplicate.email?.trim().toLowerCase() === cleanEmail
    ) {
      return "This email is already registered";
    }

    if (teacherDuplicate.phone?.trim() === cleanPhone) {
      return "This phone number is already registered";
    }

    if (
      teacherDuplicate.name?.trim().toLowerCase() === cleanName
    ) {
      return "This name is already registered";
    }
  }

  return null;
}
// ======================================================
// CHECK EMAIL AVAILABILITY
// ======================================================

app.get("/check-email", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check student collection
    const student = await db.collection("students").findOne({
      email: cleanEmail
    });

    // Check teacher collection
    const teacher = await db.collection("teachers").findOne({
      email: cleanEmail
    });

    if (student || teacher) {
      return res.status(200).json({
        exists: true,
        message: "This email is already registered"
      });
    }

    return res.status(200).json({
      exists: false,
      message: "Email is available"
    });

  } catch (error) {
    console.error("Email check error:", error);

    return res.status(500).json({
      message: "Failed to check email"
    });
  }
});


// ======================================================
// STUDENT CREATE
// ======================================================

app.post("/students", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course,
      age,
    } = req.body;

    // Check empty fields
    if (!name || !email || !phone || !course || !age) {
      return res.status(400).json({
        message: "Please fill all student fields",
      });
    }

    // Check duplicate in BOTH collections
    const duplicateError = await checkDuplicate(
      name,
      email,
      phone
    );

    if (duplicateError) {
      return res.status(409).json({
        message: duplicateError,
      });
    }

    // Student object
    const student = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      course: course.trim(),
      age: Number(age),
      createdAt: new Date(),
    };

    // Insert
    const result = await db
      .collection("students")
      .insertOne(student);

    return res.status(201).json({
      message: "Student registered successfully",

      student: {
        _id: result.insertedId,
        ...student,
      },
    });

  } catch (error) {
    console.error("Student registration error:", error);

    return res.status(500).json({
      message: "Failed to register student",
    });
  }
});


// ======================================================
// STUDENT READ
// ======================================================

app.get("/students", async (req, res) => {
  try {
    const students = await db
      .collection("students")
      .find({})
      .toArray();

    return res.status(200).json(students);

  } catch (error) {
    console.error("Student fetch error:", error);

    return res.status(500).json({
      message: "Failed to get students",
    });
  }
});


// ======================================================
// STUDENT UPDATE
// ======================================================

app.put("/students/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course,
      age,
    } = req.body;

    const result = await db
      .collection("students")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            course: course.trim(),
            age: Number(age),
          },
        }
      );

    if (result.matchedCount === 0) { 
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student updated successfully",
    });

  } catch (error) {
    console.error("Student update error:", error);

    return res.status(500).json({
      message: "Failed to update student",
    });
  }
});


// ======================================================
// STUDENT DELETE
// ======================================================

app.delete("/students/:id", async (req, res) => {
  try {
    const result = await db
      .collection("students")
      .deleteOne({
        _id: new ObjectId(req.params.id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });

  } catch (error) {
    console.error("Student delete error:", error);

    return res.status(500).json({
      message: "Failed to delete student",
    });
  }
});


// ======================================================
// TEACHER CREATE
// ======================================================

app.post("/teachers", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      experience,
    } = req.body;

    // Check empty fields
    if (
      !name ||
      !email ||
      !phone ||
      !subject ||
      !experience
    ) {
      return res.status(400).json({
        message: "Please fill all teacher fields",
      });
    }

    // Check duplicate in BOTH collections
    const duplicateError = await checkDuplicate(
      name,
      email,
      phone
    );

    if (duplicateError) {
      return res.status(409).json({
        message: duplicateError,
      });
    }

    // Teacher object
    const teacher = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      experience: Number(experience),
      createdAt: new Date(),
    };

    // Insert
    const result = await db
      .collection("teachers")
      .insertOne(teacher);

    return res.status(201).json({
      message: "Teacher registered successfully",

      teacher: {
        _id: result.insertedId,
        ...teacher,
      },
    });

  } catch (error) {
    console.error("Teacher registration error:", error);

    return res.status(500).json({
      message: "Failed to register teacher",
    });
  }
});


// ======================================================
// TEACHER READ
// ======================================================

app.get("/teachers", async (req, res) => {
  try {
    const teachers = await db
      .collection("teachers")
      .find({})
      .toArray();

    return res.status(200).json(teachers);

  } catch (error) {
    console.error("Teacher fetch error:", error);

    return res.status(500).json({
      message: "Failed to get teachers",
    });
  }
});


// ======================================================
// TEACHER UPDATE
// ======================================================

app.put("/teachers/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      experience,
    } = req.body;

    const result = await db
      .collection("teachers")
      .updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            subject: subject.trim(),
            experience: Number(experience),
          },
        }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      message: "Teacher updated successfully",
    });

  } catch (error) {
    console.error("Teacher update error:", error);

    return res.status(500).json({
      message: "Failed to update teacher",
    });
  }
});


// ======================================================
// TEACHER DELETE
// ======================================================

app.delete("/teachers/:id", async (req, res) => {
  try {
    const result = await db
      .collection("teachers")
      .deleteOne({
        _id: new ObjectId(req.params.id),
      });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      message: "Teacher deleted successfully",
    });

  } catch (error) {
    console.error("Teacher delete error:", error);

    return res.status(500).json({
      message: "Failed to delete teacher",
    });
  }
});


// ======================================================
// CONNECT MONGODB + START SERVER
// ======================================================

async function connectDB() {
  try {
    await client.connect();

    db = client.db("ToDo_list");

    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Backend server running on port 5000");
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// ==========================================
// SUPPORT CHAT - SEND/SAVE MESSAGE
// ==========================================

// =====================================================
// SEND SHARED SUPPORT MESSAGE
// =====================================================

app.post("/support-messages", async (req, res) => {
  try {
    const {
      chatId,
      role,
      sender,
      message
    } = req.body;

    if (
      !chatId ||
      !role ||
      !sender ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: "All message fields are required"
      });
    }

    // VALID ROLE
    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    // VALID SENDER
    if (!["student", "teacher"].includes(sender)) {
      return res.status(400).json({
        message: "Invalid sender"
      });
    }

    const newMessage = {
      chatId,
      role,
      sender,
      message: message.trim(),
      createdAt: new Date()
    };

    const result = await db
      .collection("support_messages")
      .insertOne(newMessage);

    res.status(201).json({
      message: "Message sent successfully",

      data: {
        _id: result.insertedId,
        ...newMessage
      }
    });

  } catch (error) {

    console.error(
      "Support message error:",
      error
    );

    res.status(500).json({
      message: "Failed to send message"
    });
  }
});


// ==========================================
// GET MESSAGES FOR ONE CHAT
// ==========================================

app.get("/support-messages/:chatId", async (req, res) => {
  try {
    const messages = await db
      .collection("support_messages")
      .find({
        chatId: req.params.chatId,
      })
      .sort({
        createdAt: 1,
      })
      .toArray();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Support fetch error:", error);

    return res.status(500).json({
      message: "Failed to fetch support messages",
    });
  }
});
// =====================================================
// GET ONE SHARED CONVERSATION
// =====================================================

app.get(
  "/support-messages/:chatId",
  async (req, res) => {

    try {

      const messages = await db
        .collection("support_messages")
        .find({
          chatId: req.params.chatId
        })
        .sort({
          createdAt: 1
        })
        .toArray();

      res.json(messages);

    } catch (error) {

      console.error(
        "Support fetch error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch messages"
      });
    }
  }
);


// ==========================================
// GET ALL SUPPORT MESSAGES
// ==========================================

app.get("/support-messages", async (req, res) => {
  try {
    const messages = await db
      .collection("support_messages")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Support fetch error:", error);

    return res.status(500).json({
      message: "Failed to fetch support messages",
    });
  }
});
connectDB();