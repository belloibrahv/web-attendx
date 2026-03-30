import { z } from "zod";

export const createSessionSchema = z.object({
  courseId: z.string().min(1),
  venue: z.string().min(1).max(120).optional(),
  ttlMinutes: z
    .number()
    .int("Session duration must be a whole number.")
    .min(5, "Session duration must be at least 5 minutes.")
    .max(15, "Session duration cannot exceed 15 minutes."),
});

export const scanAttendanceSchema = z.object({
  encodedPayload: z.string().min(10),
  deviceInfo: z.string().max(500).optional(),
});

const baseRegistrationSchema = {
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  department: z.string().trim().min(1, "Department is required."),
};

export const registerUserSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("STUDENT"),
    ...baseRegistrationSchema,
    matricNumber: z.string().trim().min(3, "Matric number is required."),
    level: z.string().trim().min(1, "Level is required."),
  }),
  z.object({
    role: z.literal("LECTURER"),
    ...baseRegistrationSchema,
    staffId: z.string().trim().min(3, "Staff ID is required."),
    title: z.string().trim().min(2, "Title is required."),
  }),
]);
