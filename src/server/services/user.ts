import { db } from "../db"
import { user } from "../db/schema"
import type { createUserSchema } from "../validation/user"
import bcrypt from 'bcrypt'


const createUser = async (data: typeof createUserSchema._output) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const resUser = db.insert(user).values({
        name: data.name,
        email: data.email,
        password: hashedPassword
    }).returning();
    return resUser;
}

const userService = {
    createUser
}



export default userService