import {request} from '../utils'

interface LoginFormData {
    email: string;
    password: string;
}

export function loginAPI(formData: LoginFormData){
    return request({
        url:'user/login',
        method:'POST',
        data:formData
    })
}
