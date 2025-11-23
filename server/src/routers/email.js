import express from "express";
import sgMail from "@sendgrid/mail";
import UserModel from "../models/usersModel.js";

const router = express.Router();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Verify SendGrid configuration
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY is not set!");
} else {
  console.log("✅ SendGrid is configured and ready");
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email Function using SendGrid
export const sendOTPEmail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: "Ajroo"
      },
      subject: "Verify your sign-up",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; padding: 32px 24px; border-radius: 16px;">
        
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://ajroo.netlify.app/assets/logo-O5aReYiM.png" alt="Ajroo Logo" style="width: 90px; margin-bottom: 6px;" />
          <h1 style="font-size: 32px; font-weight: 700; margin: 0; color: #000;">Ajroo</h1>
        </div>

        <hr style="border: none; border-top: 1px solid #e6e6e6; margin-bottom: 28px;" />

        <!-- Title -->
        <h2 style="text-align: center; font-size: 22px; color: #000; margin-bottom: 12px;">
          Verify your sign-up
        </h2>

        <!-- Subtitle -->
        <p style="text-align: center; color: #555; font-size: 15px; margin-top: 0;">
          We have received a sign-up attempt with your email address
        </p>

        <!-- OTP Box -->
        <div style="
          background: #f2f2f2;
          padding: 20px;
          text-align: center;
          margin: 28px 0;
          border-radius: 14px;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #000;
        ">
          ${otp}
        </div>

        <!-- Expire note -->
        <p style="text-align: center; color: #666; font-size: 14px; margin: 0;">
          This code will expire in 10 minutes.
        </p>
        <p style="text-align: center; color: #666; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 32px 0;" />

        <!-- Footer -->
        <p style="text-align: center; color: #777; font-size: 13px; margin: 0;">
          Share more, waste less, earn together
        </p>

        <p style="text-align: center; color: #777; font-size: 12px; margin-top: 16px;">
          Ajroo All rights reserved
        </p>

      </div>
      `,
    };

    const result = await sgMail.send(msg);
    console.log("✅ OTP email sent successfully to:", email);
    console.log("SendGrid response:", result[0].statusCode);

    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    console.error("❌ SendGrid error:", error);
    
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }
    
    throw new Error("Failed to send OTP email");
  }
};

// POST /api/auth/send-otp - ONLY UPDATE EXISTING USER, DON'T CREATE NEW ONE
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ONLY find existing user, don't create new one
    let user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Update existing user with OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.isVerified = false;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      email: email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res
      .status(200)
      .header("x-auth-token", token)
      .json({
        success: true,
        message: "OTP verified successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          gender: user.gender,
          postCount: user.postCount,
          isVerified: user.isVerified,
        },
      });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
});

export default router;






// Using nodemailer and gmail



// import express from "express";
// import nodemailer from "nodemailer";
// import UserModel from "../models/usersModel.js";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// // Create email transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD,
//   },
// });

// // Verify transporter configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Email transporter error:", error);
//   } else {
//     console.log("Email server is ready to send messages");
//   }
// });

// // Generate 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Send OTP Email Function
// export const sendOTPEmail = async (email, otp) => {
//   try {
//     const mailOptions = {
//       from: `"Ajroo" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Verify your sign-up",
//       html: `
//       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fff; padding: 32px 24px; border-radius: 16px;">
        
//         <!-- Logo -->
//         <div style="text-align: center; margin-bottom: 24px;">
//           <img src="https://ajroo.netlify.app/assets/logo-O5aReYiM.png" alt="Ajroo Logo" style="width: 90px; margin-bottom: 6px;" />
//           <h1 style="font-size: 32px; font-weight: 700; margin: 0; color: #000;">Ajroo</h1>
//         </div>

//         <hr style="border: none; border-top: 1px solid #e6e6e6; margin-bottom: 28px;" />

//         <!-- Title -->
//         <h2 style="text-align: center; font-size: 22px; color: #000; margin-bottom: 12px;">
//           Verify your sign-up
//         </h2>

//         <!-- Subtitle -->
//         <p style="text-align: center; color: #555; font-size: 15px; margin-top: 0;">
//           We have received a sign-up attempt with your email address
//         </p>

//         <!-- OTP Box -->
//         <div style="
//           background: #f2f2f2;
//           padding: 20px;
//           text-align: center;
//           margin: 28px 0;
//           border-radius: 14px;
//           font-size: 32px;
//           font-weight: bold;
//           letter-spacing: 4px;
//           color: #000;
//         ">
//           ${otp}
//         </div>

//         <!-- Expire note -->
//         <p style="text-align: center; color: #666; font-size: 14px; margin: 0;">
//           This code will expire in 10 minutes.
//         </p>
//         <p style="text-align: center; color: #666; font-size: 14px;">
//           If you didn't request this code, please ignore this email.
//         </p>

//         <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 32px 0;" />

//         <!-- Footer -->
//         <p style="text-align: center; color: #777; font-size: 13px; margin: 0;">
//           Share more, waste less, earn together
//         </p>

//         <p style="text-align: center; color: #777; font-size: 12px; margin-top: 16px;">
//           Ajroo All rights reserved
//         </p>

//       </div>
//       `,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", info.messageId);

//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// };

// // POST /api/auth/send-otp - ONLY UPDATE EXISTING USER, DON'T CREATE NEW ONE
// router.post("/send-otp", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }

//     // Generate OTP
//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // ONLY find existing user, don't create new one
//     let user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found. Please register first.",
//       });
//     }

//     // Update existing user with OTP
//     user.otp = otp;
//     user.otpExpiry = otpExpiry;
//     user.isVerified = false;
//     await user.save();

//     // Send OTP email
//     await sendOTPEmail(email, otp);

//     res.status(200).json({
//       success: true,
//       message: "OTP sent successfully to your email",
//       email: email,
//     });
//   } catch (error) {
//     console.error("Send OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send OTP",
//       error: error.message,
//     });
//   }
// });

// // POST /api/auth/verify-otp
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required",
//       });
//     }

//     // Find user
//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Check if OTP exists
//     if (!user.otp) {
//       return res.status(400).json({
//         success: false,
//         message: "No OTP found. Please request a new one",
//       });
//     }

//     // Check if OTP is expired
//     if (new Date() > user.otpExpiry) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired. Please request a new one",
//       });
//     }

//     // Verify OTP
//     if (user.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // Mark user as verified and clear OTP
//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpiry = undefined;
//     await user.save();

//     // Generate JWT token
//     const token = user.generateAuthToken();

//     res
//       .status(200)
//       .header("x-auth-token", token)
//       .json({
//         success: true,
//         message: "OTP verified successfully",
//         user: {
//           id: user._id,
//           email: user.email,
//           name: user.name,
//           role: user.role,
//           gender:user.gender,
//           postCount: user.postCount,
//           isVerified: user.isVerified,
//         },
//       });
//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to verify OTP",
//       error: error.message,
//     });
//   }
// });

// // POST /api/auth/resend-otp
// router.post("/resend-otp", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const user = await UserModel.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Generate new OTP
//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpiry = otpExpiry;
//     await user.save();

//     // Send OTP email
//     await sendOTPEmail(email, otp);

//     res.status(200).json({
//       success: true,
//       message: "OTP resent successfully",
//     });
//   } catch (error) {
//     console.error("Resend OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to resend OTP",
//       error: error.message,
//     });
//   }
// });

// export default router;
