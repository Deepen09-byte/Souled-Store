import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
})

export async function register({
    email,
    contact,
    fullName,
    password,
    isSeller
}) {

    try {
        const response = await authApiInstance.post("/register", {
            email,
            contact,
            fullName,
            password,
            isSeller
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            const { message, field } = error.response.data;
            return { success: false, message, field };
        }
        return { success: false, message: "Network error", field: null };
    }
}

export async function login({
    email,
    password,
}) {
    try {
        const response = await authApiInstance.post("/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            const { message, field } = error.response.data;
            return { success: false, message, field };
        }
        return { success: false, message: "Network error", field: null };
    }
}

export async function getMe() {
    const response = await authApiInstance.get("/me");
    return response.data;
}