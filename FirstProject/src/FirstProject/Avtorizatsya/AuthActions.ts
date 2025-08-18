import axios from "../Avtorizatsya/Api";

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    phone: string;
    password: string;
    date_of_birth: string;
    gender: 'male' | 'female';
}

export interface RegisterResponse {
    success: boolean;
    errMessage: any;
    errorCode: number | null;
    data: {
        user: {
            id: number;
            first_name: string;
            last_name: string;
            phone: string;
            date_of_birth: string;
            gender: string;
            is_active: boolean;
        };
    };
}

export interface VerifyPayload {
    phone: string;
    otp: string;
}
export interface VerifyResponse {
    success: boolean;
    errorMessage: any;
    errorCode: number | null;
    data: {
        token: {
            access: string;
            refresh: string;
        }
    }
}

export interface LoginPayload {
    phone: string;
    password: string;
}
export interface LoginResponse {
    access: string;
    refresh: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    console.log(payload);
    const res = await axios.post<RegisterResponse>('/users', payload);
    console.log(res);
    return res.data;

};

export const verifyOtp = async (payload: VerifyPayload): Promise<VerifyResponse> => {
    const res = await axios.post<VerifyResponse>('/users/verify', payload);
    return res.data;
};

export const loginUser = async (payload: LoginPayload) => {
    const res = await axios.post<VerifyResponse>('/token', payload);
    console.log(res.data);
    return res.data;
};