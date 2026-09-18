import { useEffect, useState } from "react";

import {
  Routes,
  Route,
  useNavigate 
} from "react-router-dom";

import SupportChat from "./SupportChat.jsx";

import "./App.css";

const API_URL = "http://localhost:5000";

const countryCodes = [
  { country: "India", flag: "🇮🇳", code: "+91", min: 10, max: 10 },
  { country: "USA / Canada", flag: "🇺🇸", code: "+1", min: 10, max: 10 },
  { country: "United Kingdom", flag: "🇬🇧", code: "+44", min: 10, max: 10 },
  { country: "UAE", flag: "🇦🇪", code: "+971", min: 9, max: 9 },
  { country: "Australia", flag: "🇦🇺", code: "+61", min: 9, max: 9 },
  { country: "Singapore", flag: "🇸🇬", code: "+65", min: 8, max: 8 },
  { country: "Malaysia", flag: "🇲🇾", code: "+60", min: 9, max: 10 },
  { country: "Saudi Arabia", flag: "🇸🇦", code: "+966", min: 9, max: 9 },
  { country: "Qatar", flag: "🇶🇦", code: "+974", min: 8, max: 8 },
  { country: "Kuwait", flag: "🇰🇼", code: "+965", min: 8, max: 8 },
  { country: "Oman", flag: "🇴🇲", code: "+968", min: 8, max: 8 },
  { country: "New Zealand", flag: "🇳🇿", code: "+64", min: 8, max: 10 },
];
const validateEmail = (email) => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return "";
  }

  // Basic email structure
  const emailPattern =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(cleanEmail)) {
    return "Please enter a valid email address";
  }

  const domain = cleanEmail.split("@")[1];

  // Common Gmail typing mistakes
  const wrongGmailDomains = [
    "gmaill.com",
    "gmai.com",
    "gmial.com",
    "gamil.com",
    "gmail.co",
    "gmail.comm",
    "gmail.con",
    "gmail.om",
    "gmail.ccom",
  ];

  if (wrongGmailDomains.includes(domain)) {
    return "Did you mean gmail.com?";
  }

  return "";
};
function App() {
  const navigate = useNavigate();

  // =====================================================
  // DATA STATES
  // =====================================================

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // EMAIL ERROR STATES
  // =====================================================

  const [studentEmailError, setStudentEmailError] = useState("");
  const [teacherEmailError, setTeacherEmailError] = useState("");
const getCountryInfo = (countryCode) => {
  return (
    countryCodes.find(
      (country) => country.code === countryCode
    ) || countryCodes[0]
  );
};
  // =====================================================
  // STUDENT FORM
  // =====================================================
const [studentForm, setStudentForm] = useState({
  name: "",
  email: "",
  countryCode: "+91",
  phone: "",
  course: "",
  age: "",
});
 


  // =====================================================
  // TEACHER FORM
  // =====================================================

 const [teacherForm, setTeacherForm] = useState({
  name: "",
  email: "",
  countryCode: "+91",
  phone: "",
  subject: "",
  experience: "",
});


  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`);

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.error("Student fetch error:", error);
    }
  };

  // =====================================================
  // FETCH TEACHERS
  // =====================================================

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/teachers`);

      const data = await response.json();

      setTeachers(data);
    } catch (error) {
      console.error("Teacher fetch error:", error);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  // =====================================================
  // STUDENT INPUT
  // =====================================================
const handleStudentChange = (e) => {
  const { name, value } = e.target;

  setStudentForm((previousForm) => ({
    ...previousForm,
    [name]: value,
  }));

  if (name === "email") {
    const cleanEmail = value.trim().toLowerCase();

    if (!cleanEmail) {
      setStudentEmailError("");
      return;
    }

    // FIRST: check email format
    const formatError = validateEmail(cleanEmail);

    if (formatError) {
      setStudentEmailError(formatError);
      return;
    }

    // SECOND: check duplicate in Students
    const existsInStudents = students.some(
      (student) =>
        student.email?.trim().toLowerCase() === cleanEmail &&
        student._id !== editingId
    );

    // THIRD: check duplicate in Teachers
    const existsInTeachers = teachers.some(
      (teacher) =>
        teacher.email?.trim().toLowerCase() === cleanEmail
    );

    if (existsInStudents || existsInTeachers) {
      setStudentEmailError(
        "This email is already registered"
      );
    } else {
      setStudentEmailError("");
    }
  }
};
  
  // =====================================================
  // TEACHER INPUT
  // =====================================================

 const handleTeacherChange = (e) => {
  const { name, value } = e.target;

  setTeacherForm((previousForm) => ({
    ...previousForm,
    [name]: value,
  }));

  if (name === "email") {
    const cleanEmail = value.trim().toLowerCase();

    if (!cleanEmail) {
      setTeacherEmailError("");
      return;
    }

    // FIRST: check email format
    const formatError = validateEmail(cleanEmail);

    if (formatError) {
      setTeacherEmailError(formatError);
      return;
    }

    // SECOND: check Teachers
    const existsInTeachers = teachers.some(
      (teacher) =>
        teacher.email?.trim().toLowerCase() === cleanEmail &&
        teacher._id !== editingId
    );

    // THIRD: check Students
    const existsInStudents = students.some(
      (student) =>
        student.email?.trim().toLowerCase() === cleanEmail
    );

    if (existsInTeachers || existsInStudents) {
      setTeacherEmailError(
        "This email is already registered"
      );
    } else {
      setTeacherEmailError("");
    }
  }
};
  // =====================================================
  // STUDENT CREATE / UPDATE
  // =====================================================

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    const selectedCountry = getCountryInfo(
  studentForm.countryCode
);

if (
  studentForm.phone.length < selectedCountry.min ||
  studentForm.phone.length > selectedCountry.max
) {
  alert(
    `${selectedCountry.country} phone number must contain ${
      selectedCountry.min === selectedCountry.max
        ? `exactly ${selectedCountry.min}`
        : `${selectedCountry.min}-${selectedCountry.max}`
    } digits`
  );

  return;
}

    // Do not submit duplicate email
    if (studentEmailError) {
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/students/${editingId}`
        : `${API_URL}/students`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(studentForm),
      });

      const data = await response.json();

      // Backend validation error
      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      // Clear form
      setStudentForm({
        name: "",
        email: "",
        countryCode:"+91",
        phone: "",
        course: "",
        age: "",
      });

      // Clear email error
      setStudentEmailError("");

      setEditingId(null);

      // Reload both because duplicate checking
      // uses both lists
      await fetchStudents();
      await fetchTeachers();
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  };

  // =====================================================
  // TEACHER CREATE / UPDATE
  // =====================================================

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    const selectedCountry = getCountryInfo(
  teacherForm.countryCode
);

if (
  teacherForm.phone.length < selectedCountry.min ||
  teacherForm.phone.length > selectedCountry.max
) {
  alert(
    `${selectedCountry.country} phone number must contain ${
      selectedCountry.min === selectedCountry.max
        ? `exactly ${selectedCountry.min}`
        : `${selectedCountry.min}-${selectedCountry.max}`
    } digits`
  );

  return;
}

    // Do not submit duplicate email
    if (teacherEmailError) {
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/teachers/${editingId}`
        : `${API_URL}/teachers`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(teacherForm),
      });

      const data = await response.json();

      // Backend validation error
      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      // Clear form
      setTeacherForm({
        name: "",
        email: "",
        countryCode:"+91",
        phone: "",
        subject: "",
        experience: "",
      });

      // Clear email error
      setTeacherEmailError("");

      setEditingId(null);

      // Reload both lists
      await fetchStudents();
      await fetchTeachers();
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }
  };

  // =====================================================
  // EDIT STUDENT
  // =====================================================

  const editStudent = (student) => {
    navigate("/student");

    setEditingId(student._id);

    // Remove previous email error
    setStudentEmailError("");

    setStudentForm({
      name: student.name,
      email: student.email,
      countryCode: student.countryCode || "+91",
      phone: student.phone,
      course: student.course,
      age: student.age,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/students/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      await fetchStudents();
      await fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // EDIT TEACHER
  // =====================================================

  const editTeacher = (teacher) => {
    navigate("/teacher");

    setEditingId(teacher._id);

    // Remove previous email error
    setTeacherEmailError("");

    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      countryCode: teacher.countryCode || "+91",
      phone: teacher.phone,
      subject: teacher.subject,
      experience: teacher.experience,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const deleteTeacher = async (id) => {
    if (!window.confirm("Delete this teacher?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teachers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      await fetchStudents();
      await fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // BACK TO ROLE
  // =====================================================

  const goBack = () => {
    navigate("/");

    setEditingId(null);

    setStudentEmailError("");
    setTeacherEmailError("");

  };

  // =====================================================
  // ROLE SELECTION PAGE
  // =====================================================

  const renderRoleSelection = () => {
    return (
      <div className="role-page">

        <img
          src="/wrench-wise-logo.png"
          alt="Wrench Wise"
          className="main-logo"
        />

        <p className="welcome-text">
          Welcome to Wrench Wise
        </p>

        <h1>
          Choose your registration type
        </h1>

        <p className="subtitle">
          Select whether you are a Student or Teacher
        </p>

        <div className="role-container">

          {/* STUDENT */}

          <div
            className="role-card"
            onClick={() => {
              setEditingId(null);
              setStudentEmailError("");
              navigate("/student");
            }}
          >

            <div className="role-icon">
              🎓
            </div>

            <h2>Student</h2>

            <p>
              Register as a student and manage your
              student information.
            </p>

                <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();

        setEditingId(null);
        setStudentEmailError("");

        navigate("/student");
      }}
    >
      Register as Student
    </button>

  </div>

          {/* TEACHER */}

          <div
            className="role-card"
            onClick={() => {
              setEditingId(null);
              setTeacherEmailError("");
              navigate("/teacher");
            }}
          >

            <div className="role-icon">
              👨‍🏫
            </div>

            <h2>Teacher</h2>

            <p>
              Register as a teacher and manage your
              teaching information.
            </p>

            
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();

        setEditingId(null);
        setTeacherEmailError("");

        navigate("/teacher");
      }}
    >
      Register as Teacher
    </button>

  </div>

        </div>

        <p className="footer">
          © 2026 Wrench Wise • Innovate. Engineer. Excel.
        </p>

      </div>
    );
  };

  // =====================================================
  // STUDENT PAGE
  // =====================================================

  const renderStudentPage = () => {
    return (
      <div className="app">

        <header className="header">

          <img
            src="/wrench-wise-logo.png"
            alt="Wrench Wise"
            className="header-logo"
          />

          <button
            type="button"
            className="back-button"
            onClick={goBack}
          >
            ← Change Role
          </button>

        </header>

        <main className="content">
          
            
          

          {/* =========================================
              STUDENT FORM
          ========================================= */}

          <section className="form-card">

            <h2>
              🎓{" "}
              {editingId
                ? "Update Student"
                : "Student Registration"}
            </h2>

            <form onSubmit={handleStudentSubmit}>

              {/* NAME */}

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={studentForm.name}
                onChange={handleStudentChange}
                required
              />

              {/* =====================================
                  EMAIL
              ===================================== */}

             <div className="input-group">

  <input
    type="email"
    name="email"
    placeholder="Email"
    value={studentForm.email}
    onChange={handleStudentChange}
    className={
      studentEmailError ? "input-error" : ""
    }
    required
  />

  {studentEmailError && (
    <p className="email-error">
      ⚠ {studentEmailError}
    </p>
  )}

</div>

              {/* PHONE */}

              <div className="phone-field">

  <select
    name="countryCode"
    value={studentForm.countryCode}
    onChange={handleStudentChange}
    className="country-code"
  >
    {countryCodes.map((country) => (
      <option
        key={`${country.country}-${country.code}`}
        value={country.code}
      >
        {country.flag} {country.code} - {country.country}
      </option>
    ))}
  </select>

  <input
    type="tel"
    name="phone"
    placeholder="Phone Number"
    value={studentForm.phone}
    onChange={(e) => {
      const numbersOnly = e.target.value.replace(/\D/g, "");

      const country = getCountryInfo(
        studentForm.countryCode
      );

      if (numbersOnly.length <= country.max) {
        setStudentForm((previous) => ({
          ...previous,
          phone: numbersOnly,
        }));
      }
    }}
    required
  />

</div>
              {/* COURSE */}

              <input
                type="text"
                name="course"
                placeholder="Course"
                value={studentForm.course}
                onChange={handleStudentChange}
                required
              />

              {/* AGE */}

              <input
                type="number"
                name="age"
                placeholder="Age"
                value={studentForm.age}
                onChange={handleStudentChange}
                required
              />

              <button
                type="submit"
                className="submit-button"
                disabled={Boolean(studentEmailError)}
              >
                {editingId
                  ? "Update Student"
                  : "Register Student"}
              </button>

            </form>

          </section>

          {/* =========================================
              STUDENT TABLE
          ========================================= */}

          <section className="table-card">

            <h2>
              Registered Students
            </h2>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Course</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student) => (
                    <tr key={student._id}>

                      <td>
                        {student.name}
                      </td>

                      <td>
                        {student.email}
                      </td>

                      <td>
                        {student.phone}
                      </td>

                      <td>
                        {student.course}
                      </td>

                      <td>
                        {student.age}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() =>
                            editStudent(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            deleteStudent(student._id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </main>
<SupportChat role="student" />

      </div>
    );
  };

  // =====================================================
  // TEACHER PAGE
  // =====================================================

  const renderTeacherPage = () => {
    return (
      <div className="app">

        <header className="header">

          <img
            src="/wrench-wise-logo.png"
            alt="Wrench Wise"
            className="header-logo"
          />

          <button
            type="button"
            className="back-button"
            onClick={goBack}
          >
            ← Change Role
          </button>

        </header>

        <main className="content">
          

          {/* =========================================
              TEACHER FORM
          ========================================= */}

          <section className="form-card">

            <h2>
              👨‍🏫{" "}
              {editingId
                ? "Update Teacher"
                : "Teacher Registration"}
            </h2>

            <form onSubmit={handleTeacherSubmit}>

              {/* NAME */}

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={teacherForm.name}
                onChange={handleTeacherChange}
                required
              />

              {/* =====================================
                  EMAIL
              ===================================== */}
<div className="input-group">

  <input
    type="email"
    name="email"
    placeholder="Email"
    value={teacherForm.email}
    onChange={handleTeacherChange}
    className={
      teacherEmailError ? "input-error" : ""
    }
    required
  />

  {teacherEmailError && (
    <p className="email-error">
      ⚠ {teacherEmailError}
    </p>
  )}

</div>
              {/* PHONE */}

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={teacherForm.phone}
                onChange={handleTeacherChange}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits"
                required
              />

              {/* SUBJECT */}

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={teacherForm.subject}
                onChange={handleTeacherChange}
                required
              />

              {/* EXPERIENCE */}

              <input
                type="number"
                name="experience"
                placeholder="Years of Experience"
                value={teacherForm.experience}
                onChange={handleTeacherChange}
                required
              />

              <button
                type="submit"
                className="submit-button"
                disabled={Boolean(teacherEmailError)}
              >
                {editingId
                  ? "Update Teacher"
                  : "Register Teacher"}
              </button>

            </form>

          </section>

          {/* =========================================
              TEACHER TABLE
          ========================================= */}

          <section className="table-card">

            <h2>
              Registered Teachers
            </h2>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Experience</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>

                      <td>
                        {teacher.name}
                      </td>

                      <td>
                        {teacher.email}
                      </td>

                      <td>
                        {teacher.phone}
                      </td>

                      <td>
                        {teacher.subject}
                      </td>

                      <td>
                        {teacher.experience} years
                      </td>

                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() =>
                            editTeacher(teacher)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            deleteTeacher(teacher._id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </main>

        <SupportChat role="teacher" />

      </div>
    );
  };

  // =====================================================
  // ROUTES
  // =====================================================

  return (
    <Routes>

      <Route
        path="/"
        element={renderRoleSelection()}
      />

      <Route
        path="/student"
        element={renderStudentPage()}
      />

      <Route
        path="/teacher"
        element={renderTeacherPage()}
      />

    </Routes>
  );
}

export default App;