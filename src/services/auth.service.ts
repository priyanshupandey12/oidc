import {eq} from "drizzle-orm";
import {db} from "../db/index";
import {refreshTokens, users} from "../db/schema";
import bcrypt from "bcrypt";

export const register = async (name:string,passwordHash:string,email:string) => {

    if(!name || !passwordHash || !email){
        throw new Error("Name, email and password are required")
    }


    const user = await db.select().from(users).where(eq(users.email,email))
    if(user.length > 0){
        throw new Error("User already exists")
    }
    const hashedPassword = await bcrypt.hash(passwordHash, 10);
    
    const response = await db.insert(users).values({name,passwordHash:hashedPassword,email}).returning()

       if(response.length === 0){
        throw new Error("Failed to register user")
       }
    
    const { passwordHash: _, ...safeUser } = response[0];
return { message: "User registered successfully", user: safeUser };
 
    }


export const login = async (passwordHash:string,email:string) => {
    if(!passwordHash || !email){
        throw new Error("Email and password are required")
    }
    const user = await db.select().from(users).where(eq(users.email,email))
    if(user.length === 0){
        throw new Error("Invalid email or password")
    }
    const isMatch = await bcrypt.compare(passwordHash, user[0].passwordHash)
    if(!isMatch){
        throw new Error("Invalid email or password")
    }
    const {passwordHash:_,...userWithoutPassword} = user[0]
    
    return {message:"Login successful",user:userWithoutPassword}
}


export const logout = async (userId: string) => {
 
  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.userId, userId));
};