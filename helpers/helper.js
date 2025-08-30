const bcrypt=require("bcrypt");

const hashPassword=async(password)=>{
    const saltRounds=10;
    const hashPassword=await bcrypt.hash(password,saltRounds);
    return hashPassword;
}
const comparePassword=async(password,hashPassword)=>{
    return await bcrypt.compare(password,hashPassword);
}

module.exports={
    hashPassword,
    comparePassword
}