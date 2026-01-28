const TOKEKEY = 'token'

function setToken(token: string){
    localStorage.setItem(TOKEKEY, token)
}

function getToken(){
    return localStorage.getItem(TOKEKEY)
}

function removeToken(){
    localStorage.removeItem(TOKEKEY)
}

export {
    setToken, 
    getToken, 
    removeToken
}