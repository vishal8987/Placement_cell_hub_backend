const nodemailer=require("nodemailer");

const sendEmail=async(to,otp)=>{
try{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        },
    });
    await transporter.sendMail({
        from:`Placement Cell Verification Code: ${otp}`,
        to,
        subject: "Your OTP for Verification",
  text: `Your OTP is: ${otp}. It is valid for 3 minutes.`,
    });
}catch(error){
    console.log(error);
}
}




module.exports=sendEmail;