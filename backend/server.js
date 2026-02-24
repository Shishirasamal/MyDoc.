import app from "./app.js";
import cloudinary from "cloudinary";

import appointmentRouter from "./router/appointmentRouter.js";
import userRouter from "./router/userRouter.js";
import messageRouter from "./router/messageRouter.js";

app.use("/api/appointment", appointmentRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/message", messageRouter);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
