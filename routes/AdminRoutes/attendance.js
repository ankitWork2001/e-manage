import {Router} from "express";
import {getAttendanceReport, markAttendance, unmarkAttendance} from "../../controllers/adminControllers/attendance.js";

const router = Router();

router.get('/attendance/:employeeId', getAttendanceReport);
router.put('/attendance/mark/:employeeId', markAttendance);
router.put('/attendance/unmark/:employeeId', unmarkAttendance);


export default router;