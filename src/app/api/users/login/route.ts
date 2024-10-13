import {connect} from '@/dbConfig/dbConfig'
import User from '@/models/userModel.model'
import { NextRequest, NextResponse } from 'next/server'
import bcriptjs from 'bcryptjs'
import jwt from "jsonwebtoken"


connect()

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        const {email, password} = reqBody

        // validation
        console.log(reqBody);

        const user = await User.findOne({email})

        if (!user) {
            return NextResponse.json({error: 'User does not exists'}, {status: 400})
        }
        
        console.log("User exist");

        const validPassword = await bcriptjs.compare(password, user.password)
        
        if (!validPassword) {
            return  NextResponse.json({error: 'Invalid password'}, {status: 400})
        }
                                                                                                                                                                    
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: '1d'})

        const response = NextResponse.json({
            message: "Logged In Success",
            success: true,
        })

        response.cookies.set("token", token, {
            httpOnly: true
        })
        return response

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
















