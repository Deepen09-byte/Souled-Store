import { setUser, setLoading } from "../state/auth.slice.js"
import { register, login, getMe } from "../service/auth.api.js"
import { useDispatch } from "react-redux"

export const useAuth = () => {

    const dispatch = useDispatch();

    async function handleRegister({
        email,
        contact,
        password,
        fullName,
        isSeller = false
    }) {

        const data = await register({
            email,
            contact,
            fullName,
            password,
            isSeller
        });

        if (!data.success) {
            return data;
        }

        dispatch(setUser(data.user));

        return data.user;
    }


    async function handleLogin({ email, password }) {
        const data = await login({ email, password });

        if (!data.success) {
            return data;
        }

        dispatch(setUser(data.user));
        return data.user;
    }


    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    };
};