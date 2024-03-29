// Importing necessary file, module and package , and creating instances of them
import "../env.js";
import DoctorRepository from "../repository/doctor.repository.js";
import DoctorModel from "../model/doctor.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Defining DoctorController class and there method
export default class DoctorController {
  constructor() {
    // Creating Instance of DoctorRepository
    this.doctorRepository = new DoctorRepository();
  }

  // Register Doctor Method
  async registerDoctor(req, res) {
    try {
      //   console.log(req.body);
      const { name, userName, password } = req.body;
      const hashPassword = await bcrypt.hash(password, 12);
      const newUser = new DoctorModel(name, "Doctor", userName, hashPassword);
      const createdRecord = await this.doctorRepository.add(newUser);
      if (!createdRecord) {
        res.status(409).send("User Name Already exist");
      } else {
        res.status(201).send({
          Message: "Doctor Registered",
          Doctor: createdRecord,
        });
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong with database");
    }
  }

  // SignIn Doctor Method
  async signIn(req, res) {
    try {
      const { userName, password } = req.body;
      const doctor = await this.doctorRepository.findDoctor(userName);
      if (!doctor) {
        return res.status(400).send("Invalid Credentials");
      }
      const passwordMatch = await bcrypt.compare(password, doctor.password);
      if (passwordMatch) {
        const token = jwt.sign(
          {
            userId: doctor._id,
            userName: doctor.userName,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );
        res.status(200).send(token);
      } else {
        return res.status(401).send("Invalid Credentials");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong with database");
    }
  }
}
