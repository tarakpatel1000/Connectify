import jwt from "jsonwebtoken";

const generateTokenAndSetCookies = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn : "365d"
    });

    res.cookie("token", token, {
        httpOnly : true,
        maxAge : 100 * 365 * 24 * 60 * 60 * 1000,
        sameSite : "strict"
    })

    return token;
}

export default generateTokenAndSetCookies;